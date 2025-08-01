import React, { useState, useEffect } from "react";
import CommercialRegistrationModal from "./createfacility/CommercialRegistrationModal";
import * as styles from './styles';
import { toast } from 'react-hot-toast';

export default function WelcomeModal({ isOpen, onClose, userData }) {
  const [isCreatingFacility, setIsCreatingFacility] = useState(false);
  const [showCommercialRegistration, setShowCommercialRegistration] = useState(false);
  const [showCommercialForm, setShowCommercialForm] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [formData, setFormData] = useState({
    entityType: 'individual',
    commercialRole: 'owner',
    ownerFullName: '',
    companyName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      checkCommercialUserStatus();
    }
  }, [isOpen]);

  const checkCommercialUserStatus = async () => {
    setIsCheckingCommercialStatus(true);
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.statusCode === 422 && result.status === 'fail') {
        const { firstName, lastName } = loginResponse.data.user;
        setFormData(prev => ({
          ...prev,
          ownerFullName: `${firstName || ''} ${lastName || ''}`.trim()
        }));
        setShowCommercialForm(true);
      } else if (result.statusCode === 200 && result.status === 'success') {
        onClose();
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      console.error('Error checking commercial status:', error);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      if (loginResponse?.data?.user) {
        const { firstName, lastName } = loginResponse.data.user;
        setFormData(prev => ({
          ...prev,
          ownerFullName: `${firstName || ''} ${lastName || ''}`.trim()
        }));
        setShowCommercialForm(true);
      }
    } finally {
      setIsCheckingCommercialStatus(false);
    }
  };

  if (!isOpen) return null;

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommercialSubmit = async () => {
    if (!formData.ownerFullName.trim()) {
      toast.error('Owner full name is required');
      return;
    }

    if (formData.entityType === 'company' && !formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('Authentication data not found');
      }

      const body = {
        entityType: formData.entityType,
        commercialRole: 'owner',
        ownerFullName: formData.ownerFullName
      };

      if (formData.entityType === 'company') {
        body.companyName = formData.companyName;
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/user/commercial-registration/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success(result.message);
        setShowCommercialForm(false);
        setShowWelcomeModal(true);
      } else {
        throw new Error(result.message || 'Failed to update commercial registration');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFacility = () => {
    setIsCreatingFacility(true);
    setTimeout(() => {
      setIsCreatingFacility(false);
      setShowCommercialRegistration(true);
    }, 1000);
  };

  const handleBackToWelcome = () => {
    setShowCommercialRegistration(false);
  };

  const handleCloseAll = () => {
    setShowCommercialRegistration(false);
    setShowCommercialForm(false);
    setShowWelcomeModal(false);
    onClose();
  };

  const handleWelcomeModalClose = () => {
    window.location.reload();
  };

  if (isCheckingCommercialStatus) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCommercialForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4">
            <div className="rounded-2xl p-8 bg-white relative overflow-hidden">
              <div className="mb-6">
                <h2 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
                  Commercial User Registration
                </h2>
              </div>

              <form className="space-y-6">
                <div>
                  <label className={styles.labelClass}>
                    Entity Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => handleFormChange('entityType', e.target.value)}
                    className={styles.selectClass}
                    style={{ backgroundColor: '#F0F0F0' }}
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                <div>
                  <label className={styles.labelClass}>
                    Owner Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerFullName}
                    onChange={(e) => handleFormChange('ownerFullName', e.target.value)}
                    className={styles.inputClass}
                    style={{ backgroundColor: '#F0F0F0' }}
                    placeholder="Enter owner full name"
                  />
                </div>

                {formData.entityType === 'company' && (
                  <div>
                    <label className={styles.labelClass}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleFormChange('companyName', e.target.value)}
                      className={styles.inputClass}
                      style={{ backgroundColor: '#F0F0F0' }}
                      placeholder="Enter company name"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCommercialSubmit}
                  disabled={isLoading}
                  className={styles.buttonPrimary}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Next'
                  )}
                </button>

                <div className={styles.termsTextContainer}>
                  <p>
                    By continuing, you agree to our{' '}
                    <a 
                      href="/terms-and-conditions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80"
                    >
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!showCommercialRegistration && !showCommercialForm && showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4">
            <div
              className="rounded-2xl p-8 text-white relative overflow-hidden"
              style={{ backgroundColor: '#039994' }}
            >
              <button
                onClick={handleWelcomeModalClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-10"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              <div className="text-center">
                <h2 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2">
                  Welcome to DCarbon,
                </h2>
                <h3 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-6">
                  {userData.userFirstName || "User"}
                </h3>
                
                <p className="font-[400] text-[16px] leading-[140%] tracking-[-0.02em] text-white font-sfpro mb-8 opacity-90">
                  Kindly create your first facility to begin using DCarbon's services and managing your facility as an Owner or Operator.
                </p>
                
                <button
                  onClick={handleCreateFacility}
                  disabled={isCreatingFacility}
                  className="w-full rounded-xl bg-white text-[#039994] font-[600] text-[16px] leading-[100%] tracking-[-0.05em] font-sfpro py-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
                >
                  {isCreatingFacility ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#039994] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create a facility"
                  )}
                </button>

                <div className="text-center">
                  <p className="font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-white">
                    By continuing, you agree to our{' '}
                    <a 
                      href="/terms-and-conditions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80"
                    >
                      Terms and Conditions
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-80"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)"
                  }}
                ></div>
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommercialRegistrationModal 
        isOpen={showCommercialRegistration}
        onClose={handleCloseAll}
        onBack={handleBackToWelcome}
      />
    </>
  );
}