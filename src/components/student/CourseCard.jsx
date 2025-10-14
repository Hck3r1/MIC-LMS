import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CourseCard = ({ course, enrollment, onEnroll, onUnenroll }) => {
  const isEnrolled = enrollment !== null;
  const progress = enrollment?.progress || 0;

  const getCategoryColor = (category) => {
    const colors = {
      'web-development': 'bg-blue-100 text-blue-800',
      'ui-ux': 'bg-purple-100 text-purple-800',
      'data-science': 'bg-green-100 text-green-800',
      'video-editing': 'bg-red-100 text-red-800',
      'graphics-design': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (category) => {
    const names = {
      'web-development': 'Web Development',
      'ui-ux': 'UI/UX Design',
      'data-science': 'Data Science',
      'video-editing': 'Video Editing',
      'graphics-design': 'Graphics Design'
    };
    return names[category] || category;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300 group">
      {/* Course Thumbnail */}
      <div className="relative mb-4">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="w-16 h-16 text-primary-600" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
            {getCategoryName(course.category)}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Play Button Overlay */}
        {isEnrolled && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link
                to={`/courses/${course._id}`}
                className="bg-white text-primary-600 p-3 rounded-full hover:bg-primary-600 hover:text-white transition-colors duration-200"
              >
                <PlayIcon className="w-6 h-6" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Instructor */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            {course.instructor?.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 text-sm font-medium">
                {course.instructor?.firstName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{course.duration}h</span>
          </div>
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{course.enrolledStudents?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <StarIconSolid className="w-4 h-4 text-yellow-400" />
            <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-primary-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3">
          {isEnrolled ? (
            <div className="flex space-x-2">
              <Link
                to={`/courses/${course._id}`}
                className="flex-1 btn-primary text-center"
              >
                Continue Learning
              </Link>
              <button
                onClick={() => onUnenroll(course._id)}
                className="btn-outline"
              >
                Unenroll
              </button>
            </div>
          ) : (
            <button
              onClick={() => onEnroll(course._id)}
              className="w-full btn-primary"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

