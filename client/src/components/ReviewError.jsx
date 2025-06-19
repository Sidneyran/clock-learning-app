import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewError = () => {
  const [errorData, setErrorData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchErrorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5050/api/attempts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const all = await res.json();
        console.log('Fetched full attempts data:', JSON.stringify(all, null, 2));
        const gameErrors = all
          .filter(attempt =>
            attempt.mode === 'game' &&
            Array.isArray(attempt.questionDetails) &&
            attempt.questionDetails.length > 0 &&
            attempt.questionDetails.some(ans => ans.correct === false)
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 按时间倒序
        console.log('Filtered game errors:', gameErrors);
        // Deduplicate by question number (e.g., Q9, Q10)
        const seen = new Set();
        const deduplicated = [];

        gameErrors.forEach(entry => {
          const uniqueQuestions = entry.questionDetails.filter(ans => {
            const key = `Q${ans.question}`;
            if (ans.correct === false && !seen.has(key)) {
              seen.add(key);
              return true;
            }
            return false;
          });

          if (uniqueQuestions.length > 0) {
            deduplicated.push({
              ...entry,
              questionDetails: uniqueQuestions
            });
          }
        });

        setErrorData(deduplicated);
      } catch (err) {
        console.error('Failed to fetch error data:', err);
      }
    };
    fetchErrorData();
  }, []);

  return (
    <div
      style={{
        backgroundImage: "url('/assets/reviewerror.PNG')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
      }}
    >
      <div className="h-full overflow-y-auto bg-white/60 p-6">
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
              const incorrectAnswers = entry.questionDetails.filter(ans => ans.correct === false);
              return incorrectAnswers.map((ans, idx) => {
                let correctHourAngle, correctMinuteAngle, selectedHourAngle, selectedMinuteAngle;
                if (ans.correctAnswer && ans.selected &&
                    ans.correctAnswer.includes(':') && ans.selected.includes(':')) {
                  const correctParts = ans.correctAnswer.split(':');
                  const selectedParts = ans.selected.split(':');

                  const ch = parseInt(correctParts[0], 10);
                  const cm = parseInt(correctParts[1], 10);
                  const sh = parseInt(selectedParts[0], 10);
                  const sm = parseInt(selectedParts[1], 10);

                  correctHourAngle = (360 / 12) * ((ch % 12) + (cm / 60));
                  correctMinuteAngle = (360 / 60) * cm;
                  selectedHourAngle = (360 / 12) * ((sh % 12) + (sm / 60));
                  selectedMinuteAngle = (360 / 60) * sm;
                }
                return (
                  <div key={`${index}-${idx}`} className="bg-white rounded shadow p-4 border-l-4 border-red-500 flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-28 h-28 flex-shrink-0">
                        <div className="w-full h-full border-4 border-red-300 rounded-full flex items-center justify-center relative">
                          {[...Array(12)].map((_, i) => {
                            const angle = i * 30;
                            return (
                              <span
                                key={i}
                                className="absolute text-xs text-gray-500"
                                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-40px) rotate(-${angle}deg)`, top: '50%', left: '50%' }}
                              >
                                {i === 0 ? 12 : i}
                              </span>
                            );
                          })}
                          {(typeof correctHourAngle === 'number' && typeof correctMinuteAngle === 'number' &&
                            typeof selectedHourAngle === 'number' && typeof selectedMinuteAngle === 'number') && (
                            <>
                              {/* Correct hands */}
                              <div
                                className="absolute w-1 h-10 bg-green-600 origin-bottom translate-x-[-50%]"
                                style={{ top: '12%', left: '50%', transform: `translateX(-50%) rotate(${correctHourAngle}deg)` }}
                              ></div>
                              <div
                                className="absolute w-1 h-14 bg-green-400 origin-bottom translate-x-[-50%]"
                                style={{ top: '-1%', left: '50%', transform: `translateX(-50%) rotate(${correctMinuteAngle}deg)` }}
                              ></div>

                              {/* Selected (wrong) hands */}
                              <div
                                className="absolute w-1 h-10 bg-red-600 origin-bottom opacity-70 translate-x-[-50%]"
                                style={{ top: '12%', left: '50%', transform: `translateX(-50%) rotate(${selectedHourAngle}deg)` }}
                              ></div>
                              <div
                                className="absolute w-1 h-14 bg-red-400 origin-bottom opacity-70 translate-x-[-50%]"
                                style={{ top: '-1%', left: '50%', transform: `translateX(-50%) rotate(${selectedMinuteAngle}deg)` }}
                              ></div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-gray-400">
                          🕒 Time: {new Date(entry.timestamp).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="font-bold text-red-700">❓ Q{ans.question}: What time is this?</p>
                        <p className="text-gray-800">
                          <span className="font-semibold">Your Answer:</span>{' '}
                          <span className="text-red-600">{ans.selected || "N/A"}</span>
                        </p>
                        <p className="text-gray-800">
                          <span className="font-semibold">Correct Answer:</span>{' '}
                          <span className="text-green-600">{ans.correctAnswer || "N/A"}</span>
                        </p>
                        {entry.difficulty && (
                          <p className="text-sm text-gray-600">Difficulty: {entry.difficulty}</p>
                        )}
                        <p className="text-gray-500 text-sm">Session: {entry.sessionId}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        await fetch(`http://localhost:5050/api/attempts/${entry._id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        setErrorData(prev => prev.filter(e => e._id !== entry._id));
                      }}
                      className="text-sm text-red-500 hover:text-red-700 mt-2 self-start"
                    >
                      Delete this mistake
                    </button>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewError;
