import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Table = ({ data }) => (
  <div className="max-w-2xl mx-auto bg-white rounded shadow p-4 mb-6">
    {data.length === 0 ? (
      <p className="text-center text-gray-500">No scores recorded yet.</p>
    ) : (
      <table className="w-full table-auto text-left">
        <thead>
          <tr className="text-yellow-800">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Accuracy</th>
            <th className="px-2 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="border-t">
              <td className="px-2 py-1">{index + 1}</td>
              <td className="px-2 py-1">{entry.username || entry.name}</td>
              <td className="px-2 py-1">{(entry.accuracy * 100).toFixed(1)}%</td>
              <td className="px-2 py-1">{new Date(entry.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const Leaderboard = () => {
  const [beginner, setBeginner] = useState([]);
  const [intermediate, setIntermediate] = useState([]);
  const [advanced, setAdvanced] = useState([]);
  const [selectedTab, setSelectedTab] = useState('beginner');
  const navigate = useNavigate();

  useEffect(() => {
    const normalizeLevel = (level) => {
      const l = String(level).toLowerCase().trim();
      if (l === '1' || l === 'beginner') return 'beginner';
      if (l === '2' || l === 'intermediate') return 'intermediate';
      if (l === '3' || l === 'advanced') return 'advanced';
      return null;
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/attempts/leaderboard'); // Ensure backend returns all attempts without limit
        const data = await res.json();
        console.log('Fetched leaderboard data:', data);

        const grouped = {
          beginner: [],
          intermediate: [],
          advanced: [],
        };

        data.forEach((e) => {
          const group = normalizeLevel(e.level);
          if (group) grouped[group].push(e);
        });

        setBeginner(grouped.beginner.sort((a, b) => b.accuracy - a.accuracy));
        setIntermediate(grouped.intermediate.sort((a, b) => b.accuracy - a.accuracy));
        setAdvanced(grouped.advanced.sort((a, b) => b.accuracy - a.accuracy));
      } catch (err) {
        console.error('Failed to fetch leaderboard data:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-6"
      style={{
        backgroundImage: "url('/assets/leaderboard.png')",
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </button>
      <h1 className="text-3xl font-bold text-center text-yellow-800 mb-6">🏆 Leaderboard</h1>

      <div className="flex justify-center space-x-4 mb-6">
        {['beginner', 'intermediate', 'advanced'].map(level => (
          <button
            key={level}
            onClick={() => setSelectedTab(level)}
            className={`px-4 py-2 rounded border ${
              selectedTab === level
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-yellow-700 border-yellow-500'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
      {selectedTab === 'beginner' && <Table data={beginner} />}
      {selectedTab === 'intermediate' && <Table data={intermediate} />}
      {selectedTab === 'advanced' && <Table data={advanced} />}
    </div>
  );
};

export default Leaderboard;
