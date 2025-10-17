import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import CourseCard from '../../components/student/CourseCard';
import ProgressChart from '../../components/student/ProgressChart';
import RecentActivity from '../../components/student/RecentActivity';
import UpcomingAssignments from '../../components/student/UpcomingAssignments';
import {
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { courses, fetchCourses, enrollInCourse, unenrollFromCourse, getAuthMe, getStudentOverview } = useCourses();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalModules: 0,
    completedModules: 0,
    averageGrade: 0,
    totalStudyTime: 0
  });
  const [enrollingId, setEnrollingId] = useState(null);
  const handleCertificate = async (courseId) => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/certificates/${courseId}`;
  };

  const [activities, setActivities] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await fetchCourses(1, {});
        const me = await getAuthMe();
        if (me.success && me.me) {
          const analytics = await getStudentOverview(me.me.id || me.me._id);
          if (analytics.success) {
            setStats(prev => ({ ...prev, ...analytics.data }));
            // Optional derived visuals from analytics
            setProgressData((analytics.data.weeklyProgress || []).map((p, i) => ({ name: `Week ${i+1}`, progress: p })));
            setCourseBreakdown((analytics.data.courseBreakdown || []).map(c => ({ name: c.name, progress: c.progress })));
            setCategoryBreakdown((analytics.data.categoryBreakdown || []).map(c => ({ name: c.name, value: c.value })));
          } else {
            const enrolled = Array.isArray(me.me.enrolledCourses) ? me.me.enrolledCourses : [];
            setStats(prev => ({ ...prev, totalCourses: enrolled.length }));
          }
          // Activities and assignments could be fetched via endpoints when available; keep empty otherwise
          setActivities([]);
          setUpcomingAssignments([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [fetchCourses, getAuthMe, getStudentOverview]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await enrollInCourse(courseId);
      if (res.success) {
        // Refresh published list and stats
        await fetchCourses(1, {});
        const me = await getAuthMe();
        if (me.success && me.me) {
          const enrolled = Array.isArray(me.me.enrolledCourses) ? me.me.enrolledCourses : [];
          setStats(prev => ({ ...prev, totalCourses: enrolled.length }));
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert(error?.error || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await unenrollFromCourse(courseId);
      if (res.success) {
        await fetchCourses(1, {});
        const me = await getAuthMe();
        if (me.success && me.me) {
          const enrolled = Array.isArray(me.me.enrolledCourses) ? me.me.enrolledCourses : [];
          setStats(prev => ({ ...prev, totalCourses: enrolled.length }));
        }
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      alert(error?.error || 'Failed to unenroll');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudyTime}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressChart data={progressData} type="line" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressChart data={courseBreakdown} type="bar" />
              <ProgressChart data={categoryBreakdown} type="pie" />
            </div>
          </div>

          {/* Right Column - Activity and Assignments */}
          <div className="space-y-6">
            <UpcomingAssignments assignments={upcomingAssignments} />
            <RecentActivity activities={activities} />
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
            <button className="btn-outline" onClick={() => window.location.assign('/courses')}>Browse All Courses</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => {
              const isEnrolled = !!(course.isEnrolled || (course.enrolledStudents?.some(enr => (enr.student?._id || enr.student) === user?._id)));
              const enrollmentObj = isEnrolled ? { progress: 0 } : null;
              return (
                <CourseCard
                  key={course._id}
                  course={course}
                  enrollment={enrollmentObj}
                  onEnroll={handleEnroll}
                  onUnenroll={handleUnenroll}
                  loading={enrollingId === course._id}
                />
              );
            })}
          </div>
          {/* Certificates quick action if completed */}
          <div className="mt-4">
            {courses.filter(c => (c.enrolledStudents || []).some(e => (e.student?._id || e.student) === user?._id && (e.progress || 0) === 100)).map(c => (
              <button key={c._id} className="btn-outline mr-2 mb-2" onClick={() => handleCertificate(c._id)}>Get Certificate for {c.title}</button>
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
              <button className="btn-primary">
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <BookOpenIcon className="w-6 h-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Browse Courses</p>
                <p className="text-sm text-gray-600">Discover new learning opportunities</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Progress</p>
                <p className="text-sm text-gray-600">Track your learning analytics</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <AcademicCapIcon className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">My Certificates</p>
                <p className="text-sm text-gray-600">Download your achievements</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
