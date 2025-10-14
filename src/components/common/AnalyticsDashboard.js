import React, { useState } from 'react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = ({ userRole = 'student' }) => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - in real app, this would come from API
  const analyticsData = {
    overview: {
      totalCourses: userRole === 'student' ? 5 : 8,
      completedCourses: userRole === 'student' ? 2 : 6,
      totalStudents: userRole === 'tutor' ? 156 : null,
      averageGrade: userRole === 'student' ? 87.5 : 4.7,
      studyTime: userRole === 'student' ? 45.5 : null,
      completionRate: userRole === 'tutor' ? 78 : 85
    },
    trends: [
      { name: 'Week 1', value: 20, color: 'bg-blue-500' },
      { name: 'Week 2', value: 35, color: 'bg-blue-500' },
      { name: 'Week 3', value: 50, color: 'bg-blue-500' },
      { name: 'Week 4', value: 65, color: 'bg-blue-500' },
      { name: 'Week 5', value: 80, color: 'bg-blue-500' },
      { name: 'Week 6', value: 92, color: 'bg-green-500' }
    ],
    categoryBreakdown: [
      { name: 'Web Development', value: 45, color: 'bg-blue-500' },
      { name: 'UI/UX Design', value: 25, color: 'bg-purple-500' },
      { name: 'Data Science', value: 20, color: 'bg-green-500' },
      { name: 'Video Editing', value: 10, color: 'bg-red-500' }
    ],
    recentActivity: [
      { type: 'course_completed', title: 'React Fundamentals', date: '2 days ago', change: '+5%' },
      { type: 'assignment_submitted', title: 'CSS Grid Project', date: '3 days ago', change: '+3%' },
      { type: 'module_started', title: 'JavaScript ES6', date: '5 days ago', change: '+8%' },
      { type: 'grade_received', title: 'HTML Basics Quiz', date: '1 week ago', change: '+2%' }
    ],
    performanceMetrics: {
      engagement: 92,
      retention: 88,
      satisfaction: 4.7,
      progress: 85
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, change, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-100 text-primary-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {change && (
          <div className="mt-3 flex items-center">
            {change.startsWith('+') ? (
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        )}
      </div>
    );
  };

  const ProgressBar = ({ label, value, max = 100, color = 'bg-primary-500' }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={userRole === 'student' ? 'Enrolled Courses' : 'Total Courses'}
          value={analyticsData.overview.totalCourses}
          subtitle={`${analyticsData.overview.completedCourses} completed`}
          icon={AcademicCapIcon}
          change="+12%"
          color="primary"
        />
        
        {userRole === 'tutor' && (
          <MetricCard
            title="Total Students"
            value={analyticsData.overview.totalStudents}
            subtitle="Active learners"
            icon={UsersIcon}
            change="+8%"
            color="green"
          />
        )}
        
        <MetricCard
          title={userRole === 'student' ? 'Average Grade' : 'Rating'}
          value={analyticsData.overview.averageGrade}
          subtitle={userRole === 'student' ? 'Your performance' : 'Student feedback'}
          icon={StarIcon}
          change={userRole === 'student' ? '+5%' : '+0.2'}
          color="yellow"
        />
        
        {userRole === 'student' && (
          <MetricCard
            title="Study Time"
            value={`${analyticsData.overview.studyTime}h`}
            subtitle="This month"
            icon={ClockIcon}
            change="+15%"
            color="blue"
          />
        )}
        
        {userRole === 'tutor' && (
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData.overview.completionRate}%`}
            subtitle="Student success"
            icon={TrendingUpIcon}
            change="+3%"
            color="purple"
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trend</h3>
          <div className="space-y-4">
            {analyticsData.trends.map((item, index) => (
              <ProgressBar
                key={index}
                label={item.name}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userRole === 'student' ? 'Learning Categories' : 'Course Categories'}
          </h3>
          <div className="space-y-4">
            {analyticsData.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm text-gray-600">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analyticsData.performanceMetrics.engagement}%
            </div>
            <div className="text-sm text-gray-600">Engagement</div>
            <div className="text-xs text-green-600 mt-1">+5% from last month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analyticsData.performanceMetrics.retention}%
            </div>
            <div className="text-sm text-gray-600">Retention</div>
            <div className="text-xs text-green-600 mt-1">+3% from last month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analyticsData.performanceMetrics.satisfaction}
            </div>
            <div className="text-sm text-gray-600">Satisfaction</div>
            <div className="text-xs text-green-600 mt-1">+0.1 from last month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analyticsData.performanceMetrics.progress}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-xs text-green-600 mt-1">+7% from last month</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                {activity.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Great progress!</strong> You're on track to complete 2 more courses this month.
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Consistency wins!</strong> Your daily study streak is helping maintain momentum.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Focus area:</strong> Consider spending more time on JavaScript fundamentals.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Try to maintain your current study schedule to achieve your learning goals.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Consider exploring advanced topics in your strongest subject areas.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Join study groups to enhance your learning experience and get peer support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
