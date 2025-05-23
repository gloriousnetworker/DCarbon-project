import React from "react";

export default function WelcomeModal({ isOpen, onClose, userData }) {
  if (!isOpen) return null;

  const { userFirstName, utilityProviderRequest } = userData;
  const providerName = utilityProviderRequest?.provider?.name || "your utility provider";
  const userEmail = utilityProviderRequest?.userAuthEmail || "your email";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[#039994]">Welcome, {userFirstName}!</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Authorization Pending</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your verification with {providerName} is still pending. 
                    You won't be able to track your residential energy usage until authorization is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {utilityProviderRequest?.skipped ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                You skipped the authorization process. To complete your registration:
              </p>
              <a
                href="/register/residence-user-registration"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#039994] hover:bg-[#02807c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
              >
                Complete Authorization Now
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Please check your inbox at <span className="font-medium">{userEmail}</span> for 
                the authorization email from {providerName} and complete the process.
              </p>
              <p className="text-sm text-gray-600">
                If you didn't receive the email, check your spam folder or request a new one.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#039994] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}