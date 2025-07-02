import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import OwnerAndOperatorTermsAndAgreementModal from './OwnerAndOperatorTermsAndAgreementModal';
import FinanceAndInstallerModal from './FinanceAndInstallerModal';
import OwnerFinanceAndInstallerModal from '../ownerRegistration/FinanceAndInstallerModal';
import * as styles from '../../styles';

export default function OwnerDetailsModal({ isOpen, onClose, onBack }) {
  const [isMultipleOwners, setIsMultipleOwners] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showOwnerFinanceModal, setShowOwnerFinanceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState({
    ownerFullName: "",
    phoneNumber: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    ownerWebsite: ""
  });
  const [additionalOwners, setAdditionalOwners] = useState([{
    fullName: "",
    email: "",
    phoneNumber: "",
    ownershipPercentage: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    ownerWebsite: ""
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [commercialRole, setCommercialRole] = useState('both');

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
      }

      if (data.data && data.data.commercialUser) {
        const commercialUser = data.data.commercialUser;
        const addressParts = commercialUser.ownerAddress ? commercialUser.ownerAddress.split(', ') : [];
        setOwnerDetails({
          ownerFullName: commercialUser.ownerFullName || "",
          phoneNumber: commercialUser.phoneNumber || data.data.phoneNumber || "",
          address1: addressParts[0] || "",
          address2: addressParts[1] || "",
          city: addressParts[2] || "",
          state: addressParts[3] || "",
          zipCode: addressParts[4] || "",
          ownerWebsite: commercialUser.ownerWebsite || ""
        });

        if (commercialUser.commercialRole) {
          setCommercialRole(commercialUser.commercialRole);
        }

        if (commercialUser.multipleUsers && commercialUser.multipleUsers.length > 0) {
          setIsMultipleOwners(true);
          setAdditionalOwners(commercialUser.multipleUsers.map(user => {
            const userAddressParts = user.ownerAddress ? user.ownerAddress.split(', ') : [];
            return {
              fullName: user.fullName || "",
              email: user.email || "",
              phoneNumber: user.phoneNumber || "",
              ownershipPercentage: user.ownershipPercentage || "",
              address1: userAddressParts[0] || "",
              address2: userAddressParts[1] || "",
              city: userAddressParts[2] || "",
              state: userAddressParts[3] || "",
              zipCode: userAddressParts[4] || "",
              ownerWebsite: user.ownerWebsite || ""
            };
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message || 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOwnerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdditionalOwnerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOwners = [...additionalOwners];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [name]: value
    };
    setAdditionalOwners(updatedOwners);
  };

  const addAdditionalOwner = () => {
    setAdditionalOwners([...additionalOwners, {
      fullName: "",
      email: "",
      phoneNumber: "",
      ownershipPercentage: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      ownerWebsite: ""
    }]);
  };

  const removeAdditionalOwner = (index) => {
    if (additionalOwners.length > 1) {
      const updatedOwners = additionalOwners.filter((_, i) => i !== index);
      setAdditionalOwners(updatedOwners);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        throw new Error('Authentication required. Please log in again.');
      }

      const ownerAddress = [
        ownerDetails.address1,
        ownerDetails.address2,
        ownerDetails.city,
        ownerDetails.state,
        ownerDetails.zipCode
      ].filter(Boolean).join(', ');

      const payload = {
        entityType: "individual",
        commercialRole: commercialRole,
        ownerFullName: ownerDetails.ownerFullName,
        phoneNumber: ownerDetails.phoneNumber,
        ownerAddress: ownerAddress,
        ownerWebsite: ownerDetails.ownerWebsite
      };

      if (isMultipleOwners && additionalOwners.length > 0) {
        payload.multipleUsers = additionalOwners.filter(owner => 
          owner.fullName.trim() !== "" || owner.email.trim() !== ""
        ).map(owner => ({
          ...owner,
          ownerAddress: [
            owner.address1,
            owner.address2,
            owner.city,
            owner.state,
            owner.zipCode
          ].filter(Boolean).join(', ')
        }));
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save owner details');
      }

      toast.success('Owner details saved successfully!');
      
      if (commercialRole === 'both') {
        setShowTermsModal(true);
      } else {
        setShowOwnerFinanceModal(true);
      }
    } catch (error) {
      console.error('Error saving owner details:', error);
      toast.error(error.message || 'Failed to save owner details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTermsModalClose = () => {
    setShowTermsModal(false);
    setShowFinanceModal(true);
  };

  const handleFinanceModalClose = () => {
    setShowFinanceModal(false);
    onClose();
  };

  const handleFinanceModalBack = () => {
    setShowFinanceModal(false);
  };

  const handleOwnerFinanceModalClose = () => {
    setShowOwnerFinanceModal(false);
    onClose();
  };

  const handleOwnerFinanceModalBack = () => {
    setShowOwnerFinanceModal(false);
  };

  const toggleRoleDropdown = () => {
    setShowRoleDropdown(!showRoleDropdown);
  };

  const handleRoleChange = (role) => {
    setCommercialRole(role);
    setShowRoleDropdown(false);
  };

  if (showFinanceModal) {
    return (
      <FinanceAndInstallerModal
        isOpen={showFinanceModal}
        onClose={handleFinanceModalClose}
        onBack={handleFinanceModalBack}
      />
    );
  }

  if (showOwnerFinanceModal) {
    return (
      <OwnerFinanceAndInstallerModal
        isOpen={showOwnerFinanceModal}
        onClose={handleOwnerFinanceModalClose}
        onBack={handleOwnerFinanceModalBack}
      />
    );
  }

  if (showTermsModal) {
    return (
      <OwnerAndOperatorTermsAndAgreementModal
        isOpen={showTermsModal}
        onClose={handleTermsModalClose}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {isLoading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="relative p-6 pb-4">
            {onBack && (
              <button
                onClick={onBack}
                className={styles.backArrow}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-red-500 hover:text-red-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="flex justify-between items-center mb-2">
              <h2 className={`${styles.pageTitle} mt-8`}>
                Owner and Operator Details
              </h2>
              <div className="relative">
                <button
                  onClick={toggleRoleDropdown}
                  className="text-[#039994] text-sm font-medium underline hover:text-[#02857f]"
                >
                  Change Role
                </button>
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleRoleChange('owner')}
                        className={`block w-full text-left px-4 py-2 text-sm ${commercialRole === 'owner' ? 'bg-gray-100 text-[#039994]' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Owner
                      </button>
                      <button
                        onClick={() => handleRoleChange('both')}
                        className={`block w-full text-left px-4 py-2 text-sm ${commercialRole === 'both' ? 'bg-gray-100 text-[#039994]' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Owner & Operator
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBarWrapper}>
                <div className="h-1 bg-[#039994] rounded-full" style={{ width: '50%' }}></div>
              </div>
              <span className={styles.progressStepText}>02/04</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={styles.labelClass}>
                  Generator Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerFullName"
                  value={ownerDetails.ownerFullName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                  required
                />
              </div>

              <div>
                <label className={styles.labelClass}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={ownerDetails.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                  required
                />
              </div>

              <div>
                <label className={styles.labelClass}>
                  Address 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address1"
                  value={ownerDetails.address1}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                  required
                />
              </div>

              <div>
                <label className={styles.labelClass}>
                  Address 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={ownerDetails.address2}
                  onChange={handleInputChange}
                  placeholder="Apt, suite, unit, etc."
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                />
              </div>

              <div className={styles.rowWrapper}>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={ownerDetails.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                    required
                  />
                </div>
                <div className={styles.halfWidth}>
                  <label className={styles.labelClass}>
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={ownerDetails.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={styles.labelClass}>
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={ownerDetails.zipCode}
                  onChange={handleInputChange}
                  placeholder="Zip code"
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                  required
                />
              </div>

              <div>
                <label className={styles.labelClass}>
                  Website details
                </label>
                <input
                  type="url"
                  name="ownerWebsite"
                  value={ownerDetails.ownerWebsite}
                  onChange={handleInputChange}
                  placeholder="http://"
                  className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={styles.labelClass}>
                    Multiple Owners?
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="multipleOwners"
                        checked={isMultipleOwners}
                        onChange={() => setIsMultipleOwners(true)}
                        className="w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] accent-[#039994]"
                      />
                      <span className={`ml-2 ${styles.labelClass}`}>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="multipleOwners"
                        checked={!isMultipleOwners}
                        onChange={() => setIsMultipleOwners(false)}
                        className="w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] accent-[#039994]"
                      />
                      <span className={`ml-2 ${styles.labelClass}`}>No</span>
                    </label>
                  </div>
                </div>
              </div>

              {isMultipleOwners && (
                <div className="space-y-4">
                  {additionalOwners.map((owner, index) => (
                    <div key={index} className="border border-[#039994] rounded-lg p-4 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-[#039994] text-white px-3 py-1 rounded text-sm font-sfpro">
                          {owner.fullName || `Owner ${index + 2}`}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="text-[#039994] hover:text-[#02857f]"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                              <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          {additionalOwners.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAdditionalOwner(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className={styles.rowWrapper}>
                          <div className={styles.halfWidth}>
                            <input
                              type="text"
                              name="fullName"
                              value={owner.fullName}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Full name *"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                              required
                            />
                          </div>
                          <div className={styles.halfWidth}>
                            <input
                              type="text"
                              name="ownershipPercentage"
                              value={owner.ownershipPercentage}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="% ownership"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                            />
                          </div>
                        </div>

                        <div className={styles.rowWrapper}>
                          <div className={styles.halfWidth}>
                            <input
                              type="email"
                              name="email"
                              value={owner.email}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Email address *"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                              required
                            />
                          </div>
                          <div className={styles.halfWidth}>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={owner.phoneNumber}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Phone Number *"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className={styles.labelClass}>
                            Address 1
                          </label>
                          <input
                            type="text"
                            name="address1"
                            value={owner.address1}
                            onChange={(e) => handleAdditionalOwnerChange(index, e)}
                            placeholder="Street address"
                            className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                          />
                        </div>

                        <div>
                          <label className={styles.labelClass}>
                            Address 2
                          </label>
                          <input
                            type="text"
                            name="address2"
                            value={owner.address2}
                            onChange={(e) => handleAdditionalOwnerChange(index, e)}
                            placeholder="Apt, suite, unit, etc."
                            className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                          />
                        </div>

                        <div className={styles.rowWrapper}>
                          <div className={styles.halfWidth}>
                            <label className={styles.labelClass}>
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={owner.city}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="City"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                            />
                          </div>
                          <div className={styles.halfWidth}>
                            <label className={styles.labelClass}>
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={owner.state}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="State"
                              className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={styles.labelClass}>
                            Zip Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={owner.zipCode}
                            onChange={(e) => handleAdditionalOwnerChange(index, e)}
                            placeholder="Zip code"
                            className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                          />
                        </div>

                        <div>
                          <label className={styles.labelClass}>
                            Website
                          </label>
                          <input
                            type="url"
                            name="ownerWebsite"
                            value={owner.ownerWebsite}
                            onChange={(e) => handleAdditionalOwnerChange(index, e)}
                            placeholder="Website"
                            className={`${styles.inputClass} ${styles.grayPlaceholder} placeholder-[#626060]`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAdditionalOwner}
                    className={`w-full border-2 border-dashed border-[#039994] rounded-lg p-4 text-[#039994] hover:bg-gray-50 transition-colors ${styles.labelClass}`}
                  >
                    + Add Another Owner
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.buttonPrimary} flex items-center justify-center disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>

              <div className={styles.termsTextContainer}>
                <span>Terms and Conditions</span>
                <span className="mx-2">•</span>
                <span>Privacy Policy</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}