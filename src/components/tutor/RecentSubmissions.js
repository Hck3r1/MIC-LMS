import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const RecentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';
  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/submissions/recent?limit=6`, { headers });
        const list = res.data?.data?.submissions || [];
        // Normalize to UI shape
        const normalized = list.map(s => ({
          _id: s._id,
          student: {
            _id: s.studentId?._id || s.studentId,
            firstName: s.studentId?.firstName || '',
            lastName: s.studentId?.lastName || '',
            avatar: s.studentId?.avatar || ''
          },
          assignment: {
            _id: s.assignmentId?._id || s.assignmentId,
            title: s.assignmentId?.title || 'Assignment',
            course: s.courseId?.title || 'Course'
          },
          submittedAt: new Date(s.createdAt || s.submittedAt || Date.now()),
          status: s.status || 'submitted',
          grade: (() => {
            if (typeof s.gradePercentage === 'number' && !isNaN(s.gradePercentage)) {
              return Math.round((s.gradePercentage / 100) * (s.maxPoints || 100));
            } else if (typeof s.grade === 'number' && !isNaN(s.grade)) {
              return s.grade;
            }
            return null;
          })(),
          maxPoints: s.maxPoints || 100
        }));
        setSubmissions(normalized);
      } catch (_) {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_URL, headers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Needs Grading';
      case 'graded':
        return 'Graded';
      case 'returned':
        return 'Returned';
      default:
        return 'Unknown';
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    if (!grade) return 'text-gray-500';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Submissions</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
        <Link
          to="/tutor/submissions"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {submission.student.avatar ? (
                      <img
                        src={submission.student.avatar}
                        alt={`${submission.student.firstName} ${submission.student.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.student.firstName} {submission.student.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{submission.assignment.course}</p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                  {submission.status === 'submitted' && <ClockIcon className="w-3 h-3 mr-1" />}
                  {submission.status === 'graded' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                  {getStatusText(submission.status)}
                </span>
              </div>

              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {submission.assignment.title}
              </h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {formatTimeAgo(submission.submittedAt)}
                </div>
                
                <div className="flex items-center space-x-3">
                  {submission.grade !== null ? (
                    <span className={`text-sm font-medium ${getGradeColor(submission.grade, submission.maxPoints)}`}>
                      {submission.grade}/{submission.maxPoints}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {submission.maxPoints} points
                    </span>
                  )}
                  
                  <Link
                    to={`/tutor/submissions/${submission._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {submission.status === 'graded' ? 'View' : 'Grade'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {submissions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {submissions.filter(s => s.status === 'submitted').length} pending
            </span>
            <span className="text-gray-600">
              {submissions.filter(s => s.status === 'graded').length} graded
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentSubmissions;
