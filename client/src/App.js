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
import Login from './components/Login';
import Register from './components/Register';

const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Navigate to="/home" />} />
          <Route path="/practice" element={<ClockLearning />} />
          <Route path="/videos" element={<VideoPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/challenge" element={<GameChallenge />} />
          <Route path="/review-game" element={<PrivateRoute><GameReview /></PrivateRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/review-error" element={<ReviewError />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;