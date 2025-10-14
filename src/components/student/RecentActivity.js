import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RecentActivity = () => {
  // Mock data - in real app, this would come from API
  const activities = [
    {
      id: 1,
      type: 'assignment_submitted',
      title: 'React Components Assignment',
      course: 'Full-Stack React Development',
      timestamp: '2 hours ago',
      status: 'submitted',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'module_completed',
      title: 'JavaScript Fundamentals',
      course: 'Full-Stack React Development',
      timestamp: '1 day ago',
      status: 'completed',
      icon: CheckCircleIcon,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'assignment_due',
      title: 'CSS Grid Layout',
      course: 'Web Development Basics',
      timestamp: '2 days ago',
      status: 'due_soon',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      type: 'grade_received',
      title: 'HTML Structure Assignment',
      course: 'Web Development Basics',
      timestamp: '3 days ago',
      status: 'graded',
      icon: CheckCircleIcon,
      color: 'text-green-600'
    }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'completed':
        return 'Completed';
      case 'due_soon':
        return 'Due Soon';
      case 'graded':
        return 'Graded';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Link
          to="/student/activity"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 truncate">
                {activity.course}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ClockIcon className="w-3 h-3 mr-1" />
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
