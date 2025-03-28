'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTimes, FaPlus } from 'react-icons/fa';

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Main owner info
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Multiple owners toggle
  const [multipleOwners, setMultipleOwners] = useState('no');

  // Existing owners list
  const [owners, setOwners] = useState([
    // Uncomment if you want to display a pre-filled owner
    // { fullName: 'Awele Francis', ownership: '50', email: 'awele@example.com', phone: '000-000-000', address: '', website: '' }
  ]);

  // New owner form
  const [newOwner, setNewOwner] = useState({
    fullName: '',
    ownership: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  // Track which owner is being edited (if any)
  const [editingIndex, setEditingIndex] = useState(null);

  // Loader / submission simulation
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to the next step
      router.push('/register/commercial-both-registration/agreement');
    }, 1500);
  };

  // Handle adding or updating an owner
  const handleAddOrUpdateOwner = () => {
    if (editingIndex !== null) {
      // Update existing owner
      const updatedOwners = [...owners];
      updatedOwners[editingIndex] = newOwner;
      setOwners(updatedOwners);
      setEditingIndex(null);
    } else {
      // Add new owner
      setOwners([...owners, newOwner]);
    }
    // Reset the form
    setNewOwner({
      fullName: '',
      ownership: '',
      email: '',
      phone: '',
      address: '',
      website: '',
    });
  };

  // Handle edit click
  const handleEditOwner = (index) => {
    setEditingIndex(index);
    setNewOwner(owners[index]);
  };

  // Handle remove owner
  const handleRemoveOwner = (index) => {
    const updatedOwners = [...owners];
    updatedOwners.splice(index, 1);
    setOwners(updatedOwners);

    // If we were editing this owner, reset the form
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewOwner({
        fullName: '',
        ownership: '',
        email: '',
        phone: '',
        address: '',
        website: '',
      });
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Full-Screen Container */}
      <div className="min-h-screen w-full bg-white flex flex-col items-center py-8 px-4">
        {/* Back Arrow */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Heading */}
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-2">
            Owner’s Details
          </h1>
        </div>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            {/* Full progress since it's 03/03 */}
            <div className="h-1 bg-[#039994] w-full rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/03</span>
        </div>

        {/* Subheading */}
        <div className="w-full max-w-md mb-4">
          <h2 className="text-md font-semibold text-[#039994]">Company’s owner</h2>
        </div>

        {/* Form Fields */}
        <div className="w-full max-w-md space-y-4">
          {/* Company’s name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company’s name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Address + Website details (2-column layout on larger screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="E.g. Street, City, County, State."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website details
              </label>
              <input
                type="text"
                placeholder="http://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          </div>

          {/* Multiple Owners? */}
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

          {/* Owners List & Add Form (only if multipleOwners === 'yes') */}
          {multipleOwners === 'yes' && (
            <div className="border border-gray-300 rounded-md p-4 space-y-4">
              {/* Existing owners (chips) */}
              {owners.length > 0 && (
                <div className="flex flex-col space-y-2">
                  {owners.map((owner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#F5F5F5] px-3 py-2 rounded-md"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {owner.fullName}
                      </span>
                      <div className="flex items-center space-x-3">
                        {/* Edit icon */}
                        <button
                          type="button"
                          onClick={() => handleEditOwner(index)}
                          className="text-[#039994] hover:text-[#027e7e] focus:outline-none"
                        >
                          <FaEdit size={14} />
                        </button>
                        {/* Remove (X) icon */}
                        <button
                          type="button"
                          onClick={() => handleRemoveOwner(index)}
                          className="text-red-500 hover:text-red-600 focus:outline-none"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New or Edit Owner Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Full name</label>
                  <input
                    type="text"
                    value={newOwner.fullName}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, fullName: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
                {/* Ownership */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">% ownership</label>
                  <input
                    type="text"
                    value={newOwner.ownership}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, ownership: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
                {/* Email address */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email address</label>
                  <input
                    type="email"
                    value={newOwner.email}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, email: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
                {/* Phone number */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newOwner.phone}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, phone: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={newOwner.address}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, address: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
                {/* Website */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Website</label>
                  <input
                    type="text"
                    value={newOwner.website}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, website: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
              </div>

              {/* Add / Update button */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleAddOrUpdateOwner}
                  className="flex items-center bg-[#039994] text-white px-3 py-1 rounded-md text-sm
                             hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
                >
                  <FaPlus className="mr-2" />
                  {editingIndex !== null ? 'Update Owner' : 'Add Owner'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2
                       hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>
        </div>

        {/* Terms and Conditions & Privacy Policy */}
        <div className="mt-6 text-center text-xs text-gray-500 leading-tight">
          Terms and Conditions &amp;{' '}
          <a
            href="/privacy"
            className="text-[#039994] hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}
