import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import { ArrowLeftIcon, DocumentTextIcon, UserIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const SubmissionGrade = () => {
  const { id } = useParams();
  const { gradeSubmission } = useSubmissions();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/submissions/${id}`, { headers });
        const data = res.data?.data?.submission;
        if (data) {
          setSubmission(data);
          // Convert percentage back to points for display
          const maxPoints = data.assignmentId?.maxPoints || 100;
          const currentPoints = data.gradePercentage ? Math.round((data.gradePercentage / 100) * maxPoints) : '';
          setGrade(currentPoints);
          setFeedback(data.feedback?.general || '');
        } else {
          setError('Submission not found');
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadSubmission();
  }, [id, headers]);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!submission) return;

    setGrading(true);
    try {
      const gradeValue = parseFloat(grade);
      const maxPoints = submission.assignmentId?.maxPoints || 100;
      
      if (isNaN(gradeValue)) {
        alert('Please enter a valid grade');
        return;
      }

      if (gradeValue < 0 || gradeValue > maxPoints) {
        alert(`Grade must be between 0 and ${maxPoints}`);
        return;
      }

      // Convert to percentage for backend (backend expects 0-100)
      const percentage = (gradeValue / maxPoints) * 100;

      await gradeSubmission(id, {
        grade: percentage,
        feedback: { general: feedback }
      });

      // Reload submission to get updated data
      const res = await axios.get(`${API_URL}/submissions/${id}`, { headers });
      setSubmission(res.data?.data?.submission);
      alert('Submission graded successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading submission</p>
          <p className="text-sm">{error}</p>
          <Link to="/tutor/submissions" className="btn-primary mt-4 inline-block">
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Submission not found</p>
          <Link to="/tutor/submissions" className="btn-primary mt-4 inline-block">
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  const maxPoints = submission.assignmentId?.maxPoints || 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tutor/submissions" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Submissions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
          <p className="text-gray-600 mt-2">Review and grade this student's work</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Info & Assignment Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {submission.studentId?.avatar ? (
                    <img
                      src={submission.studentId.avatar}
                      alt={`${submission.studentId.firstName} ${submission.studentId.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {submission.studentId?.firstName} {submission.studentId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{submission.studentId?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="text-gray-900">{formatTimeAgo(submission.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'graded' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {submission.status === 'graded' ? 'Graded' : 'Needs Grading'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{submission.assignmentId?.title}</p>
                  <p className="text-sm text-gray-600">{submission.courseId?.title}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Max Points: {maxPoints}</p>
                  {submission.gradePercentage !== null && (
                    <p className="text-green-600 font-medium">
                      Current Grade: {Math.round((submission.gradePercentage / 100) * maxPoints)}/{maxPoints} ({Math.round(submission.gradePercentage)}%)
                    </p>
                  )}
                  {submission.assignmentId?.dueDate && (
                    <p>Due: {new Date(submission.assignmentId.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Content & Grading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Content */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Content</h3>
              
              {/* Text Submission */}
              {submission.textSubmission && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Text Submission</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{submission.textSubmission}</p>
                  </div>
                </div>
              )}

              {/* Code Submission */}
              {submission.codeSubmission && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Code Submission</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{submission.codeSubmission.source || JSON.stringify(submission.codeSubmission, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* File Submissions */}
              {submission.files && submission.files.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">File Submissions</h4>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                            <p className="text-xs text-gray-600">{file.fileSize} bytes</p>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!submission.textSubmission && !submission.codeSubmission && (!submission.files || submission.files.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No content submitted</p>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Submission</h3>
              <form onSubmit={handleGrade} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (0-{maxPoints})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxPoints}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="input-field"
                    placeholder={`Enter grade (0-${maxPoints})`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum points: {maxPoints}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-field"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Link to="/tutor/submissions" className="btn-outline">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={grading}
                    className="btn-primary"
                  >
                    {grading ? 'Grading...' : submission.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionGrade;