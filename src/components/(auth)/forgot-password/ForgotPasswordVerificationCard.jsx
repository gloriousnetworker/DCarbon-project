'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordCard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'https://dcarbon-server.onrender.com/api/auth/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('An OTP verification code has been sent to your email');
      // Store email in local storage for use in reset password flow
      localStorage.setItem('forgotEmail', email);
      // Navigate to reset-password page after success
      setTimeout(() => {
        window.location.href = '/reset-password';
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      {/* Glass-Effect Card */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8 mx-auto mt-10"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>
        {/* Heading */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Forgot Password
        </h2>
        {/* Description */}
        <p className="text-sm text-white text-center mb-6">
          Please enter your email address. A reset OTP will be sent to your email.
        </p>
        {/* Email Input Field */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
          />
        </div>
        {/* Continue Button */}
        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-full rounded-lg bg-[#2EBAA0] text-white font-semibold py-2 hover:bg-[#27a48e] focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
        >
          Continue
        </button>
        {/* Disclaimer */}
        <p className="mt-6 text-xs text-center text-white leading-tight">
          By clicking continue, you agree to our{' '}
          <a href="/terms" className="text-[#2EBAA0] hover:underline font-medium">
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a href="/privacy" className="text-[#2EBAA0] hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </>
  );
}
