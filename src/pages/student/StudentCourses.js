import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EnrolledCourses from '../../components/student/EnrolledCourses';

const StudentCourses = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    timeSpent: 0,
    certificates: 0,
    overallProgress: 0
  });

  useEffect(() => {
    if (user?.enrolledCourses) {
      const enrolledCourses = user.enrolledCourses;
      const totalCourses = enrolledCourses.length;
      
      // Calculate completed courses (assuming 100% progress means completed)
      const completedCourses = enrolledCourses.filter(enrollment => {
        const progress = enrollment.progress || 0;
        return progress >= 100;
      }).length;

      // Calculate total time spent (sum of course durations)
      const totalTimeSpent = enrolledCourses.reduce((total, enrollment) => {
        const course = enrollment.course || enrollment;
        return total + (course.duration || 0);
      }, 0);

      // Calculate overall progress (average of all course progress)
      const totalProgress = enrolledCourses.reduce((total, enrollment) => {
        return total + (enrollment.progress || 0);
      }, 0);
      const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

      setStats({
        enrolled: totalCourses,
        completed: completedCourses,
        timeSpent: totalTimeSpent,
        certificates: completedCourses, // Assuming completed courses = certificates
        overallProgress: averageProgress
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">My Courses</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">Track your learning progress and continue your journey</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.enrolled}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Courses Enrolled</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.overallProgress}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.enrolled}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Enrolled</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.timeSpent}h</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Time Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.certificates}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Certificates</div>
              </div>
            </div>
          </div>
        </div>

        <EnrolledCourses stats={stats} />
      </div>
    </div>
  );
};

export default StudentCourses;


