import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import axios from 'axios';
import {
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  PlayCircleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { currentCourse, modules, fetchCourse, fetchModules, enrollInCourse } = useCourses();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchCourse(id);
    fetchModules(id);
  }, [id, fetchCourse, fetchModules]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      const res = await axios.get(`${API_URL}/reviews/course/${id}`);
      setReviews(res.data?.data?.reviews || []);
    };
    loadReviews();
  }, [id]);

  const handleStart = async () => {
    if (!id) return;
    setError('');
    setEnrolling(true);
    try {
      // If already enrolled, just navigate
      if (currentCourse?.isEnrolled) {
        navigate(`/courses/${id}/learn`);
        return;
      }
      const res = await enrollInCourse(id);
      if (!res?.success) {
        setError(res?.error || 'Failed to enroll');
      }
      // Refresh course to reflect enrollment flag; then navigate either way
      await fetchCourse(id);
      navigate(`/courses/${id}/learn`);
    } catch (e) {
      setError('Failed to start course');
    } finally {
      setEnrolling(false);
    }
  };

  const stats = useMemo(() => ({
    duration: currentCourse?.duration || 0,
    students: currentCourse?.enrolledStudents?.length || 0,
    rating: typeof currentCourse?.rating?.average === 'number' ? currentCourse.rating.average.toFixed(1) : '0.0',
    ratingCount: currentCourse?.rating?.count || 0
  }), [currentCourse]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero/Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white">{currentCourse?.title || 'Course Details'}</h1>
              <p className="text-primary-50 mt-3 text-base lg:text-lg max-w-3xl">{currentCourse?.description || 'View course details and modules'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-5 text-primary-50">
                <span className="inline-flex items-center text-sm"><ClockIcon className="w-4 h-4 mr-2" />{stats.duration}h</span>
                <span className="inline-flex items-center text-sm"><UserIcon className="w-4 h-4 mr-2" />{stats.students} students</span>
                <span className="inline-flex items-center text-sm"><StarIcon className="w-4 h-4 mr-1 text-yellow-300" />{stats.rating} <span className="ml-1 opacity-80">({stats.ratingCount})</span></span>
              </div>
              <div className="mt-6 space-y-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
                )}
                <button className="btn-white disabled:opacity-60" onClick={handleStart} disabled={enrolling}>
                  {enrolling ? 'Starting…' : (currentCourse?.isEnrolled ? 'Continue Learning' : 'Enroll & Start')}
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white/10 backdrop-blur">
                <div className="w-full h-40 bg-white/20 flex items-center justify-center">
                  <PlayCircleIcon className="w-16 h-16 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">About this course</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{currentCourse?.description || 'No description provided.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentCourse?.difficulty && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">{currentCourse.difficulty}</span>
                )}
                {currentCourse?.category && (
                  <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">{currentCourse.category}</span>
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Curriculum</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400 inline-flex items-center"><AcademicCapIcon className="w-4 h-4 mr-2" />{modules?.length || 0} modules</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {(modules || []).map((m, idx) => (
                  <div key={m._id || idx} className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-medium">{m.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{m.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">Order {m.order || (idx + 1)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center"><PlayCircleIcon className="w-4 h-4 mr-1" /> Videos</span>
                      <span className="inline-flex items-center"><ClipboardDocumentListIcon className="w-4 h-4 mr-1" /> Assignments</span>
                    </div>
                  </div>
                ))}
                {(!modules || modules.length === 0) && (
                  <div className="text-sm text-gray-600">No modules added yet.</div>
                )}
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Discussion</h2>
                  <Link to={`/forums/course/${id}`} className="btn-outline text-sm inline-flex items-center"><ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1"/>Open Forum</Link>
                </div>
              </div>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Reviews</h2>
              <div className="space-y-3 mb-4">
                {reviews.map(r => (
                  <div key={r._id} className="border-b last:border-none pb-3">
                    <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div className="text-gray-800 whitespace-pre-wrap">{r.comment}</div>
                  </div>
                ))}
                {reviews.length === 0 && <div className="text-sm text-gray-600">No reviews yet.</div>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Your rating</span>
                  <select className="input-field w-28" value={myRating} onChange={(e) => setMyRating(parseInt(e.target.value))}>
                    <option value={0}>Select…</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <textarea rows={3} className="input-field" placeholder="Add a comment (optional)" value={myComment} onChange={(e) => setMyComment(e.target.value)} />
                <div className="flex justify-end">
                  <button className="btn-primary" onClick={async () => {
                    try {
                      const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
                      await axios.post(`${API_URL}/reviews`, { courseId: id, rating: myRating, comment: myComment }, { headers });
                      const res = await axios.get(`${API_URL}/reviews/course/${id}`);
                      setReviews(res.data?.data?.reviews || []);
                      setMyRating(0); setMyComment('');
                    } catch (_) {}
                  }}>Submit Review</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-3" />
                <div>
                  <div className="text-gray-900 font-medium">{currentCourse?.instructor?.firstName} {currentCourse?.instructor?.lastName}</div>
                  <div className="text-sm text-gray-600">{currentCourse?.instructor?.specialization}</div>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/profile?user=${currentCourse?.instructor?._id || currentCourse?.instructor?.id || ''}`} className="btn-outline text-sm">View Profile</Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Info</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center"><ClockIcon className="w-4 h-4 mr-2" />Duration: {stats.duration} hours</li>
                <li className="flex items-center"><UserIcon className="w-4 h-4 mr-2" />Students: {stats.students}</li>
                <li className="flex items-center"><StarIcon className="w-4 h-4 mr-2 text-yellow-500" />Rating: {stats.rating} ({stats.ratingCount})</li>
              </ul>
              <div className="mt-4 space-y-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
                )}
                <button className="btn-primary w-full disabled:opacity-60" onClick={handleStart} disabled={enrolling}>
                  {enrolling ? 'Starting…' : (currentCourse?.isEnrolled ? 'Continue Learning' : 'Enroll & Start')}
                </button>
                {currentCourse?.isEnrolled && (
                  <Link to={`/courses/${id}/learn`} className="btn-outline w-full text-center text-sm">Open Player</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

