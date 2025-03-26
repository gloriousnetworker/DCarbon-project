'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Refs for OTP inputs to control focus
  const otpInputs = useRef([]);

  // Retrieve email from local storage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} minute${m !== 1 ? 's' : ''} ${s.toString().padStart(2, '0')} second${s !== 1 ? 's' : ''}`;
  };

  // Handle OTP change
  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace for OTP inputs
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Verify OTP endpoint
  const handleVerifyEmail = async () => {
    setLoading(true);
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        'https://dcarbon-server.onrender.com/api/user/verify-otp',
        { email: userEmail, otp: Number(enteredOtp) },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Email verified successfully');
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP endpoint
  const handleResendEmail = async () => {
    // Simple email format check before proceeding
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(userEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'https://dcarbon-server.onrender.com/api/user/resend-otp',
        { email: userEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('OTP resent successfully');
      // Update local storage in case the email was changed
      localStorage.setItem('userEmail', userEmail);
      setOtp(Array(6).fill(''));
      setTimeLeft(300);
      otpInputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resend OTP failed');
    } finally {
      setLoading(false);
    }
  };

  // Toggle editing mode for email input
  const handleToggleEditEmail = () => {
    setIsEditingEmail(true);
  };

  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          Let’s verify your email
        </h1>
        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            readOnly={!isEditingEmail}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-[#039994] ${
              isEditingEmail ? 'bg-white' : 'bg-gray-100'
            }`}
          />
        </div>
        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">01/05</span>
        </div>
        <p className="text-center text-sm text-gray-600 mb-6">
          Please enter the 6-digit code sent to your email.
        </p>
        <div className="w-full max-w-md">
          <div className="flex justify-center items-center space-x-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (otpInputs.current[index] = el)}
                className="w-12 h-12 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            ))}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
            <span>OTP expires in</span>
            <span className="ml-1 font-semibold text-red-500">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-6 space-y-2 sm:space-y-0">
            <button
              type="button"
              className="hover:underline text-left"
              onClick={handleToggleEditEmail}
            >
              Not the correct email? <span className="text-[#039994]">Change email address</span>
            </button>
            <button
              type="button"
              className="hover:underline text-left"
              onClick={handleResendEmail}
            >
              Did not receive an email? <span className="text-[#039994]">Resend email</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleVerifyEmail}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Verify Email Address
          </button>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-[#039994] hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
      {showModal && <EmailVerificationModal closeModal={() => setShowModal(false)} />}
    </>
  );
}
