import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            id: clientPrincipal.userId,
            name: clientPrincipal.userDetails,
            email: clientPrincipal.userDetails,
            roles: clientPrincipal.userRoles || ['authenticated'],
            provider: clientPrincipal.identityProvider
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
    login,
    loginWithGitHub,
    loginWithGoogle,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};