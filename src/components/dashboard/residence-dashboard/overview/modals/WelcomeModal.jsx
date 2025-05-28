import React from "react";

export default function WelcomeModal({ 
  isOpen, 
  onClose, 
  userData, 
  authStatus, 
  agreementStatus,
  utilityAuthDetails = [],
  utilityAuthEmails = []
}) {
  if (!isOpen) return null;

  const { userFirstName, utilityAuth = [], agreements } = userData;
  const userEmail = (typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null) || "your email";
  
  const isAuthComplete = authStatus === "COMPLETED";
  const isAgreementComplete = agreementStatus === "ACCEPTED";

  // Get authorized emails (from AUTHORIZED or UPDATED status)
  const getAuthorizedEmails = () => {
    const authorizedEmails = [];
    utilityAuthDetails.forEach((auth, index) => {
      if (auth.status === "AUTHORIZED" || auth.status === "UPDATED") {
        authorizedEmails.push(utilityAuthEmails[index] || 'Unknown email');
      }
    });
    return authorizedEmails;
  };

  // Get error emails and their status
  const getErrorEmails = () => {
    const errorEmails = [];
    utilityAuthDetails.forEach((auth, index) => {
      if (auth.status === "UPDATE_ERROR" || auth.status === "ERROR" || auth.status === "FAILED") {
        errorEmails.push({
          email: utilityAuthEmails[index] || 'Unknown email',
          status: auth.status
        });
      }
    });
    return errorEmails;
  };

  // Get pending emails
  const getPendingEmails = () => {
    const pendingEmails = [];
    utilityAuthDetails.forEach((auth, index) => {
      if (auth.status === "PENDING" || auth.status === "PROCESSING") {
        pendingEmails.push(utilityAuthEmails[index] || 'Unknown email');
      }
    });
    return pendingEmails;
  };

  const authorizedEmails = getAuthorizedEmails();
  const errorEmails = getErrorEmails();
  const pendingEmails = getPendingEmails();

  const getModalContent = () => {
    // Both requirements missing
    if (!isAuthComplete && !isAgreementComplete) {
      return {
        title: "Complete Your Setup",
        alertType: "warning",
        alertTitle: "Multiple Requirements Pending",
        alertMessage: "You need to complete both utility authorization and accept the user agreement to fully access your residential account.",
        details: (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-800 mb-2">1. Utility Authorization</h4>
              <p className="text-sm text-blue-700">
                {pendingEmails.length > 0 ? (
                  <>
                    Authorization for{' '}
                    {pendingEmails.map((email, index) => (
                      <span key={index}>
                        <span className="font-medium">{email}</span>
                        {index < pendingEmails.length - 1 && ', '}
                      </span>
                    ))} is pending. Check your inbox for the authorization email.
                  </>
                ) : (
                  "Your utility authorization is still pending."
                )}
              </p>
              <a
                href="/register/residence-user-registration/step-two"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Complete Authorization Process
              </a>
            </div>
            
            <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
              <h4 className="font-medium text-purple-800 mb-2">2. User Agreement</h4>
              <p className="text-sm text-purple-700">
                You need to review and accept the user agreement to create facilities and access all features.
              </p>
              <a
                href="/register/residence-user-registration/agreement"
                className="inline-flex items-center mt-2 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-800 bg-purple-100 hover:bg-purple-200"
              >
                Review Agreement
              </a>
            </div>
          </div>
        ),
        canProceed: false
      };
    }

    // Only authorization missing
    if (!isAuthComplete) {
      return {
        title: "Complete Utility Authorization",
        alertType: "warning",
        alertTitle: "Authorization Required",
        alertMessage: "You need to complete utility authorization to access all residential features.",
        details: (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-800 mb-2">Utility Authorization Status</h4>
              
              {pendingEmails.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-blue-700">
                    Authorization pending for:
                  </p>
                  <ul className="list-disc list-inside mt-1 text-sm text-blue-700">
                    {pendingEmails.map((email, index) => (
                      <li key={index} className="font-medium">{email}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-700 mt-2">
                    Check your inbox for the authorization email from your utility provider.
                  </p>
                </div>
              )}
              
              {errorEmails.length > 0 && (
                <div className="border-l-4 border-red-400 bg-red-50 p-3 mt-3">
                  <h5 className="font-medium text-red-800 mb-1">Authorization Issues</h5>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {errorEmails.map((error, index) => (
                      <li key={index}>
                        <span className="font-medium">{error.email}</span>: {error.status}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-red-700 mt-2">
                    Please contact your Utility Provider or the DCarbon Team for assistance.
                  </p>
                </div>
              )}
              
              {pendingEmails.length === 0 && errorEmails.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    You may have skipped the authorization process. To complete your registration:
                  </p>
                  <a
                    href="/register/residence-user-registration/step-two"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#039994] hover:bg-[#02807c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
                  >
                    Complete Authorization Now
                  </a>
                </div>
              )}
              
              <a
                href="/register/residence-user-registration/step-two"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Initiate/Resend Authorization Email
              </a>
            </div>
          </div>
        ),
        canProceed: false
      };
    }

    // Only agreement missing
    if (!isAgreementComplete) {
      return {
        title: "Accept User Agreement",
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
              href="/register/residence-user-registration/agreement"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Review and Accept Agreement
            </a>
          </div>
        ),
        canProceed: false
      };
    }

    // Everything complete - success state
    return {
      title: "Setup Complete!",
      alertType: "success",
      alertTitle: "You're all set!",
      alertMessage: "You've completed all required setup steps and can now access all residential features.",
      details: (
        <div className="space-y-4">
          <div className="border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800 mb-2">Utility Authorization</h4>
            <p className="text-sm text-green-700">
              Your utility authorizations are complete for:
            </p>
            <ul className="list-disc list-inside mt-1 text-sm text-green-700">
              {authorizedEmails.map((email, index) => (
                <li key={index} className="font-medium">{email}</li>
              ))}
            </ul>
          </div>
          
          {errorEmails.length > 0 && (
            <div className="border-l-4 border-orange-400 bg-orange-50 p-3">
              <h5 className="font-medium text-orange-800 mb-1">Note: Some Authorizations Have Issues</h5>
              <ul className="list-disc list-inside text-sm text-orange-700">
                {errorEmails.map((error, index) => (
                  <li key={index}>
                    <span className="font-medium">{error.email}</span>: {error.status}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-orange-700 mt-2">
                You can still proceed with authorized accounts, but please contact support about these issues.
              </p>
            </div>
          )}
          
          <div className="border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800 mb-2">User Agreement</h4>
            <p className="text-sm text-green-700">
              You've accepted our user agreement on {new Date(agreements?.updatedAt).toLocaleDateString()}.
            </p>
          </div>
        </div>
      ),
      canProceed: true
    };
  };

  const modalContent = getModalContent();

  // Alert color configuration
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
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      icon: "text-green-400", 
      title: "text-green-800",
      text: "text-green-700"
    }
  };

  const colors = alertColors[modalContent.alertType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[#039994]">
            {modalContent.title}, {userFirstName}!
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
                  {modalContent.alertType === 'success' ? (
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  ) : (
                    <path 
                      fillRule="evenodd" 
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                      clipRule="evenodd" 
                    />
                  )}
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${colors.title}`}>
                  {modalContent.alertTitle}
                </h3>
                <div className={`mt-2 text-sm ${colors.text}`}>
                  <p>{modalContent.alertMessage}</p>
                </div>
              </div>
            </div>
          </div>

          {modalContent.details && (
            <div className="space-y-3">
              {modalContent.details}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            {modalContent.canProceed ? (
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#039994] hover:bg-[#02807c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
                >
                  Continue to Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex justify-center py-2 px-4 border border-[#039994] rounded-md shadow-sm text-sm font-medium text-[#039994] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#039994] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] border-[#039994]"
              >
                I Understand
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}