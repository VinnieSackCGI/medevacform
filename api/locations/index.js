const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        
        if (!connectionString) {
            context.res = {
                status: 500,
                body: { error: "Storage connection string not configured" }
            };
            return;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('application-data');
        const blobClient = containerClient.getBlobClient('country-locations.json');
        
        // Check if blob exists
        const exists = await blobClient.exists();
        if (!exists) {
            context.res = {
                status: 404,
                body: { error: "Location data not found" }
            };
            return;
        }

        // Download and parse the JSON data
        const downloadResponse = await blobClient.download();
        const data = await streamToString(downloadResponse.readableStreamBody);
        const locations = JSON.parse(data);

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: locations
        };

    } catch (error) {
        context.log.error('Error fetching locations:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to fetch location data" }
        };
    }
};

// Helper function to convert stream to string
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