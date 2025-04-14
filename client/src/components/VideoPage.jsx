import React from 'react';
import { useNavigate } from 'react-router-dom';

const VideoPage = () => {
  const navigate = useNavigate();

  const videos = [
    {
      title: 'How to Tell Time on an Analog Clock',
      url: 'https://www.youtube.com/embed/HrxZWNu72WI',
      description: 'Basic explanation of how to read an analog clock for kids.'
    },
    {
      title: 'Learn to Tell Time',
      url: 'https://www.youtube.com/embed/8RJzoyIVzV8',
      description: 'A fun animated lesson on telling time using a clock.'
    },
    {
      title: 'Telling Time for Beginners',
      url: 'https://www.youtube.com/embed/pdzk57g0mGU',
      description: 'Beginner-friendly video that teaches children how to read the hour and minute hands.'
    }
  ];

  return (
    <div className="px-6 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Home
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">📺 Video Learning</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div key={index} className="shadow rounded-lg overflow-hidden bg-white p-4">
            <div className="mb-2 aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                src={video.url}
                title={video.title}
                loading="lazy"
                aria-label={`Video about ${video.title}`}
                allowFullScreen
              ></iframe>
            </div>
            <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
            <p className="text-sm text-gray-600">{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;
