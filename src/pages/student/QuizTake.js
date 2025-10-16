import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const QuizTake = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_URL}/quizzes/module/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      const first = res.data?.data?.quizzes?.[0];
      if (first) setQuiz(first);
      setAnswers((first?.questions || []).map(() => null));
    };
    load();
  }, [id]);

  const onSubmit = async () => {
    if (!quiz?._id) return;
    const res = await axios.post(`${API_URL}/quizzes/${quiz._id}/attempt`, { answers }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
    setResult(res.data?.data?.result);
  };

  if (!quiz) return <div className="p-6">Loading quiz…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        <div className="space-y-6 card">
          {(quiz.questions || []).map((q, idx) => (
            <div key={idx}>
              <div className="font-medium text-gray-900 mb-2">Q{idx + 1}. {q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center space-x-2">
                    <input type="radio" name={`q-${idx}`} checked={answers[idx] === oi} onChange={() => setAnswers(ans => { const a = [...ans]; a[idx] = oi; return a; })} />
                    <span className="text-gray-800">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={onSubmit}>Submit</button>
        </div>

        {result && (
          <div className="card mt-4">
            <div className="text-gray-900 font-semibold">Score: {result.score}/{result.total} ({result.percentage}%)</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTake;


