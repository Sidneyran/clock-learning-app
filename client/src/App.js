import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import ClockLearning from './components/ClockLearning';
import Home from './components/Home';
import VideoPage from './components/VideoPage';
import ReviewPage from './components/ReviewPage';
import GameChallenge from './components/GameChallenge';
import GameReview from './components/GameReview';
import Leaderboard from './components/Leaderboard';
import ReviewError from './components/ReviewError';
import Profile from './components/profile.jsx';
import Login from './components/Login';
import Register from './components/Register';

const PrivateRoute = ({ children }) => {
  const { authData } = React.useContext(AuthContext);
  return authData?.user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/practice" element={<PrivateRoute><ClockLearning /></PrivateRoute>} />
          <Route path="/videos" element={<VideoPage />} />
          <Route path="/review" element={<PrivateRoute><ReviewPage /></PrivateRoute>} />
          <Route path="/challenge" element={<PrivateRoute><GameChallenge /></PrivateRoute>} />
          <Route path="/review-game" element={<PrivateRoute><GameReview /></PrivateRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/review-error" element={<PrivateRoute><ReviewError /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;