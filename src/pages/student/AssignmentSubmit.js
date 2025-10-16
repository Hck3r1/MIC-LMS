import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSubmissions } from '../../contexts/SubmissionsContext';
import CodeEditor from '../../components/common/CodeEditor';

const AssignmentSubmit = () => {
  const { id: assignmentId } = useParams();
  const { submitAssignment } = useSubmissions();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitAssignment({ assignmentId, textSubmission: text, files: Array.from(files) });
      alert('Submitted');
      setText('');
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Assignment</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Submission</label>
            <textarea className="input-field" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your solution here..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code (optional)</label>
            <CodeEditor value={code} onChange={setCode} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmit;



