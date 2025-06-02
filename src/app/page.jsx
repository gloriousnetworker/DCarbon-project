'use client'; // Mark as a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate loading completion after 5 seconds
    }, 5000);
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#039994] flex flex-col justify-center items-center text-white relative">
      {/* Login Button - Top Right */}
      <div className="absolute top-8 right-8">
        <button
          onClick={handleLoginClick}
          className="bg-white text-[#039994] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Login
        </button>
      </div>

      <div className="text-center">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold mb-6">
          DCARBON
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          SUSTAINABLE INNOVATION
        </p>

        {/* Construction Animation */}
        {loading ? (
          <div className="flex items-center justify-center space-x-4">
            {/* Animated SVG (Sleek Construction Worker) */}
            <svg
              className="w-24 h-24 animate-bounce"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
            >
              {/* Construction Worker Helmet */}
              <circle cx="100" cy="50" r="30" fill="yellow" stroke="#fff" strokeWidth="3" />
              {/* Worker Body (Arms + Tools) */}
              <rect
                className="construction-arm"
                x="70"
                y="70"
                width="15"
                height="40"
                fill="white"
              />
              <rect
                className="construction-arm"
                x="115"
                y="70"
                width="15"
                height="40"
                fill="white"
              />
              {/* Worker Legs */}
              <line x1="85" y1="110" x2="85" y2="150" stroke="white" strokeWidth="5" />
              <line x1="115" y1="110" x2="115" y2="150" stroke="white" strokeWidth="5" />
              {/* Hammer Icon */}
              <rect
                className="construction-tool"
                x="50"
                y="120"
                width="10"
                height="30"
                fill="gray"
                transform="rotate(45 55 130)"
              />
              {/* Construction Head (Simple Face) */}
              <circle className="construction-head" cx="100" cy="50" r="5" fill="#fff" />
            </svg>
            <span className="text-lg font-semibold text-white">Under Construction</span>
          </div>
        ) : (
          <p className="text-lg font-semibold">Coming Soon</p>
        )}

        {/* Under Construction Message */}
        <div className="mt-8 flex flex-col items-center space-y-2">
          <div className="text-3xl font-semibold text-white">We're Building Something Amazing!</div>
          <p className="text-lg text-white opacity-80">
            We're working hard to bring you the best experience. Stay tuned for updates.
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150" />
        </div>

        {/* Additional Login Button (Alternative placement) */}
        {!loading && (
          <div className="mt-8">
            <button
              onClick={handleLoginClick}
              className="bg-yellow-400 text-[#039994] px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Get Started - Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}