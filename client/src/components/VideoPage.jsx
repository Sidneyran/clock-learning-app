import React from 'react';
import { useNavigate } from 'react-router-dom';

const VideoPage = () => {
  const navigate = useNavigate();

  const videos = [
    {
      title: 'Telling Time For Children - Learning the Clock',
      url: 'https://www.youtube.com/embed/h6RNkQ7lU8Y',
      description: 'An engaging introduction for kids on how to read analog clocks.',
    },
    {
      title: 'How to Tell Time on an Analog Clock',
      url: 'https://www.youtube.com/embed/3Posbu-VKxU',
      description: 'Basic explanation of how to read an analog clock for kids.',
    },
    {
      title: 'Learn to Tell Time - Animated Clock Lesson',
      url: 'https://www.youtube.com/embed/g6tJAy_7AL4',
      description: 'A fun animated lesson on telling time using a clock.',
    },
    {
      title: 'AM and PM for Kids | Learn 12 Hour and 24 Hour Clock',
      url: 'https://www.youtube.com/embed/nus0XJ6Do9o',
      description: 'This video helps children understand the difference between AM and PM and introduces the concept of 24-hour time using simple examples.',
    },
  ];

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/assets/videopage.png')" }}>
      <div className="px-6 py-8 bg-white bg-opacity-80 min-h-screen">
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
                  className="w-full h-full rounded"
                  src={video.url}
                  title={video.title}
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
              <p className="text-sm text-gray-600">{video.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
