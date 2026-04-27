import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/koalaApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.checkAuth()
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setRole(data.role || null);
        setName(data.name || null);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (code) => {
    const data = await api.login(code);
    setIsAuthenticated(true);
    setRole(data.role);
    setName(data.name);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setIsAuthenticated(false);
    setRole(null);
    setName(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, name, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
