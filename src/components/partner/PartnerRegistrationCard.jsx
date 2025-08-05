'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [partnerType, setPartnerType] = useState('installer');
  const [errors, setErrors] = useState({});

  const router = useRouter();

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'partnerName':
        if (!value.trim()) {
          newErrors.partnerName = 'Company name is required';
        } else if (value.trim().length < 2) {
          newErrors.partnerName = 'Company name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.partnerName = 'Company name must be less than 100 characters';
        } else {
          delete newErrors.partnerName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(value.trim())) {
          newErrors.email = 'Please enter a valid email address';
        } else if (value.trim().length > 254) {
          newErrors.email = 'Email address is too long';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phoneNumber':
        const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
        const cleanPhone = value.replace(/\D/g, '');
        if (!value.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!phoneRegex.test(value.trim()) && cleanPhone.length !== 10 && cleanPhone.length !== 11) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;

      case 'address1':
        if (!value.trim()) {
          newErrors.address1 = 'Address is required';
        } else if (value.trim().length < 5) {
          newErrors.address1 = 'Address must be at least 5 characters';
        } else if (value.trim().length > 100) {
          newErrors.address1 = 'Address must be less than 100 characters';
        } else {
          delete newErrors.address1;
        }
        break;

      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else if (value.trim().length < 2) {
          newErrors.city = 'City must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.city = 'City must be less than 50 characters';
        } else if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          newErrors.city = 'City contains invalid characters';
        } else {
          delete newErrors.city;
        }
        break;

      case 'state':
        if (!value.trim()) {
          newErrors.state = 'State is required';
        } else if (value.trim().length < 2) {
          newErrors.state = 'State must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.state = 'State must be less than 50 characters';
        } else if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          newErrors.state = 'State contains invalid characters';
        } else {
          delete newErrors.state;
        }
        break;

      case 'zipCode':
        const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/;
        if (!value.trim()) {
          newErrors.zipCode = 'Zip code is required';
        } else if (!zipRegex.test(value.trim())) {
          newErrors.zipCode = 'Please enter a valid zip code (12345 or 12345-6789)';
        } else {
          delete newErrors.zipCode;
        }
        break;

      case 'partnerType':
        const validTypes = ['installer', 'sales_agent', 'finance_company'];
        if (!validTypes.includes(value)) {
          newErrors.partnerType = 'Please select a valid partner type';
        } else {
          delete newErrors.partnerType;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllFields = () => {
    const fields = {
      partnerName: partnerName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      address1: address1.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      partnerType: partnerType
    };

    let isValid = true;
    const newErrors = {};

    Object.keys(fields).forEach(fieldName => {
      const fieldIsValid = validateField(fieldName, fields[fieldName]);
      if (!fieldIsValid) {
        isValid = false;
      }
    });

    if (address2.trim().length > 100) {
      newErrors.address2 = 'Address 2 must be less than 100 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  const checkAuthenticationBeforeSubmit = () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Authentication required. Please log in again.');
      return false;
    }

    if (userId.trim() === '' || authToken.trim() === '') {
      toast.error('Invalid authentication. Please log in again.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!checkAuthenticationBeforeSubmit()) {
      return;
    }

    if (!validateAllFields()) {
      toast.error('Please fix all errors before proceeding');
      return;
    }

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    setLoading(true);

    try {
      const addressParts = [
        address1.trim(),
        address2.trim(),
        city.trim(),
        state.trim(),
        zipCode.trim()
      ].filter(part => part.length > 0);

      const payload = {
        name: partnerName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        partnerType: partnerType,
        address: addressParts.join(', ')
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/create-partner/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.status === 'success') {
        toast.success('Partner registration successful');
        localStorage.setItem('partnerType', partnerType);
        
        switch(partnerType) {
          case 'sales_agent':
            router.push('/register/partner-user-registration/sales-agent-agreement');
            break;
          case 'finance_company':
            router.push('/register/partner-user-registration/finance-company-agreement');
            break;
          case 'installer':
          default:
            router.push('/register/partner-user-registration/partner-installer-agreement');
        }
      } else {
        const errorMessage = response.data?.message || 'Partner registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Partner registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== 'Network Error') {
        errorMessage = error.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Partner already exists with this information.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);
    
    setTimeout(() => {
      validateField(fieldName, value);
    }, 300);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = "border-gray-300 focus:ring-[#039994]";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  const isFormValid = () => {
    return partnerName.trim() && 
           email.trim() && 
           phoneNumber.trim() && 
           address1.trim() && 
           city.trim() && 
           state.trim() && 
           zipCode.trim() && 
           partnerType &&
           Object.keys(errors).length === 0;
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-sfpro">Processing registration...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
        <div className="relative w-full flex flex-col items-center mb-2">
          <div className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10" onClick={() => router.back()}>
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
        </div>

        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
          Partner Information
        </h1>

        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/2 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500 font-sfpro">01/02</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Partner Type <span className="text-red-500">*</span>
            </label>
            <select
              value={partnerType}
              onChange={handleInputChange(setPartnerType, 'partnerType')}
              className={getInputClassName('partnerType') + " bg-white"}
              required
            >
              <option value="installer">Installer</option>
              <option value="sales_agent">Sales Agent</option>
              <option value="finance_company">Finance Company</option>
            </select>
            {errors.partnerType && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.partnerType}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={handleInputChange(setPartnerName, 'partnerName')}
              placeholder="Company name"
              className={getInputClassName('partnerName')}
              required
              maxLength={100}
            />
            {errors.partnerName && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.partnerName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handleInputChange(setPhoneNumber, 'phoneNumber')}
              placeholder="(123) 456-7890"
              className={getInputClassName('phoneNumber')}
              required
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={handleInputChange(setEmail, 'email')}
              placeholder="name@domain.com"
              className={getInputClassName('email')}
              required
              maxLength={254}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address1}
              onChange={handleInputChange(setAddress1, 'address1')}
              placeholder="123 Main St"
              className={getInputClassName('address1')}
              required
              maxLength={100}
            />
            {errors.address1 && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.address1}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address 2
            </label>
            <input
              type="text"
              value={address2}
              onChange={handleInputChange(setAddress2, 'address2')}
              placeholder="Apt, suite, unit, etc."
              className={getInputClassName('address2')}
              maxLength={100}
            />
            {errors.address2 && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.address2}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={handleInputChange(setCity, 'city')}
                placeholder="City"
                className={getInputClassName('city')}
                required
                maxLength={50}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.city}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={state}
                onChange={handleInputChange(setState, 'state')}
                placeholder="State"
                className={getInputClassName('state')}
                required
                maxLength={50}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={handleInputChange(setZipCode, 'zipCode')}
              placeholder="12345"
              className={getInputClassName('zipCode')}
              required
              maxLength={10}
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-500 font-sfpro">{errors.zipCode}</p>
            )}
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>

        <div className="mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
          By clicking on 'Next', you agree to our{' '}
          <a href="/terms" className="text-[#039994] hover:underline font-medium">
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}