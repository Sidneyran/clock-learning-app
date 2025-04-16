import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, GraduationCap, Clock, History, Trophy, AlertCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12">
      <div className="flex justify-end mb-4">
        <div className="text-sm text-gray-700">
          Logged in as <strong>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Guest'}</strong>
          <button
            className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-4">Clock Learning App</h1>
      <p className="text-center text-lg text-gray-700 mb-6">Welcome back, <strong>{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Guest'}</strong>!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/videos')}
        >
          <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Video Learning</h3>
          <p className="text-gray-600">Watch curated YouTube videos and explore clock concepts interactively.</p>
        </div>

        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/practice')}
        >
          <Clock className="w-12 h-12 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Practice Mode</h3>
          <p className="text-gray-600">Choose your level and start practicing reading analog clocks.</p>
        </div>

        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/review')}
        >
          <History className="w-12 h-12 mx-auto text-orange-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Review Progress</h3>
          <p className="text-gray-600">Review your past attempts, scores, and improve your skills.</p>
        </div>

        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/challenge')}
        >
          <BookOpenCheck className="w-12 h-12 mx-auto text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Time Challenge</h3>
          <p className="text-gray-600">Test your time-telling skills with fun mini games.</p>
        </div>

        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/review-error')}
        >
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Review Errors</h3>
          <p className="text-gray-600">Focus on your incorrect answers and learn from mistakes.</p>
        </div>

        <div
          className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition duration-200 text-center"
          onClick={() => navigate('/leaderboard')}
        >
          <Trophy className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
          <p className="text-gray-600">See the top scores from the Time Challenge game.</p>
        </div>
      </div>

      <footer className="text-center mt-12 text-sm text-gray-500">
        Built with ❤️ to help children master time telling.
      </footer>
    </div>
  );
};

export default Home;
