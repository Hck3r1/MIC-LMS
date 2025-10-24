import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import {
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, fetchInstructorCourses, deleteCourse, updateCourse } = useCourses();
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);

  const loadCourses = useCallback(async () => {
    try {
      const instructorId = user?.id || user?._id;
      if (!instructorId) return;
      await fetchInstructorCourses(instructorId);
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  }, [fetchInstructorCourses, user?.id, user?._id]);

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteCourse(courseId);
        loadCourses(); // Reload courses
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      setPublishingId(course._id);
      await updateCourse(course._id, { isPublished: !course.isPublished });
      await loadCourses();
    } catch (e) {
      console.error('Toggle publish failed', e);
    } finally {
      setPublishingId(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses</h2>
        <button
          onClick={() => navigate('/tutor/create-course')}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Courses Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first course to start teaching and sharing your knowledge with students.
          </p>
          <button
            onClick={() => navigate('/tutor/create-course')}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 h-full flex flex-col hover:-translate-y-1">
              {/* Course Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 transform transition-transform duration-300 group-hover:scale-105">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                    course.isPublished 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 transform transition-transform duration-300 group-hover:scale-105">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm bg-white/20 text-white">
                    {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>

              {/* Course Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Title and Rating */}
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <StarIcon className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="ml-1">({course.rating?.count || 0} reviews)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>{course.enrolledStudents?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center">
                    <BookOpenIcon className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium whitespace-nowrap">{course.totalModules || 0} modules</span>
                  </div>
                  <div className="flex items-center">
                    <PencilIcon className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium whitespace-nowrap">{course.totalAssignments || 0} assignments</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-3">
                  {/* Primary Action */}
                  <Link
                    to={`/tutor/courses/${course._id}`}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl text-center block transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center">
                      <BookOpenIcon className="w-5 h-5 mr-2" />
                      Manage Course
                    </span>
                  </Link>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Preview Course"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Preview
                    </Link>
                    
                    <Link
                      to={`/tutor/courses/${course._id}/edit`}
                      className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit Course"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </div>

                  {/* Publish/Delete Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`flex-1 flex items-center justify-center text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                        course.isPublished 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                      disabled={publishingId === course._id}
                    >
                      {publishingId === course._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          {course.isPublished ? (
                            <>
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Publish
                            </>
                          )}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Delete Course"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};


export default CourseManagement;
