'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import EmailModal from '../../../components/modals/EmailModal';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// Import our custom styles from styles.js
import {
  mainContainer,
  pageTitle,
  formWrapper,
  labelClass,
  inputClass,
  buttonPrimary,
  termsTextContainer,
  grayPlaceholder,
} from './styles';

// Main component that will be wrapped in Suspense
function RegisterCardContent() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userCategory, setUserCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [urlReferralCode, setUrlReferralCode] = useState(''); // From URL params
  const [manualReferralCode, setManualReferralCode] = useState(''); // Manually entered
  const [showReferralField, setShowReferralField] = useState(false);

  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const searchParams = useSearchParams();

  // Check for referral code in URL on component mount
  useEffect(() => {
    const code = searchParams.get('referral');
    if (code) {
      setUrlReferralCode(code);
      setShowReferralField(true); // Auto-show the field when URL has referral
      toast.success(`You've been invited with referral code: ${code}`);
    }
  }, [searchParams]);

  // Mapping UI labels to API expected values
  const userTypeMapping = {
    Residential: 'RESIDENTIAL',
    Commercial: 'COMMERCIAL',
    Partner: 'PARTNER',
  };

  // Get available user categories based on referral status
  const availableUserCategories = urlReferralCode
    ? ['Residential', 'Commercial']
    : ['Residential', 'Commercial', 'Partner'];

  // Validate the form before submission
  const validateForm = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password
    ) {
      setError('Please fill out all fields.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    const phoneRegex = /^\+?[0-9]{7,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError(
        'Please enter a valid phone number starting with + followed by country code.'
      );
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!userCategory) {
      setError('Please select a user category.');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
  
    const payload = {
      email,
      firstName,
      lastName,
      phoneNumber,
      userType: userTypeMapping[userCategory],
      password,
    };

    // Add manual referral code to payload body if present
    if (manualReferralCode.trim()) {
      payload.bodyReferralCode = manualReferralCode.trim();
    }
  
    try {
      // Clean URL construction
      const baseUrl = 'https://services.dcarbon.solutions';
      let url = `${baseUrl}/api/user/register`;
  
      // Use URL referral code as query parameter if present
      if (urlReferralCode.trim()) {
        url += `?referralCode=${urlReferralCode.trim()}`;
      }
  
      const response = await axios.post(
        url,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      localStorage.setItem('userEmail', response.data.data.email);
      toast.success('Registration successful');
      setShowModal(true);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () =>
    setPasswordVisible((prev) => !prev);
  const handleUserCategory = (category) =>
    setUserCategory(category);

  const toggleReferralField = () => {
    setShowReferralField(!showReferralField);
    if (!showReferralField) {
      setManualReferralCode('');
    }
  };

  // Get the display value for referral code input
  const getReferralDisplayValue = () => {
    return urlReferralCode || manualReferralCode;
  };

  // Check if referral field should be read-only
  const isReferralReadOnly = () => {
    return !!urlReferralCode;
  };

  return (
    <>
      {/* Loader overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      <div className={mainContainer}>
        {/* Logo Section */}
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            style={{ width: '116px', height: '37px', objectFit: 'contain' }}
          />
        </div>

        {/* Title Section - Two Lines on Large Screens */}
        <h1 className={pageTitle}>
          <span className="block lg:hidden">
            Start your Solar journey with DCarbon
          </span>
          <span className="hidden lg:block">
            Start your Solar journey
            <br />
            with DCarbon
          </span>
        </h1>

        {/* Horizontal Divider */}
        <hr className="w-full border border-gray-200 mt-4 mb-8" />

        {/* Form Container */}
        <div className="w-full max-w-md">
          {urlReferralCode && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
              You're registering with referral code: <strong>{urlReferralCode}</strong>
            </div>
          )}

          <form
            className={formWrapper}
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            {/* First Name and Last Name */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
              {/* First Name */}
              <div className="flex-1">
                <label htmlFor="firstName" className={labelClass}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Profile icon placeholder for First Name */}
                  <img
                    src="/vectors/profile_icon.png"
                    alt="Profile icon"
                    className="absolute w-[16px] h-[16px] top-1/2 left-2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    id="firstName"
                    placeholder="First name"
                    className={`${inputClass} ${grayPlaceholder} pl-10`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex-1">
                <label htmlFor="lastName" className={labelClass}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Profile icon placeholder for Last Name */}
                  <img
                    src="/vectors/profile_icon.png"
                    alt="Profile icon"
                    className="absolute w-[16px] h-[16px] top-1/2 left-2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Last name"
                    className={`${inputClass} ${grayPlaceholder} pl-10`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1E1E1E] text-[14px]">
                  @
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="name@domain.com"
                  className={`${inputClass} ${grayPlaceholder} pl-10`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* Unique black phone icon placeholder */}
                <img
                  src="/vectors/phone.png"
                  alt="Phone icon"
                  className="absolute w-[24px] h-[24px] top-1/2 left-2 -translate-y-1/2"
                />
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 000-000-0000"
                  className={`${inputClass} ${grayPlaceholder} pl-10`}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Referral Code Field */}
            <div>
              {!urlReferralCode && (
                <button
                  type="button"
                  onClick={toggleReferralField}
                  className="text-[#039994] text-sm font-sfpro underline mb-2"
                >
                  {showReferralField ? 'Hide referral code' : 'Have a referral code?'}
                </button>
              )}
              
              {showReferralField && (
                <div>
                  <label htmlFor="referralCode" className={labelClass}>
                    Referral Code
                    {urlReferralCode && <span className="text-sm text-gray-500 ml-2">(From invitation link)</span>}
                  </label>
                  <div className="relative">
                    <img
                      src="/vectors/referral_icon.png"
                      alt="Referral icon"
                      className="absolute w-[16px] h-[16px] top-1/2 left-2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      id="referralCode"
                      placeholder={isReferralReadOnly() ? "" : "Enter referral code"}
                      className={`${inputClass} ${grayPlaceholder} pl-10 ${
                        isReferralReadOnly() ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      value={getReferralDisplayValue()}
                      onChange={(e) => {
                        if (!isReferralReadOnly()) {
                          setManualReferralCode(e.target.value);
                        }
                      }}
                      readOnly={isReferralReadOnly()}
                      disabled={isReferralReadOnly()}
                    />
                    {isReferralReadOnly() && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {isReferralReadOnly() && (
                    <p className="mt-1 text-xs text-gray-500">
                      This referral code was provided through your invitation link and cannot be changed.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* User Category */}
            <div>
              <label className={labelClass}>
                Solar System Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {availableUserCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleUserCategory(category)}
                    className={`flex-1 text-center px-4 py-2 rounded-md text-sm font-sfpro transition duration-300 ease-in-out ${
                      userCategory === category
                        ? 'bg-[#039994] text-white'
                        : 'bg-transparent text-[#039994] border border-[#039994]'
                    } hover:bg-[#02857f] hover:text-white`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1E1E1E] text-[14px]">
                  |**
                </span>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  className={`${inputClass} ${grayPlaceholder} pl-12`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                >
                  {passwordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.03 3.97a.75.75 0 011.06 0l10 10a.75.75 0 11-1.06 1.06l-1.042-1.042A8.74 8.74 0 0110 15c-3.272 0-6.06-1.906-7.76-4.701a.945.945 0 010-1.006 10.45 10.45 0 013.12-3.263L4.03 5.03a.75.75 0 010-1.06zm12.24 7.79c.291-.424.546-.874.76-1.339a.945.945 0 000-1.006C16.06 6.905 13.272 5 10 5c-.638 0-1.26.07-1.856.202l7.127 7.127z"
                        clipRule="evenodd"
                    />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 font-sfpro text-[12px] font-[400] leading-[100%] tracking-[-0.05em] text-[#626060]">
                * Must be at least 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-[14px] font-sfpro">
                {error}
              </p>
            )}

            {/* Create Account Button */}
            <button type="submit" className={buttonPrimary}>
              Create Account
            </button>
          </form>

          {/* Already have an account? Sign in */}
          <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-0.05em] text-[#626060]">
            Already have an account?{' '}
            <a href="/login" className="text-[#039994] underline">
              Sign in
            </a>
          </p>

          {/* Horizontal Divider */}
          <hr className="w-full border border-gray-200 mt-4" />

          {/* Terms and Conditions */}
          <p className={termsTextContainer}>
            By clicking on 'Create Account', you agree to our{' '}
            <a href="/terms" className="text-[#039994] underline">
              Terms and Conditions
            </a>{' '}
            &amp;{' '}
            <a href="/privacy" className="text-[#039994] underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {showModal && <EmailModal closeModal={() => setShowModal(false)} />}
    </>
  );
}

export default function RegisterCard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full">Loading registration form...</div>}>
      <RegisterCardContent />
    </Suspense>
  );
}