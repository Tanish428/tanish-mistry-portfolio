import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './useAuth.js';
import * as authApi from '../api/authApi.js';
import { clearCsrfToken } from '../api/csrf.js';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentAdmin = await authApi.getCurrentAdmin();
      setAdmin(currentAdmin || null);
    } catch (err) {
      if (err?.status !== 401) {
        setError(err.message || 'Failed to authenticate session');
      }
      setAdmin(null);
      clearCsrfToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    authApi.getCurrentAdmin()
      .then((currentAdmin) => {
        if (isMounted) {
          setAdmin(currentAdmin || null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err?.status !== 401) {
            setError(err.message || 'Failed to authenticate session');
          }
          setAdmin(null);
          clearCsrfToken();
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setError(null);
    try {
      const loggedInAdmin = await authApi.login(email, password);
      setAdmin(loggedInAdmin);
      return loggedInAdmin;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local state even if server logout request fails
    } finally {
      setAdmin(null);
      setError(null);
      clearCsrfToken();
    }
  }, []);

  const value = {
    admin,
    isAuthenticated: Boolean(admin),
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshSession: checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
