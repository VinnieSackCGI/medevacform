import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function AccessRequestForm({ user, onRequestSubmitted }) {
    const [formData, setFormData] = useState({
        role: 'user',
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            setSubmitStatus({ type: 'error', message: 'Please provide a reason for access.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/access-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: formData.role,
                    reason: formData.reason.trim()
                })
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus({
                    type: 'success',
                    message: `Access request submitted successfully! Request ID: ${result.requestId}`
                });
                setFormData({ role: 'user', reason: '' });
                if (onRequestSubmitted) {
                    onRequestSubmitted(result);
                }
            } else {
                setSubmitStatus({
                    type: 'error',
                    message: result.error || 'Failed to submit access request.'
                });
            }
        } catch (error) {
            console.error('Error submitting access request:', error);
            setSubmitStatus({
                type: 'error',
                message: 'Network error. Please check your connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-2 border-blue-200 shadow-xl bg-white">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Request Access
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        MEDEVAC Form System
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {user && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700">
                                <strong>Logged in as:</strong> {user.userDetails}
                            </p>
                            <p className="text-sm text-gray-600">
                                Provider: {user.identityProvider}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                Requested Role
                            </Label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            >
                                <option value="user">User - Submit and view own MEDEVAC cases</option>
                                <option value="reviewer">Reviewer - Review and approve cases</option>
                                <option value="admin">Admin - Full system access</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                                Justification for Access *
                            </Label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Please explain why you need access to the MEDEVAC system, your role, and how you plan to use it..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-24 resize-y"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {submitStatus && (
                            <div className={`p-3 rounded-lg text-sm ${
                                submitStatus.type === 'success' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                                {submitStatus.message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !formData.reason.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting Request...
                                </>
                            ) : (
                                'Submit Access Request'
                            )}
                        </Button>
                    </form>

                    <div className="text-xs text-gray-500 text-center space-y-1">
                        <p>Your request will be reviewed by system administrators.</p>
                        <p>You will be notified when your access is approved or denied.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}