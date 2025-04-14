import React, { useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

const ClockLearning = () => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [targetHour, setTargetHour] = useState(3);
  const [targetMinute, setTargetMinute] = useState(30);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [visualTime, setVisualTime] = useState(new Date());

  const generateRandomTime = () => {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    setTargetHour(randomHour);
    setTargetMinute(randomMinute);
    const newTime = new Date();
    newTime.setHours(randomHour);
    newTime.setMinutes(randomMinute);
    setVisualTime(newTime);
  };

  const checkAnswer = () => {
    setTotalAttempts(prev => prev + 1);
    if (hour === targetHour && minute === targetMinute) {
      setCorrectAnswers(prev => prev + 1);
      const newScore = score + 10;
      setScore(newScore);
      setLevel(Math.floor(newScore / 50) + 1);
      alert('✅ Correct!');
      generateRandomTime(); // 答对后自动换时间
    } else {
      alert('❌ Try again!');
    }
  };

  React.useEffect(() => {
    generateRandomTime();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>🕒 What time is this?</h2>
      <p style={{ fontWeight: 'bold' }}>
        {visualTime.getHours() >= 12 ? 'PM' : 'AM'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Clock
          value={visualTime}
          renderNumbers={level === 1} // 初级显示刻度
          showSecondHand={level >= 3} // 高级显示秒针
        />
      </div>

      <div>
        <label>Hour:</label>
        <input type="number" value={hour} onChange={e => setHour(parseInt(e.target.value))} min="1" max="12" />
        <label>Minute:</label>
        <input type="number" value={minute} onChange={e => setMinute(parseInt(e.target.value))} min="0" max="59" />
      </div>

      <button onClick={checkAnswer} style={{ marginTop: '10px' }}>Check</button>

      <div style={{ marginTop: '20px' }}>
        <p>
          Attempts: {totalAttempts} | Correct: {correctAnswers} | Accuracy:{' '}
          {totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(1) : 0}%
        </p>
        <p>Score: {score} ⭐</p>
        <p>Level: {level} 🧠</p>
        <p>Current Difficulty: {level === 1 ? 'Beginner (with numbers)' : level === 2 ? 'Intermediate (no numbers)' : 'Advanced (with second hand)'}</p>
      </div>
    </div>
  );
};

export default ClockLearning;