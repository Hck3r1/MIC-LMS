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

const EnrolledCourses = () => {
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
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="card text-center py-12">
        <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses</h3>
        <p className="text-gray-600 mb-6">
          You haven't enrolled in any courses yet. Start your learning journey today!
        </p>
        <Link
          to="/courses"
          className="btn-primary inline-flex items-center"
        >
          Browse Courses
          <PlayIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <Link
          to="/courses"
          className="btn-outline inline-flex items-center"
        >
          Browse More
          <PlayIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrolledCourses.map((enrollment) => {
          const course = enrollment.course || enrollment;
          const progress = enrollment.progress || 0;
          
          return (
            <div key={course._id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex space-x-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{course.duration}h</span>
                    <span className="mx-2">•</span>
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
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

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Continue Learning
                    </Link>
                    <Link
                      to={`/student/progress/${course._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                    >
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      View Progress
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
