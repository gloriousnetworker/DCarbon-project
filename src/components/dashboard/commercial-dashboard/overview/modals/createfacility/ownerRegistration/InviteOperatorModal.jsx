import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm',
  modal: 'relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden',
  modalHeader: 'px-8 pt-8 pb-6 bg-gradient-to-br from-[#039994] to-[#02857f]',
  modalTitle: 'font-[600] text-[28px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2',
  modalSubtitle: 'text-[15px] text-white text-opacity-90 leading-relaxed',
  closeButton: 'absolute top-6 right-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all',
  backButton: 'absolute top-6 left-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all',
  modalBody: 'px-8 py-6',
  buttonPrimary: 'w-full rounded-lg bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sfpro transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[500] text-[#1E1E1E]',
  inputClass: 'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[400] text-[#1E1E1E] transition-all',
  selectClass: 'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[400] text-[#1E1E1E] transition-all bg-white',
  textareaClass: 'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent font-sfpro text-[14px] leading-[100%] tracking-[-0.03em] font-[400] text-[#1E1E1E] transition-all resize-none',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-500',
  spinner: 'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinnerLarge: 'h-10 w-10 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  infoBox: 'flex items-start gap-3 p-4 bg-[#039994] bg-opacity-5 border-l-4 border-[#039994] rounded-r-lg',
  successBox: 'flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg',
  warningBox: 'flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg',
  divider: 'my-6 border-t border-gray-200',
  successModalBody: 'px-8 py-12 text-center'
};

