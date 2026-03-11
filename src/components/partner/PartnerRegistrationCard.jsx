'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '../../../lib/config';
import toast from 'react-hot-toast';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [salesAgentName, setSalesAgentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [territory, setTerritory] = useState([]);
  const [customTerritory, setCustomTerritory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isPartnerTypeLocked, setIsPartnerTypeLocked] = useState(false);

  const router = useRouter();

  const californiaCounties = [
    'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa', 'Del Norte',
    'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo', 'Kern', 'Kings', 'Lake',
    'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa', 'Mendocino', 'Merced', 'Modoc',
    'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange', 'Placer', 'Plumas', 'Riverside', 'Sacramento',
    'San Benito', 'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo',
    'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra', 'Siskiyou',
    'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare', 'Tuolumne',
    'Ventura', 'Yolo', 'Yuba'
  ];

  useEffect(() => {
    const storedPartnerType = localStorage.getItem('partnerType');
    if (storedPartnerType) {
      const formattedType = storedPartnerType.toLowerCase().replace('_', '_');
      setPartnerType(formattedType);
      setIsPartnerTypeLocked(true);
    }
  }, []);

  const handleBackClick = async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      router.back();
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/api/user/partner/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.status === 'success' && response.data.data) {
        const partnerId = response.data.data.id;
        
        await axiosInstance.delete(
          `/api/user/partner/${partnerId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            timeout: 30000
          }
        );
        
        toast.success('Partner registration cancelled');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
    } finally {
      localStorage.removeItem('partnerType');
      router.back();
    }
  };

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
      markFieldTouched('phoneNumber');
      return;
    }

    const formatted = formatPhoneNumber(input);
    setPhoneNumber(formatted);
    markFieldTouched('phoneNumber');
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

  const getCompanyNameLabel = () => {
    switch(partnerType) {
      case 'sales_agent':
        return 'Sales Agent Company Name';
      case 'installer':
        return 'Contractor/EPC Company Name';
      case 'finance_company':
      default:
        return 'Company Name';
    }
  };

  const getCompanyNamePlaceholder = () => {
    switch(partnerType) {
      case 'sales_agent':
        return 'e.g., Solar Sales Inc.';
      case 'installer':
        return 'e.g., Green Energy Installers';
      case 'finance_company':
      default:
        return 'e.g., Solar Finance Corp';
    }
  };

  const getEmailLabel = () => {
    switch(partnerType) {
      case 'sales_agent':
        return 'Sales Agent Company Email';
      case 'installer':
        return 'Contractor/EPC Company Email';
      case 'finance_company':
      default:
        return 'Company Email';
    }
  };

  const getEmailPlaceholder = () => {
    switch(partnerType) {
      case 'sales_agent':
        return 'sales@company.com';
      case 'installer':
        return 'installer@company.com';
      case 'finance_company':
      default:
        return 'info@company.com';
    }
  };

  const getDisplayPartnerType = () => {
    switch(partnerType) {
      case 'sales_agent':
        return 'Sales Agent';
      case 'finance_company':
        return 'Finance Company';
      case 'installer':
      default:
        return 'Installer';
    }
  };

  const markFieldTouched = (fieldName) => {
    if (!touchedFields[fieldName]) {
      setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    }
  };

  const handleBlur = (fieldName) => {
    markFieldTouched(fieldName);
    validateField(fieldName);
  };

  const validateField = (name) => {
    let errorMessage = '';

    switch (name) {
      case 'partnerType':
        if (!partnerType) {
          errorMessage = 'Please select a partner type';
        }
        break;

      case 'partnerName':
        if (!partnerName.trim()) {
          errorMessage = `${getCompanyNameLabel()} is required`;
        } else if (partnerName.trim().length < 2) {
          errorMessage = `${getCompanyNameLabel()} must be at least 2 characters`;
        } else if (partnerName.trim().length > 100) {
          errorMessage = `${getCompanyNameLabel()} must be less than 100 characters`;
        } else if (!/^[a-zA-Z0-9\s\-'&.,]+$/.test(partnerName.trim())) {
          errorMessage = 'Company name contains invalid characters';
        }
        break;

      case 'salesAgentName':
        if (partnerType === 'sales_agent' && salesAgentName.trim().length > 100) {
          errorMessage = 'Sales agent name must be less than 100 characters';
        } else if (partnerType === 'sales_agent' && salesAgentName.trim() && !/^[a-zA-Z\s\-'.]+$/.test(salesAgentName.trim())) {
          errorMessage = 'Sales agent name contains invalid characters';
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.trim()) {
          errorMessage = `${getEmailLabel()} is required`;
        } else if (!emailRegex.test(email.trim())) {
          errorMessage = 'Please enter a valid email address (e.g., name@domain.com)';
        } else if (email.trim().length > 254) {
          errorMessage = 'Email address is too long';
        }
        break;

      case 'phoneNumber':
        const phoneRegex = /^\+1 \d{3}-\d{3}-\d{4}$/;
        if (!phoneNumber.trim()) {
          errorMessage = 'Phone number is required';
        } else if (!phoneRegex.test(phoneNumber.trim())) {
          errorMessage = 'Please use format: +1 555-123-4567';
        }
        break;

      case 'territory':
        if (!territory || territory.length === 0) {
          errorMessage = 'Please select at least one county or territory';
        }
        break;

      case 'address1':
        if (!address1.trim()) {
          errorMessage = 'Street address is required';
        } else if (address1.trim().length < 5) {
          errorMessage = 'Please enter a complete street address';
        } else if (address1.trim().length > 100) {
          errorMessage = 'Address must be less than 100 characters';
        }
        break;

      case 'address2':
        if (address2.trim().length > 100) {
          errorMessage = 'Address line 2 must be less than 100 characters';
        }
        break;

      case 'city':
        if (!city.trim()) {
          errorMessage = 'City is required';
        } else if (city.trim().length < 2) {
          errorMessage = 'Please enter a valid city name';
        } else if (city.trim().length > 50) {
          errorMessage = 'City must be less than 50 characters';
        } else if (!/^[a-zA-Z\s\-'.]+$/.test(city.trim())) {
          errorMessage = 'City name contains invalid characters';
        }
        break;

      case 'state':
        if (!state.trim()) {
          errorMessage = 'State is required';
        } else if (state.trim().length < 2) {
          errorMessage = 'Please enter a valid state';
        } else if (state.trim().length > 50) {
          errorMessage = 'State must be less than 50 characters';
        } else if (!/^[a-zA-Z\s\-'.]+$/.test(state.trim())) {
          errorMessage = 'State contains invalid characters';
        }
        break;

      case 'zipCode':
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipCode.trim()) {
          errorMessage = 'ZIP code is required';
        } else if (!zipRegex.test(zipCode.trim())) {
          errorMessage = 'Enter 5-digit ZIP (e.g., 90210) or ZIP+4 (e.g., 90210-1234)';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return !errorMessage;
  };

  const validateAllFields = () => {
    const fieldsToValidate = [
      'partnerType',
      'partnerName',
      'email',
      'phoneNumber',
      'territory',
      'address1',
      'city',
      'state',
      'zipCode'
    ];

    if (partnerType === 'sales_agent') {
      fieldsToValidate.push('salesAgentName');
    }

    let isValid = true;
    const newErrors = {};

    fieldsToValidate.forEach(fieldName => {
      const fieldValid = validateField(fieldName);
      if (!fieldValid) {
        isValid = false;
      }
    });

    if (address2.trim().length > 100) {
      newErrors.address2 = 'Address line 2 must be less than 100 characters';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    const allTouched = {};
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...allTouched }));

    if (!isValid) {
      let errorList = [];
      fieldsToValidate.forEach(field => {
        if (errors[field]) errorList.push(errors[field]);
      });
      if (newErrors.address2) errorList.push(newErrors.address2);
      
      toast.error(
        <div>
          <p className="font-semibold mb-1">Please fix the following:</p>
          <ul className="list-disc pl-4 text-sm">
            {errorList.slice(0, 3).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
            {errorList.length > 3 && <li>And {errorList.length - 3} more issues...</li>}
          </ul>
        </div>,
        { duration: 5000 }
      );
    }

    return isValid;
  };

  const checkAuthenticationBeforeSubmit = () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Your session has expired. Please log in again.', { duration: 4000 });
      return false;
    }

    if (userId.trim() === '' || authToken.trim() === '') {
      toast.error('Invalid authentication. Please log in again.', { duration: 4000 });
      return false;
    }

    return true;
  };

  const handleTerritoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedValues = selectedOptions.map(option => option.value);
    setTerritory(selectedValues);
    markFieldTouched('territory');
    validateField('territory');
  };

  const addCustomTerritory = () => {
    if (!customTerritory.trim()) {
      toast.error('Please enter a territory name');
      return;
    }

    if (territory.includes(customTerritory.trim())) {
      toast.error('This territory is already selected');
      return;
    }

    setTerritory([...territory, customTerritory.trim()]);
    setCustomTerritory('');
    setShowCustomInput(false);
    markFieldTouched('territory');
    validateField('territory');
    toast.success(`Added "${customTerritory.trim()}" to territories`);
  };

  const removeTerritory = (territoryToRemove) => {
    setTerritory(territory.filter(t => t !== territoryToRemove));
    if (territory.length === 1) {
      validateField('territory');
    }
    toast.success(`Removed "${territoryToRemove}" from territories`);
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!checkAuthenticationBeforeSubmit()) {
      return;
    }

    if (!validateAllFields()) {
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
        address: addressParts.join(', '),
        territory: territory
      };

      if (partnerType === 'sales_agent' && salesAgentName.trim()) {
        payload.salesAgentName = salesAgentName.trim();
      }

      const response = await axiosInstance.post(
        `/api/user/create-partner/${userId}`,
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
        toast.success(`${getDisplayPartnerType()} registration successful!`, { duration: 3000 });
        localStorage.setItem('partnerType', partnerType);
        
        setTimeout(() => {
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
        }, 500);
      } else {
        const errorMessage = response.data?.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Unable to complete registration. ';
      
      if (error.response?.data?.message) {
        const serverMsg = error.response.data.message;
        if (serverMsg.includes('duplicate') || serverMsg.includes('already exists')) {
          errorMessage = 'A partner with this email or company name already exists. Please use different information.';
        } else if (serverMsg.includes('validation')) {
          errorMessage = 'Some information provided is invalid. Please check your entries.';
        } else {
          errorMessage = serverMsg;
        }
      } else if (error.message && error.message !== 'Network Error') {
        errorMessage = error.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'This partner information is already registered. Please use different details.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check all fields and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);
    markFieldTouched(fieldName);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] transition-colors duration-200";
    
    if (touchedFields[fieldName] && errors[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    if (touchedFields[fieldName] && !errors[fieldName] && 
        ((fieldName === 'partnerName' && partnerName) || 
         (fieldName === 'email' && email) ||
         (fieldName === 'phoneNumber' && phoneNumber) ||
         (fieldName === 'address1' && address1) ||
         (fieldName === 'city' && city) ||
         (fieldName === 'state' && state) ||
         (fieldName === 'zipCode' && zipCode) ||
         (fieldName === 'territory' && territory.length > 0) ||
         (fieldName === 'partnerType' && partnerType))) {
      return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-[#039994]`;
  };

  const isFormValid = () => {
    const requiredFields = ['partnerType', 'partnerName', 'email', 'phoneNumber', 'address1', 'city', 'state', 'zipCode'];
    const hasRequiredFields = requiredFields.every(field => {
      switch(field) {
        case 'partnerType': return partnerType;
        case 'partnerName': return partnerName.trim();
        case 'email': return email.trim();
        case 'phoneNumber': return phoneNumber.trim();
        case 'address1': return address1.trim();
        case 'city': return city.trim();
        case 'state': return state.trim();
        case 'zipCode': return zipCode.trim();
        default: return true;
      }
    });

    const hasTerritory = territory.length > 0;
    const hasNoErrors = Object.values(errors).every(err => !err);

    return hasRequiredFields && hasTerritory && hasNoErrors;
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-sm mx-4">
            <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-sfpro text-center">Creating your partner account...</p>
            <p className="text-xs text-gray-400 mt-2 font-sfpro">This may take a moment</p>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
        <div className="relative w-full flex flex-col items-center mb-2">
          <div className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10 hover:text-[#02857f] transition-colors" onClick={handleBackClick}>
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
          <span className="text-sm font-medium text-gray-500 font-sfpro">Step 1 of 2</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Partner Type <span className="text-red-500">*</span>
            </label>
            {isPartnerTypeLocked ? (
              <input
                type="text"
                value={getDisplayPartnerType()}
                readOnly
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              />
            ) : (
              <>
                <select
                  value={partnerType}
                  onChange={handleInputChange(setPartnerType, 'partnerType')}
                  onBlur={() => handleBlur('partnerType')}
                  className={getInputClassName('partnerType') + " bg-white"}
                  required
                >
                  <option value="">-- Select partner type --</option>
                  <option value="installer">Installer / EPC</option>
                  <option value="sales_agent">Sales Agent</option>
                  <option value="finance_company">Finance Company</option>
                </select>
                {touchedFields.partnerType && errors.partnerType && (
                  <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                    <span className="mr-1">⚠️</span> {errors.partnerType}
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              {getCompanyNameLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={handleInputChange(setPartnerName, 'partnerName')}
              onBlur={() => handleBlur('partnerName')}
              placeholder={getCompanyNamePlaceholder()}
              className={getInputClassName('partnerName')}
              required
              maxLength={100}
            />
            {touchedFields.partnerName && errors.partnerName && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.partnerName}
              </p>
            )}
          </div>

          {partnerType === 'sales_agent' && (
            <div>
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Sales Agent Name <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={salesAgentName}
                onChange={handleInputChange(setSalesAgentName, 'salesAgentName')}
                onBlur={() => handleBlur('salesAgentName')}
                placeholder="e.g., John Smith"
                className={getInputClassName('salesAgentName')}
                maxLength={100}
              />
              {touchedFields.salesAgentName && errors.salesAgentName && (
                <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                  <span className="mr-1">⚠️</span> {errors.salesAgentName}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 font-sfpro">Primary contact person for sales</p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onKeyDown={handlePhoneKeyDown}
              onBlur={() => handleBlur('phoneNumber')}
              placeholder="+1 555-123-4567"
              className={getInputClassName('phoneNumber')}
              required
            />
            {touchedFields.phoneNumber && errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.phoneNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              {getEmailLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={handleInputChange(setEmail, 'email')}
              onBlur={() => handleBlur('email')}
              placeholder={getEmailPlaceholder()}
              className={getInputClassName('email')}
              required
              maxLength={254}
            />
            {touchedFields.email && errors.email && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Territory (Service Areas) <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              value={territory}
              onChange={handleTerritoryChange}
              onBlur={() => handleBlur('territory')}
              className={getInputClassName('territory') + " h-32"}
              size={6}
              required
            >
              {californiaCounties.map(county => (
                <option key={county} value={county} className="py-1">{county}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 font-sfpro">
              💡 Hold Ctrl (Windows) or Cmd (Mac) to select multiple counties
            </p>
            
            <div className="mt-3">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-sm text-[#039994] hover:underline font-sfpro flex items-center"
                >
                  <span className="mr-1">+</span> Add custom territory
                </button>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customTerritory}
                    onChange={(e) => setCustomTerritory(e.target.value)}
                    placeholder="Enter territory name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addCustomTerritory}
                    className="bg-[#039994] text-white px-3 py-1 rounded-md text-sm font-sfpro hover:bg-[#02857f] transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomTerritory('');
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-sfpro hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {territory.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 font-sfpro mb-2">
                  Selected ({territory.length}):
                </p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {territory.map((terr, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm font-sfpro flex items-center group">
                      {terr}
                      <button
                        type="button"
                        onClick={() => removeTerritory(terr)}
                        className="ml-1 text-red-500 hover:text-red-700 font-bold opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {touchedFields.territory && errors.territory && (
              <p className="mt-2 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.territory}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address1}
              onChange={handleInputChange(setAddress1, 'address1')}
              onBlur={() => handleBlur('address1')}
              placeholder="123 Main Street"
              className={getInputClassName('address1')}
              required
              maxLength={100}
            />
            {touchedFields.address1 && errors.address1 && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.address1}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address Line 2 <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={address2}
              onChange={handleInputChange(setAddress2, 'address2')}
              onBlur={() => handleBlur('address2')}
              placeholder="Suite 200, Building B"
              className={getInputClassName('address2')}
              maxLength={100}
            />
            {touchedFields.address2 && errors.address2 && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.address2}
              </p>
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
                onBlur={() => handleBlur('city')}
                placeholder="Los Angeles"
                className={getInputClassName('city')}
                required
                maxLength={50}
              />
              {touchedFields.city && errors.city && (
                <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                  <span className="mr-1">⚠️</span> {errors.city}
                </p>
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
                onBlur={() => handleBlur('state')}
                placeholder="California"
                className={getInputClassName('state')}
                required
                maxLength={50}
              />
              {touchedFields.state && errors.state && (
                <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                  <span className="mr-1">⚠️</span> {errors.state}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={handleInputChange(setZipCode, 'zipCode')}
              onBlur={() => handleBlur('zipCode')}
              placeholder="90210"
              className={getInputClassName('zipCode')}
              required
              maxLength={10}
            />
            {touchedFields.zipCode && errors.zipCode && (
              <p className="mt-1 text-sm text-red-500 font-sfpro flex items-start">
                <span className="mr-1">⚠️</span> {errors.zipCode}
              </p>
            )}
          </div>
        </div>

        <div className="w-full max-w-md mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
          >
            {loading ? 'Creating Account...' : 'Continue to Agreement →'}
          </button>
          
          {!isFormValid() && (
            <p className="mt-2 text-sm text-amber-600 font-sfpro text-center">
              ⚠️ Please complete all required fields correctly
            </p>
          )}
        </div>

        <div className="mt-8 text-center font-sfpro text-xs text-gray-500 max-w-md">
          By clicking 'Continue to Agreement', you agree to our{' '}
          <a href="/terms" className="text-[#039994] hover:underline font-medium">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}