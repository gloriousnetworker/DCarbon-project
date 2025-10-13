import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AddResidentialFacilityModal from './AddResidentialFacilityModal';

export default function UtilityAuthorizationModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [hasAuthorizedUtility, setHasAuthorizedUtility] = useState(false);
  const [utilityAuthEmail, setUtilityAuthEmail] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [authorizedUtilities, setAuthorizedUtilities] = useState([]);
  const [selectedUtilityAuth, setSelectedUtilityAuth] = useState('');
  const [verifiedFacilities, setVerifiedFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(3);
  const [meterFetchInterval, setMeterFetchInterval] = useState(null);
  const [userMetersData, setUserMetersData] = useState([]);
  const [hasValidMeters, setHasValidMeters] = useState(false);
  const [utilityStatus, setUtilityStatus] = useState('');
  const [scale, setScale] = useState(1);

  const baseUrl = 'https://services.dcarbon.solutions';

  useEffect(() => {
    if (isOpen && hasAuthorizedUtility) {
      fetchAuthorizedUtilities();
      checkUserMeters();
    }
  }, [isOpen, hasAuthorizedUtility]);

  useEffect(() => {
    return () => {
      if (meterFetchInterval) {
        clearInterval(meterFetchInterval);
      }
    };
  }, [meterFetchInterval]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  const checkUserMeters = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/user-meters/${getUserId()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setUserMetersData(data.data);
        const hasMeters = data.data.some(utility => 
          utility.meters && 
          utility.meters.meters && 
          utility.meters.meters.length > 0
        );
        setHasValidMeters(hasMeters);
        if (data.data.length > 0) {
          setUtilityStatus(data.data[0].status || '');
        }
      } else {
        setUserMetersData([]);
        setHasValidMeters(false);
        setUtilityStatus('');
      }
    } catch (error) {
      setUserMetersData([]);
      setHasValidMeters(false);
      setUtilityStatus('');
    }
  };

  const fetchAuthorizedUtilities = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/utility-auth/${getUserId()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAuthorizedUtilities(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch authorized utilities');
    }
  };

  const fetchUserMeters = async (utilityId) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/user-meters/${getUserId()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const utility = data.data.find(u => u.id === utilityId);
        if (utility) {
          setUtilityStatus(utility.status || '');
          if (utility.meters && utility.meters.meters && utility.meters.meters.length > 0) {
            setVerifiedFacilities(utility.meters.meters);
            setHasValidMeters(true);
            if (meterFetchInterval) {
              clearInterval(meterFetchInterval);
              setMeterFetchInterval(null);
            }
          } else {
            setHasValidMeters(false);
            startMeterFetchInterval(utilityId);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to fetch user meters');
      setHasValidMeters(false);
    }
  };

  const startMeterFetchInterval = (utilityId) => {
    if (meterFetchInterval) {
      clearInterval(meterFetchInterval);
    }
    const interval = setInterval(() => {
      fetchUserMeters(utilityId);
    }, 5000);
    setMeterFetchInterval(interval);
  };

  const handleUtilityAuthChange = (value) => {
    setHasAuthorizedUtility(value);
    setCurrentStep(1);
    if (!value) {
      setUtilityAuthEmail('');
      setSelectedUtilityAuth('');
      setVerifiedFacilities([]);
      setSelectedFacilities([]);
      setHasValidMeters(false);
    } else {
      checkUserMeters();
    }
  };

  const handleVerifyEmail = async () => {
    if (!utilityAuthEmail) {
      toast.error('Please enter your utility authorization email');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initiating utility authorization...');

    try {
      const response = await fetch(`${baseUrl}/api/auth/initiate-utility-auth/${getUserId()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          utilityAuthEmail: utilityAuthEmail
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Utility authorization initiated successfully!', { id: toastId });
        setIframeUrl('https://utilityapi.com/authorize/DCarbon_Solutions');
        setShowIframe(true);
        setCurrentStep(2);
        setScale(1);
      } else {
        toast.error('Failed to initiate utility authorization', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to initiate utility authorization', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUtilityAuth = async (verificationToken) => {
    setLoading(true);
    const toastId = toast.loading('Verifying utility authorization...');

    try {
      const response = await fetch(`${baseUrl}/api/auth/check-utility-auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: verificationToken
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(data.message, { id: toastId });
        if (data.data && data.data.meters && data.data.meters.meters) {
          setVerifiedFacilities(data.data.meters.meters);
          setHasValidMeters(true);
          setCurrentStep(3);
        } else {
          const selectedUtility = userMetersData.find(u => u.id === selectedUtilityAuth);
          if (selectedUtility) {
            startMeterFetchInterval(selectedUtilityAuth);
          }
        }
      } else {
        toast.error('Verification failed', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to verify utility authorization', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitySelection = (facilityUid, isSelected) => {
    if (isSelected) {
      setSelectedFacilities(prev => [...prev, facilityUid]);
    } else {
      setSelectedFacilities(prev => prev.filter(uid => uid !== facilityUid));
    }
  };

  const handleIframeMessage = (event) => {
    if (event.data && event.data.type === 'utility-auth-complete') {
      setShowIframe(false);
      toast.success('Utility authorization completed successfully!');
      fetchAuthorizedUtilities();
      setCurrentStep(3);
      checkUserMeters();
    }
  };

  useEffect(() => {
    if (showIframe) {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [showIframe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowFacilityModal(true);
  };

  const handleFacilityModalClose = () => {
    setShowFacilityModal(false);
    onClose();
    window.location.reload();
  };

  const handleIframeClose = () => {
    setShowIframe(false);
    setScale(1);
    onClose();
    window.location.reload();
  };

  const handleMainModalClose = () => {
    onClose();
    window.location.reload();
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const displayedFacilities = showAllFacilities ? verifiedFacilities : verifiedFacilities.slice(0, 3);

  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">Utility Authorization Portal</h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={zoomOut}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale <= 0.5}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom Out
                </button>
                <button
                  onClick={resetZoom}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21V9M21 3L15 9M9 21H3V15M3 21L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset
                </button>
                <button
                  onClick={zoomIn}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale >= 3}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom In
                </button>
              </div>
              <button
                onClick={handleIframeClose}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Step 1:</strong> Enter the email of your DCarbon account you are authorizing for.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Step 2:</strong> Enter the credentials (username and password) you use to login to your utility billing portal. This data is secure and not stored on our servers per utility regulations.
            </p>
          </div>

          <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg overflow-auto">
              <div 
                className="w-full h-full origin-top-left"
                style={{ 
                  transform: `scale(${scale})`,
                  width: `${100/scale}%`,
                  height: `${100/scale}%`
                }}
              >
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title="Utility Authorization"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-sm text-gray-600">
              Use scroll to navigate when zoomed in
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (showFacilityModal) {
    return (
      <AddResidentialFacilityModal 
        isOpen={true}
        onClose={handleFacilityModalClose}
        selectedMeters={selectedFacilities}
        utilityAuthEmail={hasAuthorizedUtility ? selectedUtilityAuth : utilityAuthEmail}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-8 h-8 border-4 border-[#039994] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="relative p-6 pb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-6 top-6 text-[#039994] hover:text-[#02857f]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            <button
              onClick={handleMainModalClose}
              className="absolute top-6 right-6 text-red-500 hover:text-red-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mt-8 text-center">
              Utility Authorization
            </h2>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center">
                <div className="w-96 h-1 bg-gray-200 rounded-full mr-2">
                  <div className="h-1 bg-[#039994] rounded-full" style={{ width: `${(currentStep/totalSteps)*100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-500 font-sfpro">{currentStep}/{totalSteps}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {hasValidMeters ? (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <strong>Success!</strong> Meters have been successfully fetched. You can now generate facilities.
                </p>
              </div>
            ) : utilityStatus && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  <strong>Status:</strong> {utilityStatus}. {utilityStatus === 'INITIATED' ? 'Please complete the authorization process.' : 'Waiting for meters to be fetched...'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Have you already connected your utility account to DCarbon previously?
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasAuthorizedUtility"
                      checked={hasAuthorizedUtility === true}
                      onChange={() => handleUtilityAuthChange(true)}
                      className="w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] accent-[#039994]"
                    />
                    <span className="ml-2 text-sm font-sfpro text-[#1E1E1E]">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasAuthorizedUtility"
                      checked={hasAuthorizedUtility === false}
                      onChange={() => handleUtilityAuthChange(false)}
                      className="w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] accent-[#039994]"
                    />
                    <span className="ml-2 text-sm font-sfpro text-[#1E1E1E]">No</span>
                  </label>
                </div>
              </div>

              {hasAuthorizedUtility ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>All you need to do:</strong> Select the email and fetch the meters associated with the account, then proceed to generating your facility.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Utility authorization email
                    </label>
                    <select
                      value={selectedUtilityAuth}
                      onChange={(e) => {
                        setSelectedUtilityAuth(e.target.value);
                        setVerifiedFacilities([]);
                        setSelectedFacilities([]);
                        setShowAllFacilities(false);
                        fetchUserMeters(e.target.value);
                      }}
                      className="block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994]"
                    >
                      <option value="">Select Email</option>
                      {userMetersData.map((utility) => (
                        <option key={utility.id} value={utility.id}>
                          {utility.utilityAuthEmail}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUtilityAuth && verifiedFacilities.length === 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const selectedUtility = userMetersData.find(u => u.id === selectedUtilityAuth);
                          if (selectedUtility) {
                            handleVerifyUtilityAuth(selectedUtility.verificationToken);
                          }
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-[#039994] text-white text-sm font-medium rounded-lg hover:bg-[#02857f] transition-colors disabled:opacity-50"
                      >
                        Fetch Meters
                      </button>
                    </div>
                  )}

                  {verifiedFacilities.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-[#039994] mb-4">Facilities</h3>
                      <div className="space-y-4">
                        {displayedFacilities.map((meter) => (
                          <div key={meter.uid} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                  Meter ID: {meter.uid}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Meter Numbers: {meter.base?.meter_numbers?.join(', ') || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div><strong>Service Class:</strong> {meter.base?.service_class || 'N/A'}</div>
                                  <div><strong>Service Tariff:</strong> {meter.base?.service_tariff || 'N/A'}</div>
                                  <div><strong>Billing Address:</strong> {meter.base?.billing_address || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                  I agree to the Terms of Agreement
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFacilitySelection(meter.uid, !selectedFacilities.includes(meter.uid));
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center 
                                    ${selectedFacilities.includes(meter.uid) ? 'bg-[#039994] border-[#039994]' : 'border-gray-300'}`}
                                >
                                  {selectedFacilities.includes(meter.uid) && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {verifiedFacilities.length > 3 && !showAllFacilities && (
                        <div className="text-center mt-4">
                          <button
                            type="button"
                            onClick={() => setShowAllFacilities(true)}
                            className="text-[#039994] text-sm font-medium hover:underline"
                          >
                            View more facilities
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Step 1:</strong> Enter the email used in signing up with DCarbon to connect and fetch meters from Utility API.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DCarbon Email
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={utilityAuthEmail}
                        onChange={(e) => setUtilityAuthEmail(e.target.value)}
                        placeholder="Email address"
                        className="flex-1 block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={loading || !utilityAuthEmail}
                        className="px-4 py-2 bg-[#039994] text-white text-sm font-medium rounded-lg hover:bg-[#02857f] transition-colors disabled:opacity-50"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={loading || !hasValidMeters}
                  className={`w-full py-3 bg-[#039994] text-white font-medium rounded-lg transition-colors hover:bg-[#02857f] disabled:opacity-50`}
                >
                  {loading ? 'Processing...' : 'Add Residential Facility'}
                </button>
                
                <div className="mt-2">
                  <p className="text-xs text-center text-gray-500">
                    <a href="#" className="underline hover:no-underline">Terms and Conditions</a>
                    {' • '}
                    <a href="#" className="underline hover:no-underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}