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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">{currentCourse.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleTogglePublish} className={`btn-outline inline-flex items-center ${currentCourse.isPublished ? 'text-yellow-700' : 'text-green-700'}`} disabled={publishing}>
            {publishing ? 'Updating...' : currentCourse.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <Link to={`/tutor/courses/${id}/edit`} className="btn-primary inline-flex items-center">
            <PencilIcon className="w-5 h-5 mr-2" />
            Edit Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 whitespace-pre-line">{currentCourse.description}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Modules & Assignments</h2>
              <Link 
                to={`/tutor/courses/${id}/assignments`}
                className="btn-primary inline-flex items-center"
              >
                <BookOpenIcon className="w-4 h-4 mr-2" />
                Manage Assignments
              </Link>
            </div>
            <p className="text-gray-500">Create and manage assignments for your course modules.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Details</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Category: {currentCourse.category}</p>
              <p>Difficulty: {currentCourse.difficulty}</p>
              <p>Duration: {currentCourse.duration} hours</p>
              <p>Status: {currentCourse.isPublished ? 'Published' : 'Draft'}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
              <span className="text-sm text-gray-600">{students.length} total</span>
            </div>
            {students.length === 0 ? (
              <p className="text-sm text-gray-600">No students enrolled yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {students.map((enr) => (
                  <li key={enr._id || enr.student?._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {enr.student?.avatar ? (
                        <img src={enr.student.avatar} alt={enr.student.firstName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700">
                          {enr.student?.firstName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{enr.student?.firstName} {enr.student?.lastName}</div>
                        <div className="text-xs text-gray-600">Enrolled {new Date(enr.enrolledAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="btn-outline text-xs px-2 py-1"
                        onClick={() => {
                          const sid = enr.student?._id || enr.student;
                          const fullName = `${enr.student?.firstName || ''} ${enr.student?.lastName || ''}`.trim();
                          const qp = fullName ? `?name=${encodeURIComponent(fullName)}` : '';
                          navigate(`/messages/with/${sid}${qp}`);
                        }}
                      >
                        Message
                      </button>
                      <Link to={`/profile?user=${enr.student?._id}`} className="btn-outline text-xs px-2 py-1">View</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourse;


