'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Loader from '../../components/loader/Loader';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';

export default function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(timer);
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyEmail = () => {
    setShowModal(true); // Show the modal when verify is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <>
      {/* Loader Overlay */}
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

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>
          Let’s verify your email
        </h1>

        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">01/05</span>
        </div>

        <p className="text-center text-sm text-gray-600 mb-6">
          Please enter the 6-digit code sent to <b>name@domain.com</b>. This process is a one-time process in accessing our solar services.
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
                className="w-12 h-12 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            ))}
          </div>

          <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
            <span>OTP expires in</span>
            <span className="ml-1 font-semibold text-red-500">{timeLeft}s</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-6 space-y-2 sm:space-y-0">
            <button
              type="button"
              className="hover:underline text-left"
              onClick={() => alert('Change email flow here')}
            >
              Not the correct email? <span className="text-[#039994]">Change email address</span>
            </button>
            <button
              type="button"
              className="hover:underline text-left"
              onClick={() => alert('Resend email flow here')}
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
            <a
              href="/login"
              className="text-[#039994] hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal isVisible={showModal} onClose={handleCloseModal} />
    </>
  );
}
