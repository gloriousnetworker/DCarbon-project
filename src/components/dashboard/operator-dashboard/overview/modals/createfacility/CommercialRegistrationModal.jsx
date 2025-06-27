import React, { useState } from "react";
import OwnerDetailsModal from "./ownerRegistration/OwnerDetailsModal";

export default function CommercialRegistrationModal({ isOpen, onClose, onBack }) {
  const [selectedRole, setSelectedRole] = useState('Operator');
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    localStorage.setItem('ownerReferralCode', referralCode);
    if (selectedRole === 'Operator') {
      setShowOwnerDetails(true);
    }
  };

  const getRoleDescription = () => {
    return "Lorem ipsum dolor sit amet consectetur. Gravida dictum eget turpis hendrerit ultricies faucibus egestas erat. Donec auctor orci orci sapien fermentum pharetra. Eget tempor odio ut lacinia dictum justo suspendisse amet tempor. Quis risus tellus commodo mauris dui. Est egestas netus.";
  };

  const handleCloseOwnerDetails = () => {
    setShowOwnerDetails(false);
  };

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
                <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                  Commercial Role
                </label>
                
                <div className="mb-6">
                  <label className="flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white">
                    <div className="flex-1 pr-3">
                      <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                        Operator
                      </div>
                      <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                        {getRoleDescription()}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="commercialRole"
                      value="Operator"
                      checked={selectedRole === 'Operator'}
                      onChange={(e) => setSelectedRole(e.target.value)}
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
                  onClick={handleNext}
                  disabled={!referralCode.trim()}
                  className={`w-full rounded-md font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${referralCode.trim() ? 'bg-[#039994] text-white hover:bg-[#02857f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Next
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

      <OwnerDetailsModal
        isOpen={showOwnerDetails}
        onClose={handleCloseOwnerDetails}
        onBack={() => setShowOwnerDetails(false)}
      />
    </>
  );
}