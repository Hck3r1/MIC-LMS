import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const NotificationsContext = createContext();

const initialState = { items: [], unreadCount: 0, nextCursor: null, loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LIST':
      return {
        ...state,
        items: action.payload.items || action.payload.notifications || [],
        unreadCount: action.payload.unreadCount ?? state.unreadCount,
        nextCursor: action.payload.nextCursor ?? null,
        loading: false,
        error: null
      };
    case 'APPEND_LIST':
      return {
        ...state,
        items: [...state.items, ...((action.payload.items || action.payload.notifications) || [])],
        nextCursor: action.payload.nextCursor ?? null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'MARK_READ':
      return { ...state, items: state.items.map(n => action.payload.ids.includes(n._id) ? { ...n, readAt: new Date().toISOString() } : n), unreadCount: Math.max(0, state.unreadCount - action.payload.ids.length) };
    default:
      return state;
  }
}

export const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);
  const { token } = useAuth();

  const listNotifications = useCallback(async ({ unread = false, cursor, limit = 20 } = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.get(`${API_URL}/notifications`, { params: { unread, cursor, limit }, headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      const data = res.data?.data || {};
      dispatch({ type: 'SET_LIST', payload: { items: data.notifications || [], unreadCount: data.unreadCount || 0, nextCursor: data.nextCursor || null } });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.response?.data?.message || 'Failed to load notifications' });
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!state.nextCursor) return;
    const res = await axios.get(`${API_URL}/notifications`, { params: { cursor: state.nextCursor }, headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
    const data = res.data?.data || {};
    dispatch({ type: 'APPEND_LIST', payload: { items: data.notifications || [], nextCursor: data.nextCursor || null } });
  }, [state.nextCursor]);

  const markSeen = useCallback(async () => {
    await axios.post(`${API_URL}/notifications/mark-seen`, null, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
  }, []);

  const markRead = useCallback(async (ids) => {
    await axios.post(`${API_URL}/notifications/mark-read`, { ids }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
    dispatch({ type: 'MARK_READ', payload: { ids } });
  }, []);

  // Socket connection
  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    const url = API_URL.replace('/api', '');
    const socket = io(url, { auth: { token } });
    socketRef.current = socket;
    socket.on('notification:new', (payload) => {
      dispatch({ type: 'SET_LIST', payload: { items: [payload, ...state.items], unreadCount: state.unreadCount + 1, nextCursor: state.nextCursor } });
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, state.items, state.unreadCount, state.nextCursor]);

  const value = { ...state, listNotifications, loadMore, markSeen, markRead };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};


