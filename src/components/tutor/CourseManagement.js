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
  TrashIcon
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="card hover:shadow-lg transition-shadow duration-300 h-full">
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.isPublished 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    <span>{course.enrolledStudents?.length || 0} students</span>
                    <span className="mx-2">•</span>
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.totalModules || 0} modules • {course.totalAssignments || 0} assignments
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tutor/courses/${course._id}`}
                      className="btn-primary w-full md:flex-1 text-sm py-1 px-3 text-center"
                    >
                      Manage Course
                    </Link>
                    
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-outline text-sm py-1 px-3"
                      title="Preview Course"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    
                    <Link
                      to={`/tutor/courses/${course._id}/edit`}
                      className="btn-outline text-sm py-1 px-3"
                      title="Edit Course"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`btn-outline text-sm py-1 px-3 ${course.isPublished ? 'text-yellow-700' : 'text-green-700'}`}
                      title={course.isPublished ? 'Unpublish' : 'Publish'}
                      disabled={publishingId === course._id}
                    >
                      {publishingId === course._id ? 'Updating…' : (course.isPublished ? 'Unpublish' : 'Publish')}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="btn-outline text-sm py-1 px-3 text-red-600 hover:bg-red-50 hover:border-red-200"
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
