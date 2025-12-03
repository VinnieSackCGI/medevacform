import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper function to check if user has required role
export const hasRole = (userRoles, requiredRole) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    return userRoles.includes(requiredRole) || userRoles.includes('admin');
};

// Helper function to check if user has access
export const hasAccess = (userRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    return userRoles.some(role => ['user', 'reviewer', 'admin'].includes(role));
};export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessRequestSubmitted, setAccessRequestSubmitted] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/.auth/me');
      if (response.ok) {
        const authInfo = await response.json();
        const clientPrincipal = authInfo.clientPrincipal;
        
        if (clientPrincipal) {
          setUser({
            userId: clientPrincipal.userId,
            userDetails: clientPrincipal.userDetails,
            email: clientPrincipal.userDetails,
            userRoles: clientPrincipal.userRoles || [],
            identityProvider: clientPrincipal.identityProvider
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // For Azure AD login
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=' + encodeURIComponent(window.location.origin);
  };

  const loginWithGitHub = () => {
    // For GitHub login (if configured)
    window.location.href = '/.auth/login/github?post_login_redirect_uri=' + encodeURIComponent(window.location.origin);
  };

  const loginWithGoogle = () => {
    // For Google login (if configured)
    window.location.href = '/.auth/login/google?post_login_redirect_uri=' + encodeURIComponent(window.location.origin);
  };

  const logout = () => {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=' + encodeURIComponent(window.location.origin);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    hasAccess: user ? hasAccess(user.userRoles) : false,
    hasRole: (role) => user ? hasRole(user.userRoles, role) : false,
    login,
    loginWithGitHub,
    loginWithGoogle,
    logout,
    checkAuthStatus,
    accessRequestSubmitted,
    setAccessRequestSubmitted
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};