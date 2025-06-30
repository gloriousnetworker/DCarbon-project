import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import OwnerTermsAndAgreementModal from './OwnerTermsAndAgreementModal';
import * as styles from "../../styles";

export default function OwnerDetailsModal({ isOpen, onClose, onBack }) {
  const [isMultipleOwners, setIsMultipleOwners] = useState(false);
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
  const [fetchedOwnerData, setFetchedOwnerData] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOwnerData();
    }
  }, [isOpen]);

  const parseAddress = (address) => {
    if (!address) return { address1: "", address2: "", city: "", state: "", zipCode: "" };
    
    const parts = address.split(', ');
    const addressParts = {
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: ""
    };

    if (parts.length >= 4) {
      addressParts.address1 = parts[0] || "";
      addressParts.city = parts[1] || "";
      addressParts.state = parts[2] || "";
      addressParts.zipCode = parts[3] || "";
    }

    return addressParts;
  };

  const fetchOwnerData = async () => {
    try {
      const referralCode = localStorage.getItem('ownerReferralCode');
      const authToken = localStorage.getItem('authToken');

      if (!referralCode || !authToken) {
        throw new Error('Referral code or authentication token missing');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/by-referral-code/${referralCode}`,
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
        throw new Error(data.message || 'Failed to fetch owner data');
      }

      setFetchedOwnerData(data.data);
      
      const addressParts = parseAddress(data.data.commercialUser?.ownerAddress);
      
      setOwnerDetails(prev => ({
        ...prev,
        ownerFullName: `${data.data.firstName} ${data.data.lastName}`,
        phoneNumber: data.data.phoneNumber,
        address1: addressParts.address1,
        address2: addressParts.address2,
        city: addressParts.city,
        state: addressParts.state,
        zipCode: addressParts.zipCode,
        ownerWebsite: data.data.commercialUser?.ownerWebsite || ""
      }));

      if (data.data.commercialUser?.multipleUsers && data.data.commercialUser.multipleUsers.length > 0) {
        setIsMultipleOwners(true);
        setAdditionalOwners(data.data.commercialUser.multipleUsers.map(user => ({
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          ownershipPercentage: user.ownershipPercentage || "",
          address1: user.address1 || "",
          address2: user.address2 || "",
          city: user.city || "",
          state: user.state || "",
          zipCode: user.zipCode || "",
          ownerWebsite: user.ownerWebsite || ""
        })));
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
      toast.error(error.message || 'Failed to load owner data');
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
        commercialRole: "owner",
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
      setShowTermsModal(true);
    } catch (error) {
      console.error('Error saving owner details:', error);
      toast.error(error.message || 'Failed to save owner details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setShowTermsModal(true);
  };

  const handleDecline = () => {
    onBack();
  };

  const handleTermsModalClose = () => {
    setShowTermsModal(false);
    onClose();
  };

  if (showTermsModal) {
    return (
      <OwnerTermsAndAgreementModal
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
                className="absolute top-6 left-6 text-[#039994] hover:text-[#02857f]"
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

            <h2 className={`${styles.pageTitle} ${onBack ? 'ml-8' : ''}`}>Owner Details</h2>

            <div className={styles.progressContainer}>
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBarActive}></div>
              </div>
              <span className={styles.progressStepText}>02/04</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {fetchedOwnerData && (
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-sfpro font-[600] text-[16px] mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Full Name</p>
                    <p className="font-sfpro text-[14px]">{`${fetchedOwnerData.firstName} ${fetchedOwnerData.lastName}`}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Email</p>
                    <p className="font-sfpro text-[14px]">{fetchedOwnerData.email}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Phone Number</p>
                    <p className="font-sfpro text-[14px]">{fetchedOwnerData.phoneNumber}</p>
                  </div>
                  {fetchedOwnerData.commercialUser?.ownerAddress && (
                    <div>
                      <p className="font-sfpro text-[12px] text-gray-500">Address</p>
                      <p className="font-sfpro text-[14px]">{fetchedOwnerData.commercialUser.ownerAddress}</p>
                    </div>
                  )}
                  {fetchedOwnerData.commercialUser?.ownerWebsite && (
                    <div>
                      <p className="font-sfpro text-[12px] text-gray-500">Website</p>
                      <p className="font-sfpro text-[14px]">{fetchedOwnerData.commercialUser.ownerWebsite}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Entity Type</p>
                    <p className="font-sfpro text-[14px] capitalize">{fetchedOwnerData.commercialUser?.entityType}</p>
                  </div>
                  <div>
                    <p className="font-sfpro text-[12px] text-gray-500">Commercial Role</p>
                    <p className="font-sfpro text-[14px] capitalize">{fetchedOwnerData.commercialUser?.commercialRole}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.formWrapper}>
              <div className="pt-4 flex space-x-4">
                {fetchedOwnerData && (
                  <button
                    type="button"
                    onClick={handleDecline}
                    className="flex-1 border border-[#039994] text-[#039994] rounded-md py-3 font-sfpro font-semibold hover:bg-gray-50"
                  >
                    Decline
                  </button>
                )}
                <button
                  type={fetchedOwnerData ? "button" : "submit"}
                  onClick={fetchedOwnerData ? handleConfirm : null}
                  disabled={isSubmitting}
                  className={`flex-1 rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      Confirm and Continue
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2 inline-block"></div>
                    </>
                  ) : (
                    'Confirm and Continue'
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