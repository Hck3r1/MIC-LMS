import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockSubmissions = [
      {
        _id: '1',
        student: {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          avatar: ''
        },
        assignment: {
          _id: '1',
          title: 'React Components Assignment',
          course: 'Full-Stack React Development'
        },
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'submitted',
        grade: null,
        maxPoints: 100
      },
      {
        _id: '2',
        student: {
          _id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: ''
        },
        assignment: {
          _id: '2',
          title: 'CSS Grid Layout',
          course: 'Web Development Basics'
        },
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: 'graded',
        grade: 85,
        maxPoints: 100
      },
      {
        _id: '3',
        student: {
          _id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          avatar: ''
        },
        assignment: {
          _id: '3',
          title: 'JavaScript Fundamentals Quiz',
          course: 'JavaScript Basics'
        },
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'graded',
        grade: 92,
        maxPoints: 100
      }
    ];

    setSubmissions(mockSubmissions);
    setLoading(false);
  }, []);

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
