import React, { createContext, useContext, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const SubmissionsContext = createContext();

export const SubmissionsProvider = ({ children }) => {
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  const submitAssignment = async ({ assignmentId, textSubmission, files }) => {
    const form = new FormData();
    form.append('assignmentId', assignmentId);
    if (textSubmission) form.append('textSubmission', textSubmission);
    (files || []).forEach((f) => form.append('files', f));
    const res = await axios.post(`${API_URL}/submissions`, form, { headers: { ...authHeaders } });
    return res.data;
  };

  const getAssignmentSubmissions = async (assignmentId) => {
    const res = await axios.get(`${API_URL}/submissions/assignment/${assignmentId}`, { headers: authHeaders });
    return res.data;
  };

  const getStudentSubmissions = async (studentId, courseId) => {
    const res = await axios.get(`${API_URL}/submissions/student/${studentId}`, { params: { courseId }, headers: authHeaders });
    return res.data;
  };

  const gradeSubmission = async (submissionId, { grade, feedback }) => {
    const res = await axios.put(`${API_URL}/submissions/${submissionId}/grade`, { grade, feedback }, { headers: authHeaders });
    return res.data;
  };

  const value = { submitAssignment, getAssignmentSubmissions, getStudentSubmissions, gradeSubmission };
  return <SubmissionsContext.Provider value={value}>{children}</SubmissionsContext.Provider>;
};

export const useSubmissions = () => {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) throw new Error('useSubmissions must be used within a SubmissionsProvider');
  return ctx;
};



