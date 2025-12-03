import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function AdminAccessRequests() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingRequest, setProcessingRequest] = useState(null);

    useEffect(() => {
        fetchAccessRequests();
    }, []);

    const fetchAccessRequests = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/access-requests');
            
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
                setError(null);
            } else if (response.status === 403) {
                setError('Admin access required to view access requests.');
            } else {
                const result = await response.json();
                setError(result.error || 'Failed to load access requests.');
            }
        } catch (error) {
            console.error('Error fetching access requests:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestAction = async (requestId, action, comments = '') => {
        try {
            setProcessingRequest(requestId);
            
            const response = await fetch('/api/access-requests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    action,
                    comments
                })
            });

            if (response.ok) {
                // Refresh the requests list
                await fetchAccessRequests();
            } else {
                const result = await response.json();
                setError(result.error || `Failed to ${action} request.`);
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            setError(`Network error while ${action}ing request.`);
        } finally {
            setProcessingRequest(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'denied':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading access requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <Button 
                    onClick={fetchAccessRequests} 
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Access Requests Management</span>
                        <Button 
                            onClick={fetchAccessRequests}
                            variant="outline"
                            size="sm"
                        >
                            Refresh
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <p className="text-gray-600">No access requests found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <Card key={request.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {request.userDetails}
                                                    </h3>
                                                    <Badge className={`${getStatusBadgeColor(request.status)} border`}>
                                                        {request.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                                    <div>
                                                        <span className="font-medium">Provider:</span> {request.identityProvider}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Requested Role:</span> {request.requestedRole}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Requested:</span> {formatDate(request.requestedAt)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Request ID:</span> {request.id}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <span className="font-medium text-sm text-gray-700">Justification:</span>
                                                    <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded border text-sm">
                                                        {request.reason}
                                                    </p>
                                                </div>

                                                {request.status !== 'pending' && (
                                                    <div className="bg-gray-50 p-3 rounded border">
                                                        <div className="text-sm text-gray-600 mb-1">
                                                            <span className="font-medium">Reviewed by:</span> {request.reviewedBy}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">Reviewed:</span> {formatDate(request.reviewedAt)}
                                                        </div>
                                                        {request.reviewComments && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-gray-700">Comments:</span>
                                                                <p className="mt-1 text-gray-600">{request.reviewComments}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {request.status === 'pending' && (
                                            <div className="flex gap-2 pt-2 border-t">
                                                <Button
                                                    onClick={() => {
                                                        const comments = prompt('Optional comments for approval:');
                                                        handleRequestAction(request.id, 'approve', comments || '');
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={processingRequest === request.id}
                                                >
                                                    {processingRequest === request.id ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        const comments = prompt('Reason for denial (required):');
                                                        if (comments && comments.trim()) {
                                                            handleRequestAction(request.id, 'deny', comments.trim());
                                                        } else {
                                                            alert('Please provide a reason for denial.');
                                                        }
                                                    }}
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    disabled={processingRequest === request.id}
                                                >
                                                    {processingRequest === request.id ? 'Processing...' : 'Deny'}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}