import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext';
import axios from 'axios';
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const AssignmentsManage = () => {
  const { id: courseId } = useParams();
  const { modules, assignments, fetchModules, fetchAssignments, updateAssignment, deleteAssignment } = useCourses();
  const [form, setForm] = useState({ moduleId: '', title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    fetchModules(courseId);
  }, [courseId, fetchModules]);

  useEffect(() => {
    if (!form.moduleId) return;
    fetchAssignments(form.moduleId);
  }, [form.moduleId, fetchAssignments]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  const createAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/assignments`, { ...form, courseId }, { headers });
      alert('Assignment created');
      // Immediately refresh assignments for the selected module so UI reflects the new item
      if (form.moduleId) {
        await fetchAssignments(form.moduleId);
      }
      setForm({ moduleId: '', title: '', description: '', instructions: '', type: 'file_upload', dueDate: '', maxPoints: 100 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = async (a) => {
    const title = prompt('Update title', a.title) || a.title;
    const description = prompt('Update description', a.description) || a.description;
    const dueDate = prompt('Update due date (YYYY-MM-DDTHH:mm)', (a.dueDate ? new Date(a.dueDate).toISOString().slice(0,16) : '')) || a.dueDate;
    const res = await updateAssignment(a._id, { title, description, dueDate });
    if (res.success) {
      await fetchAssignments(a.moduleId);
      alert('Updated');
    } else {
      alert(res.error);
    }
  };

  const onDelete = async (a) => {
    if (!window.confirm('Delete this assignment?')) return;
    const res = await deleteAssignment(a._id);
    if (res.success) {
      await fetchAssignments(a.moduleId);
      alert('Deleted');
    } else {
      alert(res.error);
    }
  };

  const onPublish = async (assignment) => {
    if (!window.confirm(`Publish "${assignment.title}"? Students will be able to submit to this assignment.`)) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.patch(`${API_URL}/assignments/${assignment._id}/publish`, {}, { headers });
      if (response.data.success) {
        alert('Assignment published successfully!');
        await fetchAssignments(assignment.moduleId);
      } else {
        alert(response.data.message || 'Failed to publish assignment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/tutor/courses" className="hover:text-primary-600 transition-colors">
            Manage Courses
          </Link>
          <span>/</span>
          <Link to={`/tutor/courses/${courseId}`} className="hover:text-primary-600 transition-colors">
            Course Details
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Assignments</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Assignments</h1>
          </div>
          <Link 
            to={`/tutor/courses/${courseId}`}
            className="btn-outline inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={createAssignment} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <select className="input-field" value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} required>
              <option value="">Select module</option>
              {(modules || []).map((m) => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea className="input-field" rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="file_upload">File Upload</option>
                <option value="text_submission">Text Submission</option>
                <option value="code_submission">Code Submission</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="datetime-local" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
              <input type="number" min="1" className="input-field" value={form.maxPoints} onChange={(e) => setForm({ ...form, maxPoints: parseInt(e.target.value || '1') })} required />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
          </div>
        </form>

        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Assignments in selected module</h2>
          {!form.moduleId && <div className="text-sm text-gray-600">Select a module to view assignments.</div>}
          {form.moduleId && (
            <div className="divide-y divide-gray-100">
              {(assignments || []).map((a) => (
                <div key={a._id} className="py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-900 font-medium">{a.title}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        a.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {a.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Due: {a.dueDate ? new Date(a.dueDate).toLocaleString() : '—'}</div>
                    <div className="text-sm text-gray-500">Type: {a.type.replace('_', ' ')} • Points: {a.maxPoints}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!a.isPublished && (
                      <button 
                        type="button" 
                        className="btn-primary text-sm" 
                        onClick={() => onPublish(a)}
                        disabled={loading}
                      >
                        Publish
                      </button>
                    )}
                    <button type="button" className="btn-outline" onClick={() => onEdit(a)}>Edit</button>
                    <button type="button" className="btn-danger" onClick={() => onDelete(a)}>Delete</button>
                  </div>
                </div>
              ))}
              {(assignments || []).length === 0 && (
                <div className="py-3 text-sm text-gray-600">No assignments in this module.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsManage;



