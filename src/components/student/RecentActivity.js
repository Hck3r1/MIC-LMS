import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ activities = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment_submitted':
        return DocumentTextIcon;
      case 'module_completed':
        return CheckCircleIcon;
      case 'assignment_due':
        return ExclamationTriangleIcon;
      case 'grade_received':
        return StarIcon;
      case 'course_enrolled':
        return AcademicCapIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'assignment_submitted':
        return 'text-blue-600';
      case 'module_completed':
        return 'text-green-600';
      case 'assignment_due':
        return 'text-yellow-600';
      case 'grade_received':
        return 'text-green-600';
      case 'course_enrolled':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (type, status) => {
    switch (type) {
      case 'assignment_submitted':
        return 'Submitted';
      case 'module_completed':
        return 'Completed';
      case 'assignment_due':
        return 'Due Soon';
      case 'grade_received':
        return 'Graded';
      case 'course_enrolled':
        return 'Enrolled';
      default:
        return 'Activity';
    }
  };

  const getStatusColor = (type, status) => {
    switch (type) {
      case 'assignment_submitted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'module_completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'assignment_due':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'grade_received':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'course_enrolled':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffTime = now - activityDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
        <Link
          to="/student/activity"
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const activityColor = getActivityColor(activity.type);
            
            return (
              <div key={activity._id || activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0`}>
                  <ActivityIcon className={`w-4 h-4 ${activityColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.type, activity.status)}`}>
                      {getStatusText(activity.type, activity.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.course || activity.courseTitle}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {formatTimestamp(activity.timestamp || activity.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
