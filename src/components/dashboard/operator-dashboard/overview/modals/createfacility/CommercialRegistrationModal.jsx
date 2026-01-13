import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import axios from "axios";
import dynamic from "next/dynamic";

const InstapullAuthorizationModal = dynamic(
  () => import("./InstapullAuthorizationModal"),
  { ssr: false }
);

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm',
  modal: 'relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
  modalHeader: 'px-8 pt-8 pb-6 bg-gradient-to-br from-[#039994] to-[#02857f]',
  modalTitle: 'font-[600] text-[28px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2',
  modalSubtitle: 'text-[15px] text-white text-opacity-90 leading-relaxed',
  closeButton: 'absolute top-6 right-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all z-10',
  modalBody: 'flex-1 overflow-y-auto px-8 py-6',
  statusFilterContainer: 'mb-6 flex flex-wrap gap-3 items-center',
  statusFilterButton: 'px-4 py-2 rounded-lg font-medium text-sm transition-all',
  statusFilterButtonActive: 'bg-white text-[#039994] shadow-md',
  statusFilterButtonInactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  facilityGrid: 'grid grid-cols-1 md:grid-cols-2 gap-5',
  facilityCard: 'relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-[#039994] hover:shadow-lg transition-all duration-300',
  facilityCardAuthorized: 'relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-md',
  facilityHeader: 'flex items-start justify-between mb-4',
  facilityTitle: 'font-[600] text-[18px] leading-[120%] tracking-[-0.03em] text-gray-800 font-sfpro flex-1 pr-2',
  roleBadge: 'px-3 py-1 rounded-full text-xs font-[600] uppercase tracking-wide',
  facilityDetails: 'space-y-2 mb-4',
  detailRow: 'flex items-center justify-between text-sm',
  detailLabel: 'text-gray-500 font-[500]',
  detailValue: 'text-gray-800 font-[400] text-right',
  ownerSection: 'mt-4 pt-4 border-t-2 border-gray-200',
  ownerLabel: 'text-xs text-gray-500 font-[500] uppercase tracking-wide mb-1',
  ownerName: 'text-sm text-gray-800 font-[500]',
  buttonAuthorize: 'w-full rounded-lg bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sfpro transition-all text-sm',
  buttonAuthorized: 'w-full rounded-lg bg-green-600 text-white font-semibold py-3 cursor-default font-sfpro text-sm flex items-center justify-center gap-2',
  buttonFetching: 'w-full rounded-lg bg-yellow-500 text-white font-semibold py-3 cursor-wait font-sfpro text-sm flex items-center justify-center gap-2',
  buttonClose: 'w-full rounded-lg border-2 border-[#039994] text-[#039994] font-semibold py-3 hover:bg-[#039994] hover:bg-opacity-5 focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sfpro transition-all',
  greenButtonBadge: 'absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center shadow-lg z-10',
  emptyState: 'flex flex-col items-center justify-center py-16 text-center',
  emptyIcon: 'w-20 h-20 text-gray-300 mb-4',
  emptyTitle: 'text-xl font-[600] text-gray-600 mb-2',
  emptyText: 'text-sm text-gray-500 max-w-md',
  spinner: 'inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin',
  loadingContainer: 'flex flex-col items-center justify-center py-20',
  loadingSpinner: 'w-12 h-12 border-4 border-gray-200 border-t-[#039994] rounded-full animate-spin mb-4',
  loadingText: 'text-gray-600 text-sm',
  invitationStatusBadge: 'px-2 py-1 rounded-full text-xs font-[600] uppercase tracking-wide',
  ownerDetailsGrid: 'grid grid-cols-1 gap-y-1 text-xs mt-2',
  ownerDetailRow: 'flex justify-between',
  ownerDetailLabel: 'text-blue-600 font-medium',
  ownerDetailValue: 'text-blue-800',
  statusLabel: 'text-blue-600 font-medium',
  statusValue: 'font-medium'
};

