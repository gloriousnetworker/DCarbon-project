import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import InstapullAuthorizationModal from "./InstapullAuthorizationModal";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4',
  modal: 'relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col',
  modalHeader: 'p-6',
  modalTitle: 'font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2',
  closeButton: 'absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700',
  selectClass: 'w-full p-2 border border-gray-300 rounded-md text-sm font-sfpro mb-3',
  buttonPrimary: 'w-full rounded-md border border-green-500 bg-white text-green-500 font-semibold py-3 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro text-[14px]',
  progressContainer: 'w-full h-1 bg-gray-200 rounded-full mb-1',
  progressBarActive: 'h-1 bg-[#039994] rounded-full',
  progressStepText: 'text-right mb-6 text-[12px] font-medium text-gray-500 font-sfpro',
  loadingContainer: 'mb-4 p-3 bg-gray-50 rounded-md border border-gray-200',
  loadingPulse: 'animate-pulse',
  loadingLine1: 'h-4 bg-gray-300 rounded w-3/4 mb-2',
  loadingLine2: 'h-3 bg-gray-300 rounded w-full',
  facilityContainer: 'border border-gray-300 rounded-lg p-4 bg-white mb-4',
  facilityCount: 'font-sfpro font-[600] text-[14px] text-blue-700 mb-2',
  facilityInfo: 'mt-2 p-2 bg-gray-50 rounded border text-xs font-sfpro mb-3',
  emptyStateContainer: 'border border-gray-300 rounded-lg p-6 bg-white mb-4 text-center',
  emptyStateIcon: 'w-12 h-12 mx-auto mb-3 text-gray-400',
  emptyStateText: 'font-sfpro text-[14px] font-medium text-gray-600',
  emptyStateSubtext: 'font-sfpro text-[12px] text-gray-500 mt-1',
  closeButtonSecondary: 'mt-3 rounded-md border border-[#039994] text-[#039994] font-semibold py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]',
  termsContainer: 'mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]'
};

export default function ResidentialFacilityModal({ isOpen, onClose, currentStep }) {
  const [userFacilities, setUserFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [selectedUtilityProvider, setSelectedUtilityProvider] = useState(null);
  const [showInstapullAuthModal, setShowInstapullAuthModal] = useState(false);
  const [instapullOpened, setInstapullOpened] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison', 'PG&E', 'SCE', 'SDG&E'];

  useEffect(() => {
    if (isOpen) {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      setUserId(userId);
      setAuthToken(authToken);
      
      if (userId && authToken) {
        fetchUserFacilities(userId, authToken);
        checkUserProgress(userId, authToken);
      }
    }
  }, [isOpen]);

  const isGreenButtonUtility = (utilityProvider) => {
    if (!utilityProvider) return false;
    return greenButtonUtilities.some(utility => 
      utilityProvider.toLowerCase().includes(utility.toLowerCase())
    );
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

  const checkUserProgress = async (userId, authToken) => {
    try {
      const stageChecks = [
        { stage: 2, check: () => checkStage2Completion(userId, authToken) },
        { stage: 3, check: () => checkStage3Completion(userId, authToken) },
        { stage: 4, check: () => checkStage4Completion(userId, authToken) },
        { stage: 5, check: () => checkStage5Completion(userId, authToken) }
      ];

      let highestCompletedStage = 1;

      for (const { stage, check } of stageChecks) {
        const isCompleted = await check();
        if (isCompleted) {
          highestCompletedStage = stage;
        }
      }

      setCurrentStage(highestCompletedStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage5Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      return false;
    }
  };

  const handleContinueRegistration = () => {
    const facility = userFacilities.find(f => f.id === selectedFacility);
    if (facility) {
      setSelectedUtilityProvider(facility.utilityProvider);
      openInstapullTab();
      setShowInstapullAuthModal(true);
    }
  };

  if (!isOpen && !showInstapullAuthModal) return null;

  return (
    <>
      {isOpen && !showInstapullAuthModal && (
        <div className={styles.modalContainer} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onClose}
              className={styles.closeButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Continue Pending Registrations</h2>

                <div className={styles.progressContainer}>
                  <div className={styles.progressBarActive} style={{ width: `${(currentStage-1)*25}%` }}></div>
                </div>
                <div className={styles.progressStepText}>{currentStage-1}/4</div>

                {loading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingPulse}>
                      <div className={styles.loadingLine1}></div>
                      <div className={styles.loadingLine2}></div>
                    </div>
                  </div>
                )}

                {!loading && userFacilities.length > 0 && (
                  <div className={styles.facilityContainer}>
                    <div className={styles.facilityCount}>
                      Existing Facilities ({userFacilities.length})
                    </div>
                    <select 
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className={styles.selectClass}
                    >
                      {userFacilities.map((facility) => {
                        const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
                        return (
                          <option key={facility.id} value={facility.id} className={isGreenButton ? "text-green-600 font-medium" : ""}>
                            {facility.facilityName || 'Residential Facility'} - {facility.utilityProvider}
                            {isGreenButton && " ✓"}
                          </option>
                        );
                      })}
                    </select>
                    {selectedFacility && (
                      <div className={styles.facilityInfo}>
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
                      disabled={!selectedFacility}
                      className={`${styles.buttonPrimary} ${
                        !selectedFacility
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      Continue Registration
                    </button>
                  </div>
                )}

                {!loading && userFacilities.length === 0 && (
                  <div className={styles.emptyStateContainer}>
                    <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className={styles.emptyStateText}>No pending registrations found.</p>
                    <p className={styles.emptyStateSubtext}>Click "Add Residential Facility" to start a new registration.</p>
                    <button
                      onClick={onClose}
                      className={styles.closeButtonSecondary}
                    >
                      Close
                    </button>
                  </div>
                )}

                <div className={styles.termsContainer}>
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
