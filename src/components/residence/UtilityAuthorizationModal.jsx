"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiMail, FiSkipForward, FiClock } from 'react-icons/fi';

// Modal styles
const modalStyles = {
  overlay: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50',
  content: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4',
  warningTitle: 'text-xl font-bold mb-4 text-yellow-600 font-sfpro flex items-center gap-2',
  importantNote: 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-sm text-yellow-700 font-sfpro',
  stepsContainer: 'space-y-4 mb-6',
  step: 'flex items-start gap-3',
  stepIcon: 'text-[#039994] mt-0.5 flex-shrink-0',
  buttonContainer: 'flex flex-col sm:flex-row justify-between gap-3 mt-6',
  skipButton: 'flex-1 px-4 py-2 border border-[#039994] text-[#039994] rounded hover:bg-gray-50 focus:outline-none font-sfpro font-medium flex items-center justify-center gap-2',
  authorizeButton: 'flex-1 px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f] focus:outline-none font-sfpro font-medium flex items-center justify-center gap-2',
  countdownContainer: 'flex items-center justify-center gap-2 mt-2 text-sm text-gray-600',
};

export default function UtilityAuthorizationModal({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  const navigateToNextPage = () => {
    localStorage.setItem('utilityVerificationSkipped', 'true');
    router.push('/register/residence-user-registration/agreement');
    onClose();
  };

  const handleAuthorize = () => {
    setIsClosing(true);
    toast.success('Check your email to complete authorization', {
      style: {
        fontFamily: 'SF Pro',
        background: '#E8F5E9',
        color: '#1B5E20',
      },
    });
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isClosing && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isClosing && countdown === 0) {
      if (typeof window !== 'undefined') {
        window.open('', '_self').close(); // Attempt to close tab
      }
    }
    return () => clearTimeout(timer);
  }, [isClosing, countdown]);

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.content}>
        {/* Warning Header */}
        <h2 className={modalStyles.warningTitle}>
          <FiAlertTriangle className="text-yellow-600" size={24} />
          Important Authorization Required
        </h2>

        {/* Important Note */}
        <div className={modalStyles.importantNote}>
          <p className="font-medium">Action Required:</p>
          <p>You must authorize your utility data to complete registration. Check your email for the authorization link.</p>
        </div>

        {/* Steps */}
        <div className={modalStyles.stepsContainer}>
          <div className={modalStyles.step}>
            <div className="bg-[#039994] rounded-full p-1">
              <FiMail className="text-white" size={16} />
            </div>
            <div>
              <strong>Step 1:</strong> We will send an authorization link to your email after you have authorized Utility API to your DCarbon Operator email
            </div>
          </div>
          
          <div className={modalStyles.step}>
            <div className="bg-[#039994] rounded-full p-1">
              <div className="text-white text-xs font-bold w-4 h-4 flex items-center justify-center">2</div>
            </div>
            <div>
              <strong>Step 2:</strong> Click the link in your email to authorize
            </div>
          </div>
          
          <div className={modalStyles.step}>
            <div className="bg-[#039994] rounded-full p-1">
              <div className="text-white text-xs font-bold w-4 h-4 flex items-center justify-center">3</div>
            </div>
            <div>
              <strong>Step 3:</strong> Continue your registration with DCarbon via the link
            </div>
          </div>
        </div>

        {/* Countdown display when closing */}
        {isClosing && (
          <div className={modalStyles.countdownContainer}>
            <FiClock />
            <span>This tab will close in {countdown} seconds...</span>
          </div>
        )}

        {/* Buttons Container */}
        <div className={modalStyles.buttonContainer}>
          <button
            onClick={navigateToNextPage}
            className={modalStyles.skipButton}
            disabled={isClosing}
          >
            <FiSkipForward />
            Skip for now
          </button>
          
          <button
            onClick={handleAuthorize}
            className={modalStyles.authorizeButton}
            disabled={isClosing}
          >
            <FiMail />
            {isClosing ? `Closing in ${countdown}s...` : 'Authorize via Email'}
          </button>
        </div>

        {/* Skip Notice */}
        <div className="text-xs text-gray-500 mt-4 text-center font-sfpro space-y-1">
          <p>• Skipping will limit access to some features</p>
          <p>• You can complete authorization later from your account settings</p>
        </div>
      </div>
    </div>
  );
}