import React, { useState } from "react";
import OwnerDetailsModal from "./ownerRegistration/OwnerDetailsModal";
import OwnerAndOperatorDetailsModal from "./ownerAndOperatorRegistration/OwnerDetailsModal";
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";
import OwnerAndOperatorTermsAndAgreementModal from "./ownerAndOperatorRegistration/OwnerAndOperatorTermsAndAgreementModal";
import FinanceAndInstallerModal from "./ownerRegistration/FinanceAndInstallerModal";
import OperatorFinanceAndInstallerModal from "./ownerAndOperatorRegistration/FinanceAndInstallerModal";
import AddCommercialFacilityModal from "./ownerAndOperatorRegistration/AddCommercialFacilityModal";

export default function CommercialRegistrationModal({ isOpen, onClose, currentStep }) {
  const [selectedRole, setSelectedRole] = useState('Owner');
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [showOwnerOperatorDetails, setShowOwnerOperatorDetails] = useState(false);
  const [showOwnerTerms, setShowOwnerTerms] = useState(false);
  const [showOwnerOperatorTerms, setShowOwnerOperatorTerms] = useState(false);
  const [showOwnerFinance, setShowOwnerFinance] = useState(false);
  const [showOwnerOperatorFinance, setShowOwnerOperatorFinance] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 2) {
      if (selectedRole === 'Owner') {
        setShowOwnerDetails(true);
      } else {
        setShowOwnerOperatorDetails(true);
      }
    } else if (currentStep === 3) {
      if (selectedRole === 'Owner') {
        setShowOwnerTerms(true);
      } else {
        setShowOwnerOperatorTerms(true);
      }
    } else if (currentStep === 4) {
      if (selectedRole === 'Owner') {
        setShowOwnerFinance(true);
      } else {
        setShowOwnerOperatorFinance(true);
      }
    } else if (currentStep === 5) {
      setShowFacilityModal(true);
    }
  };

  const getHeaderTitle = () => {
    if (currentStep === 2) {
      return selectedRole === 'Owner' ? "Owner's Registration" : "Owner & Operator Registration";
    } else if (currentStep === 3) {
      return "Terms & Agreements";
    } else if (currentStep === 4) {
      return "Financial Information";
    } else {
      return "Add Commercial Facility";
    }
  };

  const getProgressPercentage = () => {
    return currentStep === 2 ? '25%' : 
           currentStep === 3 ? '50%' : 
           currentStep === 4 ? '75%' : '100%';
  };

  const getStepNumber = () => {
    return currentStep === 2 ? '01/04' : 
           currentStep === 3 ? '02/04' : 
           currentStep === 4 ? '03/04' : '04/04';
  };

  const renderStepContent = () => {
    if (currentStep === 2) {
      return (
        <>
          <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
            Commercial Role
          </label>
          <div className="mb-3">
            <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRole === 'Owner' ? 'bg-white' : 'bg-[#F0F0F0]'}`}>
              <div className="flex-1 pr-3">
                <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                  Owner
                </div>
                {selectedRole === 'Owner' && (
                  <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                    Lorem ipsum dolor sit amet consectetur. Gravida dictum eget turpis hendrerit ultricies faucibus egestas erat.
                  </div>
                )}
              </div>
              <input
                type="radio"
                name="commercialRole"
                value="Owner"
                checked={selectedRole === 'Owner'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
              />
            </label>
          </div>
          <div className="mb-6">
            <label className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${selectedRole === 'Owner & Operator' ? 'bg-white' : 'bg-[#F0F0F0]'}`}>
              <div className="flex-1 pr-3">
                <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-1">
                  Owner & Operator
                </div>
                {selectedRole === 'Owner & Operator' && (
                  <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                    Lorem ipsum dolor sit amet consectetur. Gravida dictum eget turpis hendrerit ultricies faucibus egestas erat.
                  </div>
                )}
              </div>
              <input
                type="radio"
                name="commercialRole"
                value="Owner & Operator"
                checked={selectedRole === 'Owner & Operator'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
              />
            </label>
          </div>
        </>
      );
    } else if (currentStep === 3) {
      return (
        <div className="font-sfpro text-[14px] leading-[150%] text-gray-700 mb-6">
          Please review and accept the terms and agreements to proceed with your {selectedRole.toLowerCase()} registration.
        </div>
      );
    } else if (currentStep === 4) {
      return (
        <div className="font-sfpro text-[14px] leading-[150%] text-gray-700 mb-6">
          Provide your financial information and preferred installer details for your {selectedRole.toLowerCase()} account.
        </div>
      );
    } else {
      return (
        <div className="font-sfpro text-[14px] leading-[150%] text-gray-700 mb-6">
          You can now add your commercial facility details to complete the setup.
        </div>
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <button onClick={onClose} className="text-[#039994] mr-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
                {getHeaderTitle()}
              </h2>

              <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                <div className="h-1 bg-[#039994] rounded-full" style={{ width: getProgressPercentage() }}></div>
              </div>
              <div className="text-right mb-6">
                <span className="text-[12px] font-medium text-gray-500 font-sfpro">{getStepNumber()}</span>
              </div>

              <div>
                {renderStepContent()}
                <button
                  onClick={handleNext}
                  className="w-full rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                >
                  {currentStep === 5 ? 'Add Facility' : 'Next'}
                </button>

                {currentStep === 2 && (
                  <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                    <span>Terms and Conditions</span>
                    <span className="mx-2">&</span>
                    <span>Privacy Policy</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OwnerDetailsModal
        isOpen={showOwnerDetails}
        onClose={() => setShowOwnerDetails(false)}
      />

      <OwnerAndOperatorDetailsModal
        isOpen={showOwnerOperatorDetails}
        onClose={() => setShowOwnerOperatorDetails(false)}
      />

      <OwnerTermsAndAgreementModal
        isOpen={showOwnerTerms}
        onClose={() => setShowOwnerTerms(false)}
      />

      <OwnerAndOperatorTermsAndAgreementModal
        isOpen={showOwnerOperatorTerms}
        onClose={() => setShowOwnerOperatorTerms(false)}
      />

      <FinanceAndInstallerModal
        isOpen={showOwnerFinance}
        onClose={() => setShowOwnerFinance(false)}
      />

      <OperatorFinanceAndInstallerModal
        isOpen={showOwnerOperatorFinance}
        onClose={() => setShowOwnerOperatorFinance(false)}
      />

      <AddCommercialFacilityModal
        isOpen={showFacilityModal}
        onClose={() => setShowFacilityModal(false)}
      />
    </>
  );
}