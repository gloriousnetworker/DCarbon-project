'use client'; // Mark as a client component

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate loading completion after 5 seconds
    }, 5000);
  }, []);

  return (
    <div className="min-h-screen bg-[#039994] flex flex-col justify-center items-center text-white">
      <div className="text-center">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold mb-6 animate__animated animate__fadeInUp animate__delay-1s">
          DCARBON
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8 animate__animated animate__fadeInUp animate__delay-1.5s">
          SUSTAINABLE INNOVATION
        </p>

        {/* Construction Animation */}
        {loading ? (
          <div className="flex items-center justify-center space-x-4 animate__animated animate__fadeInUp animate__delay-2s">
            {/* Animated SVG (Construction Worker) */}
            <svg
              className="w-16 h-16 animate__animated animate__pulse animate__infinite animate__delay-1s"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 5" />
            </svg>
            <span className="text-lg font-semibold text-white">Under Construction</span>
            <svg
              className="w-16 h-16 animate__animated animate__pulse animate__infinite animate__delay-1s"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 5" />
            </svg>
          </div>
        ) : (
          <p className="text-lg font-semibold animate__animated animate__fadeInUp animate__delay-2.5s">Coming Soon</p>
        )}

        {/* Under Construction Message */}
        <div className="mt-8 flex flex-col items-center space-y-2 animate__animated animate__fadeInUp animate__delay-3s">
          <div className="text-3xl font-semibold text-white">We're Building Something Amazing!</div>
          <p className="text-lg text-white opacity-80">
            We're working hard to bring you the best experience. Stay tuned for updates.
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-dot-1" />
          <div className="w-2 h-2 bg-white rounded-full animate-dot-2" />
          <div className="w-2 h-2 bg-white rounded-full animate-dot-3" />
        </div>
      </div>
    </div>
  );
}
