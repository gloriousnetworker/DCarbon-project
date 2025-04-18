'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, redirectPath }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://dcarbon-server.onrender.com/api/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Store the full response for debugging
      localStorage.setItem('loginResponse', JSON.stringify(response.data));

      const { user, token, requiresTwoFactor, tempToken } = response.data.data;

      // Check if login requires Two Factor Authentication
      if (requiresTwoFactor) {
        // Store the temporary token and any other relevant info for the next step
        localStorage.setItem('tempToken', tempToken);
        localStorage.setItem('userId', user.id);
        toast.success(response.data.message || '2FA verification required');
        window.location.href = '/login/two-factor-authentication';
        return;
      }

      // Otherwise, store user details and token for normal login flow
      localStorage.setItem('userFirstName', user.firstName);
      localStorage.setItem('userProfilePicture', user.profilePicture);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);

      toast.success('Login successful');
      
      // Call the success handler with user data
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      // Close the modal
      onClose();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <Loader />
        </div>
      )}

      {/* Glass-Effect Card Container */}
      <div
        className="w-full max-w-md space-y-6 p-8 rounded-xl shadow-lg relative"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="relative w-full flex flex-col items-center mb-2">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF] font-sfpro text-center">
          Welcome back to DCarbon
        </h2>

        {/* Horizontal Line */}
        <hr className="border-t-2 border-gray-200 mb-4 opacity-70" />

        {/* Email Field */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="@ e.g name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] bg-white bg-opacity-70"
            />
          </div>

          {/* Password Field with Forgot Password Link */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] mb-2 bg-white bg-opacity-70"
            />
            <div className="text-right">
              <a
                href="/forgot-password"
                className="font-sfpro font-[600] text-[12px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF] no-underline hover:text-[#02857f]"
              >
                Forgot password
              </a>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors duration-200"
        >
          Sign in
        </button>

        {/* Create Account Link */}
        <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF]">
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#039994] no-underline hover:text-[#02857f]"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}