import { useState } from 'react';
import Loader from '../../../components/loader/Loader';

export default function LoginCard() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard'; // Example redirect
    }, 3000);
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* 
        Main container with a purple gradient background 
        and content centered both horizontally & vertically.
      */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1C1343] to-[#2B1E5B] px-4">
        {/* Card Container */}
        <div className="w-full max-w-sm bg-[#1F1A44] bg-opacity-90 rounded-xl px-8 py-10 shadow-lg">
          {/* DCarbon Logo / Title Section */}
          <div className="flex flex-col items-center mb-6">
            {/* If you have an actual logo image, replace this text with an <img /> */}
            <div className="text-white font-bold text-2xl mb-2">
              DCarbon
              <span className="text-teal-400 ml-1">Solutions</span>
            </div>
            <h1 className="text-white text-xl font-semibold">Welcome back to DCarbon</h1>
          </div>

          {/* Form */}
          <form>
            {/* Email Field */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="e.g. name@domain.com"
                className="w-full rounded-md border border-[#4C4470] bg-transparent px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Password + Forgot Password Row */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-teal-400 hover:underline"
                >
                  Forgot password
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full rounded-md border border-[#4C4470] bg-transparent px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Sign in
            </button>
          </form>

          {/* Create Account */}
          <p className="mt-4 text-center text-gray-300">
            Don’t have an account?{' '}
            <a href="/register" className="text-teal-400 hover:underline">
              Create account
            </a>
          </p>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-center text-gray-400 leading-tight">
            By clicking on ‘Sign in’, you agree to our{' '}
            <a href="/terms" className="text-teal-400 hover:underline">
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-teal-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
