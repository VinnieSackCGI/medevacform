const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const method = req.method;
    const id = context.bindingData.id;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: getCorsHeaders()
        };
        return;
    }

    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        context.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('STORAGE')));
        
        if (!connectionString) {
        context.log.error('Storage connection string not found in environment variables');
        context.res = {
          status: 500,
          headers: getCorsHeaders(),
          body: { 
            error: "Storage connection string not configured",
            debug: "Environment check failed"
          }
        };
        return;
      }        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('application-data');

        switch (method) {
            case 'POST':
                await handleCreate(context, req, containerClient);
                break;
            case 'GET':
                if (id) {
                    await handleGetById(context, id, containerClient);
                } else {
                    await handleGetAll(context, req, containerClient);
                }
                break;
            case 'PUT':
                if (!id) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { error: "ID required for update" }
                    };
                    return;
                }
                await handleUpdate(context, req, id, containerClient);
                break;
            case 'DELETE':
                if (!id) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { error: "ID required for delete" }
                    };
                    return;
                }
                await handleDelete(context, id, containerClient);
                break;
            default:
                context.res = {
                    status: 405,
                    headers: getCorsHeaders(),
                    body: { error: "Method not allowed" }
                };
        }
    } catch (error) {
        context.log.error('Error in MEDEVAC API:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Internal server error" }
        };
    }
};

// Create new MEDEVAC submission
async function handleCreate(context, req, containerClient) {
    try {
        const formData = req.body;
        
        if (!formData || !formData.patientName) {
            context.res = {
                status: 400,
                headers: getCorsHeaders(),
                body: { error: "Patient name is required" }
            };
            return;
        }

        // Generate unique ID
        const id = generateMedevacId();
        const timestamp = new Date().toISOString();
        
        // Get user info from Static Web Apps auth
        const userHeader = req.headers['x-ms-client-principal'];
        let userInfo = null;
        if (userHeader) {
            try {
                const decoded = Buffer.from(userHeader, 'base64').toString('ascii');
                userInfo = JSON.parse(decoded);
            } catch (e) {
                context.log('Could not parse user info:', e);
            }
        }

        const submission = {
            id: id,
            ...formData,
            createdAt: timestamp,
            updatedAt: timestamp,
            status: formData.status || 'draft',
            createdBy: userInfo ? {
                userId: userInfo.userId,
                userDetails: userInfo.userDetails,
                identityProvider: userInfo.identityProvider
            } : null
        };

        const blobName = `medevac-submissions/${id}.json`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        
        await blobClient.upload(
            JSON.stringify(submission, null, 2),
            JSON.stringify(submission, null, 2).length,
            {
                blobHTTPHeaders: { blobContentType: 'application/json' }
            }
        );

        // Update index
        await updateSubmissionIndex(containerClient, submission, 'create');

        context.res = {
            status: 201,
            headers: getCorsHeaders(),
            body: { 
                message: "MEDEVAC submission created successfully",
                id: id,
                submission: submission
            }
        };

    } catch (error) {
        context.log.error('Error creating submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to create submission" }
        };
    }
}

// Get submission by ID
async function handleGetById(context, id, containerClient) {
    try {
        const blobName = `medevac-submissions/${id}.json`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        
        const exists = await blobClient.exists();
        if (!exists) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "MEDEVAC submission not found" }
            };
            return;
        }

        const downloadResponse = await blobClient.download();
        const data = await streamToString(downloadResponse.readableStreamBody);
        const submission = JSON.parse(data);

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: submission
        };

    } catch (error) {
        context.log.error('Error getting submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to retrieve submission" }
        };
    }
}

// Get all submissions with optional filtering
async function handleGetAll(context, req, containerClient) {
    try {
        const { status, patientName, limit = 50, offset = 0 } = req.query;
        
        // Get submissions index
        const indexBlobClient = containerClient.getBlockBlobClient('medevac-submissions/index.json');
        const indexExists = await indexBlobClient.exists();
        
        let submissions = [];
        
        if (indexExists) {
            const indexData = await streamToString((await indexBlobClient.download()).readableStreamBody);
            const index = JSON.parse(indexData);
            submissions = index.submissions || [];
        }

        // Apply filters
        let filteredSubmissions = submissions;
        
        if (status) {
            filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
        }
        
        if (patientName) {
            filteredSubmissions = filteredSubmissions.filter(s => 
                s.patientName.toLowerCase().includes(patientName.toLowerCase())
            );
        }

        // Apply pagination
        const total = filteredSubmissions.length;
        const paginatedSubmissions = filteredSubmissions
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                submissions: paginatedSubmissions,
                total: total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        };

    } catch (error) {
        context.log.error('Error getting submissions:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to retrieve submissions" }
        };
    }
}

