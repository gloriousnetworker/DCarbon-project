'use client';

import { useState, useEffect, useRef } from 'react';

const mainContainer = "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4 py-8";
const headingContainer = "mb-4";
const pageTitle = "text-3xl font-bold text-gray-800 text-center font-sfpro";
const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-sm";
const buttonPrimary = "w-full bg-[#039994] text-white py-3 rounded-lg font-medium hover:bg-[#027d73] transition-colors font-sfpro";
const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

function Loader() {
  return (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  );
}

function EmailVerificationModal({ closeModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Email Verified!</h2>
        <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
        <button
          onClick={closeModal}
          className="bg-[#039994] text-white px-6 py-2 rounded-lg hover:bg-[#027d73] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(300);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [toasts, setToasts] = useState([]);

  const otpInputs = useRef([]);

  const toast = {
    success: (message) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    },
    error: (message) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }
  };

  useEffect(() => {
    const storedEmail = 'awamaaronvictor+installedcus@gmail.com';
    setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} minute${m !== 1 ? 's' : ''} ${s.toString().padStart(2, '0')} second${s !== 1 ? 's' : ''}`;
  };

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

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('https://services.dcarbon.solutions/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: Number(enteredOtp) })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OTP verification failed');
      }
      toast.success('Email verified successfully');
      setShowModal(true);
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(userEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://services.dcarbon.solutions/api/user/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Resend OTP failed');
      }
      toast.success('OTP resent successfully');
      setOtp(Array(6).fill(''));
      setTimeLeft(300);
      otpInputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Resend OTP failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEditEmail = () => {
    setIsEditingEmail(true);
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-6 py-3 rounded-lg shadow-lg ${
              t.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium animate-fade-in`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {loading && (
        <div className={spinnerOverlay}>
          <Loader />
        </div>
      )}

      <div className={mainContainer}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <img
              src="/auth_images/Login_logo.png"
              alt="DCarbon Logo"
              className="h-10 object-contain mx-auto"
            />
          </div>

          <div className={headingContainer}>
            <h1 className={pageTitle}>
              Let's verify your email
            </h1>
          </div>

          <p className="text-center text-sm text-gray-600 mb-6 font-sfpro">
            Please enter the 6-digit code sent to your email.
          </p>

          <div className="w-full mb-4">
            <input
              type="text"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              readOnly={!isEditingEmail}
              className={`${inputClass} text-center ${isEditingEmail ? 'bg-white' : 'bg-gray-100'} break-all`}
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.5',
                minHeight: '3rem'
              }}
            />
          </div>

          <div className="w-full">
            <div className="flex justify-center items-center space-x-2 mb-4 flex-wrap gap-y-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (otpInputs.current[index] = el)}
                  className="w-12 h-12 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
                />
              ))}
            </div>

            <div className="flex items-center justify-center text-sm text-gray-600 mb-6 font-sfpro flex-wrap text-center gap-1">
              <span>OTP expires in</span>
              <span className="font-semibold text-[#FF0000]">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex flex-col items-center text-sm text-gray-500 mb-6 space-y-2 font-sfpro">
              <button
                type="button"
                className="hover:underline text-center"
                onClick={handleResendEmail}
              >
                Did not receive an email? <span className="text-[#039994]">Resend email</span>
              </button>
              <button
                type="button"
                className="hover:underline text-center"
                onClick={handleToggleEditEmail}
              >
                Not the correct email? <span className="text-[#039994]">Change email address</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyEmail}
              className={buttonPrimary}
            >
              Verify Email Address
            </button>

            <p className="mt-6 text-center text-sm text-gray-600 font-sfpro">
              Already have an account?{' '}
              <a href="/login" className="text-[#039994] hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {showModal && <EmailVerificationModal closeModal={() => setShowModal(false)} />}
    </>
  );
}