'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { FaEdit, FaTimes, FaPlus } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Main company info
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Owner info
  const [ownerFullName, setOwnerFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerWebsite, setOwnerWebsite] = useState('');

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

  const validateForm = () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }

    if (!companyAddress.trim()) {
      toast.error('Company address is required');
      return false;
    }

    if (!ownerFullName.trim()) {
      toast.error('Owner’s full name is required');
      return false;
    }

    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return false;
    }

    if (!/^\+?\d{7,}$/.test(phoneNumber)) {
      toast.error('Invalid phone number format');
      return false;
    }

    if (multipleOwners === 'yes' && owners.length === 0) {
      toast.error('At least one additional owner required');
      return false;
    }

    return true;
  };

  const handleAddOrUpdateOwner = () => {
    if (!newOwner.fullName || !newOwner.email) {
      toast.error('Full name and email are required for additional owners');
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      const payload = {
        entityType: 'individual',
        commercialRole: 'owner',
        companyName,
        companyAddress,
        companyWebsite: companyWebsite || undefined,
        ownerFullName,
        phoneNumber,
        ownerAddress: ownerAddress || undefined,
        ownerWebsite: ownerWebsite || undefined,
        multipleUsers: multipleOwners === 'yes' 
          ? owners.map(owner => ({
              fullName: owner.fullName,
              email: owner.email
            }))
          : undefined
      };

      await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Details updated successfully');
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
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      <div className="min-h-screen w-full bg-white flex flex-col items-center py-8 px-4">
        <div className="relative w-full mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 text-[#039994] p-2 focus:outline-none"
          >
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-2">
            Commercial Registration
          </h1>
        </div>

        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-full rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/03</span>
        </div>

        <div className="w-full max-w-md space-y-4">
          {/* Company Details */}
          <div className="border-b pb-4">
            <h2 className="text-md font-semibold text-[#039994] mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Company legal name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <input
                  type="text"
                  placeholder="Registered business address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>
            </div>
          </div>

          {/* Primary Owner Details */}
          <div className="border-b pb-4">
            <h2 className="text-md font-semibold text-[#039994] mb-4">Primary Owner Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner's Full Name
                </label>
                <input
                  type="text"
                  placeholder="Legal name of primary owner"
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Primary contact number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Address
                  </label>
                  <input
                    type="text"
                    placeholder="Residential address"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Website
                </label>
                <input
                  type="text"
                  placeholder="Personal or business website"
                  value={ownerWebsite}
                  onChange={(e) => setOwnerWebsite(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>
            </div>
          </div>

          {/* Multiple Owners Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Multiple Owners?</span>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="multipleOwners"
                  value="yes"
                  checked={multipleOwners === 'yes'}
                  onChange={() => setMultipleOwners('yes')}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm">Yes</span>
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
                <span className="text-sm">No</span>
              </label>
            </div>

            {multipleOwners === 'yes' && (
              <div className="border border-gray-300 rounded-md p-4 space-y-4">
                {owners.map((owner, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#F5F5F5] px-3 py-2 rounded-md">
                    <div>
                      <p className="text-sm font-medium">{owner.fullName}</p>
                      <p className="text-xs text-gray-600">{owner.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditOwner(index)}
                        className="text-[#039994] hover:text-[#02857f] p-1"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveOwner(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newOwner.fullName}
                      onChange={(e) => setNewOwner({ ...newOwner, fullName: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={newOwner.email}
                      onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newOwner.phone}
                      onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Website</label>
                    <input
                      type="text"
                      value={newOwner.website}
                      onChange={(e) => setNewOwner({ ...newOwner, website: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddOrUpdateOwner}
                  className="w-full bg-[#039994] text-white py-2 rounded-md hover:bg-[#02857f] transition-colors"
                >
                  {editingIndex !== null ? 'Update Owner' : 'Add Additional Owner'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#039994] text-white py-2 rounded-md hover:bg-[#02857f] transition-colors"
          >
            Complete Registration
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Terms and Conditions &amp;{' '}
          <a href="/privacy" className="text-[#039994] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}