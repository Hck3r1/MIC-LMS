import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const UpcomingAssignments = ({ assignments }) => {
  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilDue <= 1) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilDue <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getUrgencyIcon = (daysUntilDue) => {
    if (daysUntilDue < 0) return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (daysUntilDue <= 1) return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (daysUntilDue <= 3) return <ClockIcon className="w-4 h-4" />;
    return <CalendarIcon className="w-4 h-4" />;
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (assignment) => {
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    
    if (assignment.status === 'submitted') {
      return 'Submitted';
    } else if (assignment.status === 'graded') {
      return `Graded: ${assignment.grade}%`;
    } else if (daysUntilDue < 0) {
      return 'Overdue';
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  const getStatusColor = (assignment) => {
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    
    if (assignment.status === 'submitted') {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (assignment.status === 'graded') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (daysUntilDue < 0) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (daysUntilDue <= 1) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (daysUntilDue <= 3) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Assignments</h3>
        <div className="text-center py-8">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No upcoming assignments</p>
          <p className="text-gray-400 text-xs mt-1">Great job staying on top of your work!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
        <Link
          to="/student/assignments"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all
        </Link>
      </div>
      
      <div className="space-y-3">
        {assignments.slice(0, 5).map((assignment) => {
          const daysUntilDue = getDaysUntilDue(assignment.dueDate);
          
          return (
            <div
              key={assignment._id}
              className={`p-4 rounded-lg border ${getUrgencyColor(daysUntilDue)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {assignment.title}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {assignment.courseName}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDueDate(assignment.dueDate)}
                      </span>
                    </div>
                    
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment)}`}>
                      {getUrgencyIcon(daysUntilDue)}
                      <span>{getStatusText(assignment)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {assignment.status !== 'submitted' && assignment.status !== 'graded' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Link
                    to={`/courses/${assignment.courseId}/assignments/${assignment._id}`}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Assignment →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {assignments.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/student/assignments"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all {assignments.length} assignments
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingAssignments;

