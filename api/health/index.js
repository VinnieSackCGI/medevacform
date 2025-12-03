module.exports = async function (context, req) {
    const healthCheck = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: "production",
        services: {
            storage: "connected",
            functions: "operational"
        }
    };

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: healthCheck
    };
};