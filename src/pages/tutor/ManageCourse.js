import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext';
import { BookOpenIcon, PencilIcon } from '@heroicons/react/24/outline';

const ManageCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCourse, fetchCourse, fetchCourseEnrollments, updateCourse, loading } = useCourses();
  const [students, setStudents] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchCourse(id);
  }, [id, fetchCourse]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const res = await fetchCourseEnrollments(id);
      if (res.success) setStudents(res.students || []);
    };
    load();
  }, [id, fetchCourseEnrollments]);

  if (loading || !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleTogglePublish = async () => {
    if (!id) return;
    try {
      setPublishing(true);
      const next = !currentCourse.isPublished;
      await updateCourse(id, { isPublished: next });
      await fetchCourse(id);
    } catch (e) {
      console.error('Publish toggle failed', e);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentCourse.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleTogglePublish} 
              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center ${currentCourse.isPublished ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`} 
              disabled={publishing}
            >
              {publishing ? 'Updating...' : currentCourse.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <Link 
              to={`/tutor/courses/${id}/edit`} 
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-flex items-center"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit Course
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{currentCourse.description}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Modules & Assignments</h2>
                <Link 
                  to={`/tutor/courses/${id}/assignments`}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors inline-flex items-center"
                >
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  Manage Assignments
                </Link>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Create and manage assignments for your course modules.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Course Details</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p>Category: {currentCourse.category}</p>
                <p>Difficulty: {currentCourse.difficulty}</p>
                <p>Duration: {currentCourse.duration} hours</p>
                <p>Status: {currentCourse.isPublished ? 'Published' : 'Draft'}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enrolled Students</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{students.length} total</span>
              </div>
              {students.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">No students enrolled yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((enr) => (
                    <li key={enr._id || enr.student?._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {enr.student?.avatar ? (
                          <img src={enr.student.avatar} alt={enr.student.firstName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">
                            {enr.student?.firstName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{enr.student?.firstName} {enr.student?.lastName}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Enrolled {new Date(enr.enrolledAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs"
                          onClick={() => {
                            const sid = enr.student?._id || enr.student;
                            const fullName = `${enr.student?.firstName || ''} ${enr.student?.lastName || ''}`.trim();
                            const qp = fullName ? `?name=${encodeURIComponent(fullName)}` : '';
                            navigate(`/messages/with/${sid}${qp}`);
                          }}
                        >
                          Message
                        </button>
                        <Link 
                          to={`/profile?user=${enr.student?._id}`} 
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs"
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourse;


