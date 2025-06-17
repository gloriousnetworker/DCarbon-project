import React, { useState } from "react";
import CommercialRegistrationModal from "./createfacility/CommercialRegistrationModal";
import * as styles from './styles';

export default function WelcomeModal({ isOpen, onClose, userData }) {
  const [isCreatingFacility, setIsCreatingFacility] = useState(false);
  const [showCommercialRegistration, setShowCommercialRegistration] = useState(false);
  
  if (!isOpen) return null;

  const handleCreateFacility = () => {
    setIsCreatingFacility(true);
    // Simulate loading then show commercial registration modal
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
    onClose();
  };

  return (
    <>
      {/* Welcome Modal */}
      {!showCommercialRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4">
            {/* Modal Container */}
            <div
              className="rounded-2xl p-8 text-white relative overflow-hidden"
              style={{ backgroundColor: '#039994' }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
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
              {/* Content */}
              <div className="text-center">
                {/* Welcome Message */}
                <h2 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-2">
                  Welcome to DCarbon,
                </h2>
                <h3 className="font-[600] text-[32px] leading-[110%] tracking-[-0.05em] text-white font-sfpro mb-6">
                  {userData.userFirstName || "User"}
                </h3>
                {/* Description */}
                <p className="font-[400] text-[16px] leading-[140%] tracking-[-0.02em] text-white font-sfpro mb-8 opacity-90">
                  Kindly create your first facility to begin using DCarbon's services and managing your facility as an Owner or Operator.
                </p>
                {/* Create Facility Button */}
                <button
                  onClick={handleCreateFacility}
                  disabled={isCreatingFacility}
                  className="w-full rounded-xl bg-white text-[#039994] font-[600] text-[16px] leading-[100%] tracking-[-0.05em] font-sfpro py-4 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
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
              </div>
              {/* Background Decoration */}
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

      {/* Commercial Registration Modal */}
      <CommercialRegistrationModal 
        isOpen={showCommercialRegistration}
        onClose={handleCloseAll}
        onBack={handleBackToWelcome}
      />
    </>
  );
}