export default function InviteOperatorModal({ isOpen, onClose, onBack, selectedUtilityProvider, isGreenButtonUtility }) {
  const [loading, setLoading] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [currentModal, setCurrentModal] = useState('invite');
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "Please join the DCarbon Platform as my Operator!"
  });

  useEffect(() => {
    if (isOpen && currentModal === 'invite') {
      fetchUserFacilities();
    }
  }, [isOpen, currentModal]);

  const fetchUserFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      if (result.status === 'success' && result.data?.facilities) {
        const sortedFacilities = result.data.facilities.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFacilities(sortedFacilities);
        if (sortedFacilities.length > 0) {
          setSelectedFacilityId(sortedFacilities[0].id);
        }
      } else {
        toast.error('Failed to load facilities');
      }
    } catch (error) {
      toast.error('Error loading facilities');
    } finally {
      setLoadingFacilities(false);
    }
  };

  const getSelectedFacility = () => {
    return facilities.find(f => f.id === selectedFacilityId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (e) => {
    setSelectedFacilityId(e.target.value);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter operator name');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return false;
    }

    if (!selectedFacilityId) {
      toast.error('Please select a facility');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending invitation...');

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      if (!userId || !authToken) {
        throw new Error('Authentication required');
      }

      const selectedFacility = getSelectedFacility();
      
      const payload = {
        invitees: [
          {
            email: formData.email.trim(),
            role: "OPERATOR",
            name: formData.name.trim(),
            customerType: "COMMERCIAL",
            message: formData.message.trim(),
            inviterUserType: "COMMERCIAL_USER",
            facilityId: selectedFacilityId,
            facilityName: selectedFacility?.nickname || selectedFacility?.facilityName || "Facility"
          }
        ]
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-operator/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Invitation sent successfully!', { id: toastId });
        setCurrentModal('emailSent');
      } else {
        throw new Error(response.data.message || 'Failed to send invitation');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send invitation';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", email: "", message: "Please join the DCarbon Platform as my Operator!" });
      setCurrentModal('invite');
      setSelectedFacilityId("");
      onClose();
    }
  };

  const handleBackClick = () => {
    if (!loading && onBack) {
      setFormData({ name: "", email: "", message: "Please join the DCarbon Platform as my Operator!" });
      setCurrentModal('invite');
      setSelectedFacilityId("");
      onBack();
    }
  };

  const handleCompleteRegistration = () => {
    setCurrentModal('registrationSuccess');
  };

  const handleGoToDashboard = () => {
    setFormData({ name: "", email: "", message: "Please join the DCarbon Platform as my Operator!" });
    setCurrentModal('invite');
    setSelectedFacilityId("");
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinnerLarge}></div>
        </div>
      )}

      <div className={styles.modalContainer} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {currentModal === 'invite' && (
            <>
              {onBack && (
                <button
                  onClick={handleBackClick}
                  disabled={loading}
                  className={styles.backButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <button
                onClick={handleClose}
                disabled={loading}
                className={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Invite Operator</h2>
                <p className={styles.modalSubtitle}>
                  Send an invitation to your operator to join and manage your facility
                </p>
              </div>

              <div className={styles.modalBody}>
                {selectedUtilityProvider && (
                  <div className={isGreenButtonUtility ? styles.successBox : styles.infoBox}>
                    <svg className="flex-shrink-0 w-5 h-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-[14px] font-[500] mb-1" style={{color: isGreenButtonUtility ? '#059669' : '#039994'}}>
                        {isGreenButtonUtility ? 'Green Button Utility' : `Utility: ${selectedUtilityProvider.name}`}
                      </p>
                      {isGreenButtonUtility && (
                        <p className="text-[13px] text-gray-700 leading-relaxed">Invite operator to authorize utility data</p>
                      )}
                    </div>
                  </div>
                )}

                {loadingFacilities ? (
                  <div className="py-8 text-center">
                    <div className="inline-block w-6 h-6 border-3 border-[#039994] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Loading facilities...</p>
                  </div>
                ) : facilities.length === 0 ? (
                  <div className={styles.warningBox}>
                    <svg className="flex-shrink-0 w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-[14px] font-[500] text-yellow-700 mb-1">No Facilities Found</p>
                      <p className="text-[13px] text-yellow-700 leading-relaxed">Please create a facility before inviting an operator</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={styles.labelClass}>
                          Select Facility <span className="text-[#039994]">*</span>
                        </label>
                        <select
                          value={selectedFacilityId}
                          onChange={handleFacilityChange}
                          className={styles.selectClass}
                          disabled={loading}
                          required
                        >
                          {facilities.map(facility => (
                            <option key={facility.id} value={facility.id}>
                              {facility.nickname || facility.facilityName || "Unnamed Facility"}
                            </option>
                          ))}
                        </select>
                        {selectedFacilityId && (
                          <p className={styles.noteText}>
                            Facility ID: {selectedFacilityId}
                            {getSelectedFacility()?.utilityProvider && ` • Utility: ${getSelectedFacility()?.utilityProvider}`}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={styles.labelClass}>
                          Operator Name <span className="text-[#039994]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter operator's name"
                          className={styles.inputClass}
                          disabled={loading}
                          required
                        />
                      </div>

                      <div>
                        <label className={styles.labelClass}>
                          Operator Email <span className="text-[#039994]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="operator@company.com"
                          className={styles.inputClass}
                          disabled={loading}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={styles.labelClass}>
                          Role <span className="text-[#039994]">*</span>
                        </label>
                        <input
                          type="text"
                          value="OPERATOR"
                          className={`${styles.inputClass} bg-gray-50 cursor-not-allowed`}
                          disabled
                        />
                        <p className={styles.noteText}>Role is fixed as OPERATOR</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className={styles.labelClass}>
                          Custom Message <span className="text-[#039994]">*</span>
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Enter your custom invitation message"
                          className={styles.textareaClass}
                          disabled={loading}
                          required
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className={styles.divider}></div>

                    <p className="text-[12px] text-gray-500 text-center mb-6">
                      By inviting an operator, you agree to our{' '}
                      <a 
                        href="/terms" 
                        className="text-[#039994] hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Service
                      </a>
                    </p>

                    <button 
                      type="button" 
                      onClick={handleSubmit}
                      className={styles.buttonPrimary}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className={styles.spinner}></div>
                          <span>Sending Invitation...</span>
                        </span>
                      ) : (
                        'Send Invitation'
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {currentModal === 'emailSent' && (
            <>
              <button
                onClick={handleClose}
                className={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Email Sent Successfully</h2>
                <p className={styles.modalSubtitle}>
                  Your invitation has been delivered to the operator
                </p>
              </div>

              <div className={styles.successModalBody}>
                <div className="flex justify-center mb-6">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#039994" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="#039994" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h3 className="text-[20px] font-[600] text-[#039994] mb-3">Invitation Sent</h3>
                <p className="text-[15px] text-gray-600 mb-8 max-w-md mx-auto">
                  Your operator will receive the invitation and complete the authorization process to access utility data.
                </p>

                <button 
                  onClick={handleCompleteRegistration}
                  className={styles.buttonPrimary}
                >
                  Complete Registration
                </button>
              </div>
            </>
          )}

          {currentModal === 'registrationSuccess' && (
            <>
              <button
                onClick={handleClose}
                className={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Almost Ready!</h2>
                <p className={styles.modalSubtitle}>
                  You're one step away from starting with DCarbon
                </p>
              </div>

              <div className={styles.successModalBody}>
                <div className="flex justify-center mb-6">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#039994" strokeWidth="1.5"/>
                    <path d="M9 12L11 14L15 10" stroke="#039994" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h3 className="text-[20px] font-[600] text-[#039994] mb-3">Registration Complete</h3>
                <p className="text-[15px] text-gray-600 mb-8 max-w-md mx-auto">
                  Your operator will authorize utility access. Once complete, you'll be ready to use all DCarbon features.
                </p>

                <button 
                  onClick={handleGoToDashboard}
                  className={styles.buttonPrimary}
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}