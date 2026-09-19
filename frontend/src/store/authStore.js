import { create } from 'zustand';
import { api } from '../services/api';

const safeJsonParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export const useAuthStore = create((set, get) => ({
  user: safeJsonParse('shopease_user', null),
  token: localStorage.getItem('shopease_token') || null,
  isAuthenticated: !!localStorage.getItem('shopease_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/auth/login', { email, password });
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem('shopease_token', data.token);
      localStorage.setItem('shopease_user', JSON.stringify(user));
      set({ user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/auth/register', userData);
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem('shopease_token', data.token);
      localStorage.setItem('shopease_user', JSON.stringify(user));
      set({ user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('shopease_token');
    localStorage.removeItem('shopease_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  demoLogin: async (role = 'buyer') => {
    set({ loading: true, error: null });
    try {
      const email = `${role}@shopease.com`;
      const data = await api.post('/api/auth/login', { email, password: 'demoPassword123' });
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem('shopease_token', data.token);
      localStorage.setItem('shopease_user', JSON.stringify(user));
      set({ user, token: data.token, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  isAdmin: () => {
    const user = get().user;
    return user && (user.role === 'admin' || user.role === 'seller');
  },
}));
