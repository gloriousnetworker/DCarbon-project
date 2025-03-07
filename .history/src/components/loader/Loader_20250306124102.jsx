// src/components/auth/loader/Loader.jsx
import React from 'react';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      {/* Outer circle with a thicker gradient border that rotates */}
      <div className="relative">
        <div
          className="p-3 rounded-full animate-rotate"
          style={{
            // Conic gradient using #039994 to create a swirl effect
            background: 'conic-gradient(from 0deg, #039994 0%, #03999400 50%, #039994 100%)',
          }}
        >
          {/* Inner circle that pulses */}
          <div className="w-16 h-16 bg-white rounded-full animate-beep"></div>
        </div>
      </div>

      {/* Text: Please wait + blinking dots */}
      <div
        className="font-semibold text-2xl leading-none tracking-[-0.05em] text-center"
        style={{ fontFamily: 'SF Pro Text', color: '#039994' }}
      >
        Please wait
        <span className="dot animate-dot-1">.</span>
        <span className="dot animate-dot-2">.</span>
        <span className="dot animate-dot-3">.</span>
      </div>
    </div>
  );
}

export default Loader;
