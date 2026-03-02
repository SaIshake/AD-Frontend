import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('adm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ⚠️ OLD interceptor was doing window.location.href = '/login'
// That causes a FULL page reload — replaced with just rejecting the promise
API.interceptors.response.use(
  res => res,
  err => {
    // Only clear token and redirect if it's a 401 on a protected route
    // NOT on the login route itself
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('adm_token');
      localStorage.removeItem('adm_user');
      // Use React Router navigation instead of hard reload
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('adm_token');
      const userData = localStorage.getItem('adm_user');

      // 1. Initial local state (for fast UI startup)
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          localStorage.removeItem('adm_token');
          localStorage.removeItem('adm_user');
        }
      }

      // 2. Background sync with server for fresh AD data
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data);
          localStorage.setItem('adm_user', JSON.stringify(data));
        } catch (err) {
          // If token is invalid (401), clear it
          if (err.response?.status === 401) {
            localStorage.removeItem('adm_token');
            localStorage.removeItem('adm_user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Listen for auth logout event (fired by interceptor)
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = async (username, password) => {
    const { data } = await API.post('/auth/login', { username, password });
    localStorage.setItem('adm_token', data.token);
    localStorage.setItem('adm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      // Tell server to blocklist the token
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      // Always clear local state regardless of API result
      localStorage.removeItem('adm_token');
      localStorage.removeItem('adm_user');
      setUser(null);
    }
  };

  const can = (permission) => user?.permissions?.includes(permission) ?? false;

  return (
    <AuthContext.Provider value={{ user, login, logout, can, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
