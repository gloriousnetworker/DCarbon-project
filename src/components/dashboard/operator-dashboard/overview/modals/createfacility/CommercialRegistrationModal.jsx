import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";

export default function CommercialRegistrationModal({ isOpen, onClose, onBack }) {
  const [currentStep, setCurrentStep] = useState('checking');
  const [formData, setFormData] = useState({
    entityType: 'individual',
    commercialRole: 'operator',
    ownerFullName: '',
    companyName: ''
  });
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReferralLoading, setIsReferralLoading] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [modalHidden, setModalHidden] = useState(false);
  const [hasMeters, setHasMeters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalHidden(false);
      checkCommercialUserStatus();
    }
  }, [isOpen]);

  const checkUserMeters = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return false;

      const response = await fetch(`https://services.dcarbon.solutions/api/auth/user-meters/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      console.error('Error checking user meters:', error);
      return false;
    }
  };

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
        const metersExist = await checkUserMeters();
        setHasMeters(metersExist);
        setCurrentStep('referralCode');
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommercialSubmit = async () => {
    if (!formData.ownerFullName.trim()) {
      toast.error('Operator full name is required');
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
        commercialRole: formData.commercialRole,
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
        const metersExist = await checkUserMeters();
        setHasMeters(metersExist);
        setCurrentStep('referralCode');
      } else {
        throw new Error(result.message || 'Failed to update commercial registration');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
        toast.success(result.message);
        
        const metersExist = await checkUserMeters();
        if (!metersExist) {
          setModalHidden(true);
          setShowAgreementModal(true);
        } else {
          onClose();
        }
      } else {
        throw new Error(result.message || 'Invalid referral code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to validate referral code');
    } finally {
      setIsReferralLoading(false);
    }
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
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
                Commercial Operator User Registration
              </h2>
            </div>

            <div>
              <label className="block mb-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Entity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.entityType}
                onChange={(e) => handleFormChange('entityType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md font-sfpro text-[14px]"
                style={{ backgroundColor: '#F0F0F0' }}
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Commercial Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.commercialRole}
                onChange={(e) => handleFormChange('commercialRole', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md font-sfpro text-[14px]"
                style={{ backgroundColor: '#F0F0F0' }}
              >
                <option value="operator">Operator</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Operator Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ownerFullName}
                onChange={(e) => handleFormChange('ownerFullName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md font-sfpro text-[14px]"
                style={{ backgroundColor: '#F0F0F0' }}
                placeholder="Enter owner full name"
              />
            </div>

            {formData.entityType === 'company' && (
              <div>
                <label className="block mb-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleFormChange('companyName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md font-sfpro text-[14px]"
                  style={{ backgroundColor: '#F0F0F0' }}
                  placeholder="Enter company name"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleCommercialSubmit}
              disabled={isLoading}
              className={`w-full rounded-md font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${!isLoading ? 'bg-[#039994] text-white hover:bg-[#02857f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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

            <div className="mt-4 text-center">
              <p className="font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
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
          <div>
            {currentStep === 'referralCode' && (
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setCurrentStep('commercialForm')}
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
            )}
            
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
                    defaultChecked
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

      default:
        return null;
    }
  };

  if ((!isOpen && !showAgreementModal) || modalHidden) return null;

  return (
    <>
      {isOpen && !modalHidden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
            >
              <svg
                width="16"
                height="16"
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

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {renderStep()}
              </div>
            </div>
          </div>
        </div>
      )}

      <OwnerTermsAndAgreementModal
        isOpen={showAgreementModal}
        onClose={() => {
          setShowAgreementModal(false);
          onClose();
        }}
        onBack={() => {
          setShowAgreementModal(false);
          setCurrentStep('referralCode');
          setModalHidden(false);
        }}
      />
    </>
  );
}