import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

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
    case 'RESET_COURSE':
      return {
        ...state,
        currentCourse: null,
        modules: [],
        assignments: [],
        loading: true,
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

  // Compose Authorization header from stored token
  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (_) {
      return {};
    }
  };

  // Fetch courses with filters and pagination
  const fetchCourses = useCallback(async (page = 1, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const params = new URLSearchParams({ page: page.toString(), limit: '12' });
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
      });

      const response = await axios.get(`${API_URL}/courses?${params}`, { headers: getAuthHeaders() });

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
  const fetchCourse = useCallback(async (courseId) => {
    try {
      dispatch({ type: 'RESET_COURSE' });
      const response = await axios.get(`${API_URL}/courses/${courseId}`, { headers: getAuthHeaders() });
      dispatch({ type: 'SET_COURSE', payload: response.data.data.course });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch course' });
    }
  }, []);

  // Fetch instructor courses (includes drafts)
  const fetchInstructorCourses = useCallback(async (instructorId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_URL}/courses?instructor=${instructorId}` , { headers: getAuthHeaders() });
      dispatch({ type: 'SET_COURSES', payload: response.data.data.courses || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch instructor courses' });
    }
  }, []);

  // Fetch course enrollments
  const fetchCourseEnrollments = useCallback(async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}/students`, { headers: getAuthHeaders() });
      return { success: true, students: response.data.data.students };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch enrollments' };
    }
  }, []);

  // (Removed duplicate definition)

  // Create course
  const createCourse = useCallback(async (courseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_URL}/courses`, courseData, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      
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
  }, []);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      
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
  }, []);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await axios.delete(`${API_URL}/courses/${courseId}`, { headers: getAuthHeaders() });
      
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
  }, []);

  // Enroll in course
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      await axios.post(`${API_URL}/courses/${courseId}/enroll`, null, { headers: getAuthHeaders() });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Unenroll from course
  const unenrollFromCourse = useCallback(async (courseId) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/enroll`, { headers: getAuthHeaders() });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to unenroll from course';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Upload course thumbnail
  const uploadThumbnail = useCallback(async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await axios.post(`${API_URL}/courses/${courseId}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });

      return { success: true, thumbnail: response.data.data.thumbnail };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload thumbnail';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Upload course banner
  const uploadBanner = useCallback(async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await axios.post(`${API_URL}/courses/${courseId}/banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });

      return { success: true, banner: response.data.data.banner };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload banner';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create module
  const createModule = useCallback(async (moduleData) => {
    try {
      const response = await axios.post(`${API_URL}/modules`, moduleData, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      return { success: true, module: response.data.data.module };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create module';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Add content to module
  const addModuleContent = useCallback(async (moduleId, contentData) => {
    try {
      const response = await axios.post(`${API_URL}/modules/${moduleId}/content`, contentData, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      return { success: true, module: response.data.data.module };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add module content';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create assignment
  const createAssignment = useCallback(async (assignmentData) => {
    try {
      const response = await axios.post(`${API_URL}/assignments`, assignmentData, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      return { success: true, assignment: response.data.data.assignment };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create assignment';
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateAssignment = useCallback(async (assignmentId, update) => {
    try {
      const response = await axios.put(`${API_URL}/assignments/${assignmentId}`, update, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
      return { success: true, assignment: response.data.data.assignment };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update assignment';
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteAssignment = useCallback(async (assignmentId) => {
    try {
      await axios.delete(`${API_URL}/assignments/${assignmentId}`, { headers: getAuthHeaders() });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete assignment';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch modules for a course
  const fetchModules = useCallback(async (courseId) => {
    try {
      // keep loading true if reset just happened
      const response = await axios.get(`${API_URL}/modules/course/${courseId}`, { headers: getAuthHeaders() });
      // Be tolerant to varying API response shapes across environments
      const data = response?.data;
      const modules = Array.isArray(data?.data?.modules)
        ? data.data.modules
        : Array.isArray(data?.modules)
          ? data.modules
          : Array.isArray(data?.data)
            ? data.data
            : [];
      dispatch({ type: 'SET_MODULES', payload: modules });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch modules' });
    }
  }, []);

  // Fetch assignments for a module
  const fetchAssignments = useCallback(async (moduleId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_URL}/assignments/module/${moduleId}`, { headers: getAuthHeaders() });
      // Accept different response wrappers
      const data = response?.data;
      const assignments = Array.isArray(data?.data?.assignments)
        ? data.data.assignments
        : Array.isArray(data?.assignments)
          ? data.assignments
          : Array.isArray(data?.data)
            ? data.data
            : [];
      dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch assignments' });
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Get tutor specialization stats
  const getTutorSpecializationStats = useCallback(async (tutorId) => {
    try {
      const response = await axios.get(`${API_URL}/users/tutors/${tutorId}/specialization-stats`, { headers: getAuthHeaders() });
      return { success: true, stats: response.data.data };
    } catch (error) {
      // Fallback: derive minimal stats client-side to avoid empty UI
      try {
        // Prefer tutor profile (has createdCourses populated)
        const tutorRes = await axios.get(`${API_URL}/users/tutors/${tutorId}`);
        const tutor = tutorRes.data?.data?.tutor;
        if (tutor) {
          const created = Array.isArray(tutor.createdCourses) ? tutor.createdCourses : [];
          const totalCourses = created.length;
          const totalStudents = created.reduce((sum, c) => sum + (Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0), 0);
          const ratings = created
            .map(c => (c.rating && typeof c.rating.average === 'number') ? c.rating.average : null)
            .filter(v => v !== null);
          const averageRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
          return {
            success: true,
            stats: {
              specialization: tutor.specialization,
              totalCourses,
              totalStudents,
              pendingGrades: 0,
              averageRating
            }
          };
        }

        const coursesRes = await axios.get(`${API_URL}/courses?instructor=${tutorId}`, { headers: getAuthHeaders() });
        const courses = coursesRes.data?.data?.courses || [];
        const totalCourses = courses.length;
        const totalStudents = courses.reduce((sum, c) => sum + (Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0), 0);
        const ratings = courses
          .map(c => (c.rating && typeof c.rating.average === 'number') ? c.rating.average : null)
          .filter(v => v !== null);
        const averageRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
        return {
          success: true,
          stats: {
            specialization: undefined,
            totalCourses,
            totalStudents,
            pendingGrades: 0,
            averageRating
          }
        };
      } catch (_) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch specialization stats';
        return { success: false, error: errorMessage };
      }
    }
  }, []);

  // Analytics APIs
  const getTutorOverview = useCallback(async (tutorId, timeframe = '30d') => {
    try {
      const response = await axios.get(`${API_URL}/analytics/tutor/${tutorId}/overview`, { params: { timeframe }, headers: getAuthHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch overview analytics';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getTutorRecentPerformance = useCallback(async (tutorId, timeframe = '30d') => {
    try {
      const response = await axios.get(`${API_URL}/analytics/tutor/${tutorId}/recent-performance`, { params: { timeframe }, headers: getAuthHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch recent performance';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getTutorTopCourses = useCallback(async (tutorId, limit = 3) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/tutor/${tutorId}/top-courses`, { params: { limit }, headers: getAuthHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch top courses';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getTutorActionItems = useCallback(async (tutorId) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/tutor/${tutorId}/action-items`, { headers: getAuthHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch action items';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get tutor profile (public)
  const getTutorProfile = useCallback(async (tutorId) => {
    try {
      const response = await axios.get(`${API_URL}/users/tutors/${tutorId}`);
      return { success: true, tutor: response.data?.data?.tutor };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tutor profile';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getAuthMe = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const hasHeader = !!headers.Authorization || !!axios.defaults.headers.common['Authorization'];
      if (!hasHeader) {
        return { success: false, error: 'Not authenticated' };
      }
      const response = await axios.get(`${API_URL}/auth/me`, { headers });
      return { success: true, me: response.data?.data?.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch current user';
      return { success: false, error: errorMessage };
    }
  }, []);

  const getStudentOverview = useCallback(async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/student/${studentId}/overview`, { headers: getAuthHeaders() });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch student analytics';
      return { success: false, error: errorMessage };
    }
  }, []);

  // duplicate removed

  const value = {
    ...state,
    fetchCourses,
    fetchCourse,
    fetchInstructorCourses,
    fetchCourseEnrollments,
    fetchInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    uploadThumbnail,
    uploadBanner,
    createModule,
    addModuleContent,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    fetchModules,
    fetchAssignments,
    setFilters,
    clearError
    ,getTutorSpecializationStats
    ,getTutorOverview
    ,getTutorRecentPerformance
    ,getTutorTopCourses
    ,getTutorActionItems
    ,getTutorProfile
    ,getAuthMe
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

