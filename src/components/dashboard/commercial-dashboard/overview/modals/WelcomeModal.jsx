// src/components/modals/WelcomeModal.jsx
import React from "react";

export default function WelcomeModal({ 
  isOpen, 
  onClose, 
  userData, 
  authStatus, 
  agreementStatus 
}) {
  if (!isOpen) return null;

  const { userFirstName, utilityProviderRequest, agreements } = userData;
  const providerName = utilityProviderRequest?.provider?.name || "your utility provider";
  const userEmail = utilityProviderRequest?.userAuthEmail || "your email";
  
  const isAuthComplete = authStatus === "AUTHORIZED" || authStatus === "UPDATED";
  const isAgreementComplete = agreementStatus === "ACCEPTED";

  const getModalContent = () => {
    // Both requirements missing
    if (!isAuthComplete && !isAgreementComplete) {
      return {
        title: "Complete Your Setup",
        alertType: "warning",
        alertTitle: "Multiple Requirements Pending",
        alertMessage: "You need to complete both utility authorization and accept the user agreement to fully access your account.",
        details: (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-800 mb-2">1. Utility Authorization</h4>
              <p className="text-sm text-blue-700">
                Your verification with {providerName} is still pending. 
                Check your inbox at <span className="font-medium">{userEmail}</span> for the authorization email.
              </p>
            </div>
            <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
              <h4 className="font-medium text-purple-800 mb-2">2. User Agreement</h4>
              <p className="text-sm text-purple-700">
                You need to review and accept the user agreement to create facilities and access all features.
              </p>
              <a
                href="/register/commercial-both-registration/agreement"
                className="inline-flex items-center mt-2 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-800 bg-purple-100 hover:bg-purple-200"
              >
                Review Agreement
              </a>
            </div>
          </div>
        )
      };
    }
    
    // Only authorization missing
    if (!isAuthComplete && isAgreementComplete) {
      return {
        title: "Authorization Pending",
        alertType: "warning",
        alertTitle: "Utility Authorization Required",
        alertMessage: `Your verification with ${providerName} is still pending. You won't be able to add commercial facilities until authorization is complete.`,
        details: utilityProviderRequest?.skipped ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You skipped the authorization process. To complete your registration:
            </p>
            <a
              href="/register/operator-registration"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#039994] hover:bg-[#02807c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
            >
              Complete Authorization Now
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Please check your inbox at <span className="font-medium">{userEmail}</span> for
              the authorization email from {providerName} and complete the process, or{" "}
              <a
                href="/register/commercial-both-registration/step-two"
                className="font-medium text-[#039994] hover:text-[#02807c] underline"
              >
                click here to INITIATE
              </a>
              .
            </p>
            <p className="text-sm text-gray-600">
              If you didn't receive the email, check your spam folder or request a new one.
            </p>
          </div>
        )
      };
    }
    
    // Only agreement missing
    if (isAuthComplete && !isAgreementComplete) {
      return {
        title: "Agreement Required",
        alertType: "error",
        alertTitle: "User Agreement Pending",
        alertMessage: "You must accept the user agreement to create facilities and access all platform features.",
        details: (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your utility authorization is complete, but you still need to review and accept our user agreement.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ You cannot create facilities until this requirement is completed.
              </p>
            </div>
            <a
              href="/agreement"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Review and Accept Agreement
            </a>
          </div>
        )
      };
    }

    // Fallback (shouldn't reach here if logic is correct)
    return {
      title: "Welcome",
      alertType: "info",
      alertTitle: "Welcome to Your Dashboard",
      alertMessage: "Your account setup is complete!",
      details: null
    };
  };

  const content = getModalContent();
  const alertColors = {
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      icon: "text-yellow-400",
      title: "text-yellow-800",
      text: "text-yellow-700"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400", 
      icon: "text-red-400",
      title: "text-red-800",
      text: "text-red-700"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: "text-blue-400", 
      title: "text-blue-800",
      text: "text-blue-700"
    }
  };

  const colors = alertColors[content.alertType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[#039994]">
            {content.title}, {userFirstName}!
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
       
        <div className="space-y-4">
          <div className={`p-4 ${colors.bg} border-l-4 ${colors.border}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg 
                  className={`h-5 w-5 ${colors.icon}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${colors.title}`}>
                  {content.alertTitle}
                </h3>
                <div className={`mt-2 text-sm ${colors.text}`}>
                  <p>{content.alertMessage}</p>
                </div>
              </div>
            </div>
          </div>

          {content.details && (
            <div className="space-y-3">
              {content.details}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#039994] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] border-[#039994]"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}