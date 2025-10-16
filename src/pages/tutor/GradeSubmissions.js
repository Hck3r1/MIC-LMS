import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const GradeSubmissions = ({ assignmentId: assignmentIdProp }) => {
  const params = useParams();
  const assignmentId = assignmentIdProp || params.assignmentId;
  const { gradeSubmission } = useSubmissions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }), []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/submissions/assignment/${assignmentId}`, { headers });
      setItems(res.data?.data?.submissions || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (assignmentId) load(); }, [assignmentId]);

  const onGrade = async (sid) => {
    const grade = parseFloat(prompt('Enter grade (0-100):') || '0');
    if (Number.isNaN(grade)) return;
    await gradeSubmission(sid, { grade, feedback: { general: '' } });
    await load();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Submissions</h3>
      <div className="divide-y divide-gray-100">
        {items.map(s => (
          <div key={s._id} className="py-3 flex items-center justify-between">
            <div>
              <div className="text-gray-900">{s.studentId?.firstName} {s.studentId?.lastName}</div>
              <div className="text-sm text-gray-600">Status: {s.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline" onClick={() => onGrade(s._id)}>Grade</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="py-4 text-sm text-gray-600">No submissions yet.</div>}
      </div>
    </div>
  );
};

export default GradeSubmissions;



