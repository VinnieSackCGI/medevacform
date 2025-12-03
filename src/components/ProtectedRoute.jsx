import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';
import AccessRequestForm from './AccessRequestForm';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { 
        user, 
        loading, 
        hasAccess, 
        hasRole, 
        accessRequestSubmitted, 
        setAccessRequestSubmitted 
    } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // User not authenticated - show login page
    if (!user) {
        return <LoginPage />;
    }

    // User authenticated but doesn't have basic access - show access request form
    if (!hasAccess && !accessRequestSubmitted) {
        return (
            <AccessRequestForm 
                user={user}
                onRequestSubmitted={() => setAccessRequestSubmitted(true)}
            />
        );
    }

    // User has submitted access request but not yet approved
    if (!hasAccess && accessRequestSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-xl border border-blue-200">
                    <div className="text-6xl text-blue-500 mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Request Submitted</h2>
                    <p className="text-gray-600 mb-6">
                        Your access request has been submitted and is pending review by system administrators.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        You will be notified when your access is approved or denied.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => setAccessRequestSubmitted(false)}
                            className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Submit Another Request
                        </button>
                        <button
                            onClick={() => window.location.href = '/.auth/logout'}
                            className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user has required role (if specified)
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-6xl text-red-400 mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
                    <p className="text-gray-600 mb-6">
                        You don't have the required permissions to access this resource.
                        Required role: <span className="font-semibold">{requiredRole}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Your current roles: {user.userRoles && user.userRoles.length > 0 ? user.userRoles.join(', ') : 'None'}
                    </p>
                </div>
            </div>
        );
    }

    // User authenticated and has required permissions
    return children;
};

export default ProtectedRoute;