import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GameReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results =
    location.state?.results ||
    JSON.parse(localStorage.getItem('latest_game_results') || '[]');

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? ((correctCount / results.length) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    if (results.length === 0) return;

    const correctCount = results.filter(r => r.correct).length;
    const accuracy = correctCount / results.length;
    const avgTime = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / results.length;
    const attempts = results.length;
    const lastLevel = results[results.length - 1]?.level || 1;

    fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accuracy,
        avg_time: avgTime,
        attempts,
        last_level: lastLevel
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.recommended_level !== undefined) {
          console.log('保存推荐等级：', data.recommended_level);
          localStorage.setItem('recommended_level', data.recommended_level);
        }
      })
      .catch(err => console.error('Error fetching recommendation:', err));
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        No review data found. Please complete a game first.
      </div>
    );
  }

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
