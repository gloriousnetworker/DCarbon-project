"use client";

import { useState } from 'react';
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

  const handleAuthorize = async () => {
    setAuthorizing(true);

    try {
      // Hitting the endpoint from the provided URL
      const response = await fetch('https://dcarbon-server.onrender.com/api/auth/fetch-utility-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse and log the response data
      const data = await response.json();
      console.log('Utility API response:', data);

      // Check if authorizationUid exists and is not null
      if (data && data.authorizationUid) {
        toast.success('Utility authorized successfully!', {
          style: {
            fontFamily: 'SF Pro',
            background: '#E8F5E9',
            color: '#1B5E20',
          },
        });
        onAuthorized();
      } else {
        throw new Error('Authorization failure: no valid authorizationUid found');
      }
    } catch (error) {
      toast.error(error.message || 'Error during utility authorization', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className={modalStyles.overlay}>
        {/* Modal Content */}
        <div className={modalStyles.content}>
          {/* Modal Title */}
          <h2 className={modalStyles.title}>Utility Authorization</h2>
          
          {/* Modal Description */}
          <p className={modalStyles.description}>
            Please click "Authorize" to validate your utility data before proceeding.
          </p>

          {/* Buttons Container */}
          <div className={modalStyles.buttonContainer}>
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className={modalStyles.cancelButton}
              disabled={authorizing}
            >
              Cancel
            </button>
            
            {/* Authorize Button */}
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
    </>
  );
}