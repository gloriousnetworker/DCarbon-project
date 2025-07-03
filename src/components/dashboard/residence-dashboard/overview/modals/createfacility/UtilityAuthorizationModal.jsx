import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AddResidentialFacilityModal from './AddResidentialFacilityModal';
import {
  buttonPrimary,
  spinnerOverlay,
  spinner,
  labelClass,
  inputClass,
  termsTextContainer
} from '../../styles.js';

export default function UtilityAuthorizationModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [hasAuthorizedUtility, setHasAuthorizedUtility] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showProviderRequest, setShowProviderRequest] = useState(false);
  const [newProviderData, setNewProviderData] = useState({
    name: '',
    website: '',
    documentation: 'NA'
  });
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
  const [totalSteps] = useState(4);

  const baseUrl = 'https://services.dcarbon.solutions';

  useEffect(() => {
    if (isOpen && !hasAuthorizedUtility) {
      fetchUtilityProviders();
    }
    if (isOpen && hasAuthorizedUtility) {
      fetchAuthorizedUtilities();
    }
  }, [isOpen, hasAuthorizedUtility]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  const fetchUtilityProviders = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/utility-providers`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUtilityProviders(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch utility providers');
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
        const validUtilities = data.data.filter(utility => 
          utility.status === 'UPDATED' && 
          utility.verificationToken && 
          utility.meters && 
          utility.meters.meters && 
          utility.meters.meters.length > 0
        );
        setAuthorizedUtilities(validUtilities);
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
        if (utility && utility.meters && utility.meters.meters) {
          setVerifiedFacilities(utility.meters.meters);
          setCurrentStep(3);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch user meters');
    }
  };

  const handleUtilityAuthChange = (value) => {
    setHasAuthorizedUtility(value);
    setCurrentStep(1);
    if (!value) {
      setUtilityAuthEmail('');
      setSelectedUtilityAuth('');
      setVerifiedFacilities([]);
      setSelectedFacilities([]);
    } else {
      setSelectedProvider('');
    }
  };

  const handleProviderRequest = async () => {
    if (!newProviderData.name || !newProviderData.website) {
      toast.error('Please fill in provider name and website');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/utility-providers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProviderData)
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Utility provider request submitted successfully');
        setShowProviderRequest(false);
        setNewProviderData({ name: '', website: '', documentation: 'NA' });
        await fetchUtilityProviders();
      } else {
        toast.error('Failed to submit provider request');
      }
    } catch (error) {
      toast.error('Failed to submit provider request');
    } finally {
      setLoading(false);
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
          setCurrentStep(3);
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
    
    if (hasAuthorizedUtility) {
      if (!selectedUtilityAuth) {
        toast.error('Please select a utility authorization email');
        return;
      }
      if (selectedFacilities.length === 0) {
        toast.error('Please select at least one facility');
        return;
      }
    } else {
      if (!selectedProvider) {
        toast.error('Please select a utility provider');
        return;
      }
      if (!utilityAuthEmail) {
        toast.error('Please enter your utility authorization email');
        return;
      }
    }

    setCurrentStep(4);
    setShowFacilityModal(true);
  };

  const handleFacilityModalClose = () => {
    setShowFacilityModal(false);
    onClose();
  };

  const handleBackToUtilityAuth = () => {
    setShowFacilityModal(false);
  };

  const displayedFacilities = showAllFacilities ? verifiedFacilities : verifiedFacilities.slice(0, 3);

  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">Utility Authorization Portal</h3>
            <button
              onClick={() => setShowIframe(false)}
              className="text-red-500 hover:text-red-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Step 2:</strong> Enter the email of your DCarbon account you are authorizing for, then choose your utility provider.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Step 3:</strong> Enter your Utility Account credentials and authorize access when prompted.
            </p>
          </div>
          <iframe
            src={iframeUrl}
            className="w-full h-full"
            title="Utility Authorization"
          />
        </div>
      </div>
    );
  }

  if (showFacilityModal) {
    return (
      <AddResidentialFacilityModal 
        isOpen={true}
        onClose={handleFacilityModalClose}
        onBack={handleBackToUtilityAuth}
        selectedMeters={selectedFacilities}
        utilityAuthEmail={hasAuthorizedUtility ? selectedUtilityAuth : utilityAuthEmail}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
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
              onClick={onClose}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`${labelClass} text-sm mb-4 block`}>
                  Is your DCarbon account able to fetch meters from Utility API?
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
                    <label className={`${labelClass} text-sm mb-2 block`}>
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
                      className={`${inputClass} text-sm w-full`}
                    >
                      <option value="">Select Email</option>
                      {authorizedUtilities.map((utility) => (
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
                          const selectedUtility = authorizedUtilities.find(u => u.id === selectedUtilityAuth);
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
                <>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Step 1:</strong> Select your Utility Provider from the list below.
                      </p>
                    </div>
                    <div>
                      <label className={`${labelClass} text-sm mb-2 block`}>
                        Utility Provider
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className={`${inputClass} text-sm w-full`}
                      >
                        <option value="">Select Provider</option>
                        {utilityProviders.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => setShowProviderRequest(!showProviderRequest)}
                        className="text-[#039994] text-sm font-medium hover:underline mt-2"
                      >
                        Utility Provider not listed?
                      </button>

                      {showProviderRequest && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Request New Provider</h4>
                          <input
                            type="text"
                            placeholder="Provider Name"
                            value={newProviderData.name}
                            onChange={(e) => setNewProviderData({...newProviderData, name: e.target.value})}
                            className={`${inputClass} text-sm w-full`}
                          />
                          <input
                            type="url"
                            placeholder="Website URL"
                            value={newProviderData.website}
                            onChange={(e) => setNewProviderData({...newProviderData, website: e.target.value})}
                            className={`${inputClass} text-sm w-full`}
                          />
                          <input
                            type="text"
                            placeholder="Documentation (optional)"
                            value={newProviderData.documentation}
                            onChange={(e) => setNewProviderData({...newProviderData, documentation: e.target.value})}
                            className={`${inputClass} text-sm w-full`}
                          />
                          <button
                            type="button"
                            onClick={handleProviderRequest}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-[#039994] text-white text-sm font-medium rounded-lg hover:bg-[#02857f] transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Submitting...' : 'Submit Request'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Step 2:</strong> Enter the email used in your Utility Account to fetch meters from Utility API.
                      </p>
                    </div>
                    <div>
                      <label className={`${labelClass} text-sm mb-2 block`}>
                        Utility authorization email
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={utilityAuthEmail}
                          onChange={(e) => setUtilityAuthEmail(e.target.value)}
                          placeholder="Email address"
                          className={`${inputClass} flex-1 text-sm`}
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
                </>
              )}

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${buttonPrimary} w-full py-3 text-white font-medium rounded-lg transition-colors`}
                >
                  {loading ? 'Processing...' : 'Add Residential Facility'}
                </button>
                
                <div className={termsTextContainer}>
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