import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const GradeSubmissions = ({ assignmentId: assignmentIdProp }) => {
  const params = useParams();
  const assignmentId = assignmentIdProp || params.assignmentId;
  const { gradeSubmission } = useSubmissions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignmentId || '');
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    moduleId: '',
    assignmentId: assignmentId || ''
  });
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const effectiveAssignmentId = assignmentId || appliedFilters.assignmentId;
      const paramsObj = {
        page,
        limit: pagination.limit
      };
      if (appliedFilters.search.trim()) paramsObj.search = appliedFilters.search.trim();
      if (appliedFilters.moduleId) paramsObj.moduleId = appliedFilters.moduleId;
      if (effectiveAssignmentId) paramsObj.assignmentId = effectiveAssignmentId;

      const res = await axios.get(`${API_URL}/submissions/tutor`, { headers, params: paramsObj });
      const data = res.data?.data || {};
      setItems(data.submissions || []);
      setPagination(data.pagination || {
        page,
        limit: pagination.limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
      setModules(data.filterOptions?.modules || []);
      setAssignments(data.filterOptions?.assignments || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters.assignmentId, appliedFilters.moduleId, appliedFilters.search, assignmentId, headers, pagination.limit]);

  useEffect(() => {
    load(1);
  }, [load]);

  // eslint-disable-next-line no-unused-vars
  const onGrade = async (sid) => {
    const grade = parseFloat(prompt('Enter grade (0-100):') || '0');
    if (Number.isNaN(grade)) return;
    await gradeSubmission(sid, { grade, feedback: { general: '' } });
    await load(pagination.page || 1);
  };

  useEffect(() => {
    // If assignment is route-bound, keep it fixed.
    if (assignmentId) {
      setSelectedAssignmentId(assignmentId);
      setAppliedFilters((prev) => ({ ...prev, assignmentId }));
    }
  }, [assignmentId]);

  const handleModuleChange = (e) => {
    setModuleId(e.target.value);
    setSelectedAssignmentId('');
  };

  const applyFilters = () => {
    setAppliedFilters({
      search,
      moduleId,
      assignmentId: assignmentId || selectedAssignmentId
    });
  };

  const clearFilters = () => {
    if (assignmentId) return;
    setSearch('');
    setModuleId('');
    setSelectedAssignmentId('');
    setAppliedFilters({
      search: '',
      moduleId: '',
      assignmentId: ''
    });
  };

  const pageStudentStats = useMemo(() => {
    const stats = new Map();
    items.forEach((submission) => {
      const studentKey = submission?.studentId?._id || submission?.studentId?.id;
      if (!studentKey) return;
      if (!stats.has(studentKey)) {
        stats.set(studentKey, {
          submissionCount: 0,
          assignmentIds: new Set()
        });
      }
      const entry = stats.get(studentKey);
      entry.submissionCount += 1;
      if (submission?.assignmentId?._id) entry.assignmentIds.add(submission.assignmentId._id);
    });
    return stats;
  }, [items]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Needs Grading';
      case 'graded':
        return 'Graded';
      case 'returned':
        return 'Returned';
      default:
        return 'Unknown';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-red-600 text-center">
        <p className="text-lg font-medium">Error loading submissions</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/tutor" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {assignmentId ? 'Assignment Submissions' : 'All Submissions'}
          </h1>
          <p className="text-gray-600 mt-2">
            {assignmentId ? 'Grade submissions for this assignment' : 'Review and grade all submissions'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {assignmentId ? 'Assignment Submissions' : 'All Submissions'}
            </h3>
            <div className="text-sm text-gray-600">
              {pagination.total} total • {items.filter(s => s.status === 'submitted').length} pending on this page
            </div>
          </div>

          {!assignmentId && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Student Search</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Module</label>
                  <select className="input-field" value={moduleId} onChange={handleModuleChange}>
                    <option value="">All modules</option>
                    {modules.map((module) => (
                      <option key={module._id} value={module._id}>{module.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Assignment</label>
                  <select
                    className="input-field"
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  >
                    <option value="">All assignments</option>
                    {assignments.map((assignment) => (
                      <option key={assignment._id} value={assignment._id}>{assignment.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button type="button" className="btn-outline" onClick={clearFilters}>Clear</button>
                <button type="button" className="btn-primary" onClick={applyFilters}>Apply Filters</button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((submission) => (
                <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {submission.studentId?.avatar ? (
                          <img
                            src={submission.studentId.avatar}
                            alt={`${submission.studentId.firstName} ${submission.studentId.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 font-medium">
                            {submission.studentId?.firstName?.charAt(0) || 'S'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.studentId?.firstName} {submission.studentId?.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{submission.courseId?.title}</p>
                        {(() => {
                          const studentKey = submission?.studentId?._id || submission?.studentId?.id;
                          const pageStats = studentKey ? pageStudentStats.get(studentKey) : null;
                          const backendCompleted = submission?.studentProgress?.assignmentsCompleted;
                          const backendTotalSubmissions = submission?.studentProgress?.totalSubmissions;
                          const completedAssignments = Number.isInteger(backendCompleted)
                            ? backendCompleted
                            : (pageStats ? pageStats.assignmentIds.size : 0);
                          const totalSubmissions = Number.isInteger(backendTotalSubmissions)
                            ? backendTotalSubmissions
                            : (pageStats ? pageStats.submissionCount : 0);
                          return (
                            <div className="mt-1 flex items-center gap-3 text-xs">
                              <span className="text-primary-700">Assignments done: {completedAssignments}</span>
                              <span className="text-gray-500">Total submissions: {totalSubmissions}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status === 'submitted' && <ClockIcon className="w-3 h-3 mr-1" />}
                      {submission.status === 'graded' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                      {getStatusText(submission.status)}
                    </span>
                  </div>

                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {submission.assignmentId?.title || 'Assignment'}
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {formatTimeAgo(submission.createdAt)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {(() => {
                        // Calculate percentage from available data
                        let percentage = null;
                        if (submission.gradePercentage !== null && submission.gradePercentage !== undefined) {
                          percentage = submission.gradePercentage;
                        } else if (submission.grade !== null && submission.grade !== undefined) {
                          percentage = submission.grade;
                        }
                        
                        if (percentage !== null && !isNaN(percentage)) {
                          return (
                            <span className="text-sm font-medium text-green-600">
                              {Math.round(percentage)}%
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-sm text-gray-500">
                              Not graded
                            </span>
                          );
                        }
                      })()}
                      
                      <Link
                        to={`/tutor/submissions/${submission._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {submission.status === 'graded' ? 'View' : 'Grade'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                type="button"
                className="btn-outline"
                onClick={() => load((pagination.page || 1) - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => load((pagination.page || 1) + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeSubmissions;



