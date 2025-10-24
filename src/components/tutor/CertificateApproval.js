import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const CertificateApproval = () => {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

  useEffect(() => {
    const loadCertificateRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCertificateRequests([]);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API_URL}/certificates/requests`, { headers });
        if (response.data.success) {
          setCertificateRequests(response.data.data || []);
        } else {
          setCertificateRequests([]);
        }
      } catch (error) {
        console.error('Error loading certificate requests:', error);
        setCertificateRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadCertificateRequests();
  }, [API_URL]); // Removed headers dependency

  const handleApproveCertificate = async (requestId) => {
    try {
      setProcessing(requestId);
      
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}/certificates/${requestId}/approve`, {}, { headers });
      if (response.data.success) {
        setCertificateRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'approved', approvedAt: new Date().toISOString() }
              : req
          )
        );
        alert('Certificate approved successfully!');
      }
    } catch (error) {
      console.error('Error approving certificate:', error);
      alert('Failed to approve certificate. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectCertificate = async (requestId) => {
    try {
      setProcessing(requestId);
      
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_URL}/certificates/${requestId}/reject`, {}, { headers });
      if (response.data.success) {
        setCertificateRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'rejected', rejectedAt: new Date().toISOString() }
              : req
          )
        );
        alert('Certificate request rejected.');
      }
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      alert('Failed to reject certificate. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Certificate Requests</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Certificate Requests</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {certificateRequests.filter(req => req.status === 'pending').length} pending
        </div>
      </div>

      <div className="space-y-4">
        {certificateRequests.length === 0 ? (
          <div className="text-center py-8">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No certificate requests yet</p>
          </div>
        ) : (
          certificateRequests.map((request) => (
            <div key={request._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    {request.student?.avatar ? (
                      <img
                        src={request.student.avatar}
                        alt={`${request.student.firstName} ${request.student.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {request.student?.firstName} {request.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {request.course?.title}
                    </p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status}</span>
                </span>
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Certificate Request Details
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Course completed: {formatDate(request.completedAt)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Requested: {formatDate(request.requestedAt)}
                </p>
                {request.approvedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Approved: {formatDate(request.approvedAt)}
                  </p>
                )}
                {request.rejectedAt && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Rejected: {formatDate(request.rejectedAt)}
                  </p>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveCertificate(request._id)}
                    disabled={processing === request._id}
                    className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === request._id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Approve
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRejectCertificate(request._id)}
                    disabled={processing === request._id}
                    className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                  
                  <Link
                    to={`/tutor/students/${request.student?._id}`}
                    className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View Student
                  </Link>
                </div>
              )}

              {request.status === 'approved' && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Certificate approved and issued
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  Certificate request rejected
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {certificateRequests.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {certificateRequests.filter(req => req.status === 'pending').length} pending
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {certificateRequests.filter(req => req.status === 'approved').length} approved
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {certificateRequests.filter(req => req.status === 'rejected').length} rejected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateApproval;
