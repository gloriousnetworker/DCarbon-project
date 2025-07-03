import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AddCommercialFacilityModal from './AddCommercialFacilityModal';

const buttonPrimary = "bg-[#039994] hover:bg-[#02857f] text-white font-medium py-2 px-4 rounded-lg transition-colors";
const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50";
const spinner = "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]";
const labelClass = "block text-sm font-medium text-gray-700";
const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#039994] focus:ring focus:ring-[#039994] focus:ring-opacity-50 p-2 border";
const termsTextContainer = "mt-4 text-center";

export default function UtilityAuthorizationModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
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
  const [verifiedFacilities, setVerifiedFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [isLoadingOwner, setIsLoadingOwner] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);

  const baseUrl = 'https://services.dcarbon.solutions';

  useEffect(() => {
    if (isOpen) {
      fetchOwnerData();
      fetchUtilityProviders();
    }
  }, [isOpen]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getUserId = () => {
    return localStorage.getItem('userId');
  };

  const fetchOwnerData = async () => {
    try {
      const referralResponse = JSON.parse(localStorage.getItem('referralResponse'));
      if (!referralResponse || !referralResponse.data || !referralResponse.data.inviterId) {
        throw new Error('Owner information not found');
      }

      const inviterId = referralResponse.data.inviterId;
      const authToken = getAuthToken();

      const response = await fetch(
        `${baseUrl}/api/user/get-commercial-user/${inviterId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch owner data');
      }

      setOwnerData(data.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load owner data');
    } finally {
      setIsLoadingOwner(false);
    }
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

  const fetchUserMeters = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/user-meters/${getUserId()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        const utility = data.data.find(u => u.utilityAuthEmail === utilityAuthEmail);
        if (utility && utility.meters && utility.meters.meters) {
          setVerifiedFacilities(utility.meters.meters);
          setCurrentStep(3);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch user meters');
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

  const handleVerifyUtilityAuth = async () => {
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
          email: utilityAuthEmail
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
      fetchUserMeters();
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
    
    if (!selectedProvider) {
      toast.error('Please select a utility provider');
      return;
    }
    if (!utilityAuthEmail) {
      toast.error('Please enter your utility authorization email');
      return;
    }
    if (verifiedFacilities.length > 0 && selectedFacilities.length === 0) {
      toast.error('Please select at least one facility');
      return;
    }

    setCurrentStep(4);
    setShowFacilityModal(true);
  };

  const handleFacilityModalClose = () => {
    setShowFacilityModal(false);
    onClose();
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
      <AddCommercialFacilityModal 
        isOpen={true}
        onClose={handleFacilityModalClose}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {(loading || isLoadingOwner) && (
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
            {ownerData && (
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-sfpro font-[600] text-[16px] mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Full Name</p>
                    <p className="font-sfpro text-[14px]">{ownerData.commercialUser?.ownerFullName || `${ownerData.firstName} ${ownerData.lastName}`}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Email</p>
                    <p className="font-sfpro text-[14px]">{ownerData.email}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Phone Number</p>
                    <p className="font-sfpro text-[14px]">{ownerData.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Address</p>
                    <p className="font-sfpro text-[14px]">{ownerData.commercialUser?.ownerAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Commercial Role</p>
                    <p className="font-sfpro text-[14px] capitalize">{ownerData.commercialUser?.commercialRole || 'owner'}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Entity Type</p>
                    <p className="font-sfpro text-[14px] capitalize">{ownerData.commercialUser?.entityType || 'individual'}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    onClick={verifiedFacilities.length > 0 ? handleVerifyUtilityAuth : handleVerifyEmail}
                    disabled={loading || !utilityAuthEmail}
                    className="px-4 py-2 bg-[#039994] text-white text-sm font-medium rounded-lg hover:bg-[#02857f] transition-colors disabled:opacity-50"
                  >
                    {verifiedFacilities.length > 0 ? 'Verify Again' : 'Authorize'}
                  </button>
                </div>
              </div>

              {verifiedFacilities.length > 0 && (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Step 3:</strong> Select the facilities you want to add to your DCarbon account.
                    </p>
                  </div>
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
                </>
              )}

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${buttonPrimary} w-full py-3 text-white font-medium rounded-lg transition-colors`}
                >
                  {loading ? 'Processing...' : 'Add Commercial Facility'}
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