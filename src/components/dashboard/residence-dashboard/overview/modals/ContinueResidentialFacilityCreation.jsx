import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import InstapullAuthorizationModal from "./InstapullAuthorizationModal";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4',
  modal: 'relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col',
  modalHeader: 'p-6',
  modalTitle: 'font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2',
  closeButton: 'absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700',
  formWrapper: 'w-full space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  progressContainer: 'w-full flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/3 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  loadingContainer: 'flex flex-col items-center justify-center py-12',
  loadingSpinner: 'w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4',
  loadingText: 'text-gray-600 font-sfpro',
  emptyStateContainer: 'text-center py-8',
  emptyStateIcon: 'w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center',
  emptyStateTitle: 'font-[600] text-[16px] text-gray-800 font-sfpro mb-2',
  emptyStateText: 'text-sm text-gray-600 max-w-md mx-auto mb-6 font-sfpro',
  facilityInfoBox: 'mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50',
  gridContainer: 'grid grid-cols-1 md:grid-cols-2 gap-3 mb-3',
  infoLabel: 'text-xs text-gray-500 mb-1 font-sfpro',
  infoValue: 'text-sm font-medium text-gray-800 font-sfpro',
  statusBadgeGreen: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-sfpro',
  statusBadgeYellow: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-sfpro',
  statusBadgeGray: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-sfpro',
  facilityCount: 'font-[600] text-[16px] text-gray-800 font-sfpro mb-4',
  termsTextContainer: 'mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]',
  greenButtonBadge: 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-sfpro'
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

  useEffect(() => {
    if (isOpen) {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      setUserId(userId);
      setAuthToken(authToken);
      
      if (userId && authToken) {
        fetchUserFacilities(userId, authToken);
      }
    }
  }, [isOpen]);

  const isGreenButtonUtility = (utilityProvider) => {
    const greenButtonKeywords = ['green button connect', 'green button', 'san diego gas and electric', 'southern california edison', 'pacific gas and electric', 'PG&E', 'SCE', 'SDG&E'];
    const nameLower = utilityProvider.toLowerCase();
    return greenButtonKeywords.some(keyword => nameLower.includes(keyword));
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
      setShowInstapullAuthModal(true);
    }
  };

  const getFacilityStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active') return <span className={styles.statusBadgeGreen}>Active</span>;
    if (statusLower === 'pending') return <span className={styles.statusBadgeYellow}>Pending</span>;
    if (statusLower === 'inactive') return <span className={styles.statusBadgeGray}>Inactive</span>;
    return <span className={styles.statusBadgeGreen}>Draft</span>;
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
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBarActive} style={{ width: '75%' }}></div>
                  </div>
                  <span className={styles.progressStepText}>04/05</span>
                </div>

                {loading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p className={styles.loadingText}>Loading your facilities...</p>
                  </div>
                )}

                {!loading && userFacilities.length > 0 && (
                  <div className={styles.formWrapper}>
                    <div>
                      <h3 className={styles.facilityCount}>
                        Existing Facilities ({userFacilities.length})
                      </h3>
                      <div className="mb-6">
                        <select 
                          value={selectedFacility}
                          onChange={(e) => setSelectedFacility(e.target.value)}
                          className={styles.selectClass}
                        >
                          {userFacilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {facility.facilityName || 'Residential Facility'} - {facility.utilityProvider}
                            </option>
                          ))}
                        </select>

                        {selectedFacility && (
                          <div className={styles.facilityInfoBox}>
                            {userFacilities.map((facility) => {
                              if (facility.id === selectedFacility) {
                                return (
                                  <div key={facility.id}>
                                    <div className={styles.gridContainer}>
                                      <div>
                                        <p className={styles.infoLabel}>Facility Name</p>
                                        <p className={styles.infoValue}>{facility.facilityName}</p>
                                      </div>
                                      <div>
                                        <p className={styles.infoLabel}>Utility Provider</p>
                                        <div className="flex items-center gap-2">
                                          <p className={styles.infoValue}>{facility.utilityProvider}</p>
                                          {isGreenButtonUtility(facility.utilityProvider) && (
                                            <span className={styles.greenButtonBadge}>
                                              Green Button
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className={styles.infoLabel}>Status</p>
                                        <div className="flex items-center gap-2">
                                          {getFacilityStatusBadge(facility.status)}
                                        </div>
                                      </div>
                                      <div>
                                        <p className={styles.infoLabel}>Finance Type</p>
                                        <p className={styles.infoValue}>{facility.financeType}</p>
                                      </div>
                                      <div className="md:col-span-2">
                                        <p className={styles.infoLabel}>Address</p>
                                        <p className={styles.infoValue}>{facility.address}</p>
                                      </div>
                                      <div>
                                        <p className={styles.infoLabel}>Installation Date</p>
                                        <p className={styles.infoValue}>
                                          {new Date(facility.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className={styles.infoLabel}>Meter ID</p>
                                        <p className={styles.infoValue}>{facility.meterId}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleContinueRegistration}
                        disabled={!selectedFacility}
                        className={styles.buttonPrimary}
                      >
                        Continue Registration
                      </button>
                    </div>
                  </div>
                )}

                {!loading && userFacilities.length === 0 && (
                  <div className={styles.emptyStateContainer}>
                    <div className={styles.emptyStateIcon}>
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className={styles.emptyStateTitle}>
                      No Pending Facilities Found
                    </h4>
                    <p className={styles.emptyStateText}>
                      You don't have any pending residential facilities to continue registration with.
                    </p>
                  </div>
                )}

                <div className={styles.termsTextContainer}>
                  <span>Terms and Conditions</span>
                  <span className="mx-2">•</span>
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
