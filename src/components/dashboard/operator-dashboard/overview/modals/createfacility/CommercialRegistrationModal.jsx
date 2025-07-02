import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";
import UtilityAuthorizationModal from "./ownerRegistration/UtilityAuthorizationModal";

export default function CommercialRegistrationModal({ isOpen, onClose, onBack }) {
  const [referralCode, setReferralCode] = useState('');
  const [isReferralLoading, setIsReferralLoading] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      const loginResponse = localStorage.getItem('loginResponse');
      if (loginResponse) {
        const userData = JSON.parse(loginResponse);
        const step = userData.data.user.registrationStep || 1;
        setRegistrationStep(step);

        if (step === 2) {
          setShowAgreementModal(true);
          return;
        } else if (step >= 3) {
          setShowUtilityModal(true);
          return;
        }
      }
    }
  }, [isOpen]);

  if (!isOpen && !showAgreementModal && !showUtilityModal) return null;

  const handleNext = async () => {
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
        setShowAgreementModal(true);
      } else {
        throw new Error(result.message || 'Invalid referral code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to validate referral code');
    } finally {
      setIsReferralLoading(false);
    }
  };

  return (
    <>
      {isOpen && registrationStep === 1 && (
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
                <div className="flex items-center mb-4">
                  <button
                    onClick={onBack}
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
                    onClick={handleNext}
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
      />

      <UtilityAuthorizationModal
        isOpen={showUtilityModal}
        onClose={() => {
          setShowUtilityModal(false);
          onClose();
        }}
      />
    </>
  );
}