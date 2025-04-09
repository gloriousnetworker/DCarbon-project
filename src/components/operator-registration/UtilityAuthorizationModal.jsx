"use client";

import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast.success('Utility authorized successfully!');
        onAuthorized();
      } else {
        throw new Error('Authorization failure: no valid authorizationUid found');
      }
    } catch (error) {
      toast.error(error.message || 'Error during utility authorization');
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-[#039994]">Utility Authorization</h2>
          <p className="mb-6 text-gray-700">
            Please click "Authorize" to validate your utility data before proceeding.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none"
              disabled={authorizing}
            >
              Cancel
            </button>
            <button
              onClick={handleAuthorize}
              className="px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f] focus:outline-none"
              disabled={authorizing}
            >
              {authorizing ? 'Authorizing . . . .' : 'Authorize'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
