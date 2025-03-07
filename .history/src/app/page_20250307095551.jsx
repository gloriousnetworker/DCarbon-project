'use client'; // Mark as a client component

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Simulate loading completion after 5 seconds
    }, 5000);
  }, []);

  useEffect(() => {
    // GSAP Animation for the construction SVG
    if (loading) {
      const timeline = gsap.timeline({ repeat: -1, yoyo: true });
      
      timeline.to('.construction-arm', {
        rotation: '+=20',
        transformOrigin: 'center center',
        duration: 1,
        ease: 'power1.inOut',
      });
      
      timeline.to('.construction-head', {
        scale: 1.2,
        duration: 0.8,
        ease: 'bounce.out',
        yoyo: true,
        repeat: 1,
      }, 0); // Start the head animation at the same time as the arm animation
    }
  }, [loading]);

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
              className="w-24 h-24 animate__animated animate__rotateIn"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="50" fill="none" stroke="#fff" strokeWidth="5" />
              <rect
                className="construction-arm"
                x="50"
                y="50"
                width="30"
                height="60"
                fill="white"
              />
              <rect
                className="construction-arm"
                x="120"
                y="50"
                width="30"
                height="60"
                fill="white"
              />
              <circle className="construction-head" cx="100" cy="50" r="5" fill="white" />
            </svg>
            <span className="text-lg font-semibold text-white">Under Construction</span>
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
