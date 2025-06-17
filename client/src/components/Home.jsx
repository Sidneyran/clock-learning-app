import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, GraduationCap, Clock, History, Trophy, AlertCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      console.log('Restored user:', storedUser);
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        const username = storedUser.username || storedUser.name || storedUser.email || 'Guest';
        setUser({ ...storedUser, username });
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed px-6 py-12" style={{ backgroundImage: "url('/assets/image2.png')" }}>
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
        <div className="bg-white border border-gray-200 px-4 py-2 rounded shadow-sm text-sm text-gray-700">
          Welcome back, <strong>{user?.username || user?.name || user?.email || 'Guest'}</strong>!
        </div>
        <div className="text-sm text-gray-700">
          Logged in as <strong>{user?.username || user?.name || user?.email || 'Guest'}</strong>
          <button
            className="ml-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
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
      <h1 className="text-5xl font-bold text-center text-blue-900 mb-2">ClockStar</h1>
      <p className="text-center text-lg text-gray-600 mb-6 italic">clock learning app for kids</p>

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
          <p className="text-gray-600">
            Review your past attempts, scores, and improve your skills. Ideal for tracking learning history and enabling parental monitoring.
          </p>
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
        Built with ❤️ to help children master time telling — ClockStar.
      </footer>
    </div>
  );
};

export default Home;
