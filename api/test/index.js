const { app } = require('@azure/functions');

app.http('test', {
    methods: ['GET', 'POST'],
    route: 'test',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Test API endpoint called');
        
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            jsonBody: { 
                message: 'API is working!',
                timestamp: new Date().toISOString(),
                method: request.method
            }
        };
    }
});