import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { ArrowLeft } from 'lucide-react';

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 24); // 0 - 23
  const minute = Math.floor(Math.random() * 12) * 5;
  const second = Math.floor(Math.random() * 60);
  return { hour, minute, second };
};

const formatTime = ({ hour, minute, second }, level) => {
  const pad = (n) => n.toString().padStart(2, '0');
  if (level === 3) {
    return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }
  return `${pad(hour)}:${pad(minute)}`;
};

const generateOptions = (correctTime, level) => {
  const options = new Set();
  options.add(correctTime);
  while (options.size < 4) {
    const { hour, minute, second } = getRandomTime();
    options.add(formatTime({ hour, minute, second }, level));
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
    const correct = formatTime(targetTime, recommendedLevel);
    setOptions(generateOptions(correct, recommendedLevel));
  }, [targetTime]);

  useEffect(() => {
    try {
      const rec = window.localStorage.getItem('recommended_level');
      console.log("📦 Retrieved recommended_level from localStorage:", rec);
      if (rec && rec !== 'undefined' && rec !== 'null') {
        const level = parseInt(rec);
        setRecommendedLevel(level);
        setTimeLimit(30); // 所有等级统一为 30 秒
        setShowHints(level === 1);
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
    const correct = formatTime(targetTime, recommendedLevel);
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

        // --- 上传答题数据至后端 API ---
        if (!scoreSubmitted) {
          try {
            const userToken = localStorage.getItem('token');
            if (userToken) {
              const decoded = JSON.parse(atob(userToken.split('.')[1]));
              fetch('http://localhost:5050/api/attempts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                  userId: decoded.id,
                  username: decoded.username || 'Anonymous',
                  mode: 'game',
                  level: difficultyLevel,
                  score: updatedResults.filter(r => r.correct).length,
                  total: updatedResults.length,
                  accuracy: Number((updatedResults.filter(r => r.correct).length / updatedResults.length).toFixed(2)),
                  timeTaken: updatedResults.reduce((acc, r) => acc + r.timeTaken, 0),
                  correct: updatedResults.every(r => r.correct === true),
                  submittedToLeaderboard: false,
                  questionDetails: updatedResults.map(r => ({
                    question: r.question,
                    correctAnswer: r.correctAnswer,
                    selected: r.selected,
                    correct: r.correct,
                    timeTaken: r.timeTaken,
                    difficulty: r.difficulty
                  }))
                })
              })
                .then(res => res.json())
                .then(data => {
                  console.log("✅ Upload response data:", data);
                  console.log('✅ Game result uploaded:', data);
                })
                .catch(err => console.error('❌ Upload failed:', err));
            }
          } catch (err) {
            console.error('❌ Error preparing upload:', err);
          }
        }
        // --- END 上传答题数据 ---
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

  const correct = formatTime(targetTime, recommendedLevel);
  return (
    <>
      {!hasStarted && (
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/game.jpg')" }}
        >
          <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <button
              className="absolute top-4 left-4 flex items-center text-sm text-gray-600 hover:text-gray-800"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-1 w-4 h-4" /> Back to Home
            </button>
            <div className="bg-blue-100 p-8 rounded shadow-md max-w-3xl w-full flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-blue-800">🎮 Game</h2>
              {recommendedLevel && (
                <div className="text-sm text-blue-700 mb-6">
                  Recommended for you: {['Beginner', 'Intermediate', 'Advanced'][recommendedLevel - 1]}
                </div>
              )}
              <div className="mb-6 w-full flex flex-col items-center">
                <label className="block mb-1 text-sm font-medium text-gray-700">Number of Questions:</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-40 border border-gray-300 rounded px-3 py-1 mb-2"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {[1, 2, 3].map((level) => {
                  const levelNames = ['Beginner', 'Intermediate', 'Advanced'];
                  const levelColors = ['bg-green-100', 'bg-yellow-100', 'bg-red-100'];
                  const textColors = ['text-green-800', 'text-yellow-800', 'text-red-800'];
                  const desc = [
                    'Clock with numbers. 30 seconds per question.',
                    'Clock without numbers. 30 seconds per question.',
                    'Clock without numbers. Add seconds hand. 30 seconds per question.'
                  ];
                  return (
                    <div
                      key={level}
                      className={`p-6 h-60 rounded shadow-md flex flex-col items-center justify-between ${levelColors[level - 1]} ${textColors[level - 1]} text-center`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{levelNames[level - 1]}</h3>
                      <p className="text-sm mb-4">{desc[level - 1]}</p>
                      <button
                        onClick={() => {
                          setRecommendedLevel(level);
                          setTimeLimit(30);
                          setShowHints(level === 1);
                          setTargetTime(getRandomTime());
                          setTimeLeft(30);
                          setHasStarted(true);
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Start
                      </button>
                    </div>
                  );
                })}
              </div>
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
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm text-center max-w-md mx-auto">
            <p className="text-sm text-yellow-900 font-medium mb-1">
              🕓 Please answer using <span className="font-semibold">24-hour format</span> (e.g., 13:30 instead of 1:30 PM).
            </p>
            <p className="text-sm text-yellow-900">
              📌 Questions may show AM or PM clocks — be sure to convert correctly to 24-hour time.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Question {questionNum} {questionNum <= numQuestions ? 'of ' + numQuestions : ''}
          </p>

          <Clock
            value={
              new Date(
                2023,
                0,
                1,
                targetTime.hour,
                targetTime.minute,
                recommendedLevel === 3 ? targetTime.second || 0 : 0
              )
            }
            renderNumbers={recommendedLevel === 1}
            hourHandWidth={recommendedLevel >= 2 ? 5 : undefined}
            minuteHandWidth={recommendedLevel >= 2 ? 4 : undefined}
            secondHandLength={recommendedLevel === 3 ? 60 : 0}
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
                    <button
                      onClick={async () => {
                        const playerNickname = nickname?.trim() || `Player-${Math.floor(Math.random() * 1000)}`;
                        const userToken = localStorage.getItem('token');
                        try {
                          if (userToken) {
                            const decoded = JSON.parse(atob(userToken.split('.')[1]));
                            const gameData = {
                              userId: decoded.id,
                              username: playerNickname,
                              mode: 'game',
                              level: recommendedLevel,
                              score: results.filter(r => r.correct).length,
                              total: results.length,
                              accuracy: Number((results.filter(r => r.correct).length / results.length).toFixed(2)),
                              timeTaken: results.reduce((acc, r) => acc + r.timeTaken, 0),
                              correct: results.every(r => r.correct === true),
                              submittedToLeaderboard: true,
                              questionDetails: results.map(r => ({
                                question: r.question,
                                correctAnswer: r.correctAnswer,
                                selected: r.selected,
                                correct: r.correct,
                                timeTaken: r.timeTaken,
                                difficulty: r.difficulty
                              }))
                            };

                            const res = await fetch('http://localhost:5050/api/attempts', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${userToken}`
                              },
                              body: JSON.stringify(gameData)
                            });

                            const data = await res.json();
                            console.log("✅ Leaderboard entry submitted:", data);
                            setScoreSubmitted(true);
                          }
                        } catch (err) {
                          console.error('❌ Failed to submit leaderboard score:', err);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
                    >
                      Submit Score to LeaderBoard
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