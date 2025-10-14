import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const UpcomingAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockAssignments = [
      {
        _id: '1',
        title: 'React State Management Project',
        course: 'Full-Stack React Development',
        module: 'Advanced React Concepts',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        maxPoints: 100,
        type: 'project',
        submitted: false
      },
      {
        _id: '2',
        title: 'CSS Grid Layout Exercise',
        course: 'Web Development Basics',
        module: 'CSS Layouts',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        maxPoints: 50,
        type: 'exercise',
        submitted: false
      },
      {
        _id: '3',
        title: 'JavaScript ES6 Quiz',
        course: 'JavaScript Fundamentals',
        module: 'Modern JavaScript',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 25,
        type: 'quiz',
        submitted: true
      }
    ];

    setAssignments(mockAssignments);
    setLoading(false);
  }, []);

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (dueDate) => {
    const daysLeft = getDaysUntilDue(dueDate);
    if (daysLeft <= 1) return 'text-red-600 bg-red-100';
    if (daysLeft <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getUrgencyIcon = (dueDate) => {
    const daysLeft = getDaysUntilDue(dueDate);
    if (daysLeft <= 1) return ExclamationTriangleIcon;
    if (daysLeft <= 3) return ClockIcon;
    return CalendarIcon;
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Assignments</h3>
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
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
        <Link
          to="/student/assignments"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming assignments</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const daysLeft = getDaysUntilDue(assignment.dueDate);
            const UrgencyIcon = getUrgencyIcon(assignment.dueDate);
            
            return (
              <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">
                      {assignment.course} • {assignment.module}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      {assignment.type} • {assignment.maxPoints} points
                    </div>
                  </div>
                  
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(assignment.dueDate)} ml-4`}>
                    <UrgencyIcon className="w-3 h-3 mr-1" />
                    {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Overdue'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Due: {formatDueDate(assignment.dueDate)}
                  </div>
                  
                  {assignment.submitted ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Submitted
                    </span>
                  ) : (
                    <Link
                      to={`/student/assignments/${assignment._id}`}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      View Assignment
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;
