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
    try {
      // Show loading state
      const button = document.querySelector(`[data-course-id="${courseId}"]`);
      if (button) {
        button.disabled = true;
        button.textContent = 'Generating Certificate...';
      }

      // Generate and download certificate
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/certificates/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Get the blob data
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${courseId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success message
        alert('Certificate downloaded successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error generating certificate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      // Reset button state
      const button = document.querySelector(`[data-course-id="${courseId}"]`);
      if (button) {
        button.disabled = false;
        button.textContent = 'Get Certificate';
      }
    }
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
          // Fetch real progress data
          await fetchStudentProgress();
          
          // Fetch activities and assignments
          await Promise.all([
            fetchRecentActivities(),
            fetchUpcomingAssignments()
          ]);
          
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
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [fetchCourses, getAuthMe, getStudentOverview]);

  const fetchStudentProgress = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/progress/student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update stats with real progress data
          const totalCourses = data.data.totalCourses;
          const completedCourses = data.data.courses.filter(c => c.progressPercentage === 100).length;
          const totalModules = data.data.courses.reduce((sum, course) => sum + course.totalModules, 0);
          const completedModules = data.data.courses.reduce((sum, course) => sum + course.completedModules, 0);
          
          // Calculate average grade from submissions
          const averageGrade = await calculateAverageGrade();
          
          setStats(prev => ({
            ...prev,
            totalCourses,
            completedCourses,
            totalModules,
            completedModules,
            averageGrade,
            totalStudyTime: data.data.courses.reduce((sum, course) => sum + (course.totalTimeSpent || 0), 0)
          }));
          
          // Update course breakdown with real data
          setCourseBreakdown(data.data.courses.map(course => ({
            name: course.courseTitle,
            progress: course.progressPercentage
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const calculateAverageGrade = async () => {
    try {
      // Try to get from recent activities first (this endpoint should work)
      const activitiesResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/submissions/recent?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success && activitiesData.data.submissions) {
          const gradedSubmissions = activitiesData.data.submissions.filter(sub => 
            sub.status === 'graded' && sub.gradePercentage !== undefined && sub.gradePercentage > 0
          );
          
          if (gradedSubmissions.length > 0) {
            const totalGrade = gradedSubmissions.reduce((sum, submission) => {
              return sum + (submission.gradePercentage || 0);
            }, 0);
            
            const averageGrade = Math.round(totalGrade / gradedSubmissions.length);
            return averageGrade;
          }
        }
      }
      
      // Fallback: try to get from student analytics if available
      try {
        const me = await getAuthMe();
        if (me.success && me.me) {
          const analytics = await getStudentOverview(me.me.id || me.me._id);
          if (analytics.success && analytics.data.averageGrade !== undefined) {
            return analytics.data.averageGrade;
          }
        }
      } catch (analyticsError) {
        console.log('Analytics fallback failed:', analyticsError);
      }
      
      return 0; // Default to 0 if no graded submissions found
    } catch (error) {
      console.error('Error calculating average grade:', error);
      return 0;
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent submissions from the backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/submissions/recent?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.submissions) {
          const activities = data.data.submissions.map(submission => ({
            _id: `submission_${submission._id}`,
            type: submission.status === 'graded' ? 'grade_received' : 'assignment_submitted',
            title: submission.assignmentId?.title || 'Assignment',
            course: submission.courseId?.title || 'Course',
            timestamp: new Date(submission.createdAt),
            status: submission.status,
            grade: submission.grade,
            gradePercentage: submission.gradePercentage
          }));
          
          setActivities(activities);
        } else {
          setActivities([]);
        }
      } else {
        console.error('Failed to fetch recent activities:', response.status);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setActivities([]);
    }
  };

  const fetchUpcomingAssignments = async () => {
    try {
      // Get all enrolled courses first
      const me = await getAuthMe();
      if (!me.success || !me.me) {
        setUpcomingAssignments([]);
        return;
      }
      
      const enrolledCourseIds = (me.me.enrolledCourses || []).map(c => c._id || c.id);
      
      if (enrolledCourseIds.length === 0) {
        setUpcomingAssignments([]);
        return;
      }
      
      // Fetch assignments for all enrolled courses
      const assignmentPromises = enrolledCourseIds.map(async (courseId) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api'}/assignments/course/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.success ? data.data.assignments : [];
          }
          return [];
        } catch (error) {
          console.error(`Error fetching assignments for course ${courseId}:`, error);
          return [];
        }
      });
      
      const allAssignments = (await Promise.all(assignmentPromises)).flat();
      
      // Filter for upcoming assignments (due in the next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcoming = allAssignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate > now && dueDate <= thirtyDaysFromNow;
      });
      
      // Sort by due date (soonest first)
      upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setUpcomingAssignments(upcoming.slice(0, 5)); // Limit to 5 most urgent
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      setUpcomingAssignments([]);
    }
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageGrade}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudyTime}h</p>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Courses</h2>
            <button className="btn-outline" onClick={() => window.location.assign('/courses')}>Browse All Courses</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const enrolledIds = new Set(
                (user?.enrolledCourses || []).map((c) => c?._id || c?.id || c)
              );
              return courses.slice(0, 6).map((course) => {
                const isEnrolled = enrolledIds.has(course._id) || !!course.isEnrolled;
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
              });
            })()}
          </div>
          {/* Certificates quick action if completed */}
          <div className="mt-6">
            {courses.filter(c => (c.enrolledStudents || []).some(e => (e.student?._id || e.student) === user?._id && (e.progress || 0) === 100)).map(c => (
              <div key={c._id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-4">
                      <TrophyIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Completed!</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">You've successfully completed "{c.title}"</p>
                    </div>
                  </div>
                  <button 
                    data-course-id={c._id}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleCertificate(c._id)}
                  >
                    🏆 Get Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No courses yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
              <button className="btn-primary">
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">Browse Courses</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discover new learning opportunities</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">View Progress</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your learning analytics</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">My Certificates</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download your achievements</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
