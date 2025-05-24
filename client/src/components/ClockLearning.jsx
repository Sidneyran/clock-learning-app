import React, { useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

const ClockLearning = () => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [targetHour, setTargetHour] = useState(3);
  const [targetMinute, setTargetMinute] = useState(30);
  const [second, setSecond] = useState(0);
  const [targetSecond, setTargetSecond] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [visualTime, setVisualTime] = useState(new Date());

  const generateRandomTime = () => {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    setTargetHour(randomHour);
    setTargetMinute(randomMinute);
    setTargetSecond(randomSecond);
    const newTime = new Date();
    newTime.setHours(randomHour);
    newTime.setMinutes(randomMinute);
    newTime.setSeconds(randomSecond);
    setVisualTime(newTime);
  };

  const saveRecord = async (correct, score) => {
    const prev = JSON.parse(localStorage.getItem('clock_records')) || [];
    const attempt = {
      timestamp: Date.now(),
      difficulty: level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced',
      correct,
      score
    };
    prev.push(attempt);
    localStorage.setItem('clock_records', JSON.stringify(prev));

    const token = localStorage.getItem('token');
    console.log('🔑 token:', token);
    if (!token) return;

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.username || !storedUser.id) {
      console.warn('Missing username or userId, aborting upload.');
      return;
    }
    const username = storedUser.username || 'Anonymous';
    const userId = storedUser.id;

    const body = {
      userId,
      username,
      mode: 'practice',
      level: level === 1 ? 'easy' : level === 2 ? 'medium' : 'hard',
      score: parseFloat(score),
      total: totalAttempts + 1,
      accuracy: Number.isFinite((correctAnswers + (correct ? 1 : 0)) / (totalAttempts + 1)) ? (correctAnswers + (correct ? 1 : 0)) / (totalAttempts + 1) : 0,
      correct,
      timeTaken: 0,
      submittedToLeaderboard: false
    };

    console.log('📦 Final payload body:', body);

    console.log('🧪 Upload body correct value:', correct);
    console.log('📤 Uploading attempt:', { level: body.level, score: body.score, total: body.total, accuracy: body.accuracy, correct: body.correct });

    fetch('http://localhost:5050/api/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => console.log('✅ Upload success:', data))
      .catch(err => console.error('❌ Upload failed:', err));
  };

  const checkAnswer = () => {
    setTotalAttempts(prev => prev + 1);
    const isCorrect = level === 3
      ? hour === targetHour && minute === targetMinute && second === targetSecond
      : hour === targetHour && minute === targetMinute;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      let points = level === 1 ? 10 : level === 2 ? 15 : 20;
      const newScore = score + points;
      setScore(newScore);
      setLevel(Math.floor(newScore / 50) + 1);
      alert('✅ Correct!');
      generateRandomTime();
      saveRecord(true, newScore);
    } else {
      alert('❌ Try again!');
      saveRecord(false, score);
    }
  };

  React.useEffect(() => {
    generateRandomTime();
  }, []);

  return (
    <div className="text-center mt-10 px-4">
      <div className="mb-4 text-left">
        <a href="/" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">
          ← Back to Home
        </a>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg shadow mb-4">
        <h2 className="text-3xl font-bold mb-2">🕒 What time is this?</h2>
        <p className="text-lg font-semibold text-gray-600">
          {visualTime.getHours() >= 12 ? 'PM' : 'AM'}
        </p>
      </div>

      <div className="flex justify-center my-6">
        <Clock
          value={visualTime}
          renderNumbers={level === 1}
          showSecondHand={level === 3}
        />
      </div>

      <div className="mb-6 space-x-2">
        <button
          onClick={() => setLevel(1)}
          className={`px-4 py-1 rounded border transition duration-200 ${
            level === 1 ? 'bg-blue-500 text-white' : 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50'
          }`}
        >
          🟦 Beginner
        </button>
        <button
          onClick={() => setLevel(2)}
          className={`px-4 py-1 rounded border transition duration-200 ${
            level === 2 ? 'bg-green-500 text-white' : 'bg-white border-green-500 text-green-500 hover:bg-green-50'
          }`}
        >
          🟩 Intermediate
        </button>
        <button
          onClick={() => setLevel(3)}
          className={`px-4 py-1 rounded border transition duration-200 ${
            level === 3 ? 'bg-purple-500 text-white' : 'bg-white border-purple-500 text-purple-500 hover:bg-purple-50'
          }`}
        >
          🟪 Advanced
        </button>
      </div>

      <div className="mb-4 flex justify-center items-center gap-4">
        <div>
          <label className="block font-semibold">Hour:</label>
          <input
            type="number"
            value={hour}
            onChange={e => setHour(parseInt(e.target.value))}
            min="1"
            max="12"
            className="border rounded px-2 py-1 w-20 text-center"
          />
        </div>
        <div>
          <label className="block font-semibold">Minute:</label>
          <input
            type="number"
            value={minute}
            onChange={e => setMinute(parseInt(e.target.value))}
            min="0"
            max="59"
            className="border rounded px-2 py-1 w-20 text-center"
          />
        </div>
        {level === 3 && (
          <div>
            <label className="block font-semibold">Second:</label>
            <input
              type="number"
              value={second}
              onChange={e => setSecond(parseInt(e.target.value))}
              min="0"
              max="59"
              className="border rounded px-2 py-1 w-20 text-center"
            />
          </div>
        )}
      </div>

      <button
        onClick={checkAnswer}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
      >
        Check
      </button>

      <div className="mt-6 space-y-1 text-sm text-gray-700 bg-gray-100 p-4 rounded shadow max-w-md mx-auto">
        <p>
          Attempts: {totalAttempts} | Correct: {correctAnswers} | Accuracy:{' '}
          {totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(1) : 0}%
        </p>
        <p>Score: {score} ⭐</p>
        <p>Level: {level} 🧠</p>
        <p>
          Current Difficulty:{' '}
          {level === 1
            ? 'Beginner (with numbers)'
            : level === 2
            ? 'Intermediate (no numbers)'
            : 'Advanced (with second hand)'}
        </p>
      </div>
    </div>
  );
};

export default ClockLearning;