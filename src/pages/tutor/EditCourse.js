import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCourses } from '../../contexts/CourseContext';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentCourse,
    modules: courseModules,
    fetchCourse,
    fetchModules,
    getCourseStructure,
    updateCourse,
    createModule,
    addModuleContent,
    createAssignment,
    loading,
    getAuthMe
  } = useCourses();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 1,
    prerequisites: '',
    learningObjectives: '',
    targetAudience: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  // Local editable modules builder (existing + new)
  const [modules, setModules] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  useEffect(() => {
    if (!id) return;
    // Prefer single structure fetch; it also sets currentCourse/modules in context
    (async () => {
      const res = await getCourseStructure(id);
      if (!res?.success) {
        // Fallback to previous behavior
        await Promise.all([fetchCourse(id), fetchModules(id)]);
      }
    })();
  }, [id, getCourseStructure, fetchCourse, fetchModules]);

  useEffect(() => {
    if (!currentCourse) return;
    setFormData({
      title: currentCourse.title || '',
      description: currentCourse.description || '',
      category: currentCourse.category || '',
      difficulty: currentCourse.difficulty || 'beginner',
      duration: currentCourse.duration || 1,
      prerequisites: '',
      learningObjectives: Array.isArray(currentCourse.learningObjectives)
        ? currentCourse.learningObjectives.join('\n')
        : (currentCourse.learningObjectives || ''),
      targetAudience: currentCourse.targetAudience || ''
    });
  }, [currentCourse]);

  // Fallback prefill from auth/me if course endpoint lacks fields
  useEffect(() => {
    const fallbackPrefill = async () => {
      if (!id || !currentCourse) return;
      const missing = !currentCourse.category || !currentCourse.duration;
      if (!missing) return;
      const me = await getAuthMe();
      if (!me.success || !me.me) return;
      const match = (Array.isArray(me.me.createdCourses) ? me.me.createdCourses : []).find(c => (c._id || c.id) === id);
      if (!match) return;
      setFormData(prev => ({
        ...prev,
        category: prev.category || match.category || '',
        duration: prev.duration || match.duration || 1,
        learningObjectives: prev.learningObjectives || (Array.isArray(match.learningObjectives) ? match.learningObjectives.join('\n') : (match.learningObjectives || '')),
        targetAudience: prev.targetAudience || match.targetAudience || ''
      }));
    };
    fallbackPrefill();
  }, [id, currentCourse, getAuthMe]);

  useEffect(() => {
    // Initialize editable modules from fetched modules and prefill existing videos/assignments
    const load = async () => {
      // Map existing module content (videos)
      const base = (courseModules || []).map((m, idx) => ({
        _id: m._id,
        title: m.title || '',
        description: m.description || '',
        order: m.order || (idx + 1),
        videos: Array.isArray(m.content)
          ? m.content
              .filter(c => c?.type === 'video' && typeof c?.url === 'string')
              .map(c => c.url)
          : [''],
        assignments: []
      }));

      if (base.length === 0) {
        setModules([
          {
            title: '',
            description: '',
            order: 1,
            videos: [''],
            assignments: [
              { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 }
            ]
          }
        ]);
        return;
      }

      // Fetch assignments per module in parallel
      try {
        const results = await Promise.all(
          base.map(async (bm) => {
            try {
              const res = await axios.get(`${API_URL}/assignments/module/${bm._id}` , { headers: authHeaders });
              const data = res?.data;
              const list = Array.isArray(data?.data?.assignments)
                ? data.data.assignments
                : Array.isArray(data?.assignments)
                  ? data.assignments
                  : Array.isArray(data?.data)
                    ? data.data
                    : [];
              const simplified = list.map(a => ({
                title: a.title || '',
                description: a.description || '',
                instructions: a.instructions || '',
                type: a.type || 'file_upload',
                dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0,16) : '',
                maxPoints: typeof a.maxPoints === 'number' ? a.maxPoints : 100
              }));
              return { ...bm, assignments: simplified.length ? simplified : [ { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 } ] };
            } catch (_) {
              return { ...bm, assignments: [ { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 } ] };
            }
          })
        );
        setModules(results);
      } catch (_) {
        // Fallback to base without assignments if any unexpected error
        setModules(
          base.map(b => ({
            ...b,
            assignments: [ { title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 } ]
          }))
        );
      }
    };

    load();
  }, [courseModules, API_URL, authHeaders]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modules builder handlers (same UX as create page)
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

  const categories = useMemo(() => ([
    { value: 'web-development', label: 'Web Development' },
    { value: 'ui-ux', label: 'UI/UX Design' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'video-editing', label: 'Video Editing' },
    { value: 'graphics-design', label: 'Graphics Design' }
  ]), []);

  const difficulties = useMemo(() => ([
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await updateCourse(id, {
        ...formData,
        duration: parseInt(formData.duration),
        learningObjectives: Array.isArray(formData.learningObjectives)
          ? formData.learningObjectives
          : (formData.learningObjectives || '')
              .split(/\n|,/)
              .map(s => s.trim())
              .filter(Boolean)
      });
      if (!result.success) throw new Error(result.error);

      // For any modules without _id (new ones), create and attach content
      for (const m of modules) {
        if (m._id) continue; // existing module - skip creation in this flow
        if (!m.title || !m.description) continue;
        const modRes = await createModule({ courseId: id, title: m.title, description: m.description, order: m.order });
        if (!modRes.success) continue;
        const moduleId = modRes.module._id;
        for (const v of (m.videos || [])) {
          const url = (v || '').trim();
          if (!url) continue;
          await addModuleContent(moduleId, { type: 'video', title: 'Video', url, videoType: 'youtube' });
        }
        for (const a of (m.assignments || [])) {
          if (!a.title || !a.description || !a.instructions || !a.dueDate) continue;
          await createAssignment({ moduleId, courseId: id, title: a.title, description: a.description, instructions: a.instructions, type: a.type, dueDate: a.dueDate, maxPoints: parseInt(a.maxPoints || 100) });
        }
      }
      navigate(`/tutor/courses/${id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const inputClass = "block w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 shadow-sm focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 dark:focus:border-primary-400 placeholder-gray-400 dark:placeholder-gray-500 transition";
  const selectClass = inputClass;
  const textAreaClass = "block w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 shadow-sm focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 dark:focus:border-primary-400 placeholder-gray-400 dark:placeholder-gray-500 transition resize-none";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => navigate(`/tutor/courses/${id}`)} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Course</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Update course information and add modules, videos, and assignments</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}
        {fieldErrors.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 px-4 py-3 rounded-lg mb-6">
            <div className="font-semibold mb-2">Please fix the following:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {fieldErrors.map((e, idx) => (
                <li key={idx}>{e.path}: {e.msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
                <input type="text" name="title" required className={inputClass} value={formData.title} onChange={handleChange} placeholder="Enter an engaging course title" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Description *</label>
                <textarea name="description" required rows={4} className={textAreaClass} value={formData.description} onChange={handleChange} placeholder="Describe what students will learn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <select name="category" required className={selectClass} value={formData.category} onChange={handleChange}>
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level *</label>
                <select name="difficulty" required className={selectClass} value={formData.difficulty} onChange={handleChange}>
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (hours) *</label>
                <input type="number" name="duration" min="1" required className={inputClass} value={formData.duration} onChange={handleChange} placeholder="10" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Modules</h2>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Add new modules, YouTube links, and assignments. Existing contents remain unchanged.</p>
              <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors inline-flex items-center" onClick={addModule}>
                <PlusIcon className="w-5 h-5 mr-2" /> Add Module
              </button>
            </div>
            <div className="space-y-6">
              {modules.map((m, idx) => (
                <div key={m._id || idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Module {idx + 1}{m._id ? ' (existing)' : ''}</h3>
                    {modules.length > 1 && !m._id && (
                      <button type="button" className="text-red-600 dark:text-red-400 hover:underline text-sm transition-colors" onClick={() => removeModule(idx)}>Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                      <input className={inputClass} value={m.title} onChange={(e) => updateModuleField(idx, 'title', e.target.value)} placeholder="Module title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                      <input type="number" min="1" className={inputClass} value={m.order} onChange={(e) => updateModuleField(idx, 'order', parseInt(e.target.value || '1'))} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea rows={3} className={textAreaClass} value={m.description} onChange={(e) => updateModuleField(idx, 'description', e.target.value)} placeholder="What will this module cover?" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">YouTube Videos</h4>
                      <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline text-sm transition-colors" onClick={() => addModuleVideo(idx)}>Add link</button>
                    </div>
                    <div className="space-y-2">
                      {m.videos.map((v, vi) => (
                        <div key={vi} className="flex items-center space-x-2">
                          <input className={`${inputClass} flex-1`} placeholder="https://www.youtube.com/watch?v=..." value={v} onChange={(e) => updateModuleVideo(idx, vi, e.target.value)} />
                          {m.videos.length > 1 && (
                            <button type="button" className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm" onClick={() => removeModuleVideo(idx, vi)}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Assignments</h4>
                      <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline text-sm transition-colors" onClick={() => addModuleAssignment(idx)}>Add assignment</button>
                    </div>
                    <div className="space-y-4">
                      {(m.assignments || []).map((a, ai) => (
                        <div key={ai} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                              <input className={inputClass} value={a.title} onChange={(e) => updateModuleAssignment(idx, ai, 'title', e.target.value)} placeholder="Assignment title" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                              <select className={selectClass} value={a.type} onChange={(e) => updateModuleAssignment(idx, ai, 'type', e.target.value)}>
                                <option value="file_upload">File Upload</option>
                                <option value="text_submission">Text Submission</option>
                                <option value="code_submission">Code Submission</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                              </select>
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                              <textarea rows={2} className={textAreaClass} value={a.description} onChange={(e) => updateModuleAssignment(idx, ai, 'description', e.target.value)} placeholder="Short description" />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                              <textarea rows={3} className={textAreaClass} value={a.instructions} onChange={(e) => updateModuleAssignment(idx, ai, 'instructions', e.target.value)} placeholder="Detailed instructions" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                              <input type="datetime-local" className={inputClass} value={a.dueDate} onChange={(e) => updateModuleAssignment(idx, ai, 'dueDate', e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Points</label>
                              <input type="number" min="1" className={inputClass} value={a.maxPoints} onChange={(e) => updateModuleAssignment(idx, ai, 'maxPoints', e.target.value)} />
                            </div>
                          </div>
                          {m.assignments.length > 1 && (
                            <div className="mt-2 text-right">
                              <button type="button" className="text-red-600 dark:text-red-400 hover:underline text-sm transition-colors" onClick={() => removeModuleAssignment(idx, ai)}>Remove assignment</button>
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Course Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites</label>
                <textarea name="prerequisites" rows={3} className={textAreaClass} value={formData.prerequisites} onChange={handleChange} placeholder="What should students know before taking this course?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Objectives</label>
                <textarea name="learningObjectives" rows={4} className={textAreaClass} value={formData.learningObjectives} onChange={handleChange} placeholder="One per line or comma-separated" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                <textarea name="targetAudience" rows={3} className={textAreaClass} value={formData.targetAudience} onChange={handleChange} placeholder="Who is this course designed for?" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(`/tutor/courses/${id}`)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;


