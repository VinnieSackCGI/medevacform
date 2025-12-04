const { app } = require('@azure/functions');

// Simple in-memory storage for demo (use Azure SQL Database in production)
const userRequests = [];
let nextId = 1;

app.http('request-account', {
    methods: ['POST'],
    route: 'auth/request-account',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { firstName, lastName, email, requestedUsername, justification } = body;
            
            // Validate required fields
            if (!firstName || !lastName || !email || !requestedUsername) {
                return {
                    status: 400,
                    jsonBody: { error: 'All fields except justification are required' }
                };
            }
            
            // Check if email already exists
            const existingRequest = userRequests.find(req => req.email === email);
            if (existingRequest) {
                return {
                    status: 400,
                    jsonBody: { error: 'An account request with this email already exists' }
                };
            }
            
            // Create new request
            const newRequest = {
                id: nextId++,
                firstName,
                lastName,
                email,
                requestedUsername,
                justification: justification || '',
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            userRequests.push(newRequest);
            
            context.log('New account request created:', { id: newRequest.id, email });
            
            return {
                status: 200,
                jsonBody: { 
                    message: 'Account request submitted successfully. You will be notified when reviewed.',
                    requestId: newRequest.id 
                }
            };
            
        } catch (error) {
            context.log.error('Error processing account request:', error);
            
            return {
                status: 500,
                jsonBody: { error: 'Failed to submit account request' }
            };
        }
    }
});