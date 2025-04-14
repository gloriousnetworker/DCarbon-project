'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faMapMarkerAlt, faGlobe, faHashtag, faBuilding } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-full rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-4',
  labelClass: 'block mb-1 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  passwordInputWrapper: 'relative',
  passwordToggle: 'absolute right-3 top-2.5 cursor-pointer text-gray-500',
  infoCard: 'border border-[#039994] rounded-md p-4 space-y-2',
  infoText: 'text-gray-700 font-semibold font-sfpro',
  infoSubtext: 'text-sm text-gray-600 font-sfpro',
  radioContainer: 'flex items-center justify-between',
  radioLabel: 'text-sm font-medium text-gray-700 font-sfpro',
  radioGroup: 'flex space-x-4',
  radioOption: 'flex items-center space-x-1 cursor-pointer',
  radioInput: 'form-radio text-[#039994]',
  radioText: 'text-sm font-sfpro',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 mt-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  termsText: 'mt-4 text-center text-xs text-gray-500 leading-tight font-sfpro',
  termsLink: 'text-[#039994] hover:underline font-medium',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  mandatoryStar: 'text-red-500 ml-1',
  labelContainer: 'flex items-center',
  infoItem: 'flex items-center space-x-2',
  infoIcon: 'text-gray-400 w-4 h-4'
};

export default function UtilityAuthorizationCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [utilityProvider, setUtilityProvider] = useState('');
  const [utilityEmail, setUtilityEmail] = useState('');
  const [utilityPassword, setUtilityPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSameLocation, setIsSameLocation] = useState(null);

  // Hard-coded location details
  const companyName = 'Sopanel Energy';
  const address = 'HSE 3, 2nd Avenue, Dummy street, Dummy state.';
  const zipcode = '12345';
  const meterId = '000-123-XYZ';

  const handleSubmit = () => {
    // Validate form
    if (!utilityProvider || !utilityEmail || !utilityPassword || isSameLocation === null) {
      toast.error('Please fill all required fields', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C',
        },
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Utility authorized successfully!', {
        style: {
          fontFamily: 'SF Pro',
          background: '#E8F5E9',
          color: '#1B5E20',
        },
      });
      router.push('/register/commercial-both-registration/step-three');
    }, 1500);
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      <div className={styles.mainContainer}>
        {/* Heading Container */}
        <div className={styles.headingContainer}>
          {/* Back Arrow */}
          <div className={styles.backArrow} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* Page Title */}
          <h1 className={styles.pageTitle}>Utility Authorization</h1>

          {/* Step Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarActive} />
            </div>
            <span className={styles.progressStepText}>03/03</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className={styles.formWrapper}>
          {/* Utility Provider */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Utility provider</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <select
              value={utilityProvider}
              onChange={(e) => setUtilityProvider(e.target.value)}
              className={styles.selectClass}
            >
              <option value="">Choose provider</option>
              <option value="provider1">Provider 1</option>
              <option value="provider2">Provider 2</option>
              <option value="provider3">Provider 3</option>
              <option value="provider4">Provider 4</option>
            </select>
          </div>

          {/* Utility account username */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Utility account username</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={utilityEmail}
              onChange={(e) => setUtilityEmail(e.target.value)}
              className={styles.inputClass}
            />
          </div>

          {/* Utility account password */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Utility account password</label>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={utilityPassword}
                onChange={(e) => setUtilityPassword(e.target.value)}
                className={styles.inputClass}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div>
            <div className={styles.labelContainer}>
              <label className={styles.labelClass}>Location information</label>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBuilding} className={styles.infoIcon} />
                <p className={styles.infoSubtext}>{companyName}</p>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.infoIcon} />
                <p className={styles.infoSubtext}>{address}</p>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faGlobe} className={styles.infoIcon} />
                <p className={styles.infoSubtext}>{zipcode}</p>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faHashtag} className={styles.infoIcon} />
                <p className={styles.infoSubtext}>{meterId}</p>
              </div>
            </div>
          </div>

          {/* Location Radio */}
          <div className={styles.radioContainer}>
            <div className={styles.labelContainer}>
              <span className={styles.radioLabel}>Is this the solar installation's location?</span>
              <span className={styles.mandatoryStar}>*</span>
            </div>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="sameLocation"
                  value="yes"
                  checked={isSameLocation === 'yes'}
                  onChange={() => setIsSameLocation('yes')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>Yes</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="sameLocation"
                  value="no"
                  checked={isSameLocation === 'no'}
                  onChange={() => setIsSameLocation('no')}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>No</span>
              </label>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleSubmit}
            className={styles.buttonPrimary}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Next'}
          </button>

          {/* Terms and Conditions & Privacy Policy */}
          <div className={styles.termsText}>
            Terms and Conditions &nbsp;
            <a href="/privacy" className={styles.termsLink}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}