import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect to role-specific dashboard
  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  } else if (user?.role === 'tutor') {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your dashboard!</p>
      </div>
    </div>
  );
};

export default Dashboard;

