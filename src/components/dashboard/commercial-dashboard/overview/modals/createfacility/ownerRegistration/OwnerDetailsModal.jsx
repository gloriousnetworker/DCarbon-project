import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import FinanceAndInstallerModal from './FinanceAndInstallerModal.jsx';
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  formWrapper,
  labelClass,
  inputClass,
  rowWrapper,
  halfWidth,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  termsTextContainer
} from '../../styles.js';

export default function OwnerDetailsModal({ isOpen, onClose, onBack }) {
  const [isMultipleOwners, setIsMultipleOwners] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState({
    ownerFullName: "",
    phoneNumber: "",
    ownerAddress: "",
    ownerWebsite: ""
  });
  const [additionalOwners, setAdditionalOwners] = useState([{
    fullName: "",
    email: "",
    phoneNumber: "",
    ownershipPercentage: "",
    ownerAddress: "",
    ownerWebsite: ""
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing user data on component mount
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

      // Pre-populate form with existing data
      if (data.data && data.data.commercialUser) {
        const commercialUser = data.data.commercialUser;
        setOwnerDetails({
          ownerFullName: commercialUser.ownerFullName || "",
          phoneNumber: commercialUser.phoneNumber || data.data.phoneNumber || "",
          ownerAddress: commercialUser.ownerAddress || "",
          ownerWebsite: commercialUser.ownerWebsite || ""
        });

        // Check if there are multiple users
        if (commercialUser.multipleUsers && commercialUser.multipleUsers.length > 0) {
          setIsMultipleOwners(true);
          setAdditionalOwners(commercialUser.multipleUsers.map(user => ({
            fullName: user.fullName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            ownershipPercentage: user.ownershipPercentage || "",
            ownerAddress: user.ownerAddress || "",
            ownerWebsite: user.ownerWebsite || ""
          })));
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
      ownerAddress: "",
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

      const payload = {
        entityType: "individual",
        commercialRole: "owner",
        ownerFullName: ownerDetails.ownerFullName,
        phoneNumber: ownerDetails.phoneNumber,
        ownerAddress: ownerDetails.ownerAddress,
        ownerWebsite: ownerDetails.ownerWebsite
      };

      if (isMultipleOwners && additionalOwners.length > 0) {
        payload.multipleUsers = additionalOwners.filter(owner => 
          owner.fullName.trim() !== "" || owner.email.trim() !== ""
        );
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
      // Show finance modal instead of closing
      setShowFinanceModal(true);
    } catch (error) {
      console.error('Error saving owner details:', error);
      toast.error(error.message || 'Failed to save owner details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinanceModalClose = () => {
    setShowFinanceModal(false);
    onClose();
  };

  const handleFinanceModalBack = () => {
    setShowFinanceModal(false);
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

  if (!isOpen) return null;

  return (
    <>
      {isLoading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header with back arrow and close button */}
          <div className="relative p-6 pb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-6 top-6 text-[#039994] hover:text-[#02857f]"
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

            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mt-8 text-center">
              Owner's Details
            </h2>

            {/* Progress bar */}
            <div className="flex items-center mt-4 mb-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
                <div className="h-1 bg-[#039994] rounded-full" style={{ width: '50%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 font-sfpro">02/04</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Generator Owner Section */}
              <div>
                <label className={`${labelClass} text-sm`}>
                  Generator Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerFullName"
                  value={ownerDetails.ownerFullName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                  required
                />
              </div>

              <div>
                <label className={`${labelClass} text-sm`}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={ownerDetails.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                  required
                />
              </div>

              <div className={rowWrapper}>
                <div className={halfWidth}>
                  <label className={`${labelClass} text-sm`}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="ownerAddress"
                    value={ownerDetails.ownerAddress}
                    onChange={handleInputChange}
                    placeholder="E.g. Street, City, County, State"
                    className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                    required
                  />
                </div>
                <div className={halfWidth}>
                  <label className={`${labelClass} text-sm`}>
                    Website details
                  </label>
                  <input
                    type="url"
                    name="ownerWebsite"
                    value={ownerDetails.ownerWebsite}
                    onChange={handleInputChange}
                    placeholder="http://"
                    className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                  />
                </div>
              </div>

              {/* Multiple Owners Section */}
              <div>
                <div className="flex items-center justify-between">
                  <label className={`${labelClass} text-sm`}>
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
                      <span className="ml-2 text-sm font-sfpro text-[#1E1E1E]">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="multipleOwners"
                        checked={!isMultipleOwners}
                        onChange={() => setIsMultipleOwners(false)}
                        className="w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] accent-[#039994]"
                      />
                      <span className="ml-2 text-sm font-sfpro text-[#1E1E1E]">No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Owners Section */}
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
                        <div className={rowWrapper}>
                          <div className={halfWidth}>
                            <input
                              type="text"
                              name="fullName"
                              value={owner.fullName}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Full name *"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                              required
                            />
                          </div>
                          <div className={halfWidth}>
                            <input
                              type="text"
                              name="ownershipPercentage"
                              value={owner.ownershipPercentage}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="% ownership"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                            />
                          </div>
                        </div>

                        <div className={rowWrapper}>
                          <div className={halfWidth}>
                            <input
                              type="email"
                              name="email"
                              value={owner.email}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Email address *"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                              required
                            />
                          </div>
                          <div className={halfWidth}>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={owner.phoneNumber}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Phone Number *"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                              required
                            />
                          </div>
                        </div>

                        <div className={rowWrapper}>
                          <div className={halfWidth}>
                            <input
                              type="text"
                              name="ownerAddress"
                              value={owner.ownerAddress}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Address"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                            />
                          </div>
                          <div className={halfWidth}>
                            <input
                              type="url"
                              name="ownerWebsite"
                              value={owner.ownerWebsite}
                              onChange={(e) => handleAdditionalOwnerChange(index, e)}
                              placeholder="Website"
                              className={`${inputClass} text-sm placeholder-[#626060] bg-[#F0F0F0]`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAdditionalOwner}
                    className="w-full border-2 border-dashed border-[#039994] rounded-lg p-4 text-[#039994] hover:bg-gray-50 transition-colors font-sfpro text-sm"
                  >
                    + Add Another Owner
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${buttonPrimary} flex items-center justify-center disabled:opacity-50 text-sm`}
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

              {/* Terms and Conditions */}
              <div className={`${termsTextContainer} text-sm`}>
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