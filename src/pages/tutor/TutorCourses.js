import React from 'react';
import CourseManagement from '../../components/tutor/CourseManagement';

const TutorCourses = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Courses</h1>
        <CourseManagement />
      </div>
    </div>
  );
};

export default TutorCourses;


