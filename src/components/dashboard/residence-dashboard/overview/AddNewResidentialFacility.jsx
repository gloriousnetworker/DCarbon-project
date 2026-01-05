import React, { useState, useEffect } from "react";
import FinanceAndInstallerModal from "../../residence-dashboard/overview/modals/createfacility/FinanceAndInstallerModal";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm',
  modal: 'relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden',
  modalHeader: 'px-8 pt-8 pb-6 bg-gradient-to-br from-[#039994] to-[#02857f]',
  modalTitle: 'font-[600] text-[28px] leading-[110%] tracking-[-0.05em] text-white font-sans mb-2',
  modalSubtitle: 'text-[15px] text-white text-opacity-90 leading-relaxed',
  closeButton: 'absolute top-6 right-6 text-white hover:text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 cursor-pointer transition-all',
  modalBody: 'px-8 py-8',
  buttonPrimary: 'w-full rounded-lg bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 font-sans transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  spinner: 'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
  infoBox: 'flex items-start gap-3 p-4 bg-[#039994] bg-opacity-5 border-l-4 border-[#039994] rounded-r-lg mb-6',
  infoIcon: 'flex-shrink-0 w-5 h-5 text-[#039994] mt-0.5',
  cardContainer: 'border-2 border-gray-200 rounded-xl p-6 hover:border-[#039994] hover:shadow-lg transition-all cursor-pointer group',
  iconCircle: 'w-16 h-16 rounded-full bg-[#039994] bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-[#039994] group-hover:bg-opacity-20 transition-all',
  cardTitle: 'font-[600] text-[20px] leading-[110%] tracking-[-0.05em] text-[#1E1E1E] font-sans mb-2',
  cardDescription: 'font-sans text-[14px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-600 mb-6',
  featureList: 'space-y-3',
  featureItem: 'flex items-start gap-3',
  checkIcon: 'flex-shrink-0 w-5 h-5 text-[#039994] mt-0.5',
  featureText: 'font-sans text-[14px] leading-[140%] tracking-[-0.03em] font-[400] text-[#1E1E1E]',
  divider: 'my-6 border-t border-gray-200',
  footerNote: 'font-sans text-[12px] leading-[140%] tracking-[-0.03em] font-[400] text-gray-500 text-center'
};

export default function ResidentialFacilityModal({ isOpen, onClose, currentStep }) {
  const [creatingNewFacility, setCreatingNewFacility] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateNewFacility = () => {
    setCreatingNewFacility(true);
    setLoading(true);
    setTimeout(() => {
      setCreatingNewFacility(false);
      setLoading(false);
      setShowFinanceModal(true);
    }, 500);
  };

  if (!isOpen && !showFinanceModal) return null;

  return (
    <>
      {isOpen && !showFinanceModal && (
        <div className={styles.modalContainer} onClick={onClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onClose}
              className={styles.closeButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Residential Facility</h2>
              <p className={styles.modalSubtitle}>
                Register a new solar installation for your home and start tracking your energy production
              </p>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <svg className={styles.infoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[14px] font-[500] text-[#039994] mb-1">What You'll Need</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">Have your facility details, utility information, and financial documents ready before starting.</p>
                </div>
              </div>

              <div className={styles.cardContainer} onClick={handleCreateNewFacility}>
                <div className="flex flex-col items-center text-center">
                  <div className={styles.iconCircle}>
                    <svg className="w-8 h-8 text-[#039994]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  
                  <h4 className={styles.cardTitle}>
                    Start New Registration
                  </h4>
                  <p className={styles.cardDescription}>
                    Complete the registration process to add your residential solar facility
                  </p>
                  
                  <div className="w-full mb-6">
                    <div className={styles.featureList}>
                      <div className={styles.featureItem}>
                        <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={styles.featureText}>Facility details and location information</span>
                      </div>
                      
                      <div className={styles.featureItem}>
                        <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={styles.featureText}>Utility provider and meter setup</span>
                      </div>
                      
                      <div className={styles.featureItem}>
                        <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={styles.featureText}>Financial information and installer details</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreateNewFacility}
                    disabled={creatingNewFacility || loading}
                    className={styles.buttonPrimary}
                  >
                    {creatingNewFacility || loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className={styles.spinner}></div>
                        <span>Initializing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Begin Registration</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.divider}></div>

              <p className={styles.footerNote}>
                Need assistance? Contact our support team at support@dcarbon.solutions
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