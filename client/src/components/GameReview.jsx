import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GameReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? ((correctCount / results.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center mb-6 text-blue-600 hover:underline"
      >
        <ArrowLeft className="mr-1" /> Back to Home
      </button>

      <h1 className="text-2xl font-bold text-blue-800 mb-4">📘 Game Review</h1>

      <div className="bg-white p-6 rounded shadow-md mb-6">
        <p className="text-lg font-medium">✅ Correct Answers: {correctCount}</p>
        <p className="text-lg font-medium">❌ Incorrect Answers: {results.length - correctCount}</p>
        <p className="text-lg font-medium">🎯 Accuracy: {accuracy}%</p>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-semibold mb-4">📝 Detailed Review</h2>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Correct Answer</th>
              <th className="p-2 border">Your Choice</th>
              <th className="p-2 border">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="text-sm">
                <td className="p-2 border">{r.question}</td>
                <td className="p-2 border">{r.correctAnswer}</td>
                <td className="p-2 border">{r.selected}</td>
                <td className={`p-2 border ${r.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {r.correct ? '✔️ Correct' : '❌ Incorrect'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameReview;
