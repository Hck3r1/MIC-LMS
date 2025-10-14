import React from 'react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'course_enrolled':
        return <BookOpenIcon className="w-5 h-5 text-primary-600" />;
      case 'module_completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'assignment_submitted':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
      case 'assignment_graded':
        return <CheckCircleIcon className="w-5 h-5 text-purple-600" />;
      case 'video_watched':
        return <PlayIcon className="w-5 h-5 text-red-600" />;
      case 'due_soon':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'course_enrolled':
        return 'bg-primary-50 border-primary-200';
      case 'module_completed':
        return 'bg-green-50 border-green-200';
      case 'assignment_submitted':
        return 'bg-blue-50 border-blue-200';
      case 'assignment_graded':
        return 'bg-purple-50 border-purple-200';
      case 'video_watched':
        return 'bg-red-50 border-red-200';
      case 'due_soon':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'course_enrolled':
        return `Enrolled in "${activity.courseName}"`;
      case 'module_completed':
        return `Completed module "${activity.moduleName}" in "${activity.courseName}"`;
      case 'assignment_submitted':
        return `Submitted assignment "${activity.assignmentName}"`;
      case 'assignment_graded':
        return `Assignment "${activity.assignmentName}" graded: ${activity.grade}%`;
      case 'video_watched':
        return `Watched "${activity.videoName}" in "${activity.courseName}"`;
      case 'due_soon':
        return `Assignment "${activity.assignmentName}" due soon`;
      default:
        return activity.message || 'Activity completed';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-gray-400 text-xs mt-1">Start learning to see your activity here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 10).map((activity, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimeAgo(activity.createdAt)}
              </p>
              {activity.courseName && activity.type !== 'course_enrolled' && (
                <p className="text-xs text-gray-400 mt-1">
                  in {activity.courseName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

