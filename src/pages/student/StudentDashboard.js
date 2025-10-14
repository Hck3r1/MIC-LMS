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
  const { courses, fetchCourses } = useCourses();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalModules: 0,
    completedModules: 0,
    averageGrade: 0,
    totalStudyTime: 0
  });

  // Mock data for demonstration
  const [mockActivities] = useState([
    {
      type: 'course_enrolled',
      courseName: 'Full-Stack React Development',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      type: 'module_completed',
      courseName: 'JavaScript Basics',
      moduleName: 'Functions and Scope',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      type: 'assignment_submitted',
      assignmentName: 'HTML/CSS Portfolio Project',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      type: 'assignment_graded',
      assignmentName: 'JavaScript Fundamentals Quiz',
      grade: 95,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      type: 'video_watched',
      courseName: 'UI/UX Design Principles',
      videoName: 'Introduction to User Experience',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ]);

  const [mockAssignments] = useState([
    {
      _id: '1',
      title: 'React Component Project',
      courseName: 'Full-Stack React Development',
      courseId: 'course1',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      status: 'pending',
      maxPoints: 100
    },
    {
      _id: '2',
      title: 'CSS Grid Layout Exercise',
      courseName: 'Web Development Fundamentals',
      courseId: 'course2',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'pending',
      maxPoints: 50
    },
    {
      _id: '3',
      title: 'JavaScript Algorithms',
      courseName: 'JavaScript Advanced',
      courseId: 'course3',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day overdue
      status: 'pending',
      maxPoints: 75
    }
  ]);

  const [mockProgressData] = useState([
    { name: 'Week 1', progress: 20 },
    { name: 'Week 2', progress: 45 },
    { name: 'Week 3', progress: 65 },
    { name: 'Week 4', progress: 80 },
    { name: 'Week 5', progress: 95 }
  ]);

  const [mockCourseData] = useState([
    { name: 'React', progress: 85 },
    { name: 'JavaScript', progress: 70 },
    { name: 'CSS', progress: 60 },
    { name: 'Node.js', progress: 45 }
  ]);

  const [mockCategoryData] = useState([
    { name: 'Web Development', value: 45 },
    { name: 'UI/UX Design', value: 30 },
    { name: 'Data Science', value: 15 },
    { name: 'Other', value: 10 }
  ]);

  useEffect(() => {
    // Simulate loading user courses and stats
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user's enrolled courses
        await fetchCourses(1, { enrolled: true });
        
        // Calculate stats (mock data for now)
        setStats({
          totalCourses: 5,
          completedCourses: 2,
          totalModules: 25,
          completedModules: 12,
          averageGrade: 87.5,
          totalStudyTime: 45.5
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchCourses]);

  const handleEnroll = async (courseId) => {
    try {
      // This would call the enroll API
      console.log('Enrolling in course:', courseId);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      // This would call the unenroll API
      console.log('Unenrolling from course:', courseId);
    } catch (error) {
      console.error('Error unenrolling from course:', error);
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
            <ProgressChart data={mockProgressData} type="line" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressChart data={mockCourseData} type="bar" />
              <ProgressChart data={mockCategoryData} type="pie" />
            </div>
          </div>

          {/* Right Column - Activity and Assignments */}
          <div className="space-y-6">
            <UpcomingAssignments assignments={mockAssignments} />
            <RecentActivity activities={mockActivities} />
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <button className="btn-outline">
              Browse All Courses
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                enrollment={course.enrolledStudents?.find(
                  enrollment => enrollment.student === user?._id
                )}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
              />
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
