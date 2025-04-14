import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-10 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Home
      </button>
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
        📊 Review Your Progress
      </h2>
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <p className="text-gray-700">
          This page will display your practice history, performance charts,
          and personalized learning insights.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          (Coming soon: review history, time accuracy, and level-up tracking.)
        </p>
      </div>
    </div>
  );
};

export default ReviewPage;