export default function CommercialRegistrationModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [owners, setOwners] = useState({});
  const [currentFacility, setCurrentFacility] = useState(null);
  const [instapullOpened, setInstapullOpened] = useState(false);
  const [showInstapullAuthModal, setShowInstapullAuthModal] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState('accepted');

  const greenButtonKeywords = ['green button connect', 'green button', 'san diego gas and electric', 'southern california edison', 'pacific gas and electric', 'pg&e', 'sce', 'sdg&e'];

  const isGreenButtonUtility = (utilityProvider) => {
    const providerLower = utilityProvider?.toLowerCase() || '';
    return greenButtonKeywords.some(keyword => providerLower.includes(keyword));
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

  const authorizeFacility = async (facility, e) => {
    e.stopPropagation();
    setCurrentFacility(facility);
    
    const owner = owners[facility.commercialUserId];
    if (owner) {
      localStorage.setItem('ownersDetails', JSON.stringify(owner));
      localStorage.setItem('userId', facility.commercialUserId);
      localStorage.setItem('userRole', facility.userRole);
      localStorage.setItem('referralId', facility.invitationId);
      localStorage.setItem('generatedReferralCode', owner.referralCode);
      
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const updatedLoginResponse = {
        ...loginResponse,
        data: {
          ...loginResponse.data,
          user: {
            ...loginResponse.data.user,
            id: facility.commercialUserId,
            role: facility.userRole,
            customerType: "COMMERCIAL"
          }
        }
      };
      
      localStorage.setItem('loginResponse', JSON.stringify(updatedLoginResponse));
    }
    
    openInstapullTab();
    setShowInstapullAuthModal(true);
  };

  const checkAuthorizationStatus = async (ownerId, facilityId) => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const authToken = loginResponse?.data?.token;
    
    if (!ownerId || !authToken) return null;
    
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/user-meters/${ownerId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (response.data.status === "success" && response.data.data && response.data.data.length > 0) {
        const authData = response.data.data[0];
        setAuthorizationStatus(prev => ({
          ...prev,
          [facilityId]: {
            authorized: true,
            metersFetched: authData.meters && authData.meters.length > 0,
            status: authData.status
          }
        }));
        return {
          authorized: true,
          metersFetched: authData.meters && authData.meters.length > 0,
          status: authData.status
        };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setAuthorizationStatus(prev => ({
          ...prev,
          [facilityId]: {
            authorized: false,
            metersFetched: false,
            status: 'not_authorized'
          }
        }));
        return {
          authorized: false,
          metersFetched: false,
          status: 'not_authorized'
        };
      }
    }
    return null;
  };

  const fetchUserInvitations = async () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail;
    const authToken = loginResponse?.data?.token;
    
    if (!userEmail || !authToken) {
      toast.error("Authentication required");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/user/referral/by-invitee-email/${userEmail}?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (data.status === "success" && data.data && data.data.length > 0) {
        const facilitiesWithOwners = [];
        const ownersMap = {};
        
        for (const invitation of data.data) {
          if (invitation.facilityId && invitation.inviterId && invitation.facility) {
            const facilityData = invitation.facility;
            facilityData.userRole = invitation.role;
            facilityData.invitationStatus = invitation.status;
            facilityData.invitationId = invitation.id;
            facilityData.invitationCreatedAt = invitation.createdAt;
            facilitiesWithOwners.push(facilityData);
            
            if (!ownersMap[invitation.inviterId]) {
              ownersMap[invitation.inviterId] = {
                id: invitation.inviterId,
                firstName: invitation.name?.split(' ')[0] || '',
                lastName: invitation.name?.split(' ').slice(1).join(' ') || '',
                email: invitation.inviteeEmail,
                phoneNumber: invitation.phoneNumber,
                invitationStatus: invitation.status,
                referralCode: invitation.referralCode
              };
            }
            
            if (invitation.inviterId) {
              await checkAuthorizationStatus(invitation.inviterId, invitation.facilityId);
            }
          }
        }
        
        setFacilities(facilitiesWithOwners);
        setOwners(ownersMap);
      } else {
        setFacilities([]);
        setOwners({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load facilities");
      setFacilities([]);
      setOwners({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserInvitations();
    }
  }, [isOpen, statusFilter]);

  const handleInstapullAuthModalClose = () => {
    setShowInstapullAuthModal(false);
    setCurrentFacility(null);
    setInstapullOpened(false);
    onClose();
  };

  if (!isOpen && !showInstapullAuthModal) return null;

  if (showInstapullAuthModal) {
    return (
      <InstapullAuthorizationModal
        isOpen={showInstapullAuthModal}
        onClose={handleInstapullAuthModalClose}
        utilityProvider={currentFacility?.utilityProvider}
        instapullOpened={instapullOpened}
        openInstapullTab={openInstapullTab}
        userId={JSON.parse(localStorage.getItem('loginResponse') || '{}')?.data?.user?.id}
      />
    );
  }

  return (
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
          <h2 className={styles.modalTitle}>Your Facility Invitations</h2>
          <p className={styles.modalSubtitle}>
            Review and authorize access to facilities you've been invited to manage
          </p>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.statusFilterContainer}>
            <div className="text-sm text-gray-600 font-medium mr-3">Filter by status:</div>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`${styles.statusFilterButton} ${
                statusFilter === 'accepted' 
                  ? styles.statusFilterButtonActive 
                  : styles.statusFilterButtonInactive
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`${styles.statusFilterButton} ${
                statusFilter === 'pending' 
                  ? styles.statusFilterButtonActive 
                  : styles.statusFilterButtonInactive
              }`}
            >
              Pending
            </button>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading your facilities...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className={styles.emptyTitle}>
                {statusFilter === 'accepted' ? 'No Accepted Invitations' : 'No Pending Invitations'}
              </h3>
              <p className={styles.emptyText}>
                {statusFilter === 'accepted' 
                  ? "You don't have any accepted facility invitations. Check your pending invitations or contact your facility owner."
                  : "You don't have any pending facility invitations at the moment. Check back later or contact your facility owner."
                }
              </p>
            </div>
          ) : (
            <>
              <div className={styles.facilityGrid}>
                {facilities.map(facility => {
                  const owner = owners[facility.commercialUserId];
                  const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
                  const authStatus = authorizationStatus[facility.id] || { authorized: false, metersFetched: false, status: 'not_authorized' };
                  const showAuthorizeButton = !authStatus.authorized;
                  
                  return (
                    <div
                      key={facility.id}
                      className={authStatus.authorized ? styles.facilityCardAuthorized : styles.facilityCard}
                    >
                      {isGreenButton && (
                        <div className={styles.greenButtonBadge}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Green Button
                        </div>
                      )}
                      
                      <div className={styles.facilityHeader}>
                        <h3 className={styles.facilityTitle}>
                          {facility.facilityName}
                        </h3>
                        <span className={`${styles.roleBadge} bg-[#039994] bg-opacity-10 text-[#039994]`}>
                          {facility.userRole}
                        </span>
                      </div>
                      
                      <div className={styles.facilityDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Utility Provider</span>
                          <span className={styles.detailValue}>{facility.utilityProvider}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Status</span>
                          <span className={`${styles.detailValue} capitalize`}>{facility.status}</span>
                        </div>
                        {facility.accountNumber && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Account</span>
                            <span className={styles.detailValue}>{facility.accountNumber}</span>
                          </div>
                        )}
                      </div>
                      
                      {owner && (
                        <div className={styles.ownerSection}>
                          <div className="flex justify-between items-center mb-1">
                            <div className={styles.ownerLabel}>Facility Owner</div>
                            <span className={`${styles.invitationStatusBadge} ${
                              owner.invitationStatus === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {owner.invitationStatus || 'PENDING'}
                            </span>
                          </div>
                          <div className={styles.ownerName}>
                            {owner.firstName} {owner.lastName}
                          </div>
                          <div className={styles.ownerDetailsGrid}>
                            <div className={styles.ownerDetailRow}>
                              <span className={styles.ownerDetailLabel}>Email:</span>
                              <span className={styles.ownerDetailValue}>{owner.email}</span>
                            </div>
                            <div className={styles.ownerDetailRow}>
                              <span className={styles.ownerDetailLabel}>Phone:</span>
                              <span className={styles.ownerDetailValue}>{owner.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className={styles.ownerDetailRow}>
                              <span className={styles.statusLabel}>Invitation Status:</span>
                              <span className={`${styles.statusValue} ${
                                owner.invitationStatus === 'PENDING' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {owner.invitationStatus || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        {showAuthorizeButton ? (
                          <button
                            onClick={(e) => authorizeFacility(facility, e)}
                            className={styles.buttonAuthorize}
                          >
                            Authorize This Facility
                          </button>
                        ) : authStatus.metersFetched ? (
                          <div className={styles.buttonAuthorized}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Authorized
                          </div>
                        ) : (
                          <div className={styles.buttonFetching}>
                            <div className={styles.spinner}></div>
                            Fetching Meters...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <button
                  onClick={onClose}
                  className={styles.buttonClose}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}