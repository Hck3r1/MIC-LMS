import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import FileUpload from './FileUpload';
import {
  PlusIcon,
  XMarkIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const ModuleContentUpload = ({ moduleId, onContentAdded }) => {
  const { user } = useAuth();
  const { addModuleContent } = useCourses();
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    isRequired: true,
    isPreview: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const contentTypes = [
    { value: 'video', label: 'Video', icon: VideoCameraIcon, description: 'Upload video files or add YouTube/Vimeo links' },
    { value: 'pdf', label: 'PDF Document', icon: DocumentTextIcon, description: 'Upload PDF files for reading materials' },
    { value: 'text', label: 'Text Content', icon: BookOpenIcon, description: 'Add written content and instructions' },
    { value: 'image', label: 'Images', icon: PhotoIcon, description: 'Upload images and graphics' },
    { value: 'link', label: 'External Link', icon: LinkIcon, description: 'Add links to external resources' }
  ];

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const contentData = {
        ...formData,
        type: contentType,
        duration: formData.duration ? parseInt(formData.duration) : 0,
        files: uploadedFiles.map(file => ({
          filename: file.name,
          url: file.url,
          fileType: file.type,
          fileSize: file.size
        }))
      };

      const res = await addModuleContent(moduleId, contentData);
      if (!res.success) {
        throw new Error(res.error || 'Failed to add content');
      }
      if (onContentAdded) onContentAdded(res.module);

      // Reset form
      setFormData({
        title: '',
        description: '',
        url: '',
        duration: '',
        isRequired: true,
        isPreview: false
      });
      setUploadedFiles([]);
      setShowAddContent(false);
      setContentType('');
    } catch (error) {
      setError(error.message || 'Failed to add content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      duration: '',
      isRequired: true,
      isPreview: false
    });
    setUploadedFiles([]);
    setContentType('');
    setError('');
  };

  const selectedContentType = contentTypes.find(type => type.value === contentType);

  return (
    <div className="space-y-4">
      {!showAddContent ? (
        <button
          onClick={() => setShowAddContent(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Add Content to Module</p>
          <p className="text-xs text-gray-500">Upload videos, PDFs, or add text content</p>
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Content</h3>
            <button
              onClick={() => {
                setShowAddContent(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {!contentType ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Choose the type of content you want to add:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value)}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Type Header */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {selectedContentType && (
                  <>
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <selectedContentType.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedContentType.label}</p>
                      <p className="text-xs text-gray-500">{selectedContentType.description}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this content (optional)"
                />
              </div>

              {/* Content-specific fields */}
              {(contentType === 'video' || contentType === 'link') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {contentType === 'video' ? 'Video URL (YouTube, Vimeo, or direct link)' : 'External URL'}
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* File Upload for supported types */}
              {(contentType === 'video' || contentType === 'pdf' || contentType === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Files
                  </label>
                  <FileUpload
                    onFilesUploaded={handleFileUpload}
                    acceptedTypes={[contentType]}
                    maxFiles={contentType === 'image' ? 20 : 1}
                    maxFileSize={contentType === 'video' ? 500 : 50}
                  />
                </div>
              )}

              {/* Text content for text type */}
              {contentType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    rows={10}
                    required
                    className="input-field"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your text content here..."
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Required content</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Preview (free access)</span>
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContent(false);
                    resetForm();
                  }}
                  className="btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding Content...' : 'Add Content'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleContentUpload;
