'use client';

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
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
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
  const [formData, setFormData] = useState({
    entityType: '',
    commercialRole: 'operator',
    ownerFullName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const router = useRouter();

  const localURL = 'https://services.dcarbon.solutions';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.entityType) {
      toast.error('Please select entity type', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return false;
    }
    if (!formData.ownerFullName.trim()) {
      toast.error('Please enter operator full name', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error('Please enter phone number', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Authentication required. Please login again.', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return;
    }

    setLoading(true);

    try {
      // First submit the operator registration data
      const registrationResponse = await fetch(
        `${localURL}/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      const registrationData = await registrationResponse.json();
      if (!registrationResponse.ok || registrationData.status !== 'success') {
        throw new Error(registrationData.message || 'Operator registration failed');
      }

      toast.success('Operator registration successful', {
        style: {
          fontFamily: 'SF Pro',
          background: '#E8F5E9',
          color: '#1B5E20'
        }
      });

      // Then initiate utility authorization
      const initiateResponse = await fetch(
        `${localURL}/api/auth/initiate-utility-auth/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const initData = await initiateResponse.json();
      if (!initiateResponse.ok || initData.status !== 'success') {
        throw new Error(initData.message || 'Utility authorization initiation failed');
      }

      toast.success('Utility authorization initiated successfully', {
        style: {
          fontFamily: 'SF Pro',
          background: '#E8F5E9',
          color: '#1B5E20'
        }
      });

      window.open('https://utilityapi.com/authorize/DCarbon_Solutions', '_blank');
      setShowUtilityModal(true);
    } catch (error) {
      toast.error(error.message || 'An error occurred during registration', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUtilityAuthorized = () => {
    setShowUtilityModal(false);
    router.push('/register/commercial-operator-registration/agreement');
  };

  return (
    <>
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      <div className={styles.mainContainer}>
        <div className={styles.headingContainer}>
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
          <h1 className={styles.pageTitle}>Operator's Registration</h1>
          <div className={styles.progressContainer}>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarActive} />
            </div>
            <span className={styles.progressStepText}>01/05</span>
          </div>
        </div>

        <div className={styles.formWrapper}>
          {/* Commercial Role (static) */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Commercial Role</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <input
              type="text"
              name="commercialRole"
              value={formData.commercialRole}
              readOnly
              className={styles.inputClass}
            />
          </div>

          {/* Entity Type Dropdown */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Entity Type</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="">Choose Type</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Operator's Full Name */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Operator's Full Name</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <input
              type="text"
              name="ownerFullName"
              value={formData.ownerFullName}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Enter operator's full name"
            />
          </div>

          {/* Phone Number */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Phone Number</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Enter phone number with country code"
            />
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className={styles.buttonPrimary}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>

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

      {showUtilityModal && (
        <UtilityAuthorizationModal
          onAuthorized={handleUtilityAuthorized}
          onClose={() => setShowUtilityModal(false)}
        />
      )}
    </>
  );
}