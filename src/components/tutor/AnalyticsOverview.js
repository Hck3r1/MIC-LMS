import React from 'react';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AnalyticsOverview = () => {
  // Mock data - in real app, this would come from API
  const analytics = {
    totalStudents: 156,
    totalCourses: 8,
    totalRevenue: 12500,
    averageRating: 4.7,
    completionRate: 78,
    activeStudents: 89
  };

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
          value={analytics.totalStudents}
          subtitle={`${analytics.activeStudents} active`}
          color="blue"
        />
        <StatCard
          icon={BookOpenIcon}
          title="Courses Created"
          value={analytics.totalCourses}
          subtitle="8 published"
          color="primary"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          subtitle="This year"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={StarIcon}
          title="Average Rating"
          value={analytics.averageRating}
          subtitle="From 124 reviews"
          color="yellow"
        />
        <StatCard
          icon={ArrowTrendingUpIcon}
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          subtitle="Student success rate"
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          title="Active Students"
          value={analytics.activeStudents}
          subtitle="Last 30 days"
          color="purple"
        />
      </div>

      {/* Recent Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentStats.map((stat, index) => (
            <TrendCard
              key={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              positive={stat.positive}
            />
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Full-Stack React Development</p>
                <p className="text-xs text-gray-600">45 students • 4.8 rating</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">92% completion</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">JavaScript Fundamentals</p>
                <p className="text-xs text-gray-600">38 students • 4.6 rating</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">88% completion</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">CSS Grid & Flexbox</p>
                <p className="text-xs text-gray-600">32 students • 4.7 rating</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">85% completion</p>
              </div>
            </div>
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
