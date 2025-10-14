import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:54112/api';

// Create Course Context
const CourseContext = createContext();

// Course Reducer
const courseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course._id === action.payload._id ? action.payload : course
        ),
        loading: false,
        error: null
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course._id !== action.payload),
        loading: false,
        error: null
      };
    case 'SET_COURSE':
      return {
        ...state,
        currentCourse: action.payload,
        loading: false,
        error: null
      };
    case 'SET_MODULES':
      return {
        ...state,
        modules: action.payload,
        loading: false,
        error: null
      };
    case 'SET_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: action.payload
      };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  courses: [],
  currentCourse: null,
  modules: [],
  assignments: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    difficulty: '',
    search: '',
    sort: 'newest'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNext: false,
    hasPrev: false
  }
};

// Course Provider Component
export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Fetch courses with filters and pagination
  const fetchCourses = useCallback(async (page = 1, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      const response = await axios.get(`${API_URL}/courses?${params}`);

      dispatch({
        type: 'SET_COURSES',
        payload: response.data.data.courses || []
      });

      dispatch({
        type: 'SET_PAGINATION',
        payload: response.data.data.pagination || initialState.pagination
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch courses'
      });
    }
  }, []);

  // Fetch single course
  const fetchCourse = async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      
      dispatch({
        type: 'SET_COURSE',
        payload: response.data.data.course
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch course'
      });
    }
  };

  // Create course
  const createCourse = async (courseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_URL}/courses`, courseData);
      
      dispatch({
        type: 'ADD_COURSE',
        payload: response.data.data.course
      });
      
      return { success: true, course: response.data.data.course };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create course';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update course
  const updateCourse = async (courseId, courseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData);
      
      dispatch({
        type: 'UPDATE_COURSE',
        payload: response.data.data.course
      });
      
      return { success: true, course: response.data.data.course };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update course';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await axios.delete(`${API_URL}/courses/${courseId}`);
      
      dispatch({
        type: 'DELETE_COURSE',
        payload: courseId
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete course';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(`${API_URL}/courses/${courseId}/enroll`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
      return { success: false, error: errorMessage };
    }
  };

  // Unenroll from course
  const unenrollFromCourse = async (courseId) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/enroll`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to unenroll from course';
      return { success: false, error: errorMessage };
    }
  };

  // Upload course thumbnail
  const uploadThumbnail = async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await axios.post(`${API_URL}/courses/${courseId}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return { success: true, thumbnail: response.data.data.thumbnail };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload thumbnail';
      return { success: false, error: errorMessage };
    }
  };

  // Upload course banner
  const uploadBanner = async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await axios.post(`${API_URL}/courses/${courseId}/banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return { success: true, banner: response.data.data.banner };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload banner';
      return { success: false, error: errorMessage };
    }
  };

  // Fetch modules for a course
  const fetchModules = async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`${API_URL}/modules/course/${courseId}`);
      
      dispatch({
        type: 'SET_MODULES',
        payload: response.data.data.modules
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch modules'
      });
    }
  };

  // Fetch assignments for a module
  const fetchAssignments = async (moduleId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`${API_URL}/assignments/module/${moduleId}`);
      
      dispatch({
        type: 'SET_ASSIGNMENTS',
        payload: response.data.data.assignments
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch assignments'
      });
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    uploadThumbnail,
    uploadBanner,
    fetchModules,
    fetchAssignments,
    setFilters,
    clearError
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook to use course context
export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

export default CourseContext;

