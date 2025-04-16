import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewError = () => {
  const [errorData, setErrorData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let stored = [];
    const raw = localStorage.getItem('error_reviews');
    console.log("Raw localStorage error_reviews:", raw);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log("Parsed error review data:", parsed);
        if (Array.isArray(parsed)) {
          stored = parsed;
        } else {
          console.warn("Parsed data is not an array:", parsed);
        }
      } catch (err) {
        console.error("JSON parse error for error_reviews:", err);
      }
    }
    setErrorData(Array.isArray(stored) ? stored.reverse() : []); // Show recent first
  }, []);

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-red-700 hover:text-red-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </button>
      <h1 className="text-3xl font-bold text-center text-red-800 mb-6">❌ Review Incorrect Answers</h1>

      {errorData.length === 0 ? (
        <p className="text-center text-gray-500">No incorrect questions recorded.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {errorData.map((entry, index) => {
            console.log("Processing entry:", entry);
            let correctHourAngle, correctMinuteAngle, selectedHourAngle, selectedMinuteAngle;
            if (entry.correctAnswer?.includes(':') && entry.selected?.includes(':')) {
              const [chStr, cmStr] = entry.correctAnswer.split(':');
              const [shStr, smStr] = entry.selected.split(':');

              const ch = parseInt(chStr, 10), cm = parseInt(cmStr, 10);
              const sh = parseInt(shStr, 10), sm = parseInt(smStr, 10);

              correctHourAngle = (360 / 12) * ((ch % 12) + (cm / 60));
              correctMinuteAngle = (360 / 60) * cm;
              selectedHourAngle = (360 / 12) * ((sh % 12) + (sm / 60));
              selectedMinuteAngle = (360 / 60) * sm;
            }

            return (
              <div key={index} className="bg-white rounded shadow p-4 border-l-4 border-red-500 flex items-center space-x-4">
                <div className="w-28 h-28 flex-shrink-0">
                  <div className="w-full h-full border-4 border-red-300 rounded-full flex items-center justify-center relative">
                    {(typeof correctHourAngle === 'number' && typeof correctMinuteAngle === 'number' &&
                      typeof selectedHourAngle === 'number' && typeof selectedMinuteAngle === 'number') && (
                      <>
                        {/* Correct hands */}
                        <div className="absolute w-1 h-10 bg-green-600 origin-bottom"
                             style={{ transform: `rotate(${correctHourAngle}deg)`, top: '25%', left: '50%', transformOrigin: 'bottom center' }}></div>
                        <div className="absolute w-1 h-14 bg-green-400 origin-bottom"
                             style={{ transform: `rotate(${correctMinuteAngle}deg)`, top: '12%', left: '50%', transformOrigin: 'bottom center' }}></div>

                        {/* Selected (wrong) hands */}
                        <div className="absolute w-1 h-10 bg-red-600 origin-bottom opacity-70"
                             style={{ transform: `rotate(${selectedHourAngle}deg)`, top: '25%', left: '50%', transformOrigin: 'bottom center' }}></div>
                        <div className="absolute w-1 h-14 bg-red-400 origin-bottom opacity-70"
                             style={{ transform: `rotate(${selectedMinuteAngle}deg)`, top: '12%', left: '50%', transformOrigin: 'bottom center' }}></div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-400">🕒 Time: {entry.timestamp}</p>
                  <p className="font-bold text-red-700">❓ Q{entry.question}: What time is this?</p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Your Answer:</span>{' '}
                    <span className="text-red-600">{entry.selected || "N/A"}</span>
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Correct Answer:</span>{' '}
                    <span className="text-green-600">{entry.correctAnswer || "N/A"}</span>
                  </p>
                  {entry.difficulty && (
                    <p className="text-sm text-gray-600">Difficulty: {entry.difficulty}</p>
                  )}
                  {entry.timeTaken !== undefined && (
                    <p className="text-sm text-gray-600">Time Taken: {entry.timeTaken} seconds</p>
                  )}
                  <p className="text-gray-500 text-sm">Session: {entry.sessionId}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewError;
