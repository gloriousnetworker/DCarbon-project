"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UtilityAuthorizationModal from './UtilityAuthorizationModal';

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/5 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E]',
  termsLink: 'text-[#039994] hover:underline font-medium',
  mandatoryStar: 'text-red-500 ml-1',
  labelContainer: 'flex items-center'
};

export default function OperatorRegistrationCard() {
  const [loading, setLoading] = useState(false);
  const [commercialRole, setCommercialRole] = useState('');
  const [entityType, setEntityType] = useState('');
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    // Validate selections
    if (!commercialRole || !entityType) {
      toast.error('Please select both Commercial Role and Entity Type', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
      return;
    }

    // Get user credentials from localStorage
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Authentication required. Please login again.', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            entityType,
            commercialRole,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration update failed');
      }

      toast.success('Registration updated successfully!', {
        style: {
          fontFamily: 'SF Pro',
          background: '#E8F5E9',
          color: '#1B5E20',
        },
      });

      // Open the external link in a new tab
      window.open('https://utilityapi.com/authorize/DCarbon_Solutions', '_blank');

      // Display the Utility Authorization modal
      setShowUtilityModal(true);
    } catch (error) {
      toast.error(error.message || 'An error occurred during registration', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Callback when the utility modal authorizes successfully
  const handleUtilityAuthorized = () => {
    setShowUtilityModal(false);
    router.push('/register/residence-user-registration/step-two');
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Heading Container */}
        <div className={styles.headingContainer}>
          {/* Back Arrow */}
          <div className={styles.backArrow} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* Page Title */}
          <h1 className={styles.pageTitle}>Utility API Authorization</h1>

          {/* Step Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarActive} />
            </div>
            <span className={styles.progressStepText}>01/05</span>
          </div>
        </div>

        {/* Form Wrapper */}
        <div className={styles.formWrapper}>
          {/* Commercial Role Dropdown */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>
                Residential Role
              </label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <select
              value={commercialRole}
              onChange={(e) => setCommercialRole(e.target.value)}
              className={styles.selectClass}
            >
              <option value="">Choose role</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          {/* Entity Type Dropdown */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>
                Entity Type
              </label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className={styles.selectClass}
            >
              <option value="">Choose Type</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className={styles.buttonPrimary}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>

        {/* Terms and Conditions & Privacy Policy Links */}
        <div className={styles.termsTextContainer}>
          By clicking on 'Next', you agree to our{' '}
          <a href="/terms" className={styles.termsLink}>
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a href="/privacy" className={styles.termsLink}>
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Utility Authorization Modal */}
      {showUtilityModal && (
        <UtilityAuthorizationModal 
          onAuthorized={handleUtilityAuthorized} 
          onClose={() => setShowUtilityModal(false)} 
        />
      )}
    </>
  );
}