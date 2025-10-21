import React, { useState, useRef } from 'react';
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
  AcademicCapIcon
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={8} 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Write your solution, explanation, or any additional notes here..."
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
            <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-gray-500 mb-4">
                Support for images, documents, videos, and more
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
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
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
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



