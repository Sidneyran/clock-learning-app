// client/src/api/recommendation.js
export const getRecommendedLevel = async (accuracy, avg_time, attempts, last_level) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accuracy,
          avg_time,
          attempts,
          last_level,
        }),
      });
  
      const data = await response.json();
      return data.recommended_level;
    } catch (error) {
      console.error('Error fetching recommended level:', error);
      return null;
    }
  };