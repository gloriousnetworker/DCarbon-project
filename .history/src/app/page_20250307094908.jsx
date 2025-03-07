// src/app/page.jsx

'use client'; // Add this line to mark this as a client component

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
            <div className="w-8 h-8 border-4 border-t-4 border-white rounded-full animate-rotate" />
            <span className="text-lg font-semibold text-white">Under Construction</span>
            <div className="w-8 h-8 border-4 border-t-4 border-white rounded-full animate-rotate" />
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
