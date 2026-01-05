import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import InstapullAuthorizationModal from "./InstapullAuthorizationModal";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm',
  modal: 'relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden',
  modalHeader: 'px-8 pt-8 pb-6 bg-gradient-to-br from-[#039994] to-[#02857f]',
  modalTitle: 'font-[600] text-[28px] leading-[110%] tracking-[-0.05em] text-white font-sans mb-2',
  modalSubtitle: 'text-[15px] text-white text-opacity-90 leading-relaxed',
  closeButton: 'absolute top-6 right-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all',
  modalBody: 'px-8 py-8',
  buttonPrimary: 'w-full rounded-lg bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sans transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  spinner: 'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
  infoBox: 'flex items-start gap-3 p-4 bg-[#039994] bg-opacity-5 border-l-4 border-[#039994] rounded-r-lg mb-6',
  infoIcon: 'flex-shrink-0 w-5 h-5 text-[#039994] mt-0.5',
  cardContainer: 'border-2 border-gray-200 rounded-xl p-6 hover:border-[#039994] hover:shadow-lg transition-all cursor-pointer group',
  iconCircle: 'w-16 h-16 rounded-full bg-[#039994] bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-[#039994] group-hover:bg-opacity-20 transition-all',
  cardTitle: 'font-[600] text-[20px] leading-[110%] tracking-[-0.05em] text-[#1E1E1E] font-sans mb-2',
  cardDescription: 'font-sans text-[14px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-600 mb-6',
  selectClass: 'w-full p-3 border border-gray-300 rounded-lg text-sm font-sans focus:ring-2 focus:ring-[#039994] focus:border-[#039994] outline-none transition-all',
  facilityInfoBox: 'mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50',
  gridContainer: 'grid grid-cols-1 md:grid-cols-2 gap-3 mb-3',
  infoLabel: 'text-xs text-gray-500 mb-1',
  infoValue: 'text-sm font-medium text-gray-800',
  utilityBadgeGreen: 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
  utilityBadgeBlue: 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
  statusBadgeGreen: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
  statusBadgeYellow: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
  statusBadgeGray: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
  statusBadgeBlue: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
  emptyStateIcon: 'w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center',
  emptyStateTitle: 'font-[600] text-[16px] text-gray-800 font-sans mb-2',
  emptyStateText: 'text-sm text-gray-600 max-w-md mx-auto mb-6 font-sans',
  loadingContainer: 'flex flex-col items-center justify-center py-12',
  loadingSpinner: 'w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4',
  loadingText: 'text-gray-600',
  divider: 'my-6 border-t border-gray-200',
  footerNote: 'font-sans text-[12px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-500 text-center',
  facilityCount: 'font-[600] text-[16px] text-gray-800 font-sans',
  selectHint: 'text-sm text-gray-500'
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
  const [utilityProviders, setUtilityProviders] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      setUserId(userId);
      setAuthToken(authToken);
      
      if (userId && authToken) {
        fetchUserFacilities(userId, authToken);
        fetchUtilityProviders(authToken);
      }
    }
  }, [isOpen]);

  const fetchUtilityProviders = async (token) => {
    try {
      const response = await fetch(
        'https://services.dcarbon.solutions/api/auth/utility-providers',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (data.status === 'success') {
        setUtilityProviders(data.data);
      }
    } catch (error) {
      console.error('Error fetching utility providers:', error);
    }
  };

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
        setUserFacilities(facilities);
        if (facilities.length > 0) {
          setSelectedFacility(facilities[0].id);
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
    return <span className={styles.statusBadgeBlue}>Draft</span>;
  };

  const getUtilityTypeBadge = (utilityProvider) => {
    const isGreenButton = isGreenButtonUtility(utilityProvider);
    return isGreenButton ? (
      <span className={styles.utilityBadgeGreen}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Green Button
      </span>
    ) : (
      <span className={styles.utilityBadgeBlue}>Standard</span>
    );
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Existing Residential Facilities</h2>
              <p className={styles.modalSubtitle}>
                Continue authorization for your existing solar facilities
              </p>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <svg className={styles.infoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[14px] font-[500] text-[#039994] mb-1">Complete Your Registration</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">Select a facility to continue the authorization process and connect your utility data.</p>
                </div>
              </div>

              {loading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Loading your facilities...</p>
                </div>
              )}

              {!loading && userFacilities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={styles.facilityCount}>
                      Your Facilities ({userFacilities.length})
                    </h3>
                    <div className={styles.selectHint}>
                      Select one to continue registration
                    </div>
                  </div>

                  <div className="mb-6">
                    <select 
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className={styles.selectClass}
                    >
                      {userFacilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.facilityName || 'Residential Facility'} - {facility.utilityProvider} ({facility.status})
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
                                      {getUtilityTypeBadge(facility.utilityProvider)}
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
                    Continue Authorization for Selected Facility
                  </button>
                </div>
              )}

              {!loading && userFacilities.length === 0 && (
                <div className="text-center py-8">
                  <div className={styles.emptyStateIcon}>
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className={styles.emptyStateTitle}>
                    No Facilities Found
                  </h4>
                  <p className={styles.emptyStateText}>
                    You don't have any existing residential facilities to continue registration with.
                  </p>
                </div>
              )}

              <div className={styles.divider}></div>

              <p className={styles.footerNote}>
                Need assistance? Contact our support team at support@dcarbon.solutions
              </p>
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