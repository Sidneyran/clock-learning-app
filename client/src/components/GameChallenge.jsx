import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { ArrowLeft } from 'lucide-react';

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 24); // 0 - 23
  const minute = Math.floor(Math.random() * 12) * 5;
  return { hour, minute };
};

const formatTime = ({ hour, minute }) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}`;
};

const generateOptions = (correctTime) => {
  const options = new Set();
  options.add(correctTime);
  while (options.size < 4) {
    const { hour, minute } = getRandomTime();
    options.add(formatTime({ hour, minute }));
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const GameChallenge = () => {
  const [targetTime, setTargetTime] = useState(getRandomTime());
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [results, setResults] = useState([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [nickname, setNickname] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [showHints, setShowHints] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState(null);
  const navigate = useNavigate();
  const isPM = targetTime.hour >= 12;

  useEffect(() => {
    const correct = formatTime(targetTime);
    setOptions(generateOptions(correct));
  }, [targetTime]);

  useEffect(() => {
    try {
      const rec = window.localStorage.getItem('recommended_level');
      console.log("📦 Retrieved recommended_level from localStorage:", rec);
      if (rec && rec !== 'undefined' && rec !== 'null') {
        const level = parseInt(rec);
        setRecommendedLevel(level);
        if (level === 1) {
          setTimeLimit(30);
          setShowHints(true);
        } else if (level === 2) {
          setTimeLimit(15);
          setShowHints(false);
        } else if (level === 3) {
          setTimeLimit(10);
          setShowHints(false);
        }
      } else {
        console.log("❗ No valid recommended_level found in localStorage.");
      }
    } catch (e) {
      console.error("❌ Error accessing localStorage:", e);
    }
  }, []);

  const getRecommendedDifficulty = async (payload) => {
    try {
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.recommended_level !== undefined) {
        console.log('✅ 写入推荐等级:', data.recommended_level);
        setRecommendedLevel(data.recommended_level);
        localStorage.setItem('recommended_level', String(data.recommended_level));
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    }
  };

  useEffect(() => {
    let timer;
    setTimeLeft(timeLimit);

    if (hasStarted && !isAnswered && !isQuizFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!isAnswered) {
              handleChoice(null);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [targetTime, questionNum, hasStarted]);

  const handleChoice = (choice) => {
    if (isAnswered || isQuizFinished) return;
    const correct = formatTime(targetTime);
    const result = choice === correct;
    setSelectedChoice(choice);
    setIsCorrect(result);
    setIsAnswered(true);
    
    const difficultyLevel = showHints ? 1 : (timeLimit <= 10 ? 3 : 2);

    setResults((prevResults) => {
      const alreadyAnswered = prevResults.some(r => r.question === questionNum);
      if (alreadyAnswered) return prevResults;

      const newResult = {
        question: questionNum,
        correctAnswer: correct,
        selected: choice || 'No answer',
        correct: result,
        timeTaken: timeLimit - timeLeft,
        difficulty: difficultyLevel,
      };

      const recommendationData = JSON.parse(localStorage.getItem('recommendation_data')) || [];

      if (questionNum > 1 && prevResults.length > 0) {
        const last = prevResults[prevResults.length - 1]; // 上一题数据
        recommendationData.push({
          currentDifficulty: difficultyLevel,
          answeredCorrectly: result,
          timeTaken: timeLimit - timeLeft,
          previousDifficulty: last.difficulty,
          previousCorrect: last.correct,
          previousTime: last.timeTaken,
          recommendedNext: difficultyLevel
        });
        localStorage.setItem('recommendation_data', JSON.stringify(recommendationData));
        // Backend fetch call removed to avoid CORS errors; recommendation is now stored in localStorage.
      }

      const updatedResults = [...prevResults, newResult];

      if (questionNum === numQuestions) {
        // Calculate average values for recommendation
        const totalTime = recommendationData.reduce((acc, r) => acc + r.timeTaken, 0);
        const correctCount = updatedResults.filter(r => r.correct).length;
        const avgTime = totalTime / recommendationData.length || 0;
        const accuracy = correctCount / updatedResults.length || 0;

        const payload = {
          avg_time: Number(avgTime.toFixed(2)),
          accuracy: Number(accuracy.toFixed(2)),
          attempts: updatedResults.length,
          last_level: difficultyLevel
        };

        getRecommendedDifficulty(payload);
        localStorage.setItem('recommended_level', String(difficultyLevel));
      }
      
      if (questionNum === numQuestions) {
        const errors = updatedResults.filter(r => !r.correct);
        const reviewData = {
          review_id: `session-${Math.floor(Math.random() * 10000)}`,
          date: new Date().toLocaleString(),
          errors: errors
        };
 
        const existing = JSON.parse(localStorage.getItem('error_reviews') || '[]');
        localStorage.setItem('error_reviews', JSON.stringify([reviewData, ...existing]));
      }
      
      return updatedResults;
    });
  };

  const nextQuestion = () => {
    if (questionNum >= numQuestions || isQuizFinished) return;

    if (questionNum === numQuestions) {
      setIsQuizFinished(true);
      setShowSummaryModal(true);
      return;
    }

    setTargetTime(getRandomTime());
    setMessage('');
    setQuestionNum((prev) => prev + 1);
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setTimeLeft(timeLimit);
  };

  const correct = formatTime(targetTime);
  return (
    <>
      {!hasStarted && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex justify-center">
            <button
              className="absolute top-4 left-4 flex items-center text-sm text-gray-600 hover:text-gray-800"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-1 w-4 h-4" /> Back to Home
            </button>
          </div>
          <div className="bg-blue-100 p-6 rounded shadow-md text-center max-w-sm w-full">
            {recommendedLevel && (
              <div className="text-sm text-blue-700 mb-4 text-center">
                🧠 Recommended Level: <span className="font-semibold">{recommendedLevel}</span>
              </div>
            )}
            <h2 className="text-xl font-bold mb-4 text-blue-800">🛠 Game Settings</h2>

            <div className="mb-4 text-left">
              <label className="block mb-1 text-sm font-medium text-gray-700">Number of Questions:</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <div className="mb-4 text-left">
              <label className="block mb-1 text-sm font-medium text-gray-700">Time per Question:</label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-1"
              >
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>


            <div className="flex justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setTargetTime(getRandomTime());
                  setTimeLeft(timeLimit);
                  setHasStarted(true);
                }}
              >
                Start Challenge
              </button>
            </div>
          </div>
        </div>
      )}
      {hasStarted && (
        <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 relative">
          <button onClick={() => navigate('/')} className="absolute top-4 left-4 flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="mr-1 w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-3xl font-bold text-blue-800 mb-4">🎮 Time Challenge</h1>
          <p className="text-sm text-gray-500 mb-2">
            Question {questionNum} {questionNum <= numQuestions ? 'of ' + numQuestions : ''}
          </p>

          <Clock
            value={new Date(2023, 0, 1, targetTime.hour, targetTime.minute)}
            renderNumbers={true}
            size={200}
          />
          <p className="text-md text-gray-600 mt-2">{isPM ? 'PM' : 'AM'}</p>
          <p className="text-lg font-semibold text-red-500 mb-2">⏳ Time Left: {timeLeft}s</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => handleChoice(opt)}
                disabled={isAnswered}
                className={`px-6 py-3 shadow rounded font-semibold flex items-center justify-start transition-colors duration-200
                    ${
                      isAnswered
                        ? selectedChoice === opt
                          ? isCorrect
                            ? 'bg-green-200 text-green-800 border border-green-400'
                            : 'bg-red-200 text-red-800 border border-red-400'
                          : correct === opt
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-white text-blue-800'
                        : 'bg-white text-blue-800 hover:bg-blue-100'
                    }`}
              >
                <span className="mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span> {opt}
              </button>
            ))}
          </div>

          <p className="text-lg font-medium mb-6">{message}</p>

          <div className="flex gap-4">
            {isAnswered && !isQuizFinished && (
              <button
                onClick={questionNum === numQuestions ? () => {
                  setIsQuizFinished(true);
                  setShowSummaryModal(true);
                } : nextQuestion}
                className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
              >
                {questionNum === numQuestions ? 'Finish Challenge' : 'Next Question'}
              </button>
            )}
            {isQuizFinished && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              >
                Return to Home
              </button>
            )}
          </div>

          {showSummaryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded shadow-lg text-center relative w-full max-w-md mx-auto">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                >
                  &times;
                </button>
                <h1 className="text-2xl font-bold text-blue-800 mb-4">🎉 Challenge Completed!</h1>
                <p className="text-md text-gray-700 mb-2">
                  You got <span className="font-semibold">{results.filter(r => r.correct).length}</span> out of <span className="font-semibold">{results.length}</span> questions correct.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Accuracy: {((results.filter(r => r.correct).length / results.length) * 100).toFixed(1)}%
                </p>
                {!scoreSubmitted && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 w-full mb-2"
                    />
                    <button
                      onClick={() => {
                        const playerNickname = nickname?.trim() || `Player-${Math.floor(Math.random() * 1000)}`;
                        const newRecord = {
                          name: playerNickname,
                          score: results.filter(r => r.correct).length,
                          accuracy: ((results.filter(r => r.correct).length / results.length) * 100).toFixed(1),
                          date: new Date().toLocaleString()
                        };
                        const savedScores = JSON.parse(localStorage.getItem('game_scores')) || [];
                        savedScores.push(newRecord);
                        savedScores.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
                        localStorage.setItem('game_scores', JSON.stringify(savedScores.slice(0, 10)));
                        setScoreSubmitted(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
                    >
                      Submit Score
                    </button>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setQuestionNum(1);
                      setResults([]);
                      setIsQuizFinished(false);
                      setTargetTime(getRandomTime());
                      setOptions([]);
                      setSelectedChoice(null);
                      setIsAnswered(false);
                      setIsCorrect(null);
                      setShowSummaryModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Return to Home
                  </button>
                  <button
                    onClick={() => {
                      setShowSummaryModal(false);
                      setTimeout(() => {
                        localStorage.setItem('latest_game_results', JSON.stringify(results));
                        navigate('/review-game', { state: { results } });
                      }, 100);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Review Your Answers
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GameChallenge;