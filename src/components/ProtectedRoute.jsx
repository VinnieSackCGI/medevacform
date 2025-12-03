import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = ['authenticated'] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matisse"></div>
        <span className="ml-4 text-theme-text-primary">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This will trigger the redirect to login in the Static Web App routing
    window.location.href = '/login';
    return null;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-theme-text-primary mb-4">Access Denied</h2>
            <p className="text-theme-text-secondary">
              You don't have the required permissions to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;