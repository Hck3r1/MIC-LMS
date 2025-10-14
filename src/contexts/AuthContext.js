import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:54112/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload
      };
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user function
  const loadUser = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.get(`${API_URL}/auth/me`);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: state.token
        }
      });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.message || 'Failed to load user' 
      });
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: null });
    }
  }, [state.token, loadUser]);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data.data;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      const { user, token } = response.data.data;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('token');
    }
  };

  // Allow external flows (e.g., endpoint hooks) to set token
  const setToken = (token) => {
    dispatch({ type: 'SET_TOKEN', payload: token });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Upload avatar function
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_URL}/auth/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      dispatch({
        type: 'UPDATE_USER',
        payload: { avatar: response.data.data.avatar }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Avatar upload failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    setToken,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

