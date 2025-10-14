import { useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:54112/api';

// Create a pre-configured axios instance
export const api = axios.create({
  baseURL: API_URL,
});

// Hook: login
export function useLoginEndpoint() {
  const login = useCallback(async ({ email, password }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  return login;
}

// Hook: register
export function useRegisterEndpoint() {
  const register = useCallback(async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      const { user, token } = response.data.data;
      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }, []);

  return register;
}


