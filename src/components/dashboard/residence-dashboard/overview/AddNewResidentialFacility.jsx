import React, { useState } from "react";
import FinanceAndInstallerModal from "../../residence-dashboard/overview/modals/createfacility/FinanceAndInstallerModal";

export default function ResidentialFacilityModal({ isOpen, onClose, currentStep }) {
  const [creatingNewFacility, setCreatingNewFacility] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  const handleCreateNewFacility = () => {
    setCreatingNewFacility(true);
    setTimeout(() => {
      setCreatingNewFacility(false);
      setShowFinanceModal(true);
    }, 400);
  };

  if (!isOpen && !showFinanceModal) return null;

  return (
    <>
      {isOpen && !showFinanceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <div
            className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-[#039994] mb-1">
                    New Solar Home
                  </h2>
                  <p className="text-sm text-gray-500">
                    Register your residential solar installation
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 -m-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* What you'll need */}
              <div className="p-3 bg-[#039994]/5 rounded-lg">
                <p className="text-xs font-medium text-[#039994] mb-1.5">What you'll need</p>
                <ul className="space-y-1.5">
                  {['Facility details & address', 'Utility provider information', 'Finance & installer details'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-[#039994] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <button
                onClick={handleCreateNewFacility}
                disabled={creatingNewFacility}
                className="w-full py-3 bg-[#039994] text-white text-sm font-semibold rounded-lg hover:bg-[#028580] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingNewFacility ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Begin Registration
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Takes about 5 minutes to complete
              </p>
            </div>
          </div>
        </div>
      )}

      {showFinanceModal && (
        <FinanceAndInstallerModal
          isOpen={showFinanceModal}
          onClose={() => {
            setShowFinanceModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
