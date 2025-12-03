const { BlobServiceClient } = require('@azure/storage-blob');
const { sendNewRequestNotification, sendRequestDecisionNotification } = require('../utils/emailService');

// Initialize Azure Blob Storage
let blobServiceClient;
try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        console.error('AZURE_STORAGE_CONNECTION_STRING not found in environment variables');
    } else {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        console.log('Azure Blob Service initialized successfully');
    }
} catch (error) {
    console.error('Error initializing Azure Blob Service:', error);
}

const CONTAINER_NAME = 'access-requests';

// Ensure container exists
async function ensureContainer() {
    try {
        if (!blobServiceClient) return null;
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        await containerClient.createIfNotExists({ access: 'private' });
        return containerClient;
    } catch (error) {
        console.error('Error ensuring container exists:', error);
        return null;
    }
}

// Extract user info from Azure Static Web Apps headers
function extractUserInfo(req) {
    try {
        const clientPrincipal = req.headers['x-ms-client-principal'];
        if (!clientPrincipal) return null;
        
        const principal = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('ascii'));
        return {
            userId: principal.userId,
            userDetails: principal.userDetails,
            identityProvider: principal.identityProvider,
            userRoles: principal.userRoles || []
        };
    } catch (error) {
        console.error('Error extracting user info:', error);
        return null;
    }
}

module.exports = async function (context, req) {
    const method = req.method;
    
    try {
        const containerClient = await ensureContainer();
        if (!containerClient) {
            return {
                status: 500,
                body: { error: 'Storage service unavailable' }
            };
        }

        if (method === 'POST') {
            // Submit access request
            const userInfo = extractUserInfo(req);
            if (!userInfo) {
                return {
                    status: 401,
                    body: { error: 'Authentication required' }
                };
            }

            const { reason, role } = req.body;
            if (!reason || !role) {
                return {
                    status: 400,
                    body: { error: 'Reason and role are required' }
                };
            }

            const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const accessRequest = {
                id: requestId,
                userId: userInfo.userId,
                userDetails: userInfo.userDetails,
                identityProvider: userInfo.identityProvider,
                requestedRole: role,
                reason: reason,
                status: 'pending',
                requestedAt: new Date().toISOString(),
                reviewedAt: null,
                reviewedBy: null,
                reviewComments: null
            };

            const blobName = `${requestId}.json`;
            const blobClient = containerClient.getBlockBlobClient(blobName);
            
            await blobClient.upload(
                JSON.stringify(accessRequest, null, 2),
                Buffer.byteLength(JSON.stringify(accessRequest, null, 2)),
                {
                    blobHTTPHeaders: { blobContentType: 'application/json' }
                }
            );

            // Send email notification to admins
            try {
                await sendNewRequestNotification(accessRequest);
            } catch (error) {
                console.log('Failed to send email notification:', error);
                // Don't fail the request if email fails
            }

            return {
                status: 201,
                body: {
                    message: 'Access request submitted successfully',
                    requestId: requestId
                }
            };
        }

        if (method === 'GET') {
            // Get access requests (admin only)
            const userInfo = extractUserInfo(req);
            if (!userInfo || !userInfo.userRoles.includes('admin')) {
                return {
                    status: 403,
                    body: { error: 'Admin access required' }
                };
            }

            const requests = [];
            for await (const blob of containerClient.listBlobsFlat()) {
                const blobClient = containerClient.getBlockBlobClient(blob.name);
                const downloadResponse = await blobClient.download();
                const content = await streamToString(downloadResponse.readableStreamBody);
                requests.push(JSON.parse(content));
            }

            // Sort by request date (newest first)
            requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

            return {
                status: 200,
                body: requests
            };
        }

        if (method === 'PUT') {
            // Approve/deny access request (admin only)
            const userInfo = extractUserInfo(req);
            if (!userInfo || !userInfo.userRoles.includes('admin')) {
                return {
                    status: 403,
                    body: { error: 'Admin access required' }
                };
            }

            const { requestId, action, comments } = req.body;
            if (!requestId || !action || !['approve', 'deny'].includes(action)) {
                return {
                    status: 400,
                    body: { error: 'Valid requestId and action (approve/deny) are required' }
                };
            }

            const blobName = `${requestId}.json`;
            const blobClient = containerClient.getBlockBlobClient(blobName);
            
            try {
                const downloadResponse = await blobClient.download();
                const content = await streamToString(downloadResponse.readableStreamBody);
                const accessRequest = JSON.parse(content);

                accessRequest.status = action === 'approve' ? 'approved' : 'denied';
                accessRequest.reviewedAt = new Date().toISOString();
                accessRequest.reviewedBy = userInfo.userDetails;
                accessRequest.reviewComments = comments || '';

                await blobClient.upload(
                    JSON.stringify(accessRequest, null, 2),
                    Buffer.byteLength(JSON.stringify(accessRequest, null, 2)),
                    {
                        blobHTTPHeaders: { blobContentType: 'application/json' }
                    }
                );

                // Send email notification to user about decision
                try {
                    await sendRequestDecisionNotification(accessRequest, accessRequest.userDetails);
                } catch (error) {
                    console.log('Failed to send decision email notification:', error);
                    // Don't fail the request if email fails
                }

                return {
                    status: 200,
                    body: {
                        message: `Access request ${action}d successfully`,
                        request: accessRequest
                    }
                };
            } catch (error) {
                return {
                    status: 404,
                    body: { error: 'Access request not found' }
                };
            }
        }

        return {
            status: 405,
            body: { error: 'Method not allowed' }
        };

    } catch (error) {
        console.error('Access requests API error:', error);
        return {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};

// Helper function to convert stream to string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data.toString());
        });
        readableStream.on('end', () => {
            resolve(chunks.join(''));
        });
        readableStream.on('error', reject);
    });
}