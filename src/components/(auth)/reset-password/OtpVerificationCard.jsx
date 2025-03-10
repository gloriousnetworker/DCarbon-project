import { useState, useRef } from 'react';
import Loader from '../../../components/loader/Loader';

export default function OtpVerificationCard() {
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/reset-password/change-password'; // Example redirect
    }, 3000);
  };

  // Function to handle auto-focus for next input box
  const handleChange = (e, index) => {
    // If input is not empty, focus on the next input box
    if (e.target.value) {
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Function to handle backspace and focus on the previous input box
  const handleBackspace = (e, index) => {
    // If backspace is pressed and the box is empty, focus on the previous input box
    if (e.key === 'Backspace' && index > 0 && !e.target.value) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Glass-Effect Card */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8"
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
          Recover Password
        </h2>

        {/* Line Break */}
        <hr className="border-t-2 border-[#2EBAA0] mb-4" />

        {/* Description */}
        <p className="font-sans font-normal text-sm text-white text-center mb-4">
          Please enter the 6-digit code sent to <strong>name@domain.com</strong>. This begins the process of your account’s password recovery.
        </p>

        {/* OTP Expiration Text */}
        <p className="text-xs text-center text-white mb-4">
          OTP expires in <strong>60 secs</strong>
        </p>

        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2 mb-6">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)} // Assign the ref to each input
              type="text"
              maxLength="1"
              className="w-12 h-12 text-center bg-transparent border-b-2 border-[#2EBAA0] text-white focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
              placeholder="-"
              onChange={(e) => handleChange(e, index)} // Handle change for moving to next input
              onKeyDown={(e) => handleBackspace(e, index)} // Handle backspace for moving to previous input
            />
          ))}
        </div>

        {/* Another Line Break */}
        <hr className="border-t-2 border-[#2EBAA0] mb-4" />

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-lg bg-[#2EBAA0] text-white font-semibold py-2 hover:bg-[#27a48e] focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
        >
          Continue to Change Password
        </button>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-center text-white leading-tight">
          By clicking on ‘Continue to Change Password’, you agree to our{' '}
          <a
            href="/terms"
            className="text-[#2EBAA0] hover:underline font-medium"
          >
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a
            href="/privacy"
            className="text-[#2EBAA0] hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </>
  );
}
