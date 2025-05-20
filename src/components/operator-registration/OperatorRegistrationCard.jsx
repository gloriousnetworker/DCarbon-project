'use client';

import { useState, useEffect } from 'react';
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
  buttonSecondary: 'w-full rounded-md bg-gray-200 text-gray-800 font-semibold py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E]',
  termsLink: 'text-[#039994] hover:underline font-medium',
  mandatoryStar: 'text-red-500 ml-1',
  labelContainer: 'flex items-center',
  utilityProviderSection: 'w-full max-w-md mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200',
  utilityProviderTitle: 'text-lg font-semibold mb-3 text-gray-800 font-sfpro',
  providerCard: 'mb-4 p-3 bg-white rounded-md border border-gray-300 hover:border-[#039994] transition-colors',
  providerName: 'font-medium text-gray-800',
  providerWebsite: 'text-sm text-gray-500 mt-1',
  requestForm: 'mt-4 p-4 bg-white rounded-md border border-gray-300',
  requestInput: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#039994]',
  requestButton: 'w-full rounded-md bg-blue-600 text-white font-semibold py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
};

export default function OperatorRegistrationCard() {
  const [formData, setFormData] = useState({
    entityType: '',
    commercialRole: 'operator',
    ownerFullName: '',
    phoneNumber: '',
    utilityAuthEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    websiteUrl: ''
  });
  const [isFetchingProviders, setIsFetchingProviders] = useState(true);
  const router = useRouter();

  const localURL = 'https://services.dcarbon.solutions';

  useEffect(() => {
    const fetchUtilityProviders = async () => {
      try {
        const response = await fetch(`${localURL}/api/auth/utility-providers`);
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          setUtilityProviders(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch utility providers');
        }
      } catch (error) {
        toast.error(error.message || 'Error fetching utility providers', {
          style: {
            fontFamily: 'SF Pro',
            background: '#FFEBEE',
            color: '#B71C1C'
          }
        });
      } finally {
        setIsFetchingProviders(false);
      }
    };

    fetchUtilityProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
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
    if (!formData.utilityAuthEmail.trim()) {
      toast.error('Please enter utility authorization email', {
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

  const validateRequestForm = () => {
    if (!requestData.name.trim()) {
      toast.error('Please enter provider name', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return false;
    }
    if (!requestData.websiteUrl.trim()) {
      toast.error('Please enter provider website URL', {
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

  const updateUtilityAuthEmail = async (userId, authToken) => {
    try {
      const response = await fetch(
        `${localURL}/api/user/update-utility-auth-email/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            utilityAuthEmail: formData.utilityAuthEmail
          })
        }
      );

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to update utility auth email');
      }

      localStorage.setItem('userAuthEmail', formData.utilityAuthEmail);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const submitProviderRequest = async () => {
    if (!validateRequestForm()) return;

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
      const response = await fetch(
        `${localURL}/api/user/request-utility-provider/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(requestData)
        }
      );

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to submit provider request');
      }

      localStorage.setItem('utilityProviderRequest', JSON.stringify(data.data));

      toast.success('Provider request submitted successfully!', {
        style: {
          fontFamily: 'SF Pro',
          background: '#E8F5E9',
          color: '#1B5E20'
        }
      });

      router.push('/register/commercial-operator-registration/agreement');
    } catch (error) {
      toast.error(error.message || 'Error submitting provider request', {
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!selectedProvider) {
      toast.error('Please select a utility provider', {
        style: {
          fontFamily: 'SF Pro',
          background: '#FFEBEE',
          color: '#B71C1C'
        }
      });
      return;
    }

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
      // First update the utility auth email
      await updateUtilityAuthEmail(userId, authToken);

      // Then submit the operator registration data (without utilityProvider)
      const registrationResponse = await fetch(
        `${localURL}/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            entityType: formData.entityType,
            commercialRole: formData.commercialRole,
            ownerFullName: formData.ownerFullName,
            phoneNumber: formData.phoneNumber
          })
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

      // Store the selected provider in local storage for later use
      localStorage.setItem('selectedUtilityProvider', JSON.stringify(selectedProvider));

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

      // Open utility authorization in new tab
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
    router.push('/register/commercial-operator-registration/verify-email');
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

        {/* Utility Provider Section */}
        <div className={styles.utilityProviderSection}>
          <h2 className={styles.utilityProviderTitle}>Select Your Utility Provider</h2>
          
          {isFetchingProviders ? (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
            </div>
          ) : utilityProviders.length > 0 ? (
            <>
              <div className="max-h-60 overflow-y-auto mb-4">
                {utilityProviders.map(provider => (
                  <div 
                    key={provider.id}
                    className={`${styles.providerCard} ${selectedProvider?.id === provider.id ? 'border-[#039994] bg-[#f0f9f9]' : ''}`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className={styles.providerName}>{provider.name}</div>
                    <div className={styles.providerWebsite}>
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-[#039994] hover:underline">
                        {provider.website}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProvider && (
                <div className="text-sm text-green-600 mb-3">
                  Selected: <span className="font-medium">{selectedProvider.name}</span>
                </div>
              )}

              <button
                onClick={() => setShowRequestForm(true)}
                className={styles.buttonSecondary}
              >
                Provider Not Listed? Or Inactive?
              </button>
            </>
          ) : (
            <div className="text-center py-4 text-gray-600">
              No utility providers available at this time.
            </div>
          )}
        </div>

        {/* Request New Provider Form */}
        {showRequestForm && (
          <div className={styles.requestForm}>
            <h3 className="font-medium text-gray-800 mb-3">Request New Utility Provider</h3>
            <input
              type="text"
              name="name"
              value={requestData.name}
              onChange={handleRequestChange}
              className={styles.requestInput}
              placeholder="Provider Name"
            />
            <input
              type="url"
              name="websiteUrl"
              value={requestData.websiteUrl}
              onChange={handleRequestChange}
              className={styles.requestInput}
              placeholder="Provider Website URL"
            />
            <div className="flex space-x-3">
              <button
                onClick={submitProviderRequest}
                className={styles.requestButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => setShowRequestForm(false)}
                className="w-full rounded-md bg-gray-200 text-gray-800 font-semibold py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Registration Form (only show if provider is selected or request form isn't shown) */}
        {selectedProvider && !showRequestForm && (
          <>
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

              {/* Utility Authorization Email */}
              <div>
                <div className={styles.labelContainer}>
                  <label className={styles.labelClass}>Utility Authorization Email</label>
                  <span className={styles.mandatoryStar}>*</span>
                </div>
                <input
                  type="email"
                  name="utilityAuthEmail"
                  value={formData.utilityAuthEmail}
                  onChange={handleChange}
                  className={styles.inputClass}
                  placeholder="Enter email for utility authorization"
                />
              </div>
            </div>

            <div className="w-full max-w-md mt-6">
              <button
                onClick={handleSubmit}
                className={styles.buttonPrimary}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Click to Authorize your Utility Provider'}
              </button>
            </div>
          </>
        )}

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