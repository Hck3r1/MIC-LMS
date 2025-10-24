import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import {
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const EnrolledCourses = ({ stats }) => {
  const { user } = useAuth();
  const { fetchCourses } = useCourses();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.enrolledCourses) {
      setEnrolledCourses(user.enrolledCourses);
    }
    setLoading(false);
  }, [user]);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpenIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Enrolled Courses</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          You haven't enrolled in any courses yet. Start your learning journey today and unlock your potential!
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Learning Journey</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Continue where you left off and track your progress</p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Browse More Courses
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment) => {
          const course = enrollment.course || enrollment;
          const progress = enrollment.progress || 0;
          
          return (
            <div key={course._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600">
              {/* Course Thumbnail */}
              <div className="relative overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white">
                      <BookOpenIcon className="w-16 h-16 mb-2" />
                      <span className="text-sm font-medium">Course Preview</span>
                    </div>
                  )}
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Difficulty Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1)}
                  </span>
                </div>

                {/* Progress Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                    {progress}% Complete
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Course Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {course.title}
                </h3>

                {/* Course Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Meta */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center mr-4">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium">{course.duration}h</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{course.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs ml-1">({course.rating?.count || 0})</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Your Progress</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)} shadow-sm`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link 
                    to={`/courses/${course._id}/learn`} 
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl text-center block transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue Learning
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/student/progress/${course._id}`}
                      className="flex-1 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center"
                    >
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      Progress
                    </Link>
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;
