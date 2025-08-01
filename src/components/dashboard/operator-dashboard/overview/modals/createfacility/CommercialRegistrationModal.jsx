import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";

export default function CommercialRegistrationModal({ isOpen, onClose }) {
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const handleReferralSubmit = async () => {
    if (!referralCode.trim()) {
      toast.error('Referral code is required');
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const authToken = loginResponse?.data?.token;

      const response = await fetch(`https://services.dcarbon.solutions/api/user/referral/by-inviter-code/${referralCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.status === 'success' && result.data) {
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
        setShowAgreementModal(true);
      } else {
        throw new Error(result.message || 'Invalid referral code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to validate referral code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
              <div>
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
                  Operator's Registration
                </h2>

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
                  disabled={!referralCode.trim() || isLoading}
                  className={`w-full rounded-md font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${referralCode.trim() && !isLoading ? 'bg-[#039994] text-white hover:bg-[#02857f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Validating...
                    </div>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OwnerTermsAndAgreementModal
        isOpen={showAgreementModal}
        onClose={() => {
          setShowAgreementModal(false);
          onClose();
        }}
      />
    </>
  );
}