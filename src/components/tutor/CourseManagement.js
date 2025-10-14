import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const { user } = useAuth();
  const { courses, fetchCourses, deleteCourse } = useCourses();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [user._id, loadCourses]);

  const loadCourses = async () => {
    try {
      await fetchCourses(1, { instructor: user._id });
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first course to start teaching and sharing your knowledge with students.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    <span>{course.enrolledStudents?.length || 0} students</span>
                    <span className="mx-2">•</span>
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>{course.rating?.average?.toFixed(1) || '0.0'}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {course.totalModules || 0} modules • {course.totalAssignments || 0} assignments
                    </div>
                    <div className="text-sm text-gray-600">
                      {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/tutor/courses/${course._id}`}
                      className="flex-1 btn-primary text-sm py-1 px-3 text-center"
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

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadCourses();
          }}
        />
      )}
    </div>
  );
};

// Create Course Modal Component
const CreateCourseModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createCourse } = useCourses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createCourse(formData);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Course</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={3}
                className="input-field"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="web-development">Web Development</option>
                  <option value="ui-ux">UI/UX Design</option>
                  <option value="data-science">Data Science</option>
                  <option value="video-editing">Video Editing</option>
                  <option value="graphics-design">Graphics Design</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  required
                  className="input-field"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  className="input-field"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  className="input-field"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseManagement;
