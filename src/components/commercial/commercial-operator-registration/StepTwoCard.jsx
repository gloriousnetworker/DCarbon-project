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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your Utility has been authorized successfully. Click to login and continue creating your facility.</span>
              </div>
            </div>
          </div>

          {/* Utility Information Summary */}
          <div className="border border-[#039994] rounded-md p-4 space-y-4 mb-6">
            <h3 className="font-semibold text-gray-700">Authorization Summary</h3>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
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
              <li>• Log in to your account</li>
              <li>• Create and manage your commercial facilities</li>
              <li>• Monitor your utility data and solar installations</li>
            </ul>
          </div>
        </div>
      </>
    );
  }

  // Show pending or other status
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
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  utilityData.status === 'AUTHORIZED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
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

          {/* Pending Message */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative my-6">
            <strong className="font-bold">Pending Authorization</strong>
            <span className="block sm:inline"> Your utility authorization is still pending. Please check back later or contact support if this persists.</span>
          </div>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            className={`${buttonPrimary} mt-6`}
          >
            Refresh Status
          </button>

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