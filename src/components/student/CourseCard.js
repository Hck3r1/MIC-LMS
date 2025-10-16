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
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <BookOpenIcon className="w-16 h-16 text-white" />
          )}
        </div>
        
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {isEnrolled && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Enrolled
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <UserIcon className="w-4 h-4 mr-1" />
          <span className="truncate">{course.instructor?.firstName} {course.instructor?.lastName}</span>
          <span className="mx-2">•</span>
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{course.duration}h</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium text-gray-700">
              {course.rating?.average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({course.rating?.count || 0})
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {course.enrolledStudents?.length || 0} students
          </div>
        </div>

        {/* Progress Bar for enrolled courses */}
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isEnrolled ? (
            <>
              <Link to={`/courses/${course._id}/learn`} className="flex-1 btn-primary text-center text-sm py-2">Continue Learning</Link>
              <button
                onClick={() => onUnenroll(course._id)}
                className="btn-outline text-sm py-2 px-3"
              >
                Unenroll
              </button>
            </>
          ) : (
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => onEnroll(course._id)}
                className="btn-primary text-sm py-2 flex-1 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Enrolling...' : 'Enroll Now'}
              </button>
              <Link to={`/courses/${course._id}/learn`} className="btn-outline text-sm py-2 px-3">Preview</Link>
            </div>
          )}
        </div>

        {isEnrolled && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Link
              to={`/student/progress/${course._id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              <ChartBarIcon className="w-4 h-4 mr-1" />
              View Progress
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
