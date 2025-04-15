import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReviewPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    correct: 0,
    score: 0,
    maxScore: 0,
  });
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('clock_records')) || [];
    const latest = saved.slice(-5);
    setRecords(latest.reverse());

    let total = saved.length;
    let correct = saved.filter(r => r.correct).length;
    let maxScore = Math.max(...saved.map(r => r.score), 0);
    let latestScore = saved[saved.length - 1]?.score || 0;

    setSummary({ total, correct, score: latestScore, maxScore });

    setBarData({
      labels: latest.map((r, i) => `#${saved.length - latest.length + i + 1}`),
      datasets: [{
        label: 'Score',
        data: latest.map(r => r.score),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }]
    });

    setPieData({
      labels: ['Correct', 'Incorrect'],
      datasets: [{
        data: [correct, total - correct],
        backgroundColor: ['#34D399', '#F87171']
      }]
    });
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        <Link to="/" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeftCircle className="w-5 h-5 mr-1" />
          Back to Home
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-4">📊 Review Your Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-md font-semibold mb-2">📈 Score Trend (Last 5)</h4>
          {barData?.datasets ? <Bar data={barData} /> : <p className="text-sm text-gray-500">No data to display</p>}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="text-md font-semibold mb-2">🎯 Accuracy Ratio</h4>
          {pieData?.datasets ? <Pie data={pieData} /> : <p className="text-sm text-gray-500">No data to display</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-blue-100 p-4 rounded shadow">
          <p className="text-gray-700 font-semibold">Attempts</p>
          <p className="text-xl font-bold">{summary.total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-gray-700 font-semibold">Correct</p>
          <p className="text-xl font-bold">{summary.correct}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <p className="text-gray-700 font-semibold">Accuracy</p>
          <p className="text-xl font-bold">
            {summary.total > 0 ? ((summary.correct / summary.total) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow col-span-1 md:col-span-1">
          <p className="text-gray-700 font-semibold">Latest Score</p>
          <p className="text-xl font-bold">{summary.score} ⭐</p>
        </div>
        <div className="bg-orange-100 p-4 rounded shadow col-span-1 md:col-span-1">
          <p className="text-gray-700 font-semibold">Highest Score</p>
          <p className="text-xl font-bold">{summary.maxScore} 🏆</p>
        </div>
      </div>

      <h3 className="font-semibold mb-2">🕓 Recent Attempts</h3>
      <table className="w-full border text-sm bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border text-center">Time</th>
            <th className="p-2 border text-center">Level</th>
            <th className="p-2 border text-center">Result</th>
            <th className="p-2 border text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td className="p-2 border text-center">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="p-2 border text-center">{r.difficulty}</td>
              <td className="p-2 border text-center">{r.correct ? '✅' : '❌'}</td>
              <td className="p-2 border text-center">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewPage;