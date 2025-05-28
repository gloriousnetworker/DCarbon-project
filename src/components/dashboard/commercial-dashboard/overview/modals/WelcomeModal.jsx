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
        alertMessage: "You need to complete both utility authorization and accept the user agreement to fully access your account.",
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
                href="#"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Resend Authorization Email
              </a>
            </div>
            
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800 mb-2">2. User Agreement</h4>
              <p className="text-sm text-yellow-700">
                You need to accept our user agreement to continue using the platform.
              </p>
              <button
                className="inline-block mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-500"
                onClick={() => {
                  // This would typically open the agreement modal
                  console.log("Open agreement modal");
                }}
              >
                Review and Accept Agreement
              </button>
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
        alertMessage: "You need to complete utility authorization to access all features.",
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
                    Check your inbox for the authorization email.
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
              
              <a
                href="#"
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Resend Authorization Email
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
        alertType: "warning",
        alertTitle: "Agreement Required",
        alertMessage: "You need to accept our user agreement to continue using the platform.",
        details: (
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <h4 className="font-medium text-yellow-800 mb-2">User Agreement</h4>
            <p className="text-sm text-yellow-700">
              Please review and accept our user agreement to access all features.
            </p>
            <button
              className="inline-block mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-500"
              onClick={() => {
                // This would typically open the agreement modal
                console.log("Open agreement modal");
              }}
            >
              Review and Accept Agreement
            </button>
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
      alertMessage: "You've completed all required setup steps and can now access all features.",
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
              You've accepted our user agreement on {new Date(agreements.updatedAt).toLocaleDateString()}.
            </p>
          </div>
        </div>
      ),
      canProceed: true
    };
  };

  const modalContent = getModalContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {modalContent.title}
                </h3>
                
                {/* Alert */}
                <div className={`mt-4 rounded-md ${
                  modalContent.alertType === 'warning' 
                    ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                    : modalContent.alertType === 'error'
                      ? 'bg-red-50 border-l-4 border-red-400'
                      : 'bg-green-50 border-l-4 border-green-400'
                } p-4`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg 
                        className={`h-5 w-5 ${
                          modalContent.alertType === 'warning' 
                            ? 'text-yellow-400' 
                            : modalContent.alertType === 'error'
                              ? 'text-red-400'
                              : 'text-green-400'
                        }`} 
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
                      <h3 className={`text-sm font-medium ${
                        modalContent.alertType === 'warning' 
                          ? 'text-yellow-800' 
                          : modalContent.alertType === 'error'
                            ? 'text-red-800'
                            : 'text-green-800'
                      }`}>
                        {modalContent.alertTitle}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        modalContent.alertType === 'warning' 
                          ? 'text-yellow-700' 
                          : modalContent.alertType === 'error'
                            ? 'text-red-700'
                            : 'text-green-700'
                      }`}>
                        <p>{modalContent.alertMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Details content */}
                <div className="mt-4">
                  {modalContent.details}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {modalContent.canProceed ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Continue to Dashboard
              </button>
            ) : (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  // This would typically open the appropriate form
                  console.log("Open required form");
                }}
              >
                Complete Setup
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}