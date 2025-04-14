import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClockLearning from './components/ClockLearning';
import Home from './components/Home';
import VideoPage from './components/VideoPage';
import ReviewPage from './components/ReviewPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<ClockLearning />} />
        <Route path="/videos" element={<VideoPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