// Update existing submission
async function handleUpdate(context, req, id, containerClient) {
    try {
        const updates = req.body;
        
        if (!updates) {
            context.res = {
                status: 400,
                headers: getCorsHeaders(),
                body: { error: "Update data is required" }
            };
            return;
        }

        const blobName = `medevac-submissions/${id}.json`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        
        const exists = await blobClient.exists();
        if (!exists) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "MEDEVAC submission not found" }
            };
            return;
        }

        // Get existing submission
        const downloadResponse = await blobClient.download();
        const data = await streamToString(downloadResponse.readableStreamBody);
        const existingSubmission = JSON.parse(data);

        // Merge updates
        const updatedSubmission = {
            ...existingSubmission,
            ...updates,
            id: id, // Preserve ID
            createdAt: existingSubmission.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        // Save updated submission
        await blobClient.upload(
            JSON.stringify(updatedSubmission, null, 2),
            JSON.stringify(updatedSubmission, null, 2).length,
            {
                blobHTTPHeaders: { blobContentType: 'application/json' }
            }
        );

        // Update index
        await updateSubmissionIndex(containerClient, updatedSubmission, 'update');

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                message: "MEDEVAC submission updated successfully",
                submission: updatedSubmission
            }
        };

    } catch (error) {
        context.log.error('Error updating submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to update submission" }
        };
    }
}

// Delete submission
async function handleDelete(context, id, containerClient) {
    try {
        const blobName = `medevac-submissions/${id}.json`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        
        const exists = await blobClient.exists();
        if (!exists) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "MEDEVAC submission not found" }
            };
            return;
        }

        // Delete the submission
        await blobClient.delete();

        // Update index
        await updateSubmissionIndex(containerClient, { id }, 'delete');

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: { message: "MEDEVAC submission deleted successfully" }
        };

    } catch (error) {
        context.log.error('Error deleting submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to delete submission" }
        };
    }
}

// Helper functions
function generateMedevacId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `MEDEVAC-${timestamp}-${random}`;
}

function getCorsHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
}

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

// Update submissions index for faster queries
async function updateSubmissionIndex(containerClient, submission, operation) {
    try {
        const indexBlobClient = containerClient.getBlockBlobClient('medevac-submissions/index.json');
        
        let index = { submissions: [] };
        
        // Get existing index
        const indexExists = await indexBlobClient.exists();
        if (indexExists) {
            const indexData = await streamToString((await indexBlobClient.download()).readableStreamBody);
            index = JSON.parse(indexData);
        }

        // Update index based on operation
        switch (operation) {
            case 'create':
                index.submissions.push({
                    id: submission.id,
                    patientName: submission.patientName,
                    status: submission.status,
                    createdAt: submission.createdAt,
                    updatedAt: submission.updatedAt,
                    obligationNumber: submission.obligationNumber
                });
                break;
            case 'update':
                const updateIndex = index.submissions.findIndex(s => s.id === submission.id);
                if (updateIndex >= 0) {
                    index.submissions[updateIndex] = {
                        id: submission.id,
                        patientName: submission.patientName,
                        status: submission.status,
                        createdAt: submission.createdAt,
                        updatedAt: submission.updatedAt,
                        obligationNumber: submission.obligationNumber
                    };
                }
                break;
            case 'delete':
                index.submissions = index.submissions.filter(s => s.id !== submission.id);
                break;
        }

        // Sort by creation date (newest first)
        index.submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        index.lastUpdated = new Date().toISOString();

        // Save updated index
        await indexBlobClient.upload(
            JSON.stringify(index, null, 2),
            JSON.stringify(index, null, 2).length,
            {
                blobHTTPHeaders: { blobContentType: 'application/json' }
            }
        );

    } catch (error) {
        // Don't fail the main operation if index update fails
        console.log('Warning: Failed to update index:', error);
    }
}