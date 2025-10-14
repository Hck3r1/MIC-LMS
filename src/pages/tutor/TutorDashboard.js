import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseManagement from '../../components/tutor/CourseManagement';
import RecentSubmissions from '../../components/tutor/RecentSubmissions';
import AnalyticsOverview from '../../components/tutor/AnalyticsOverview';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const TutorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👨‍🏫
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your courses and track student progress
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="btn-outline flex items-center">
                <BellIcon className="w-4 h-4 mr-2" />
                Notifications
              </button>
              <button className="btn-primary flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Course
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grades</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Course Management */}
          <div className="lg:col-span-2">
            <CourseManagement />
          </div>

          {/* Right Column - Submissions */}
          <div>
            <RecentSubmissions />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <AnalyticsOverview />
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <PlusIcon className="w-6 h-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Create New Course</p>
                <p className="text-sm text-gray-600">Start teaching a new subject</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Grade Assignments</p>
                <p className="text-sm text-gray-600">Review and grade submissions</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <UsersIcon className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Students</p>
                <p className="text-sm text-gray-600">View student progress and feedback</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;

