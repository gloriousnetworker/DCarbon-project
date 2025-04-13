'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaEdit, FaTimes } from 'react-icons/fa';

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Main company info
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Multiple owners toggle
  const [multipleOwners, setMultipleOwners] = useState('no');
  const [owners, setOwners] = useState([]);
  const [newOwner, setNewOwner] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Updated validation: for multiple owners, ensure at least one owner is added
  // and that no partially filled newOwner entry remains unadded.
  const validateForm = () => {
    if (multipleOwners === 'yes') {
      // Warn if the user has partially filled newOwner fields that haven't been added.
      if (
        newOwner.fullName.trim() !== '' ||
        newOwner.email.trim() !== '' ||
        newOwner.phone.trim() !== '' ||
        newOwner.address.trim() !== '' ||
        newOwner.website.trim() !== ''
      ) {
        toast.error('Please add or clear the additional owner information before submitting');
        return false;
      }
      if (owners.length === 0) {
        toast.error('Please add at least one additional owner with full name and email');
        return false;
      }
    }
    return true;
  };

  const handleAddOrUpdateOwner = () => {
    if (!newOwner.fullName || !newOwner.email) {
      toast.error('Full name and email are required for owners');
      return;
    }
    if (editingIndex !== null) {
      const updatedOwners = [...owners];
      updatedOwners[editingIndex] = newOwner;
      setOwners(updatedOwners);
    } else {
      setOwners([...owners, newOwner]);
    }
    setNewOwner({ fullName: '', email: '', phone: '', address: '', website: '' });
    setEditingIndex(null);
  };

  const handleEditOwner = (index) => {
    setNewOwner(owners[index]);
    setEditingIndex(index);
  };

  const handleRemoveOwner = (index) => {
    setOwners(owners.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');

      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      // Build the payload:
      // Only include a field if it has a value (otherwise, use undefined so it gets omitted)
      const payload = {
        entityType: 'company',
        commercialRole: 'owner',
        companyName: companyName.trim() || undefined,
        companyAddress: companyAddress.trim() || undefined,
        companyWebsite: companyWebsite.trim() || undefined,
        // Use the owners array for additional users, mapping each tag's fullName and email.
        multipleUsers:
          multipleOwners === 'yes'
            ? owners.map((owner) => ({
                fullName: owner.fullName.trim() || undefined,
                email: owner.email.trim() || undefined,
              }))
            : undefined,
      };

      // Save the company details to local storage for later retrieval
      localStorage.setItem('companyDetails', JSON.stringify(payload));

      await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      toast.success('Company details updated successfully');
      router.push('/register/commercial-owner-registration/agreement');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      toast.error(errorMessage);
      console.error('Submission Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className={mainContainer}>
        <div className={headingContainer}>
          <button type="button" onClick={() => router.back()} className={backArrow}>
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
          </button>
        </div>

        <div className="w-full max-w-md">
          <h1 className={pageTitle}>Solar Owner Details</h1>
        </div>

        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={`${progressBarActive} w-full`} />
          </div>
          <span className={progressStepText}>03/03</span>
        </div>

        <div className={formWrapper}>
          {/* Company Details */}
          <div className="border-b pb-4">
            <h2 className={uploadHeading}>Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Company Name <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Company legal name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Company Address <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Registered business address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Company Website <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Optional Additional Owners Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className={labelClass}>Add Additional Owners?</span>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="multipleOwners"
                  value="yes"
                  checked={multipleOwners === 'yes'}
                  onChange={() => setMultipleOwners('yes')}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm font-sfpro">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="multipleOwners"
                  value="no"
                  checked={multipleOwners === 'no'}
                  onChange={() => setMultipleOwners('no')}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm font-sfpro">No</span>
              </label>
            </div>

            {multipleOwners === 'yes' && (
              <div className="border border-[#039994] rounded-md p-4 space-y-4">
                {owners.map((owner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#039994] px-3 py-2 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium font-sfpro text-white">{owner.fullName}</p>
                      <p className="text-xs text-gray-200 font-sfpro">{owner.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditOwner(index)}
                        className="text-white hover:text-gray-200 p-1 border border-white rounded-full"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveOwner(index)}
                        className="text-white hover:text-gray-200 p-1 bg-red-500 rounded-full"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className={rowWrapper}>
                  <div className="flex-1">
                    <label className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOwner.fullName}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, fullName: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newOwner.email}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className={rowWrapper}>
                  <div className="flex-1">
                    <label className={labelClass}>
                      Phone <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newOwner.phone}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>
                      Website <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newOwner.website}
                      onChange={(e) =>
                        setNewOwner({ ...newOwner, website: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <button onClick={handleAddOrUpdateOwner} className={buttonPrimary}>
                  {editingIndex !== null ? 'Update Owner' : 'Add Owner'}
                </button>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} className={buttonPrimary}>
            Complete Registration
          </button>
        </div>

        <div className={termsTextContainer}>
          Terms and Conditions &amp;{' '}
          <a href="/privacy" className="text-[#039994] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}

// Style constants (would normally be imported from styles.js)
const mainContainer =
  'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer =
  'relative w-full flex flex-col items-center mb-2';
const backArrow =
  'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle =
  'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const progressContainer =
  'w-full max-w-md flex items-center justify-between mb-6';
const progressBarWrapper =
  'flex-1 h-1 bg-gray-200 rounded-full mr-4';
const progressBarActive =
  'h-1 bg-[#039994] rounded-full';
const progressStepText =
  'text-sm font-medium text-gray-500 font-sfpro';
const formWrapper =
  'w-full max-w-md space-y-6';
const labelClass =
  'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const rowWrapper =
  'flex space-x-4';
const buttonPrimary =
  'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
const spinnerOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner =
  'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
const termsTextContainer =
  'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]';
const uploadHeading =
  'block mb-2 font-sfpro text-[24px] leading-[100%] tracking-[-0.05em] font-[400] text-[#039994]';
