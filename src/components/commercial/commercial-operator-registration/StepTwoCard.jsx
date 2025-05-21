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
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [metersFetched, setMetersFetched] = useState(false);
  const [metersData, setMetersData] = useState(null);

  // Fetch utility data from localStorage and API
  useEffect(() => {
    const fetchUtilityData = async () => {
      try {
        // Get the auth response from localStorage
        const localStorageData = localStorage.getItem('utilityAuthResponse');
        if (!localStorageData) {
          throw new Error('No utility authorization data found');
        }

        const authResponse = JSON.parse(localStorageData);
        
        if (!authResponse.data || !authResponse.data.authData) {
          throw new Error('Invalid utility authorization data format');
        }

        const authData = authResponse.data.authData;
        
        // Set the utility data from localStorage
        const utilityData = {
          isAuthorized: authResponse.data.isAuthorized,
          authorization_uid: authData.authorization_uid,
          uid: authData.uid,
          user_email: authData.email,
          user_uid: authData.userId,
          status: authData.status,
          createdAt: authData.createdAt,
          updatedAt: authData.updatedAt,
          // Include any other relevant fields from authData
          authData: authData // Keep the full authData object
        };

        setUtilityData(utilityData);
        
        // Fetch user meters from API
        await fetchUserMeters(authData.userId);

      } catch (error) {
        console.error("Error fetching utility data:", error);
        setApiError(error.message);
      } finally {
        setFetchingData(false);
      }
    };

    fetchUtilityData();
  }, []);

  const fetchUserMeters = async (userId) => {
    try {
      // Get the auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found in localStorage');
      }

      const apiUrl = `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.meters?.meters?.length > 0) {
        setMetersData(data.data.meters);
        setSelectedMeter(data.data.meters.meters[0]);
        setMetersFetched(true);
      } else {
        throw new Error('No meters found or invalid response format');
      }

    } catch (error) {
      console.error("Error fetching user meters:", error);
      setApiError(error.message);
    }
  };

  const handleSubmit = () => {
    // Validate form
    if (isSameLocation === null) {
      alert("Please confirm the location");
      return;
    }

    // Simulate an API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // If meters were fetched successfully, redirect to login
      if (metersFetched) {
        router.push('/login');
      } else {
        router.push('/register/commercial-operator-registration/agreement');
      }
    }, 1500);
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
          <p className="text-red-500">{apiError || 'Error loading utility data'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#039994] text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show success message if meters were fetched successfully
  if (metersFetched) {
    return (
      <div className={mainContainer}>
        <div className={headingContainer}>
          <h1 className={pageTitle}>Utility Authorization</h1>
        </div>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-6">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Meter retrieval successful. Please proceed to login to continue creating your facilities.</span>
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className={buttonPrimary}
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

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
            <h3 className="font-semibold text-gray-700">Utility Information</h3>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Authorization Status:</span> {utilityData.status}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Authorization UID:</span> {utilityData.authorization_uid}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User Email:</span> {utilityData.user_email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User UID:</span> {utilityData.user_uid}
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

          {/* Meter Information - Only show if we have meter data */}
          {utilityData.authData?.meters ? (
            <div className="border border-[#039994] rounded-md p-4 space-y-4 mt-4">
              <h3 className="font-semibold text-gray-700">Meter Information</h3>
              
              {utilityData.authData.meters.length > 1 ? (
                <div>
                  <label className={labelClass}>Select Meter</label>
                  <select
                    value={selectedMeter?.uid || ''}
                    onChange={(e) => {
                      const meter = utilityData.authData.meters.find(m => m.uid === e.target.value);
                      setSelectedMeter(meter);
                    }}
                    className={selectClass}
                  >
                    {utilityData.authData.meters.map((meter) => (
                      <option key={meter.uid} value={meter.uid}>
                        {meter.service_class?.toUpperCase() || 'METER'} - {meter.meter_numbers?.[0] || meter.uid}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {(selectedMeter || utilityData.authData.meters[0]) && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Meter UID:</span> {(selectedMeter || utilityData.authData.meters[0]).uid}
                  </p>
                  {(selectedMeter || utilityData.authData.meters[0]).meter_numbers && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Meter Numbers:</span> {(selectedMeter || utilityData.authData.meters[0]).meter_numbers.join(', ')}
                    </p>
                  )}
                  {(selectedMeter || utilityData.authData.meters[0]).service_address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Service Address:</span> {(selectedMeter || utilityData.authData.meters[0]).service_address}
                    </p>
                  )}
                  {(selectedMeter || utilityData.authData.meters[0]).service_class && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Service Class:</span> {(selectedMeter || utilityData.authData.meters[0]).service_class}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-[#039994] rounded-md p-4 mt-4">
              <p className="text-sm text-gray-600">No meter data available</p>
            </div>
          )}

          {/* Is this the same solar installation's location? */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-700">
              Is this the same solar installation's location?
            </span>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="yes"
                  checked={isSameLocation === 'yes'}
                  onChange={() => setIsSameLocation('yes')}
                  className="form-radio custom-radio"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="no"
                  checked={isSameLocation === 'no'}
                  onChange={() => setIsSameLocation('no')}
                  className="form-radio custom-radio"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleSubmit}
            className={`${buttonPrimary} mt-6`}
          >
            Next
          </button>

          {/* Terms and Conditions & Privacy Policy */}
          <div className={termsTextContainer}>
            By clicking on 'Next', you agree to our{' '}
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