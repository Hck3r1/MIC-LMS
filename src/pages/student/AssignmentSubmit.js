import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import CodeEditor from '../../components/common/CodeEditor';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  AcademicCapIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AssignmentSubmit = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const { submitAssignment } = useSubmissions();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // New state for existing submission
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  
  // Check if assignment is past due
  const isPastDue = assignment?.dueDate ? new Date() > new Date(assignment.dueDate) : false;
  const canSubmit = assignment ? (!isPastDue || assignment.allowLateSubmission) : true;

  // Fetch existing submission and assignment details
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!assignmentId) return;
      
      try {
        setLoadingSubmission(true);
        
        // Fetch assignment details
        const assignmentRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/assignments/${assignmentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (assignmentRes.ok) {
          const assignmentData = await assignmentRes.json();
          setAssignment(assignmentData.data);
        }
        
        // Fetch student's submissions for this assignment
        let submissionsRes;
        try {
          // Try the new student-specific endpoint first
          submissionsRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/submissions/assignment/${assignmentId}/student`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          const submissions = submissionsData.data?.submissions || [];
          
          if (submissions.length > 0) {
            // Get the most recent submission (already sorted by createdAt desc)
            setExistingSubmission(submissions[0]);
          }
        } else {
          console.error('Student endpoint failed:', submissionsRes.status, await submissionsRes.text());
            
            // Fallback to the original endpoint
            const fallbackRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/submissions/assignment/${assignmentId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              const submissions = fallbackData.data?.submissions || [];
              const userSubmissions = submissions.filter(sub => 
                sub.studentId === JSON.parse(localStorage.getItem('user')).id
              );
              
              if (userSubmissions.length > 0) {
                const latestSubmission = userSubmissions.sort((a, b) => 
                  new Date(b.createdAt) - new Date(a.createdAt)
                )[0];
                setExistingSubmission(latestSubmission);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching submissions:', error);
        }
      } catch (error) {
        console.error('Error fetching submission data:', error);
      } finally {
        setLoadingSubmission(false);
      }
    };
    
    fetchSubmissionData();
  }, [assignmentId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Check if submission is allowed
    if (isPastDue && !assignment?.allowLateSubmission) {
      setError('This assignment\'s due date has passed and late submissions are not allowed.');
      setLoading(false);
      return;
    }
    
    // Debug logging
    console.log('Submitting assignment with:', {
      assignmentId,
      assignmentIdType: typeof assignmentId,
      assignmentIdLength: assignmentId?.length,
      hasText: !!text,
      hasCode: !!code,
      fileCount: files.length
    });
    
    // Validate assignmentId format
    if (!assignmentId || typeof assignmentId !== 'string') {
      setError('Invalid assignment ID');
      setLoading(false);
      return;
    }
    
    try {
      await submitAssignment({ 
        assignmentId, 
        textSubmission: text, 
        files: Array.from(files),
        codeSubmission: code ? JSON.stringify({ source: code }) : undefined
      });
      setSuccess(true);
      setText('');
      setFiles([]);
      setCode('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📽️';
    if (file.type.includes('zip') || file.type.includes('rar')) return '📦';
    return '📎';
  };

  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || grade === undefined) return 'text-gray-500';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loadingSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  // Show error state if no submission found but we expected one
  if (!loadingSubmission && !existingSubmission && assignmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Submission Found</h2>
            <p className="text-gray-600 mb-4">You haven't submitted this assignment yet.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Show existing submission if found
  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <EyeIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Submission</h1>
            <p className="text-gray-600">View your submission and grade</p>
          </div>

          {/* Assignment Info */}
          {(assignment || existingSubmission.assignmentId) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {assignment?.title || existingSubmission.assignmentId?.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {assignment?.description || 'Assignment details'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Max Points: {assignment?.maxPoints || existingSubmission.assignmentId?.maxPoints || existingSubmission.maxPoints}</span>
                <span>Due: {assignment?.dueDate ? formatDate(assignment.dueDate) : existingSubmission.assignmentId?.dueDate ? formatDate(existingSubmission.assignmentId.dueDate) : 'No due date'}</span>
              </div>
            </div>
          )}

          {/* Submission Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submission Status</h3>
              <div className="flex items-center space-x-2">
                {existingSubmission.status === 'graded' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Graded
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Submitted
                  </span>
                )}
              </div>
            </div>

            {/* Grade Display */}
            {existingSubmission.status === 'graded' && existingSubmission.grade !== null && existingSubmission.grade !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Grade</h4>
                    <p className="text-sm text-gray-600">Your performance on this assignment</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGradeColor(existingSubmission.grade, existingSubmission.assignmentId?.maxPoints || existingSubmission.maxPoints || 100)}`}>
                      {existingSubmission.grade}/{existingSubmission.assignmentId?.maxPoints || existingSubmission.maxPoints || 100}
                    </div>
                    <div className="text-sm text-gray-500">
                      {existingSubmission.gradePercentage || Math.round((existingSubmission.grade / (existingSubmission.assignmentId?.maxPoints || existingSubmission.maxPoints || 100)) * 100)}%
                    </div>
                  </div>
                </div>
                
                {/* Feedback */}
                {existingSubmission.feedback && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Instructor Feedback</h5>
                    {typeof existingSubmission.feedback === 'string' ? (
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                        {existingSubmission.feedback}
                      </p>
                    ) : existingSubmission.feedback.general ? (
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-700 mb-2"><strong>General Feedback:</strong> {existingSubmission.feedback.general}</p>
                        {existingSubmission.feedback.strengths && existingSubmission.feedback.strengths.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-green-700">Strengths:</p>
                            <ul className="text-sm text-gray-700 ml-4">
                              {existingSubmission.feedback.strengths.map((strength, index) => (
                                <li key={index}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {existingSubmission.feedback.improvements && existingSubmission.feedback.improvements.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-yellow-700">Areas for Improvement:</p>
                            <ul className="text-sm text-gray-700 ml-4">
                              {existingSubmission.feedback.improvements.map((improvement, index) => (
                                <li key={index}>• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {existingSubmission.feedback.suggestions && existingSubmission.feedback.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-blue-700">Suggestions:</p>
                            <ul className="text-sm text-gray-700 ml-4">
                              {existingSubmission.feedback.suggestions.map((suggestion, index) => (
                                <li key={index}>• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Submitted on: {formatDate(existingSubmission.createdAt)}</p>
              {existingSubmission.gradedAt && (
                <p>Graded on: {formatDate(existingSubmission.gradedAt)}</p>
              )}
            </div>
          </div>

          {/* Submission Content */}
          <div className="space-y-6">
            {/* Text Submission */}
            {existingSubmission.textSubmission && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Written Response</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{existingSubmission.textSubmission}</p>
                </div>
              </div>
            )}

            {/* Code Submission */}
            {existingSubmission.codeSubmission && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Submission</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {(() => {
                      // Handle different code submission formats
                      if (typeof existingSubmission.codeSubmission === 'string') {
                        return existingSubmission.codeSubmission;
                      } else if (existingSubmission.codeSubmission.source) {
                        return existingSubmission.codeSubmission.source;
                      } else if (existingSubmission.codeSubmission.code) {
                        return existingSubmission.codeSubmission.code;
                      } else {
                        return 'Code submission available but format not recognized';
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}

            {/* File Attachments */}
            {existingSubmission.files && existingSubmission.files.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Attachments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl mr-3">{getFileIcon({ type: file.fileType || 'application/octet-stream' })}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                        <p className="text-xs text-gray-500">{file.fileSize ? formatFileSize(file.fileSize) : 'Unknown size'}</p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Submitted!</h2>
            <p className="text-gray-600 mb-4">Your assignment has been successfully submitted.</p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-2" />
              Redirecting to dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <AcademicCapIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
          <p className="text-gray-600">Upload your work and provide any additional details</p>
          {assignmentId && (
            <p className="text-sm text-gray-500 mt-2">Assignment ID: {assignmentId}</p>
          )}
        </div>

        {/* Assignment Due Date Info */}
        {assignment && (
          <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
            isPastDue && !assignment.allowLateSubmission
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              : isPastDue && assignment.allowLateSubmission
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
              : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className={`w-5 h-5 mr-2 ${
                  isPastDue && !assignment.allowLateSubmission
                    ? 'text-red-600 dark:text-red-400'
                    : isPastDue && assignment.allowLateSubmission
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {assignment.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    isPastDue && !assignment.allowLateSubmission
                      ? 'text-red-700 dark:text-red-400'
                      : isPastDue && assignment.allowLateSubmission
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    Due: {formatDate(assignment.dueDate)}
                    {isPastDue && !assignment.allowLateSubmission && (
                      <span className="font-medium ml-2">- Past Due (Submission Closed)</span>
                    )}
                    {isPastDue && assignment.allowLateSubmission && (
                      <span className="font-medium ml-2">- Past Due (Late Submission Allowed)</span>
                    )}
                  </p>
                </div>
              </div>
              {isPastDue && !assignment.allowLateSubmission && (
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {isPastDue && !assignment?.allowLateSubmission && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Submission Closed</p>
                <p className="text-sm mt-1">
                  This assignment's due date has passed and late submissions are not allowed. 
                  Please contact your instructor if you need to submit late.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Text Submission */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <DocumentIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Written Response</h3>
            </div>
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={8} 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Write your solution, explanation, or any additional notes here..."
              disabled={!canSubmit}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{text.length} characters</span>
              <span className="text-sm text-gray-400">Optional</span>
            </div>
          </div>

          {/* Code Submission */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-800 rounded mr-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">&lt;/&gt;</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Code Submission</h3>
            </div>
            <div className={`border border-gray-300 rounded-lg overflow-hidden ${!canSubmit ? 'opacity-50 pointer-events-none' : ''}`}>
              <CodeEditor value={code} onChange={setCode} />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{code.length} characters</span>
              <span className="text-sm text-gray-400">Optional</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CloudArrowUpIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">File Attachments</h3>
            </div>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                !canSubmit
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={canSubmit ? handleDrag : undefined}
              onDragLeave={canSubmit ? handleDrag : undefined}
              onDragOver={canSubmit ? handleDrag : undefined}
              onDrop={canSubmit ? handleDrop : undefined}
            >
              <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 ${!canSubmit ? 'text-gray-300' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium mb-2 ${!canSubmit ? 'text-gray-400' : 'text-gray-900'}`}>
                Drop files here or click to browse
              </p>
              <p className={`mb-4 ${!canSubmit ? 'text-gray-400' : 'text-gray-500'}`}>
                Support for images, documents, videos, and more
              </p>
              <button
                type="button"
                onClick={() => canSubmit && fileInputRef.current?.click()}
                className="btn-primary"
                disabled={!canSubmit}
              >
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept="image/*,video/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                disabled={!canSubmit}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files ({files.length})</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(file)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : !canSubmit ? (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Submission Closed
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmit;



