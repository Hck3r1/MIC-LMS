import React from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ProgressChart = ({ data, type = 'overview' }) => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalCourses: 5,
    completedCourses: 2,
    inProgress: 3,
    totalModules: 45,
    completedModules: 28,
    totalAssignments: 23,
    submittedAssignments: 18,
    averageGrade: 87,
    studyStreak: 12,
    weeklyHours: 15
  };

  const progressPercentage = Math.round((stats.completedModules / stats.totalModules) * 100);
  const assignmentPercentage = Math.round((stats.submittedAssignments / stats.totalAssignments) * 100);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-100 text-primary-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      blue: 'bg-blue-100 text-blue-600'
    };

    return (
      <div className="card text-center">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mx-auto mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    );
  };

  if (type === 'line') {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Categories</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm text-gray-600">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
          <ChartBarIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modules Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Modules Completed</span>
              <span className="text-sm text-gray-600">{stats.completedModules}/{stats.totalModules}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">{progressPercentage}% complete</p>
          </div>

          {/* Assignments Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Assignments Submitted</span>
              <span className="text-sm text-gray-600">{stats.submittedAssignments}/{stats.totalAssignments}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${assignmentPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">{assignmentPercentage}% submitted</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={AcademicCapIcon}
          title="Courses"
          value={`${stats.completedCourses}/${stats.totalCourses}`}
          subtitle="Completed"
          color="primary"
        />
               <StatCard
                 icon={ArrowTrendingUpIcon}
                 title="Average Grade"
                 value={`${stats.averageGrade}%`}
                 subtitle="This semester"
                 color="green"
               />
        <StatCard
          icon={ClockIcon}
          title="Study Streak"
          value={`${stats.studyStreak}`}
          subtitle="Days in a row"
          color="yellow"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Weekly Hours"
          value={`${stats.weeklyHours}h`}
          subtitle="This week"
          color="blue"
        />
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm font-bold">🏆</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Module Master</p>
              <p className="text-xs text-gray-600">Completed 5 modules in Web Development</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">⭐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Perfect Score</p>
              <p className="text-xs text-gray-600">Got 100% on JavaScript Fundamentals Quiz</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">🔥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Study Streak</p>
              <p className="text-xs text-gray-600">12 days of consistent learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
