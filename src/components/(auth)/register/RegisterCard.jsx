'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import EmailModal from '../../../components/modals/EmailModal';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
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
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userCategory, setUserCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [urlReferralCode, setUrlReferralCode] = useState('');
  const [manualReferralCode, setManualReferralCode] = useState('');
  const [showReferralField, setShowReferralField] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isOperatorType, setIsOperatorType] = useState(false);
  const [partnerType, setPartnerType] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('referral');
    const type = searchParams.get('type');
    
    if (code) {
      setUrlReferralCode(code);
      setShowReferralField(true);
      toast.success(`You've been invited with referral code: ${code}`);
    }
    
    if (type) {
      if (type.toLowerCase() === 'operator') {
        setIsOperatorType(true);
        setUserCategory('Operator');
      } else if (['installer', 'sales-agent', 'finance-company'].includes(type.toLowerCase())) {
        setPartnerType(type.toLowerCase());
        setUserCategory('Partner');
      }
    }
  }, [searchParams]);

  const userTypeMapping = {
    Residential: 'RESIDENTIAL',
    Commercial: 'COMMERCIAL',
    Partner: 'PARTNER',
    Operator: 'COMMERCIAL'
  };

  const partnerTypeMapping = {
    'installer': 'INSTALLER',
    'sales-agent': 'SALES-AGENT',
    'finance-company': 'FINANCE-COMPANY'
  };

  const getAvailableUserCategories = () => {
    if (isOperatorType) return ['Operator'];
    if (partnerType) return ['Partner'];
    if (!urlReferralCode && !manualReferralCode) return ['Residential', 'Commercial', 'Partner'];
    return ['Residential', 'Commercial'];
  };

  const validateForm = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Please fill out all fields.');
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
    const phoneRegex = /^\+?[0-9]{7,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number starting with + followed by country code.');
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
      isPartnerOperator: userCategory === 'Operator'
    };

    if (partnerType) {
      payload.partnerType = partnerTypeMapping[partnerType];
    }

    if (manualReferralCode.trim() && userCategory !== 'Partner') {
      payload.bodyReferralCode = manualReferralCode.trim();
    }

    try {
      const baseUrl = 'https://services.dcarbon.solutions';
      let url = `${baseUrl}/api/user/register`;

      const response = await axios.post(url, payload, { 
        headers: { 'Content-Type': 'application/json' } 
      });

      localStorage.setItem('userEmail', response.data.data.email);
      localStorage.setItem('userType', userTypeMapping[userCategory]);
      toast.success('Registration successful');
      setShowModal(true);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((prev) => !prev);
  
  const handleUserCategory = (category) => {
    if ((isOperatorType && category !== 'Operator') || (partnerType && category !== 'Partner')) {
      return;
    }
    setUserCategory(category);
  };

  const toggleReferralField = () => {
    setShowReferralField(!showReferralField);
    if (!showReferralField) {
      setManualReferralCode('');
    }
  };

  const getReferralDisplayValue = () => urlReferralCode || manualReferralCode;
  const isReferralReadOnly = () => !!urlReferralCode;

  const getButtonTooltip = (category) => {
    if (partnerType && category === 'Partner') {
      const typeMap = {
        'installer': 'Installer',
        'sales-agent': 'Sales Agent',
        'finance-company': 'Finance Company'
      };
      return `You have been invited to register on DCarbon as an ${typeMap[partnerType]}`;
    }
    
    switch(category) {
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
    return (isOperatorType && category !== 'Operator') || (partnerType && category !== 'Partner');
  };

  const availableUserCategories = getAvailableUserCategories();

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      <div className={mainContainer}>
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            style={{ width: '116px', height: '37px', objectFit: 'contain' }}
          />
        </div>

        <h1 className={pageTitle}>
          <span className="block lg:hidden">Start your Solar journey with DCarbon</span>
          <span className="hidden lg:block">
            Start your Solar journey<br />with DCarbon
          </span>
        </h1>

        <hr className="w-full border border-gray-200 mt-4 mb-8" />

        <div className="w-full max-w-md">
          {urlReferralCode && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
              You're registering with referral code: <strong>{urlReferralCode}</strong>
            </div>
          )}

          {(isOperatorType || partnerType) && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md text-sm">
              {isOperatorType && (
                <>You have been invited to register as an <strong>Operator</strong></>
              )}
              {partnerType === 'installer' && (
                <>You have been invited to register as an <strong>Installer</strong></>
              )}
              {partnerType === 'sales-agent' && (
                <>You have been invited to register as a <strong>Sales Agent</strong></>
              )}
              {partnerType === 'finance-company' && (
                <>You have been invited to register as a <strong>Finance Company</strong></>
              )}
            </div>
          )}

          <form className={formWrapper} onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
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

            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1E1E1E] text-[14px]">@</span>
                <input
                  type="email"
                  id="email"
                  placeholder="name@domain.com"
                  className={`${inputClass} ${grayPlaceholder} pl-10`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
                  required
                />
              </div>
            </div>

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
                      src="/vectors/referralIcon.png"
                      alt="Referral icon"
                      className="absolute w-[24px] h-[24px] top-1/2 left-2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      id="referralCode"
                      placeholder={isReferralReadOnly() ? "" : "Enter referral code"}
                      className={`${inputClass} ${grayPlaceholder} pl-10 ${isReferralReadOnly() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      value={getReferralDisplayValue()}
                      onChange={(e) => { if (!isReferralReadOnly()) setManualReferralCode(e.target.value); }}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

            <div>
              <label className={labelClass}>
                Solar System Type <span className="text-red-500">*</span>
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

            <div>
              <label htmlFor="password" className={labelClass}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  className={`${inputClass} ${grayPlaceholder} pr-10`}
                  placeholder="|**"
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
                      <path fillRule="evenodd" d="M4.03 3.97a.75.75 0 011.06 0l10 10a.75.75 0 11-1.06 1.06l-1.042-1.042A8.74 8.74 0 0110 15c-3.272 0-6.06-1.906-7.76-4.701a.945.945 0 010-1.006 10.45 10.45 0 013.12-3.263L4.03 5.03a.75.75 0 010-1.06zm12.24 7.79c.291-.424.546-.874.76-1.339a.945.945 0 000-1.006C16.06 6.905 13.272 5 10 5c-.638 0-1.26.07-1.856.202l7.127 7.127z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 font-sfpro text-[12px] font-[400] leading-[100%] tracking-[-0.05em] text-[#626060]">
                * Must be at least 6 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`${inputClass} ${grayPlaceholder} pr-10`}
                  placeholder="|**"
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
                      <path fillRule="evenodd" d="M4.03 3.97a.75.75 0 011.06 0l10 10a.75.75 0 11-1.06 1.06l-1.042-1.042A8.74 8.74 0 0110 15c-3.272 0-6.06-1.906-7.76-4.701a.945.945 0 010-1.006 10.45 10.45 0 013.12-3.263L4.03 5.03a.75.75 0 010-1.06zm12.24 7.79c.291-.424.546-.874.76-1.339a.945.945 0 000-1.006C16.06 6.905 13.272 5 10 5c-.638 0-1.26.07-1.856.202l7.127 7.127z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-[14px] font-sfpro">{error}</p>}

            <button type="submit" className={buttonPrimary}>
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-0.05em] text-[#626060]">
            Already have an account?{' '}
            <a href="/login" className="text-[#039994] underline">Sign in</a>
          </p>

          <hr className="w-full border border-gray-200 mt-4" />

          <p className={termsTextContainer}>
            By clicking on 'Create Account', you agree to our{' '}
            <a href="/terms-and-conditions" className="text-[#039994] underline">Terms and Conditions</a>{' '}
            &amp;{' '}
            <a href="/privacy" className="text-[#039994] underline">Privacy Policy</a>
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