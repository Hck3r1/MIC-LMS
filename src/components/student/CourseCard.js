import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const CourseCard = ({ course, enrollment, onEnroll, onUnenroll, loading }) => {
  const progress = enrollment?.progress || 0;
  const isEnrolled = !!enrollment;

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

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600">
      {/* Course Thumbnail */}
      <div className="relative overflow-hidden">
        <div className="w-full h-56 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center overflow-hidden">
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

        {/* Enrolled Badge */}
        {isEnrolled && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white shadow-lg backdrop-blur-sm">
              ✓ Enrolled
            </span>
          </div>
        )}

        {/* Course Category */}
        <div className="absolute bottom-4 left-4">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
            {course.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Course'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>

        {/* Course Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor & Duration */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center mr-4">
            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-2">
              <UserIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="truncate max-w-[120px] font-medium">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span className="font-medium">{course.duration}h</span>
          </div>
        </div>

        {/* Rating & Students */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {course.rating?.average?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({course.rating?.count || 0} reviews)
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="font-medium">{course.enrolledStudents?.length || 0} students</span>
          </div>
        </div>

        {/* Progress Bar for enrolled courses */}
        {isEnrolled && (
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
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          {isEnrolled ? (
            <div className="space-y-3">
              <Link 
                to={`/courses/${course._id}/learn`} 
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl text-center block transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue Learning
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => onUnenroll(course._id)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Unenroll
                </button>
                <Link
                  to={`/student/progress/${course._id}`}
                  className="flex-1 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center"
                >
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  Progress
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => onEnroll(course._id)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </div>
                ) : (
                  'Enroll Now'
                )}
              </button>
              <Link 
                to={`/courses/${course._id}`} 
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-center block"
              >
                Preview Course
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
