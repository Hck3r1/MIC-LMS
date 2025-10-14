import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({ 
  onFilesUploaded, 
  acceptedTypes = ['video', 'pdf', 'image', 'document'],
  maxFiles = 10,
  maxFileSize = 50, // MB
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const acceptedMimeTypes = {
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  const getFileIcon = (fileType) => {
    if (acceptedMimeTypes.video.some(type => fileType.startsWith(type.split('/')[0]))) {
      return VideoCameraIcon;
    }
    if (acceptedMimeTypes.pdf.includes(fileType)) {
      return DocumentIcon;
    }
    if (acceptedMimeTypes.image.some(type => fileType.startsWith(type.split('/')[0]))) {
      return PhotoIcon;
    }
    return DocumentIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`File size must be less than ${maxFileSize}MB`);
    }

    // Check file type
    const allAcceptedTypes = Object.values(acceptedMimeTypes).flat();
    if (!allAcceptedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return errors;
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    // Check total file count
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');
    setUploading(true);

    const validFiles = [];
    const invalidFiles = [];

    // Validate files
    fileArray.forEach(file => {
      const errors = validateFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors });
      }
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.join(', ')}`
      ).join('\n');
      setError(errorMessages);
    }

    // Upload valid files
    if (validFiles.length > 0) {
      try {
        const uploadedFilesData = await uploadFiles(validFiles);
        const newUploadedFiles = [...uploadedFiles, ...uploadedFilesData];
        setUploadedFiles(newUploadedFiles);
        
        if (onFilesUploaded) {
          onFilesUploaded(newUploadedFiles);
        }
      } catch (error) {
        setError('Upload failed. Please try again.');
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
  };

  const uploadFiles = async (files) => {
    // Simulate upload process - in real app, this would upload to server
    return new Promise((resolve) => {
      setTimeout(() => {
        const uploadedData = files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // Temporary URL for preview
          uploaded: true
        }));
        resolve(uploadedData);
      }, 2000);
    });
  };

  const removeFile = (fileId) => {
    const newFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(newFiles);
    
    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.values(acceptedMimeTypes).flat().join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Max {maxFiles} files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            <div className="text-sm whitespace-pre-line">{error}</div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.uploaded && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading files...</span>
            <span className="text-gray-600">Please wait</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
