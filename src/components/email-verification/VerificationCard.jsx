'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';
import toast, { Toaster } from 'react-hot-toast';

import {
  mainContainer,
  headingContainer,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  inputClass,
  buttonPrimary,
  spinnerOverlay,
  noteText,
  termsTextContainer
} from './styles';

export default function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(300);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isFrom423, setIsFrom423] = useState(false);

  const otpInputs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const from423 = localStorage.getItem('from423Status');
    if (storedEmail) setUserEmail(storedEmail);
    if (from423 === 'true') setIsFrom423(true);
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
      if (isFrom423) {
        await axios.post(
          'https://services.dcarbon.solutions/api/auth/verify-otp',
          { email: userEmail, otp: enteredOtp },
          { headers: { 'Content-Type': 'application/json' } }
        );
        toast.success('Account verified successfully');
        localStorage.removeItem('from423Status');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        await axios.post(
          'https://services.dcarbon.solutions/api/user/verify-otp',
          { email: userEmail, otp: Number(enteredOtp) },
          { headers: { 'Content-Type': 'application/json' } }
        );
        toast.success('Email verified successfully');
        setShowModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
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
      if (isFrom423) {
        await axios.post(
          'https://services.dcarbon.solutions/api/auth/send-otp',
          { email: userEmail },
          { headers: { 'Content-Type': 'application/json' } }
        );
        toast.success('OTP resent successfully');
        setOtp(Array(6).fill(''));
        setTimeLeft(300);
        otpInputs.current[0]?.focus();
      } else {
        await axios.post(
          'https://services.dcarbon.solutions/api/user/resend-otp',
          { email: userEmail },
          { headers: { 'Content-Type': 'application/json' } }
        );
        toast.success('OTP resent successfully');
        localStorage.setItem('userEmail', userEmail);
        setOtp(Array(6).fill(''));
        setTimeLeft(300);
        otpInputs.current[0]?.focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resend OTP failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {loading && (
        <div className={spinnerOverlay}>
          <Loader />
        </div>
      )}

      <div className={mainContainer}>
        <div className="flex justify-start mb-6">
          <button
            onClick={handleGoBack}
            className="text-[#039994] hover:text-[#027772] transition-colors mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        <div className={headingContainer}>
          <h1 className={pageTitle}>
            Let's verify your email
          </h1>
        </div>

        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>01/05</span>
        </div>

        <p className="text-center text-sm text-gray-600 mb-6 font-sfpro">
          Please enter the 6-digit code sent to your email.
        </p>

        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            value={userEmail}
            readOnly
            className={`${inputClass} text-center bg-[#E8E8E8] cursor-not-allowed`}
            placeholder="Enter your email address"
          />
        </div>

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
                className="w-12 h-12 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              />
            ))}
          </div>

          <div className="flex items-center justify-center text-sm text-gray-600 mb-6 font-sfpro">
            <span>OTP expires in</span>
            <span className="ml-1 font-semibold text-[#FF0000]">
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

      {showModal && <EmailVerificationModal closeModal={() => setShowModal(false)} />}
    </>
  );
}