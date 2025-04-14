"use client";

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

// Modal styles
const modalStyles = {
  overlay: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50',
  content: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full',
  title: 'text-xl font-bold mb-4 text-[#039994] font-sfpro',
  description: 'mb-6 text-gray-700 font-sfpro text-[14px] leading-[140%]',
  buttonContainer: 'flex justify-between space-x-4 mt-4',
  cancelButton: 'flex-1 px-4 py-2 border border-[#039994] text-[#039994] rounded hover:bg-gray-50 focus:outline-none font-sfpro font-medium',
  authorizeButton: 'flex-1 px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f] focus:outline-none font-sfpro font-medium',
  loadingText: 'font-sfpro'
};

export default function UtilityAuthorizationModal({ onAuthorized, onClose }) {
  const [authorizing, setAuthorizing] = useState(false);
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clear any intervals/timeouts when the component unmounts
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAuthorize = async () => {
    setAuthorizing(true);

    // Get user credentials from local storage
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
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

    // Define the polling function
    const pollForAuthorization = async () => {
      pollCount++;
      try {
        const response = await fetch(
          `https://dcarbon-server.onrender.com/api/auth/check-utility-auth/${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          }
        );

        const data = await response.json();
        console.log('Utility Auth check response:', data);

        if (data && data.data && data.data.isAuthorized) {
          toast.success('Utility authorized successfully!', {
            style: {
              fontFamily: 'SF Pro',
              background: '#E8F5E9',
              color: '#1B5E20',
            },
          });
          clearInterval(pollingRef.current);
          clearTimeout(timeoutRef.current);
          setAuthorizing(false);
          onAuthorized();
        } else if (pollCount >= maxPollCount) {
          // Stop polling if maximum attempts reached
          clearInterval(pollingRef.current);
          toast.error('Timed out waiting for utility authorization. Please try again.', {
            style: {
              fontFamily: 'SF Pro',
              background: '#FFEBEE',
              color: '#B71C1C',
            },
          });
          setAuthorizing(false);
        }
        // Otherwise, keep polling
      } catch (error) {
        console.error('Polling error:', error);
        // Optionally: if you want to stop on error, clear the polling and notify the user.
        clearInterval(pollingRef.current);
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

        {/* Buttons Container */}
        <div className={modalStyles.buttonContainer}>
          <button
            onClick={() => {
              // If the user cancels, clear any running polling
              if (pollingRef.current) clearInterval(pollingRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              onClose();
            }}
            className={modalStyles.cancelButton}
            disabled={authorizing}
          >
            Cancel
          </button>
          
          <button
            onClick={handleAuthorize}
            className={modalStyles.authorizeButton}
            disabled={authorizing}
          >
            {authorizing ? (
              <span className={modalStyles.loadingText}>Authorizing...</span>
            ) : (
              'Authorize'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
