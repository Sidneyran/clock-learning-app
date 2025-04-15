import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('game_scores')) || [];
    const sortedScores = savedScores
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.accuracy - a.accuracy;
      })
      .slice(0, 10);
    setScores(sortedScores);
  }, []);

  const clearScores = () => {
    localStorage.removeItem('game_scores');
    setScores([]);
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </button>
      <h1 className="text-3xl font-bold text-center text-yellow-800 mb-6">🏆 Leaderboard</h1>

      {scores.length === 0 ? (
        <p className="text-center text-gray-500">No scores recorded yet.</p>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded shadow p-4">
          <table className="w-full table-auto text-left">
            <thead>
              <tr className="text-yellow-800">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Accuracy</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => (
                <tr key={index} className="border-t">
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1">{entry.name}</td>
                  <td className="px-2 py-1">{entry.score}</td>
                  <td className="px-2 py-1">{entry.accuracy}%</td>
                  <td className="px-2 py-1">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {scores.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={clearScores}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
