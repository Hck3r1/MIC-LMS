import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissions } from '../../contexts/SubmissionsContext';

const StudentGrades = () => {
  const { user } = useAuth();
  const { getStudentSubmissions } = useSubmissions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await getStudentSubmissions(user._id);
        if (res.success) {
          setItems(res.data.submissions || []);
        } else {
          setError(res.message || 'Failed to load submissions');
        }
      } catch (e) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, getStudentSubmissions]);

  const summary = useMemo(() => {
    const graded = items.filter(s => s.status === 'graded');
    const avg = graded.length ? Math.round((graded.reduce((sum, s) => sum + (s.gradePercentage || 0), 0) / graded.length)) : 0;
    return { total: items.length, graded: graded.length, average: avg };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-2">View your assignment grades and feedback</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card"><div className="text-sm text-gray-600">Total Submissions</div><div className="text-2xl font-bold text-gray-900">{summary.total}</div></div>
          <div className="card"><div className="text-sm text-gray-600">Graded</div><div className="text-2xl font-bold text-gray-900">{summary.graded}</div></div>
          <div className="card"><div className="text-sm text-gray-600">Average Grade</div><div className="text-2xl font-bold text-gray-900">{summary.average}%</div></div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((s) => (
              <div key={s._id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{s.assignmentId?.title || 'Assignment'}</div>
                    <div className="text-sm text-gray-600">Status: {s.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-700">{typeof s.gradePercentage === 'number' ? `${s.gradePercentage}%` : '—'}</div>
                    {s.gradedAt && <div className="text-xs text-gray-500">Graded {new Date(s.gradedAt).toLocaleString()}</div>}
                  </div>
                </div>
                {s.feedback?.general && (
                  <div className="mt-2 text-sm text-gray-700">Feedback: {s.feedback.general}</div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="py-6 text-sm text-gray-600">No submissions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;


