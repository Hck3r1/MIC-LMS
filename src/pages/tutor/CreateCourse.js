import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import {
  ArrowLeftIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCourse, uploadThumbnail, uploadBanner, createModule, addModuleContent, createAssignment } = useCourses();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    
    prerequisites: '',
    learningObjectives: '',
    targetAudience: ''
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [banner, setBanner] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Modules builder state
  const [modules, setModules] = useState([
    { title: '', description: '', order: 1, videos: [''], assignments: [
      { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 }
    ] }
  ]);

  const addModule = () => {
    setModules(prev => ([...prev, { title: '', description: '', order: prev.length + 1, videos: [''], assignments: [
      { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 }
    ] }]));
  };

  const removeModule = (index) => {
    setModules(prev => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i + 1 })));
  };

  const updateModuleField = (index, field, value) => {
    setModules(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addModuleVideo = (index) => {
    setModules(prev => prev.map((m, i) => i === index ? { ...m, videos: [...m.videos, ''] } : m));
  };

  const updateModuleVideo = (moduleIndex, videoIndex, value) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      const videos = [...m.videos];
      videos[videoIndex] = value;
      return { ...m, videos };
    }));
  };

  const removeModuleVideo = (moduleIndex, videoIndex) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      const videos = m.videos.filter((_, vi) => vi !== videoIndex);
      return { ...m, videos };
    }));
  };

  const addModuleAssignment = (moduleIndex) => {
    setModules(prev => prev.map((m, i) => i === moduleIndex ? { ...m, assignments: [...m.assignments, { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 }] } : m));
  };

  const updateModuleAssignment = (moduleIndex, assignmentIndex, field, value) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      const assignments = [...m.assignments];
      assignments[assignmentIndex] = { ...assignments[assignmentIndex], [field]: value };
      return { ...m, assignments };
    }));
  };

  const removeModuleAssignment = (moduleIndex, assignmentIndex) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      const assignments = m.assignments.filter((_, ai) => ai !== assignmentIndex);
      return { ...m, assignments };
    }));
  };

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'ui-ux', label: 'UI/UX Design' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'video-editing', label: 'Video Editing' },
    { value: 'graphics-design', label: 'Graphics Design' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (type === 'thumbnail') {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (type === 'banner') {
      setBanner(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    if (type === 'thumbnail') {
      setThumbnail(null);
      setThumbnailPreview(null);
    } else if (type === 'banner') {
      setBanner(null);
      setBannerPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create course first
      const courseResult = await createCourse({
        ...formData,
        instructor: user._id,
        duration: parseInt(formData.duration),
        learningObjectives: Array.isArray(formData.learningObjectives)
          ? formData.learningObjectives
          : (formData.learningObjectives || '')
              .split(/\n|,/)
              .map(s => s.trim())
              .filter(Boolean)
      });

      if (!courseResult.success) {
        if (courseResult.errorResponse?.errors) {
          setFieldErrors(courseResult.errorResponse.errors);
        }
        throw new Error(courseResult.error);
      }

      const courseId = courseResult.course._id;

      // Upload thumbnail if provided
      if (thumbnail) {
        setUploading(true);
        const thumbnailResult = await uploadThumbnail(courseId, thumbnail);
        if (!thumbnailResult.success) {
          console.warn('Thumbnail upload failed:', thumbnailResult.error);
        }
      }

      // Upload banner if provided
      if (banner) {
        const bannerResult = await uploadBanner(courseId, banner);
        if (!bannerResult.success) {
          console.warn('Banner upload failed:', bannerResult.error);
        }
      }

      // Create modules, add YouTube video content, and assignments
      for (const m of modules) {
        if (!m.title || !m.description) continue;
        const modRes = await createModule({
          courseId,
          title: m.title,
          description: m.description,
          order: m.order
        });
        if (!modRes.success) {
          console.warn('Module creation failed:', modRes.error);
          continue;
        }
        const moduleId = modRes.module._id;
        // Add each non-empty video as youtube link content
        for (const v of m.videos) {
          const url = (v || '').trim();
          if (!url) continue;
          await addModuleContent(moduleId, {
            type: 'video',
            title: 'Video',
            url,
            videoType: 'youtube'
          });
        }
        // Create assignments for module
        for (const a of (m.assignments || [])) {
          if (!a.title || !a.description || !a.instructions || !a.dueDate) continue;
          await createAssignment({
            moduleId,
            courseId,
            title: a.title,
            description: a.description,
            instructions: a.instructions,
            type: a.type,
            dueDate: a.dueDate,
            maxPoints: parseInt(a.maxPoints || 100)
          });
        }
      }

      setUploading(false);
      
      // Navigate to course management
      navigate('/tutor/dashboard', { 
        state: { 
          message: 'Course created successfully!',
          type: 'success'
        }
      });

    } catch (error) {
      setError(error.message || 'Failed to create course');
      if (error.response?.data?.errors) setFieldErrors(error.response.data.errors);
      setLoading(false);
      setUploading(false);
    }
  };

  // UI helper classes
  const inputClass = "block w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 placeholder-gray-400 transition";
  const selectClass = inputClass;
  const textAreaClass = "block w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 placeholder-gray-400 transition resize-none";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">Share your knowledge and create an engaging learning experience</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {fieldErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <div className="font-semibold mb-2">Please fix the following:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {fieldErrors.map((e, idx) => (
                <li key={idx}>{e.path}: {e.msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className={inputClass}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging course title"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className={textAreaClass}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className={selectClass}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  name="difficulty"
                  required
                  className={selectClass}
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  className={inputClass}
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              
            </div>
          </div>

          {/* Course Media */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Media</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('thumbnail')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a thumbnail image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="btn-outline cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Banner
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {bannerPreview ? (
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('banner')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a banner image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="btn-outline cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modules Builder */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Modules</h2>
              <button type="button" className="btn-outline inline-flex items-center" onClick={addModule}>
                <PlusIcon className="w-5 h-5 mr-2" /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              {modules.map((m, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Module {idx + 1}</h3>
                    {modules.length > 1 && (
                      <button type="button" className="text-red-600 hover:underline text-sm" onClick={() => removeModule(idx)}>Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input className={inputClass} value={m.title} onChange={(e) => updateModuleField(idx, 'title', e.target.value)} placeholder="Module title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                      <input type="number" min="1" className={inputClass} value={m.order} onChange={(e) => updateModuleField(idx, 'order', parseInt(e.target.value || '1'))} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea rows={3} className={textAreaClass} value={m.description} onChange={(e) => updateModuleField(idx, 'description', e.target.value)} placeholder="What will this module cover?" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">YouTube Videos</h4>
                      <button type="button" className="text-primary-600 hover:underline text-sm" onClick={() => addModuleVideo(idx)}>Add link</button>
                    </div>
                    <div className="space-y-2">
                      {m.videos.map((v, vi) => (
                        <div key={vi} className="flex items-center space-x-2">
                          <input className={`${inputClass} flex-1`} placeholder="https://www.youtube.com/watch?v=..." value={v} onChange={(e) => updateModuleVideo(idx, vi, e.target.value)} />
                          {m.videos.length > 1 && (
                            <button type="button" className="btn-outline" onClick={() => removeModuleVideo(idx, vi)}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Assignments</h4>
                      <button type="button" className="text-primary-600 hover:underline text-sm" onClick={() => addModuleAssignment(idx)}>Add assignment</button>
                    </div>
                    <div className="space-y-4">
                      {(m.assignments || []).map((a, ai) => (
                        <div key={ai} className="border rounded-lg p-3">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input className={inputClass} value={a.title} onChange={(e) => updateModuleAssignment(idx, ai, 'title', e.target.value)} placeholder="Assignment title" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                              <select className={selectClass} value={a.type} onChange={(e) => updateModuleAssignment(idx, ai, 'type', e.target.value)}>
                                <option value="file_upload">File Upload</option>
                                <option value="text_submission">Text Submission</option>
                                <option value="code_submission">Code Submission</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                              </select>
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea rows={2} className={textAreaClass} value={a.description} onChange={(e) => updateModuleAssignment(idx, ai, 'description', e.target.value)} placeholder="Short description" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                              <textarea rows={3} className={textAreaClass} value={a.instructions} onChange={(e) => updateModuleAssignment(idx, ai, 'instructions', e.target.value)} placeholder="Detailed instructions for students" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                              <input type="datetime-local" className={inputClass} value={a.dueDate} onChange={(e) => updateModuleAssignment(idx, ai, 'dueDate', e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                              <input type="number" min="1" className={inputClass} value={a.maxPoints} onChange={(e) => updateModuleAssignment(idx, ai, 'maxPoints', e.target.value)} />
                            </div>
                          </div>
                          {m.assignments.length > 1 && (
                            <div className="mt-2 text-right">
                              <button type="button" className="text-red-600 hover:underline text-sm" onClick={() => removeModuleAssignment(idx, ai)}>Remove assignment</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <textarea
                  name="prerequisites"
                  rows={3}
                  className="input-field"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  placeholder="What should students know before taking this course?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives
                </label>
                <textarea
                  name="learningObjectives"
                  rows={4}
                  className="input-field"
                  value={formData.learningObjectives}
                  onChange={handleChange}
                  placeholder="What will students be able to do after completing this course?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  name="targetAudience"
                  rows={3}
                  className="input-field"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="Who is this course designed for?"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tutor/dashboard')}
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
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? 'Uploading...' : 'Creating Course...'}
                </div>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
