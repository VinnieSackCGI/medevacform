module.exports = async function (context, req) {
        try {
            context.log('Request received for account request');
            
            // Log the request details
            const body = await request.json();
            context.log('Request body:', JSON.stringify(body, null, 2));
            
            const { firstName, lastName, email, requestedUsername, justification } = body;
            
            // Validate required fields
            if (!firstName || !lastName || !email || !requestedUsername) {
                context.log('Missing required fields');
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    jsonBody: { error: 'All fields except justification are required' }
                };
            }
            
            // For now, just log the request (you can check Azure Function logs)
            context.log('Account request submitted:', {
                firstName,
                lastName,
                email,
                requestedUsername,
                justification,
                timestamp: new Date().toISOString()
            });
            
            // Return success response
            const response = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                jsonBody: { 
                    message: 'Account request submitted successfully. You will be notified when reviewed.',
                    requestId: Date.now() // Simple ID for now
                }
            };
            
            context.log('Sending response:', JSON.stringify(response, null, 2));
            return response;
            
        } catch (error) {
            context.log.error('Error processing account request:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                jsonBody: { error: 'Failed to submit account request. Please try again.' }
            };
        }
    }
});