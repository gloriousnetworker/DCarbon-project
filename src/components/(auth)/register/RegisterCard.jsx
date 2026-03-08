'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { axiosInstance } from '../../../../lib/config';
import Loader from '../../../components/loader/Loader';
import EmailModal from '../../../components/modals/EmailModal';
import { toast } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
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

function RegisterCardContent() {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userCategory, setUserCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [urlReferralCode, setUrlReferralCode] = useState('');
  const [manualReferralCode, setManualReferralCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isOperatorType, setIsOperatorType] = useState(false);
  const [partnerType, setPartnerType] = useState('');
  const [isResidentialType, setIsResidentialType] = useState(false);
  const [isCommercialType, setIsCommercialType] = useState(false);
  const [acceptSms, setAcceptSms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [hasInvitation, setHasInvitation] = useState(false);
  const [showPartnerRoles, setShowPartnerRoles] = useState(false);

  const searchParams = useSearchParams();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  useEffect(() => {
    const code = searchParams.get('referral') || searchParams.get('referralCode');
    const type = searchParams.get('type');

    if (code || type) {
      setHasInvitation(true);
    }

    if (code) {
      setUrlReferralCode(code);
      setManualReferralCode(code);
      toast.success(`You've been invited with referral code: ${code}`);
    }

    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'operator') {
        setIsOperatorType(true);
        setUserCategory('Operator');
      } else if (lowerType.includes('installer')) {
        setPartnerType('installer');
        setUserCategory('Partner');
        setShowPartnerRoles(true);
      } else if (lowerType.includes('sales-agent')) {
        setPartnerType('sales-agent');
        setUserCategory('Partner');
        setShowPartnerRoles(true);
      } else if (lowerType.includes('finance-company')) {
        setPartnerType('finance-company');
        setUserCategory('Partner');
        setShowPartnerRoles(true);
      } else if (lowerType === 'residential') {
        setIsResidentialType(true);
        setUserCategory('Residential');
      } else if (lowerType === 'commercial') {
        setIsCommercialType(true);
        setUserCategory('Commercial');
      }
    }
  }, [searchParams]);

  const formatPhoneNumber = (value) => {
    if (value === '+1 ') return '';

    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+1 ${numbers}`;
    if (numbers.length <= 4) return `+1 ${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+1 ${numbers.slice(1, 4)}-${numbers.slice(4)}`;
    return `+1 ${numbers.slice(1, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;

    if (input.length < phoneNumber.length) {
      setPhoneNumber(input);
      return;
    }

    const formatted = formatPhoneNumber(input);
    setPhoneNumber(formatted);
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;

      if (selectionStart === selectionEnd) {
        if (selectionStart === 4 || selectionStart === 8 || selectionStart === 12) {
          e.preventDefault();
          e.target.setSelectionRange(selectionStart - 1, selectionStart - 1);
        }
      }
    }
  };

  const userTypeMapping = {
    Residential: 'RESIDENTIAL',
    Commercial: 'COMMERCIAL',
    Partner: 'PARTNER',
    Operator: 'COMMERCIAL',
  };

  const partnerTypeMapping = {
    installer: 'INSTALLER',
    'sales-agent': 'SALES_AGENT',
    'finance-company': 'FINANCE_COMPANY',
  };

  const getAvailableUserCategories = () => {
    if (isOperatorType) return ['Operator'];
    if (isResidentialType) return ['Residential'];
    if (isCommercialType) return ['Commercial'];
    if (urlReferralCode && !partnerType) return ['Residential', 'Commercial'];
    return ['Residential', 'Commercial', 'Partner'];
  };

  const getInvitationMessage = () => {
    if (!hasInvitation) return null;

    if (isOperatorType) {
      return <>You have been invited to register as an <strong>Operator</strong></>;
    }
    if (partnerType === 'installer') {
      return <>You have been invited to register as an <strong>Installer</strong></>;
    }
    if (partnerType === 'sales-agent') {
      return <>You have been invited to register as a <strong>Sales Agent</strong></>;
    }
    if (partnerType === 'finance-company') {
      return <>You have been invited to register as a <strong>Finance Company</strong></>;
    }
    if (isResidentialType) {
      return <>You have been invited to register as a <strong>Residential</strong> solar owner</>;
    }
    if (isCommercialType) {
      return <>You have been invited to register as a <strong>Commercial</strong> solar owner</>;
    }
    if (urlReferralCode) {
      return <>You're registering with referral code: <strong>{urlReferralCode}</strong></>;
    }
    return null;
  };

  const getSelectionMessage = () => {
    if (hasInvitation) return null;

    if (userCategory === 'Operator') {
      return <>You are now registering as an <strong>Operator</strong></>;
    }
    if (userCategory === 'Partner' && partnerType === 'installer') {
      return <>You are now registering as an <strong>Installer</strong></>;
    }
    if (userCategory === 'Partner' && partnerType === 'sales-agent') {
      return <>You are now registering as a <strong>Sales Agent</strong></>;
    }
    if (userCategory === 'Partner' && partnerType === 'finance-company') {
      return <>You are now registering as a <strong>Finance Company</strong></>;
    }
    if (userCategory === 'Residential') {
      return <>You are now registering as a <strong>Residential</strong> solar owner</>;
    }
    if (userCategory === 'Commercial') {
      return <>You are now registering as a <strong>Commercial</strong> solar owner</>;
    }
    return null;
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaToken('');
  };

  const validateForm = () => {
    if (!captchaToken) {
      setCaptchaError('Please complete the captcha verification before registering.');
      return false;
    }
    setCaptchaError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!userCategory) {
      setError('Please select a solar owner type.');
      return false;
    }
    if (userCategory === 'Partner' && !partnerType) {
      setError('Please select your partner role.');
      return false;
    }
    if (phoneNumber) {
      const phoneRegex = /^\+1 \d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(phoneNumber)) {
        setError('Please enter a valid phone number in format +1 000-000-0000.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    if (!captchaToken) {
      setCaptchaError('Please complete the captcha verification before registering.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      email,
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      userType: userTypeMapping[userCategory],
      password,
      isPartnerOperator: userCategory === 'Operator',
      captchaToken,
    };

    if (userCategory === 'Partner') {
      payload.partnerType = partnerTypeMapping[partnerType];
    }

    try {
      let url = `/api/user/register`;

      if (manualReferralCode.trim()) {
        url += `?referralCode=${manualReferralCode.trim()}`;
      }

      const response = await axiosInstance.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      if (response.data.status === 'success') {
        localStorage.setItem('userEmail', response.data.data.email);
        localStorage.setItem('userType', userTypeMapping[userCategory]);
        toast.success('Registration successful! Please verify your email.');
        setShowModal(true);

        setTimeout(() => {
          router.push('/register/email-verification');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = 'Registration failed';

      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((prev) => !prev);

  const handleUserCategory = (category) => {
    if (
      (isOperatorType && category !== 'Operator') ||
      (isResidentialType && category !== 'Residential') ||
      (isCommercialType && category !== 'Commercial')
    ) {
      return;
    }

    setUserCategory(category);

    if (category === 'Partner') {
      setShowPartnerRoles(true);
    } else {
      setShowPartnerRoles(false);
      setPartnerType('');
    }
  };

  const handleBackToCategories = () => {
    setShowPartnerRoles(false);
    setPartnerType('');
    setUserCategory('');
  };

  const handlePartnerRoleSelect = (role) => {
    setPartnerType(role);
  };

  const getButtonTooltip = (category) => {
    if (hasInvitation && partnerType && category === 'Partner') {
      const typeMap = {
        installer: 'Installer',
        'sales-agent': 'Sales Agent',
        'finance-company': 'Finance Company',
      };
      return `You have been invited to register on DCarbon as an ${typeMap[partnerType]}`;
    }

    switch (category) {
      case 'Residential':
        return 'I have a solar system on my home';
      case 'Commercial':
        return 'I have a solar system on my C&I facility(ies)';
      case 'Partner':
        return 'Solar Contractor/EPC/TPO/ Finance/Sales';
      case 'Operator':
        return 'I pay the utility bills on a facility with a Solar System';
      default:
        return '';
    }
  };

  const isCategoryDisabled = (category) => {
    return (
      (isOperatorType && category !== 'Operator') ||
      (isResidentialType && category !== 'Residential') ||
      (isCommercialType && category !== 'Commercial')
    );
  };

  const availableUserCategories = getAvailableUserCategories();
  const invitationMessage = getInvitationMessage();
  const selectionMessage = getSelectionMessage();

  const onCaptchaChange = (token) => {
    if (token) {
      setCaptchaToken(token);
      setCaptchaError('');
    } else {
      setCaptchaToken('');
    }
  };

  const onCaptchaExpired = () => {
    setCaptchaToken('');
    setCaptchaError('Captcha has expired. Please complete it again.');
  };

  const onCaptchaError = () => {
    setCaptchaToken('');
    setCaptchaError('Captcha encountered an error. Please try again.');
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      <div className={mainContainer}>
        <div className="mb-8">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon"
            style={{ width: '160px', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        <h1 className={pageTitle}>
          <span>Enroll your Solar System for Free</span>
        </h1>

        <hr className="w-full border border-gray-200 mt-4 mb-8" />

        <div className="w-full max-w-md">
          {invitationMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
              {invitationMessage}
            </div>
          )}

          {selectionMessage && !invitationMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md text-sm">
              {selectionMessage}
            </div>
          )}

          <form
            className={formWrapper}
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            {!showPartnerRoles ? (
              <>
                <div className="mb-4">
                  <label className={labelClass}>
                    Choose Solar Owner type or Partner Enrollment <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {availableUserCategories.map((category) => (
                      <div key={category} className="relative flex-1 group">
                        <button
                          type="button"
                          onClick={() => handleUserCategory(category)}
                          onMouseEnter={() => setHoveredButton(category)}
                          onMouseLeave={() => setHoveredButton(null)}
                          disabled={isCategoryDisabled(category)}
                          className={`w-full text-center px-4 py-2 rounded-md text-sm font-sfpro transition duration-300 ease-in-out ${
                            isCategoryDisabled(category)
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : userCategory === category
                              ? 'bg-[#039994] text-white'
                              : 'bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white'
                          }`}
                        >
                          {category}
                        </button>
                        {hoveredButton === category && !isCategoryDisabled(category) && (
                          <div className="absolute z-10 w-full mt-1 p-2 text-xs bg-white border border-gray-200 rounded shadow-lg text-center break-words">
                            {getButtonTooltip(category)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Partner Role <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="text-sm text-[#039994] hover:underline flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back to categories
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handlePartnerRoleSelect('installer')}
                    className={`px-4 py-2 rounded-md text-sm font-sfpro ${
                      partnerType === 'installer'
                        ? 'bg-[#039994] text-white'
                        : 'bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white'
                    }`}
                  >
                    EPC/Installer
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePartnerRoleSelect('sales-agent')}
                    className={`px-4 py-2 rounded-md text-sm font-sfpro ${
                      partnerType === 'sales-agent'
                        ? 'bg-[#039994] text-white'
                        : 'bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white'
                    }`}
                  >
                    Sales Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePartnerRoleSelect('finance-company')}
                    className={`px-4 py-2 rounded-md text-sm font-sfpro ${
                      partnerType === 'finance-company'
                        ? 'bg-[#039994] text-white'
                        : 'bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white'
                    }`}
                  >
                    Finance Company
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="referralCode" className={labelClass}>
                Enter your Referral Code to streamline Enrollment{' '}
                <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <div className="relative">
                <img
                  src="/vectors/referralIcon.png"
                  alt="Referral icon"
                  className="absolute w-[24px] h-[24px] top-1/2 left-2 -translate-y-1/2"
                />
                <input
                  type="text"
                  id="referralCode"
                  placeholder="Enter referral code"
                  className={`${inputClass} ${grayPlaceholder} pl-10`}
                  value={manualReferralCode}
                  onChange={(e) => setManualReferralCode(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0 mb-4">
              <div className="flex-1">
                <label htmlFor="firstName" className={labelClass}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
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
                    required
                  />
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="lastName" className={labelClass}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
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
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="name@domain.com"
                className={`${inputClass} ${grayPlaceholder}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className={labelClass}>
                Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+1 000-000-0000"
                className={`${inputClass} ${grayPlaceholder}`}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                onKeyDown={handlePhoneKeyDown}
              />
              {phoneNumber && (
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="acceptSms"
                    checked={acceptSms}
                    onChange={(e) => setAcceptSms(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="acceptSms" className="text-xs text-gray-600">
                    I agree to receive text messages. Message and data rates may apply.
                  </label>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className={labelClass}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  className={`${inputClass} ${grayPlaceholder} pr-10`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

            <div className="mb-4">
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`${inputClass} ${grayPlaceholder} pr-10`}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                >
                  {confirmPasswordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4 flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                onChange={onCaptchaChange}
                onExpired={onCaptchaExpired}
                onError={onCaptchaError}
              />
            </div>
            {captchaError && <p className="text-red-500 text-[14px] font-sfpro mb-2">{captchaError}</p>}

            {error && <p className="text-red-500 text-[14px] font-sfpro mb-2">{error}</p>}

            <button type="submit" className={buttonPrimary} disabled={!captchaToken || loading}>
              Create Account
            </button>
            {!captchaToken && (
              <p className="text-amber-600 text-[12px] font-sfpro mt-1 text-center">
                Please complete the captcha to register
              </p>
            )}
          </form>

          <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-0.05em] text-[#626060]">
            Already have an account?{' '}
            <a href="/login" className="text-[#039994] underline">
              Sign in
            </a>
          </p>

          <hr className="w-full border border-gray-200 mt-4" />

          <p className={termsTextContainer}>
            By clicking on 'Create Account', you agree to our{' '}
            <a href="/terms-and-conditions" className="text-[#039994] underline">
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