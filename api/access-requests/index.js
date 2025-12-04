module.exports = async function (context, req) {
    const method = req.method;
    const id = context.bindingData.id;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return;
    }

    try {
        switch (method) {
            case 'GET':
                if (id) {
                    // Get specific access request
                    context.res = {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: {
                            id: id,
                            status: "pending",
                            requestedAt: new Date().toISOString(),
                            message: "Access request details would be retrieved from storage"
                        }
                    };
                } else {
                    // Get all access requests
                    context.res = {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                        body: {
                            requests: [],
                            total: 0,
                            message: "Access requests would be retrieved from storage"
                        }
                    };
                }
                break;

            case 'POST':
                // Submit new access request
                const { email, reason, department } = req.body;

                if (!email || !reason) {
                    context.res = {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                        body: { error: "Missing required fields: email, reason" }
                    };
                    return;
                }

                context.res = {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                    body: {
                        id: `ARQ-${Date.now()}`,
                        email: email,
                        reason: reason,
                        department: department || "General",
                        status: "pending",
                        createdAt: new Date().toISOString(),
                        message: "Access request submitted successfully"
                    }
                };
                break;

            default:
                context.res = {
                    status: 405,
                    headers: { "Content-Type": "application/json" },
                    body: { error: "Method not allowed" }
                };
        }
    } catch (error) {
        context.log.error('Error in access-requests function:', error);
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: { error: "Internal server error", details: error.message }
        };
    }
};
