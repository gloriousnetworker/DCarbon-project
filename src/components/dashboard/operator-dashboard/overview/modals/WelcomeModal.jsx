import React, { useState, useEffect } from "react";
import * as styles from './styles';
import { toast } from 'react-hot-toast';
import OwnerTermsAndAgreementModal from "../modals/createfacility/ownerRegistration/OwnerTermsAndAgreementModal";

export default function WelcomeModal({ isOpen, onClose, userData }) {
  const [currentStep, setCurrentStep] = useState('checking');
  const [formData, setFormData] = useState({
    entityType: 'individual',
    commercialRole: 'operator',
    ownerFullName: '',
    companyName: '',
    companyAddress: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReferralLoading, setIsReferralLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkCommercialUserStatus();
    }
  }, [isOpen]);

  const checkCommercialUserStatus = async () => {
    setCurrentStep('checking');
    
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

      if (result.statusCode === 200 && result.status === 'success') {
        onClose();
      } else if (result.statusCode === 422 && result.status === 'fail') {
        const { firstName, lastName } = loginResponse.data.user;
        setFormData(prev => ({
          ...prev,
          ownerFullName: `${firstName || ''} ${lastName || ''}`.trim()
        }));
        setCurrentStep('commercialForm');
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
        setCurrentStep('commercialForm');
      }
    }
  };

  if (!isOpen) return null;

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      companyAddress: {
        ...prev.companyAddress,
        [field]: value
      }
    }));
  };

  const handleCommercialSubmit = async () => {
    if (!formData.ownerFullName.trim()) {
      toast.error('Operator full name is required');
      return;
    }

    if (formData.entityType === 'company') {
      if (!formData.companyName.trim()) {
        toast.error('Company name is required');
        return;
      }
      if (!formData.companyAddress.address1.trim()) {
        toast.error('Address 1 is required');
        return;
      }
      if (!formData.companyAddress.city.trim()) {
        toast.error('City is required');
        return;
      }
      if (!formData.companyAddress.state.trim()) {
        toast.error('State is required');
        return;
      }
      if (!formData.companyAddress.zipCode.trim()) {
        toast.error('Zip code is required');
        return;
      }
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
        commercialRole: formData.commercialRole,
        ownerFullName: formData.ownerFullName
      };

      if (formData.entityType === 'company') {
        body.companyName = formData.companyName;
        body.companyAddress = `${formData.companyAddress.address1}, ${formData.companyAddress.address2}, ${formData.companyAddress.city}, ${formData.companyAddress.state} ${formData.companyAddress.zipCode}`;
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
        setCurrentStep('welcome');
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
    setCurrentStep('referralCode');
  };

  const handleReferralSubmit = async () => {
    if (!referralCode.trim()) {
      toast.error('Referral code is required');
      return;
    }

    setIsReferralLoading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const authToken = loginResponse?.data?.token;

      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/user/referral/by-inviter-code/${referralCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.status === 'success' && result.statusCode === 200) {
        localStorage.setItem('referralResponse', JSON.stringify(result));
        localStorage.setItem('ownerReferralCode', referralCode);
        localStorage.setItem('userId', result.data.inviterId);
        localStorage.setItem('userRole', result.data.role);
        localStorage.setItem('customerType', result.data.customerType);
        localStorage.setItem('inviteeEmail', result.data.inviteeEmail);
        localStorage.setItem('referralStatus', result.data.status);
        localStorage.setItem('inviteeName', result.data.name);
        localStorage.setItem('referralId', result.data.id);
        localStorage.setItem('generatedReferralCode', result.data.referralCode);
        
        if (result.data.phoneNumber) {
          localStorage.setItem('phoneNumber', result.data.phoneNumber);
        }
        
        const updatedLoginResponse = {
          ...loginResponse,
          data: {
            ...loginResponse.data,
            user: {
              ...loginResponse.data.user,
              id: result.data.inviterId,
              role: result.data.role,
              customerType: result.data.customerType
            }
          }
        };
        
        localStorage.setItem('loginResponse', JSON.stringify(updatedLoginResponse));
        toast.success(result.message);
        setCurrentStep('agreement');
      } else {
        throw new Error(result.message || 'Invalid referral code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to validate referral code');
    } finally {
      setIsReferralLoading(false);
    }
  };

  const handleCloseAll = () => {
    onClose();
  };

  const handleWelcomeModalClose = () => {
    window.location.reload();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'checking':
        return (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
          </div>
        );

      case 'commercialForm':
        return (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="mb-6">
              <h2 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
                Commercial Operator User Registration
              </h2>
            </div>

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
                Commercial Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value="Operator"
                readOnly
                className={styles.inputClass}
                style={{ backgroundColor: '#F0F0F0', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label className={styles.labelClass}>
                Operator Full Name <span className="text-red-500">*</span>
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
              <>
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

                <div>
                  <label className={styles.labelClass}>
                    Address 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress.address1}
                    onChange={(e) => handleAddressChange('address1', e.target.value)}
                    className={styles.inputClass}
                    style={{ backgroundColor: '#F0F0F0' }}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className={styles.labelClass}>
                    Address 2
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress.address2}
                    onChange={(e) => handleAddressChange('address2', e.target.value)}
                    className={styles.inputClass}
                    style={{ backgroundColor: '#F0F0F0' }}
                    placeholder="Apt, suite, unit, etc."
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className={styles.labelClass}>
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={styles.inputClass}
                      style={{ backgroundColor: '#F0F0F0' }}
                      placeholder="City"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={styles.labelClass}>
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={styles.inputClass}
                      style={{ backgroundColor: '#F0F0F0' }}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.labelClass}>
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className={styles.inputClass}
                    style={{ backgroundColor: '#F0F0F0' }}
                    placeholder="Zip code"
                  />
                </div>
              </>
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
          </div>
        );

      case 'welcome':
        return (
          <div className="text-center">
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
            
            <h2 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2">
              Welcome to DCarbon,
            </h2>
            <h3 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-6">
              {userData.userFirstName || "User"}
            </h3>
            
            <p className="font-[400] text-[16px] leading-[140%] tracking-[-0.02em] text-white font-sfpro mb-8 opacity-90">
              Kindly create your first facility to begin using DCarbon's services and managing your facility as an Operator referred by the Owner of the System.
            </p>
            
            <button
              onClick={handleCreateFacility}
              className="w-full rounded-xl bg-white text-[#039994] font-[600] text-[16px] leading-[100%] tracking-[-0.05em] font-sfpro py-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 mb-6"
            >
              Create a facility
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
        );

      case 'referralCode':
        return (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setCurrentStep('welcome')}
                className="text-[#039994] mr-4"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            
            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
              Operator's Registration
            </h2>

            <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
              <div className="h-1 bg-[#039994] rounded-full" style={{ width: '25%' }}></div>
            </div>
            <div className="text-right mb-6">
              <span className="text-[12px] font-medium text-gray-500 font-sfpro">01/04</span>
            </div>

            <div>
              <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Commercial Roles
              </label>
              
              <div className="mb-6">
                <label className="flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white">
                  <div className="flex-1 pr-3">
                    <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                      Operator
                    </div>
                    <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                      Lorem ipsum dolor sit amet consectetur. Gravida dictum eget turpis hendrerit ultricies faucibus egestas erat. Donec auctor orci orci sapien fermentum pharetra. Eget tempor odio ut lacinia dictum justo suspendisse amet tempor. Quis risus tellus commodo mauris dui. Est egestas netus.
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="commercialRole"
                    value="Operator"
                    checked={true}
                    className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                  />
                </label>
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                  Owner's Referral Code
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code from your owner's invitation"
                  className="w-full p-3 border border-gray-300 rounded-md font-sfpro text-[14px]"
                />
                <p className="mt-1 text-xs text-gray-500 font-sfpro">
                  You can find this code in the invitation email sent to you by your owner.
                </p>
              </div>

              <button
                onClick={handleReferralSubmit}
                disabled={!referralCode.trim() || isReferralLoading}
                className={`w-full rounded-md font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${referralCode.trim() && !isReferralLoading ? 'bg-[#039994] text-white hover:bg-[#02857f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isReferralLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Validating...
                  </div>
                ) : (
                  'Next'
                )}
              </button>

              <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                <span>Terms and Conditions</span>
                <span className="mx-2">&</span>
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
        );

      case 'agreement':
        return (
          <OwnerTermsAndAgreementModal 
            isOpen={true}
            onClose={handleCloseAll}
            onBack={() => setCurrentStep('referralCode')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4">
        <div
          className={`rounded-2xl p-8 relative overflow-hidden ${currentStep === 'welcome' ? 'text-white bg-[#039994]' : 'bg-white'}`}
        >
          {renderStep()}
          
          {currentStep === 'welcome' && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}