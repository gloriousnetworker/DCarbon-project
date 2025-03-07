// src/components/auth/loader/Loader.jsx
import React from 'react';

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        {/* Use the combined animation */}
        <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-rotate-beep"></div>
      </div>
    </div>
  );
}
