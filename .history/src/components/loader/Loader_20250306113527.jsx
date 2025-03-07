// src/components/auth/loader/Loader.jsx
import React from 'react';

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        {/* Outer circle with a gradient border that rotates */}
        <div
          className="p-1 rounded-full animate-rotate"
          style={{
            background: 'conic-gradient(from 0deg, #3b82f6, #9333ea, #ec4899, #3b82f6)',
          }}
        >
          {/* Inner circle that pulses */}
          <div className="w-16 h-16 rounded-full bg-white animate-beep"></div>
        </div>
      </div>
    </div>
  );
}
