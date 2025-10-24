import React, { useState, useEffect, useMemo } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/student/CourseCard';

const Courses = () => {
  const { courses, fetchCourses, enrollInCourse, unenrollFromCourse, getAuthMe, loading } = useCourses();
  const { user } = useAuth();
  const [enrollingId, setEnrollingId] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses(1, filters);
  }, [filters, fetchCourses]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await enrollInCourse(courseId);
      if (res.success) {
        await fetchCourses(1, filters);
        await getAuthMe();
      }
    } catch (e) {
      console.error('Enroll failed', e);
      alert('Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await unenrollFromCourse(courseId);
      if (res.success) {
        await fetchCourses(1, filters);
        await getAuthMe();
      }
    } catch (e) {
      console.error('Unenroll failed', e);
      alert('Failed to unenroll');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Available Courses</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Discover and enroll in courses to advance your IT skills</p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Filter Courses</h2>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span className="text-sm text-gray-500 dark:text-gray-400">Refine your search</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Input */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Search Courses</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  placeholder="Search by title, instructor, or topic..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="web-development">🌐 Web Development</option>
                  <option value="ui-ux">🎨 UI/UX Design</option>
                  <option value="data-science">📊 Data Science</option>
                  <option value="video-editing">🎬 Video Editing</option>
                  <option value="graphics-design">🖼️ Graphics Design</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Difficulty Level</label>
              <div className="relative">
                <select
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.category || filters.difficulty) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    Search: "{filters.search}"
                    <button
                      onClick={() => setFilters({...filters, search: ''})}
                      className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Category: {filters.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button
                      onClick={() => setFilters({...filters, category: ''})}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.difficulty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    Level: {filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
                    <button
                      onClick={() => setFilters({...filters, difficulty: ''})}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setFilters({category: '', difficulty: '', search: ''})}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {courses.length} Course{courses.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filters.search || filters.category || filters.difficulty 
                    ? 'Filtered results' 
                    : 'All available courses'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Grid View
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  enrollment={course.enrolledStudents?.some((enr) => {
                    const enrolledId = (enr.student && (enr.student._id || enr.student.id)) || enr.student;
                    const currentUserId = user?._id || user?.id;
                    return currentUserId && enrolledId && String(enrolledId) === String(currentUserId);
                  })}
                  onEnroll={handleEnroll}
                  onUnenroll={handleUnenroll}
                  loading={enrollingId === course._id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 dark:text-gray-500 mb-6">
                <svg className="mx-auto h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No courses found</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {filters.search || filters.category || filters.difficulty 
                  ? 'No courses match your current filters. Try adjusting your search criteria.'
                  : 'No courses are available at the moment. Check back later for new courses.'
                }
              </p>
              {(filters.search || filters.category || filters.difficulty) && (
                <button
                  onClick={() => setFilters({category: '', difficulty: '', search: ''})}
                  className="btn-primary px-6 py-3"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

