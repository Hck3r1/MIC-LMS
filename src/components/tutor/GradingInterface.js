import React, { useState } from 'react';
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const GradingInterface = ({ submission, assignment, onGradeSubmission }) => {
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState({
    general: submission?.feedback?.general || '',
    strengths: submission?.feedback?.strengths || [],
    improvements: submission?.feedback?.improvements || [],
    suggestions: submission?.feedback?.suggestions || []
  });
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGradeChange = (e) => {
    const value = e.target.value;
    if (value === '' || (value >= 0 && value <= assignment.maxPoints)) {
      setGrade(value);
    }
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFeedback({
        ...feedback,
        strengths: [...feedback.strengths, newStrength.trim()]
      });
      setNewStrength('');
    }
  };

  const removeStrength = (index) => {
    setFeedback({
      ...feedback,
      strengths: feedback.strengths.filter((_, i) => i !== index)
    });
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setFeedback({
        ...feedback,
        improvements: [...feedback.improvements, newImprovement.trim()]
      });
      setNewImprovement('');
    }
  };

  const removeImprovement = (index) => {
    setFeedback({
      ...feedback,
      improvements: feedback.improvements.filter((_, i) => i !== index)
    });
  };

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setFeedback({
        ...feedback,
        suggestions: [...feedback.suggestions, newSuggestion.trim()]
      });
      setNewSuggestion('');
    }
  };

  const removeSuggestion = (index) => {
    setFeedback({
      ...feedback,
      suggestions: feedback.suggestions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!grade || grade < 0 || grade > assignment.maxPoints) {
      alert('Please enter a valid grade');
      return;
    }

    setLoading(true);
    try {
      await onGradeSubmission({
        grade: parseFloat(grade),
        feedback
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to submit grade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('video/')) return VideoCameraIcon;
    if (fileType.startsWith('image/')) return PhotoIcon;
    return DocumentTextIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getGradeColor = (grade, maxPoints) => {
    if (!grade) return 'text-gray-500';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!submission || !assignment) {
    return (
      <div className="card text-center py-12">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No submission selected for grading</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Submission Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
            <p className="text-sm text-gray-600">{assignment.course}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Max Points: {assignment.maxPoints}</p>
            <p className="text-sm text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm font-medium">
                {submission.student.firstName[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {submission.student.firstName} {submission.student.lastName}
              </p>
              <p className="text-xs text-gray-500">{submission.student.email}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
          </div>

          {submission.isLate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Late Submission
            </span>
          )}
        </div>
      </div>

      {/* Submission Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Submission Content */}
        <div className="space-y-6">
          {/* Text Submission */}
          {submission.textSubmission && (
            <div className="card">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Text Submission</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {submission.textSubmission}
                </p>
              </div>
            </div>
          )}

          {/* File Submissions */}
          {submission.files && submission.files.length > 0 && (
            <div className="card">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Submitted Files</h4>
              <div className="space-y-3">
                {submission.files.map((file, index) => {
                  const FileIcon = getFileIcon(file.fileType);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                        </div>
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignment Instructions */}
          <div className="card">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Assignment Instructions</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Grading Interface */}
        <div className="space-y-6">
          {/* Grade Input */}
          <div className="card">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Grade Assignment</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (out of {assignment.maxPoints})
                </label>
                <input
                  type="number"
                  min="0"
                  max={assignment.maxPoints}
                  step="0.1"
                  className="input-field"
                  value={grade}
                  onChange={handleGradeChange}
                  placeholder="Enter grade"
                />
                {grade && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Percentage</span>
                      <span className={`font-medium ${getGradeColor(grade, assignment.maxPoints)}`}>
                        {((grade / assignment.maxPoints) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (grade / assignment.maxPoints) * 100 >= 90 ? 'bg-green-500' :
                          (grade / assignment.maxPoints) * 100 >= 80 ? 'bg-blue-500' :
                          (grade / assignment.maxPoints) * 100 >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(grade / assignment.maxPoints) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="card">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Feedback</h4>
            <div className="space-y-4">
              {/* General Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Feedback
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  value={feedback.general}
                  onChange={(e) => setFeedback({ ...feedback, general: e.target.value })}
                  placeholder="Provide overall feedback on the submission..."
                />
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths
                </label>
                <div className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                      <span className="text-sm text-green-800">{strength}</span>
                      <button
                        onClick={() => removeStrength(index)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      placeholder="Add strength..."
                    />
                    <button
                      onClick={addStrength}
                      className="btn-primary px-3"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement
                </label>
                <div className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <span className="text-sm text-yellow-800">{improvement}</span>
                      <button
                        onClick={() => removeImprovement(index)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={newImprovement}
                      onChange={(e) => setNewImprovement(e.target.value)}
                      placeholder="Add improvement area..."
                    />
                    <button
                      onClick={addImprovement}
                      className="btn-primary px-3"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggestions
                </label>
                <div className="space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <span className="text-sm text-blue-800">{suggestion}</span>
                      <button
                        onClick={() => removeSuggestion(index)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="Add suggestion..."
                    />
                    <button
                      onClick={addSuggestion}
                      className="btn-primary px-3"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Grade */}
          <div className="card">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !grade}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Grade'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingInterface;
