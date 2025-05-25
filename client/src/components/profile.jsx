import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState({ stars: 0, moons: 0, suns: 0, nextIn: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: decoded.username, email: decoded.email });

        fetch('http://localhost:5050/api/level/status', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => setLevel(data))
          .catch(err => console.error('Failed to fetch level status:', err));
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }
  }, []);

  const allowedColors = ['red', 'green', 'blue', 'yellow', 'indigo', 'purple', 'pink'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white p-6">
      <button
        onClick={() => window.location.href = '/'}
        className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
      >
        ← Back to Home
      </button>
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-indigo-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <User className="text-indigo-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-indigo-800">User Profile</h1>
            <p className="text-sm text-gray-500">Manage your account information and badges</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Username</label>
            <p className="text-lg font-medium text-gray-800">{user.username || 'Unknown User'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <p className="text-lg font-medium text-gray-800">{user.email || 'Not Provided'}</p>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-indigo-700 mb-2">📈 Your Level</h2>
            <div className="flex justify-center space-x-4 text-3xl mb-2">
              {'☀️'.repeat(level.suns)}
              {'🌙'.repeat(level.moons)}
              {'⭐️'.repeat(level.stars)}
            </div>
            <p className="text-center text-sm text-gray-500">
              {level.nextIn} more correct answers to reach next star
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;