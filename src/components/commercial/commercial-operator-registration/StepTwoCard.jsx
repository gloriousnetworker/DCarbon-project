'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import styles
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  formWrapper,
  labelClass,
  selectClass,
  buttonPrimary,
  // buttonSecondary, // Not defined in styles.js
  spinnerOverlay,
  spinner,
  termsTextContainer
} from './styles';

export default function UtilityAuthorizationCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [utilityData, setUtilityData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch utility data from localStorage
  useEffect(() => {
    const fetchUtilityData = async () => {
      try {
        // Get the verification response from localStorage
        const verificationResponse = localStorage.getItem('verificationResponse');
        if (!verificationResponse) {
          throw new Error('No verification response found in localStorage');
        }

        const parsedResponse = JSON.parse(verificationResponse);
        
        // Check if the response has the expected structure
        if (!parsedResponse.data || !parsedResponse.data.authData) {
          throw new Error('Invalid verification response format');
        }

        const authData = parsedResponse.data.authData;
        
        // Check if status is AUTHORIZED
        if (authData.status === "AUTHORIZED") {
          setIsAuthorized(true);
        }

        // Set the utility data from the verification response
        const utilityData = {
          isAuthorized: parsedResponse.data.isAuthorized,
          authorization_uid: authData.authorization_uid,
          uid: authData.uid,
          user_email: authData.utilityAuthEmail,
          user_uid: authData.userId,
          status: authData.status,
          createdAt: authData.createdAt,
          updatedAt: authData.updatedAt,
          delivery_method: authData.delivery_method,
          delivery_target: authData.delivery_target,
          is_delivered: authData.is_delivered,
          meters: authData.meters,
          type: authData.type,
          verificationToken: authData.verificationToken,
          message: parsedResponse.data.message,
          utilityVerified: parsedResponse.utilityVerified,
          authData: authData // Keep the full authData object
        };

        setUtilityData(utilityData);

      } catch (error) {
        console.error("Error fetching utility data:", error);
        setApiError(error.message);
      } finally {
        setFetchingData(false);
      }
    };

    fetchUtilityData();
  }, []);

  const handleLoginRedirect = () => {
    setLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Function to get status info based on status
  const getStatusInfo = (status) => {
    switch (status) {
      case 'AUTHORIZED':
        return {
          color: 'green',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-400',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-800',
          icon: (
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Authorization Successful!',
          message: 'Your utility provider has approved access to fetch your meter IDs and utility data. You can now proceed to login and create your facility.',
          nextSteps: [
            'Log in to your account',
            'Create and manage your commercial facilities',
            'Monitor your utility data and solar installations'
          ]
        };

      case 'UPDATED':
        return {
          color: 'blue',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: (
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Authorization Updated - Processing',
          message: 'You have re-authorized your utility provider to fetch meter data. The Utility API is currently processing your request and sending your data to DCarbon. Please wait while we complete this process.',
          nextSteps: [
            'Please wait while we fetch your meter data',
            'This process may take a few minutes',
            'You will be notified once the data is ready',
            'You can refresh this page to check for updates'
          ]
        };

      case 'UPDATE-ERROR':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-400',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800',
          icon: (
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Data Fetch Error',
          message: 'DCarbon was unable to fetch data from your utility provider. This could be due to a temporary issue with the utility provider\'s system or connectivity problems.',
          nextSteps: [
            'Try refreshing the status to retry the connection',
            'Check if your utility provider\'s system is operational',
            'Contact support if the issue persists',
            'You may need to re-authorize with your utility provider'
          ]
        };

      case 'DECLINE':
        return {
          color: 'red',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-400',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800',
          icon: (
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Authorization Declined',
          message: 'The Utility API has rejected access to fetch data from your utility provider. This may be due to invalid credentials, restricted access, or policy limitations.',
          nextSteps: [
            'Verify your utility account credentials',
            'Check with your utility provider about data sharing permissions',
            'Contact support for assistance with authorization',
            'You may need to try the authorization process again'
          ]
        };

      case 'INITIATED':
      default:
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          icon: (
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Authorization in Progress',
          message: 'Your utility authorization process has been initiated with the Utility API. Please wait while we process your request.',
          nextSteps: [
            'Please wait while we process your authorization',
            'This may take a few minutes to complete',
            'You will be notified once authorization is complete',
            'You can refresh this page to check for updates'
          ]
        };
    }
  };

  if (fetchingData) {
    return (
      <div className={spinnerOverlay}>
        <div className={spinner}></div>
      </div>
    );
  }

  if (apiError || !utilityData) {
    return (
      <div className={mainContainer}>
        <div className={headingContainer}>
          <h1 className={pageTitle}>Utility Authorization</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {apiError || 'Error loading utility data'}</span>
          </div>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028a7f] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(utilityData.status);

  // Show success message if utility is authorized
  if (isAuthorized && utilityData.status === "AUTHORIZED") {
    return (
      <>
        {/* Loader Overlay */}
        {loading && (
          <div className={spinnerOverlay}>
            <div className={spinner}></div>
          </div>
        )}

        <div className={mainContainer}>
          <div className={headingContainer}>
            <h1 className={pageTitle}>Utility Authorization</h1>
          </div>
          
          {/* Success Message */}
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.textColor} px-4 py-3 rounded relative my-6`}>
            <div className="flex items-center">
              {statusInfo.icon}
              <div>
                <strong className="font-bold">{statusInfo.title}</strong>
                <span className="block sm:inline"> {statusInfo.message}</span>
              </div>
            </div>
          </div>

          {/* Utility Information Summary */}
          <div className="border border-[#039994] rounded-md p-4 space-y-4 mb-6">
            <h3 className="font-semibold text-gray-700">Authorization Summary</h3>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.badgeColor}`}>
                  {utilityData.status}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Authorization ID:</span> {utilityData.authorization_uid}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {utilityData.user_email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Authorized On:</span> {new Date(utilityData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {utilityData.updatedAt && utilityData.updatedAt !== utilityData.createdAt && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span> {new Date(utilityData.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          
          {/* Login Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoginRedirect}
              className={`${buttonPrimary} px-8 py-3 text-lg font-medium`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Redirecting...
                </div>
              ) : (
                'Continue to Login'
              )}
            </button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {statusInfo.nextSteps.map((step, index) => (
                <li key={index}>• {step}</li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }

  // Show status-specific message for other statuses
  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {/* Main Container */}
      <div className={mainContainer}>
        {/* Back Arrow */}
        <div className={headingContainer}>
          <div className={backArrow} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className={pageTitle}>
            Utility Authorization
          </h1>
        </div>

        {/* Step Bar */}
        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>03/05</span>
        </div>

        {/* Content Container */}
        <div className={formWrapper}>
          {/* Utility Information */}
          <div className="border border-[#039994] rounded-md p-4 space-y-4">
            <h3 className="font-semibold text-gray-700">Utility Authorization Status</h3>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.badgeColor}`}>
                  {utilityData.status}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Authorization ID:</span> {utilityData.authorization_uid}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {utilityData.user_email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(utilityData.createdAt).toLocaleString()}
              </p>
              {utilityData.updatedAt && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span> {new Date(utilityData.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.textColor} px-4 py-3 rounded relative my-6`}>
            <div className="flex items-start">
              {statusInfo.icon}
              <div>
                <strong className="font-bold">{statusInfo.title}</strong>
                <span className="block mt-1"> {statusInfo.message}</span>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {statusInfo.nextSteps.map((step, index) => (
                <li key={index}>• {step}</li>
              ))}
            </ul>
          </div>

          {/* Button Group */}
          <div className="space-y-4 mt-6">
            {/* Refresh Status Button */}
            <button
              onClick={handleRetry}
              className={`${buttonPrimary} w-full`}
            >
              Refresh Status
            </button>

            {/* Continue to Dashboard Button - Show for all statuses except DECLINE */}
            {utilityData.status !== 'DECLINE' && (
              <button
                onClick={handleLoginRedirect}
                className="w-full rounded-md border border-[#039994] text-[#039994] font-semibold py-2 hover:bg-[#039994]/10 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#039994] mr-2"></div>
                    Redirecting...
                  </div>
                ) : (
                  utilityData.status === 'AUTHORIZED' ? 'Continue to Login' : 'Continue to Dashboard'
                )}
              </button>
            )}
          </div>

          {/* Terms and Conditions & Privacy Policy */}
          <div className={termsTextContainer}>
            By using our service, you agree to our{' '}
            <a href="/terms" className="text-[#039994] hover:underline font-medium">
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-[#039994] hover:underline font-medium">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}