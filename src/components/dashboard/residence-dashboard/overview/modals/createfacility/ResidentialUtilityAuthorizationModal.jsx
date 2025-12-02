import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ResidentialUtilityAuthorizationModal({ isOpen, onClose }) {
  const [scale, setScale] = useState(1);
  const [greenButtonEmail, setGreenButtonEmail] = useState('');
  const [submittingGreenButton, setSubmittingGreenButton] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison'];

  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const getUtilityUrl = (utilityName) => {
    const utilityUrls = {
      'PG&E': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'Pacific Gas and Electric': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'San Diego Gas and Electric': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SDG&E': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SCE': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US',
      'Southern California Edison': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US'
    };
    
    return utilityUrls[utilityName] || 'https://utilityapi.com/authorize/DCarbon_Solutions';
  };

  const fetchUserFacilities = async () => {
    try {
      setLoading(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const token = loginResponse?.data?.token;

      if (!userId || !token) {
        toast.error('Authentication required');
        return;
      }

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.status === 'success' && response.data.data?.facilities) {
        const userFacilities = response.data.data.facilities;
        setFacilities(userFacilities);
        
        if (userFacilities.length > 0) {
          const pendingFacility = userFacilities.find(f => 
            !f.meterIds || 
            f.meterIds.length === 0 || 
            (f.status && f.status.toLowerCase() === 'pending')
          );
          
          if (pendingFacility) {
            setSelectedFacility(pendingFacility);
          } else {
            setSelectedFacility(userFacilities[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleGreenButtonSubmit = async () => {
    if (!greenButtonEmail.trim()) {
      toast.error('Please enter the email address used for Green Button authorization');
      return;
    }

    setSubmittingGreenButton(true);
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const token = loginResponse?.data?.token;
      const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail || '';

      const payload = {
        email: userEmail,
        userType: "RESIDENTIAL",
        utilityType: selectedFacility?.utilityProvider,
        authorizationEmail: greenButtonEmail.trim()
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/utility-auth/green-button`,
        payload,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.message) {
        toast.success(response.data.message);
        setTimeout(() => {
          setGreenButtonEmail('');
          onClose();
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit Green Button authorization');
    } finally {
      setSubmittingGreenButton(false);
    }
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    if (selectedFacility) {
      const url = getUtilityUrl(selectedFacility.utilityProvider);
      window.open(url, '_blank');
    }
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

  const handleIframeClose = () => {
    onClose();
    window.location.reload();
  };

  const authorizeFacility = (facility) => {
    setSelectedFacility(facility);
    
    const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
    if (isGreenButton) {
      setShowVideoModal(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserFacilities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const VideoModal = ({ isOpen, onClose, facility, onVideoComplete }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                {facility?.utilityProvider} Authorization Instructions
              </h2>
              <button onClick={onClose} className="text-red-500 hover:text-red-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                <strong>Important:</strong> Please watch this instructional video to understand how to complete the {facility?.utilityProvider} authorization process.
              </p>
              
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-lg font-semibold">Instructional Video</p>
                  <p className="text-sm opacity-75">Video demonstration for {facility?.utilityProvider}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated time: 2-3 minutes</span>
                <span>Mandatory viewing</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                Back
              </button>
              <button
                onClick={onVideoComplete}
                className="flex-1 rounded-md text-white font-semibold py-3 bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                I've Watched the Video - Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showVideoModal) {
    return (
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        facility={selectedFacility}
        onVideoComplete={handleVideoComplete}
      />
    );
  }

  const isGreenButton = selectedFacility ? isGreenButtonUtility(selectedFacility.utilityProvider) : false;
  const iframeUrl = selectedFacility ? getUtilityUrl(selectedFacility.utilityProvider) : 'https://utilityapi.com/authorize/DCarbon_Solutions';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col ml-16">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#039994]">
            Utility Authorization
          </h3>
          <div className="flex items-center gap-4">
            {!isGreenButton && (
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
            )}
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
        
        <div className={`p-4 border-b ${isGreenButton ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'}`}>
            <strong>Utility Authorization:</strong> Follow the steps to securely share your utility data with DCarbon Solutions.
          </p>
          {selectedFacility && (
            <>
              <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
                <strong>Selected Facility:</strong> {selectedFacility.facilityName || selectedFacility.nickname}
              </p>
              <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
                <strong>Selected Utility:</strong> {selectedFacility.utilityProvider}
              </p>
            </>
          )}
          <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
            <strong>Authorization URL:</strong> {iframeUrl}
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <p className="text-gray-500 mb-4">No facilities found. Please create a facility first.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884]"
              >
                Close
              </button>
            </div>
          </div>
        ) : isGreenButton ? (
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Select a Facility to Authorize</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {facilities.map((facility) => {
                  const isCurrent = selectedFacility?.id === facility.id;
                  const isGreenButtonFacility = isGreenButtonUtility(facility.utilityProvider);
                  return (
                    <div
                      key={facility.id}
                      onClick={() => setSelectedFacility(facility)}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'border-[#039994] bg-[#03999410]' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{facility.facilityName || facility.nickname}</h5>
                          <p className="text-sm text-gray-600">{facility.utilityProvider}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isGreenButtonFacility && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Green Button
                            </span>
                          )}
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#039994] text-white">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-4 border-2 border-green-500 rounded-lg bg-green-50">
              <div className="font-semibold text-green-700 mb-2">Enter Authorization Email</div>
              <div className="text-sm text-green-600 mb-3">
                Please enter the email address you used to authorize Green Button access with {selectedFacility?.utilityProvider}:
              </div>
              <input
                type="email"
                value={greenButtonEmail}
                onChange={(e) => setGreenButtonEmail(e.target.value)}
                placeholder="Enter the email used for Green Button authorization"
                className="w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro mb-2"
              />
              <button
                onClick={handleGreenButtonSubmit}
                disabled={submittingGreenButton || !greenButtonEmail.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro"
              >
                {submittingGreenButton ? 'Submitting...' : 'Submit Authorization Email'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> If you haven't completed the authorization yet, please click the "Authorize Facility" button below to open the utility provider's authorization page in a new tab.
              </p>
              <button
                onClick={() => authorizeFacility(selectedFacility)}
                className="mt-3 px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              >
                Authorize Facility
              </button>
            </div>
          </div>
        ) : (
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
        )}

        {!isGreenButton && !loading && facilities.length > 0 && (
          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-sm text-gray-600">
              Use scroll to navigate when zoomed in
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
