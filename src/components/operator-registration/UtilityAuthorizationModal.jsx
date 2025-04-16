"use client";

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Modal styles
const modalStyles = {
  overlay: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50',
  content: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full',
  title: 'text-xl font-bold mb-4 text-[#039994] font-sfpro',
  description: 'mb-6 text-gray-700 font-sfpro text-[14px] leading-[140%]',
  buttonContainer: 'flex justify-between space-x-4 mt-4',
  skipButton: 'flex-1 px-4 py-2 border border-[#039994] text-[#039994] rounded hover:bg-gray-50 focus:outline-none font-sfpro font-medium',
  authorizeButton: 'flex-1 px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f] focus:outline-none font-sfpro font-medium',
  loadingText: 'font-sfpro',
  progressContainer: 'w-full bg-gray-200 rounded-full h-2.5 mb-6',
  progressBar: 'bg-[#039994] h-2.5 rounded-full transition-all duration-500'
};

export default function UtilityAuthorizationModal({ onAuthorized, onClose }) {
  const [authorizing, setAuthorizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();

  // Clear any intervals/timeouts when the component unmounts
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const navigateToNextPage = () => {
    router.push('/register/commercial-operator-registration/agreement');
  };

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setProgress(0);

    // Get user credentials from local storage
    const authToken = localStorage.getItem('authToken');
    const utilityToken = localStorage.getItem('utilityToken');

    if (!authToken || !utilityToken) {
      toast.error('Missing credentials. Please login again.', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
      setAuthorizing(false);
      return;
    }

    // Polling configuration: every 5 seconds, for up to 2 minutes (i.e. 24 attempts)
    const pollingIntervalMs = 5000;
    const maxPollCount = 24;
    let pollCount = 0;

    // Update progress bar incrementally
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / maxPollCount);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, pollingIntervalMs);

    // Define the polling function
    const pollForAuthorization = async () => {
      pollCount++;
      try {
        const response = await fetch(
          '/api/auth/check-utility-auth',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              token: utilityToken
            })
          }
        );

        const data = await response.json();
        console.log('Utility Auth check response:', data);

        if (data && data.data && data.data.isAuthorized) {
          // Clear intervals and timeouts
          clearInterval(pollingRef.current);
          clearInterval(progressInterval);
          clearTimeout(timeoutRef.current);
          
          // Set progress to 100%
          setProgress(100);
          
          toast.success('Utility authorized successfully!', {
            style: {
              fontFamily: 'SF Pro',
              background: '#E8F5E9',
              color: '#1B5E20',
            },
          });
          
          setAuthorizing(false);
          onAuthorized();
          navigateToNextPage();
        } else if (pollCount >= maxPollCount) {
          // Stop polling if maximum attempts reached
          clearInterval(pollingRef.current);
          clearInterval(progressInterval);
          toast.error('Timed out waiting for utility authorization. Please try again.', {
            style: {
              fontFamily: 'SF Pro',
              background: '#FFEBEE',
              color: '#B71C1C',
            },
          });
          setAuthorizing(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollingRef.current);
        clearInterval(progressInterval);
        toast.error(error.message || 'Error during utility authorization', {
          style: {
            fontFamily: 'SF Pro',
            background: '#FFEBEE',
            color: '#B71C1C',
          },
        });
        setAuthorizing(false);
      }
    };

    // Start polling
    pollingRef.current = setInterval(pollForAuthorization, pollingIntervalMs);

    // Set a fallback timeout of 2 minutes (in case polling interval fails to clear)
    timeoutRef.current = setTimeout(() => {
      clearInterval(pollingRef.current);
      clearInterval(progressInterval);
      toast.error('Timed out waiting for utility authorization. Please try again.', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
      setAuthorizing(false);
    }, pollingIntervalMs * maxPollCount);
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.content}>
        {/* Modal Title */}
        <h2 className={modalStyles.title}>Utility Authorization</h2>
        
        {/* Modal Description */}
        <p className={modalStyles.description}>
          Please click "Authorize" to validate your utility data before proceeding.
          This process may take up to 2 minutes.
        </p>

        {/* Progress Bar */}
        {authorizing && (
          <div className={modalStyles.progressContainer}>
            <div 
              className={modalStyles.progressBar} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Buttons Container */}
        <div className={modalStyles.buttonContainer}>
          <button
            onClick={() => {
              // If the user skips, clear any running polling
              if (pollingRef.current) clearInterval(pollingRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              navigateToNextPage();
            }}
            className={modalStyles.skipButton}
            disabled={authorizing}
          >
            Skip
          </button>
          
          <button
            onClick={handleAuthorize}
            className={modalStyles.authorizeButton}
            disabled={authorizing}
          >
            {authorizing ? (
              <span className={modalStyles.loadingText}>Authorizing... {Math.round(progress)}%</span>
            ) : (
              'Authorize'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}