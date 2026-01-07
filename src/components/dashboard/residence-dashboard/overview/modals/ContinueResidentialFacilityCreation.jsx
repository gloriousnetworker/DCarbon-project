import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import InstapullAuthorizationModal from "../InstapullAuthorizationModal";

export default function ResidentialFacilityModal({ isOpen, onClose, currentStep }) {
  const [userFacilities, setUserFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [selectedUtilityProvider, setSelectedUtilityProvider] = useState(null);
  const [showInstapullAuthModal, setShowInstapullAuthModal] = useState(false);
  const [instapullOpened, setInstapullOpened] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison', 'PG&E', 'SCE', 'SDG&E'];

  useEffect(() => {
    if (isOpen) {
      setShowMainModal(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      setUserId(userId);
      setAuthToken(authToken);
      
      if (userId && authToken) {
        fetchUserFacilities(userId, authToken);
      }
    } else {
      setShowMainModal(false);
    }
  }, [isOpen]);

  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const openInstapullTab = () => {
    const newTab = window.open('https://main.instapull.io/authorize/dcarbonsolutions/', '_blank');
    if (newTab) {
      setInstapullOpened(true);
      toast.success('Instapull opened in new tab');
    } else {
      toast.error('Please allow pop-ups for this site to open Instapull');
    }
  };

  const fetchUserFacilities = async (userId, authToken) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.status === 'success' && data.data?.facilities) {
        const facilities = data.data.facilities;
        const pendingFacilities = facilities.filter(facility => 
          facility.status && facility.status.toLowerCase() === 'pending'
        );
        setUserFacilities(pendingFacilities);
        if (pendingFacilities.length > 0) {
          setSelectedFacility(pendingFacilities[0].id);
        }
      } else {
        setUserFacilities([]);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setUserFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueRegistration = () => {
    const facility = userFacilities.find(f => f.id === selectedFacility);
    if (facility) {
      setSelectedUtilityProvider(facility.utilityProvider);
      openInstapullTab();
      setShowMainModal(false);
      setShowInstapullAuthModal(true);
    }
  };

  const closeAllModals = () => {
    setShowMainModal(false);
    setShowInstapullAuthModal(false);
    onClose();
  };

  if (!isOpen && !showInstapullAuthModal && !showMainModal) return null;

  return (
    <>
      {showMainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={closeAllModals}
              className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
                  Continue Pending Registrations
                </h2>

                <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                  <div className="h-1 bg-[#039994] rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="text-right mb-6">
                  <span className="text-[12px] font-medium text-gray-500 font-sfpro">4/5</span>
                </div>

                {loading && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                )}

                {!loading && userFacilities.length > 0 && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                    <div className="font-sfpro font-[600] text-[14px] text-blue-700 mb-2">
                      Existing Facilities ({userFacilities.length})
                    </div>
                    <select 
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm font-sfpro mb-3"
                    >
                      {userFacilities.map((facility) => {
                        const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
                        return (
                          <option key={facility.id} value={facility.id} className={isGreenButton ? "text-green-600 font-medium" : ""}>
                            {facility.nickname || facility.facilityName} - {facility.utilityProvider}
                            {isGreenButton && " ✓"}
                          </option>
                        );
                      })}
                    </select>
                    {selectedFacility && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border text-xs font-sfpro mb-3">
                        {userFacilities.find(f => f.id === selectedFacility)?.status && (
                          <p>Status: <span className="font-semibold">{userFacilities.find(f => f.id === selectedFacility)?.status}</span></p>
                        )}
                        {isGreenButtonUtility(userFacilities.find(f => f.id === selectedFacility)?.utilityProvider) && (
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1 flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-green-600 font-medium">Green Button Utility</span>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleContinueRegistration}
                      disabled={loading || !selectedFacility}
                      className={`w-full rounded-md border border-green-500 bg-white text-green-500 font-semibold py-3 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro text-[14px] ${
                        loading || !selectedFacility
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      Continue Registration
                    </button>
                  </div>
                )}

                {!loading && userFacilities.length === 0 && (
                  <div className="border border-gray-300 rounded-lg p-6 bg-white mb-4 text-center">
                    <div className="text-gray-500 mb-3">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="font-sfpro text-[14px] font-medium text-gray-600">No pending registrations found.</p>
                      <p className="font-sfpro text-[12px] text-gray-500 mt-1">Click "Add Residential Facility" to start a new registration.</p>
                    </div>
                    <button
                      onClick={closeAllModals}
                      className="mt-3 rounded-md border border-[#039994] text-[#039994] font-semibold py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                    >
                      Close
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                  <span>Terms and Conditions</span>
                  <span className="mx-2">&</span>
                  <span>Privacy Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInstapullAuthModal && (
        <InstapullAuthorizationModal
          isOpen={showInstapullAuthModal}
          onClose={() => {
            setShowInstapullAuthModal(false);
            onClose();
          }}
          utilityProvider={selectedUtilityProvider}
          instapullOpened={instapullOpened}
          openInstapullTab={openInstapullTab}
          userId={userId}
        />
      )}
    </>
  );
}