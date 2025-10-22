import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import axios from 'axios';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AnalyticsOverview = () => {
  const { user } = useAuth();
  const { getTutorOverview, getTutorRecentPerformance, getTutorTopCourses } = useCourses();
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState(null);
  const [topCourses, setTopCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      const [o, r, t] = await Promise.all([
        getTutorOverview(user._id, '30d'),
        getTutorRecentPerformance(user._id, '30d'),
        getTutorTopCourses(user._id, 3)
      ]);
      if (o.success && o.data) {
        setOverview(o.data);
      } else {
        // Client-side fallback: compute from instructor courses
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';
          const headers = (() => {
            try { const token = localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {}; } catch { return {}; }
          })();
          const res = await axios.get(`${API_URL}/courses?instructor=${user._id}`, { headers });
          const courses = res.data?.data?.courses || [];
          const totalCourses = courses.length;
          const totalStudents = courses.reduce((sum, c) => sum + (Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0), 0);
          const ratings = courses.map(c => (c.rating && typeof c.rating.average === 'number') ? c.rating.average : null).filter(v => v !== null);
          const averageRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
          const completionRates = courses.map(c => (typeof c.completionRate === 'number') ? c.completionRate : null).filter(v => v !== null);
          const completionRate = completionRates.length ? Math.round((completionRates.reduce((a, b) => a + b, 0) / completionRates.length)) : 0;
          setOverview({ totalCourses, totalStudents, activeStudents: 0, averageRating, completionRate });
        } catch (_) {
          // leave as is; UI will show em dashes
        }
      }
      if (r.success) setRecent(r.data);
      if (t.success) setTopCourses(t.data.top || []);
    };
    load();
  }, [user?._id, getTutorOverview, getTutorRecentPerformance, getTutorTopCourses]);

  const recentStats = [
    { label: 'New Students This Month', value: 23, change: '+15%', positive: true },
    { label: 'Course Completions', value: 45, change: '+8%', positive: true },
    { label: 'Average Grade', value: '87%', change: '+3%', positive: true },
    { label: 'Student Engagement', value: '92%', change: '-2%', positive: false }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-100 text-primary-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="card">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  const TrendCard = ({ label, value, change, positive }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center text-sm font-medium ${
          positive ? 'text-green-600' : 'text-red-600'
        }`}>
          <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${positive ? '' : 'rotate-180'}`} />
          {change}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={UsersIcon}
          title="Total Students"
          value={overview?.totalStudents ?? '—'}
          subtitle={`${overview?.activeStudents ?? '—'} active`}
          color="blue"
        />
        <StatCard
          icon={BookOpenIcon}
          title="Courses Created"
          value={overview?.totalCourses ?? '—'}
          subtitle={`${overview?.totalCourses ?? '—'} published`}
          color="primary"
        />
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={StarIcon}
          title="Average Rating"
          value={overview?.averageRating ?? '—'}
          subtitle={overview?.averageRating ? 'From reviews' : ''}
          color="yellow"
        />
        <StatCard
          icon={ArrowTrendingUpIcon}
          title="Completion Rate"
          value={`${overview?.completionRate ?? '—'}%`}
          subtitle="Student success rate"
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          title="Active Students"
          value={overview?.activeStudents ?? '—'}
          subtitle="Last 30 days"
          color="purple"
        />
      </div>

      {/* Recent Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent && (
            <>
              <TrendCard label="New Students This Month" value={recent.newStudents.value} change={`${Math.abs(recent.newStudents.deltaPct)}%`} positive={recent.newStudents.deltaPct >= 0} />
              <TrendCard label="Course Completions" value={recent.completions.value} change={`${Math.abs(recent.completions.deltaPct)}%`} positive={recent.completions.deltaPct >= 0} />
              <TrendCard label="Average Grade" value={`${recent.averageGrade.value}%`} change={`${Math.abs(recent.averageGrade.deltaPct)}%`} positive={recent.averageGrade.deltaPct >= 0} />
              <TrendCard label="Student Engagement" value={`${recent.engagement.value}`} change={`${Math.abs(recent.engagement.deltaPct)}%`} positive={recent.engagement.deltaPct >= 0} />
            </>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="space-y-3">
            {topCourses.map(c => (
              <div key={c.courseId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-600">{c.students} students • {c.rating.toFixed(1)} rating</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{c.completionRate}% completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Feedback</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-400 pl-4">
              <p className="text-sm text-gray-900">"Excellent course structure and clear explanations!"</p>
              <p className="text-xs text-gray-600 mt-1">- Sarah Johnson, React Course</p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-sm text-gray-900">"Great hands-on projects that really helped me learn."</p>
              <p className="text-xs text-gray-600 mt-1">- Mike Chen, JavaScript Course</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="text-sm text-gray-900">"Well-paced content with practical examples."</p>
              <p className="text-xs text-gray-600 mt-1">- Emily Davis, CSS Course</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">23 assignments need grading</span>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Grade Now
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">5 students need feedback</span>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Provide Feedback
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-900">Update course materials for 2 courses</span>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
