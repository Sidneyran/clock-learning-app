import React, { useState } from 'react';

const ClockLearning = () => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [targetHour, setTargetHour] = useState(3);
  const [targetMinute, setTargetMinute] = useState(30);

  const checkAnswer = () => {
    if (hour === targetHour && minute === targetMinute) {
      alert('✅ Correct!');
    } else {
      alert('❌ Try again!');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>🕒 What time is this?</h2>
      <p>
        Set the clock to:{' '}
        <strong>{targetHour}:{targetMinute.toString().padStart(2, '0')}</strong>
      </p>

      <div>
        <label>Hour:</label>
        <input type="number" value={hour} onChange={e => setHour(parseInt(e.target.value))} min="1" max="12" />
        <label>Minute:</label>
        <input type="number" value={minute} onChange={e => setMinute(parseInt(e.target.value))} min="0" max="59" />
      </div>

      <button onClick={checkAnswer} style={{ marginTop: '10px' }}>Check</button>
    </div>
  );
};

export default ClockLearning;