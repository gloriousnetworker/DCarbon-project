'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaTimes, FaPlus } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Main company/owner details
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Multiple owners toggle
  const [multipleOwners, setMultipleOwners] = useState('no');

  // Existing owners list (for additional owners)
  const [owners, setOwners] = useState([]);

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

  // Function to add or update an owner in the list
  const handleAddOrUpdateOwner = () => {
    if (editingIndex !== null) {
      // Update the existing owner
      const updatedOwners = [...owners];
      updatedOwners[editingIndex] = newOwner;
      setOwners(updatedOwners);
      setEditingIndex(null);
    } else {
      // Add new owner
      setOwners([...owners, newOwner]);
    }
    // Reset the newOwner form
    setNewOwner({
      fullName: '',
      ownership: '',
      email: '',
      phone: '',
      address: '',
      website: '',
    });
  };

  // Function to handle edit click on an owner
  const handleEditOwner = (index) => {
    setEditingIndex(index);
    setNewOwner(owners[index]);
  };

  // Function to remove an owner from the list
  const handleRemoveOwner = (index) => {
    const updatedOwners = [...owners];
    updatedOwners.splice(index, 1);
    setOwners(updatedOwners);
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

  // Handle submission of the entire form
  const handleSubmit = async () => {
    // Basic validation can be added here as needed
    if (!companyName || !phoneNumber || !address || !website) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Retrieve userId and authToken from local storage
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        toast.error('User not authenticated.');
        setLoading(false);
        return;
      }

      // Build the payload. We are using:
      // - The main form values for company details.
      // - For owner details, if multipleOwners is 'no', we assume the main form values represent the sole owner.
      // - If multipleOwners is 'yes', we include the owners list (mapping only fullName and email).
      const payload = {
        entityType: 'individual',
        commercialRole: 'owner',
        // If no multiple owners, use main form for owner details,
        // otherwise use the first owner in the list if available.
        ownerFullName: multipleOwners === 'no' ? companyName : (owners.length > 0 ? owners[0].fullName : ''),
        companyWebsite: website,
        multipleUsers: multipleOwners === 'yes'
          ? owners.map((owner) => ({ fullName: owner.fullName, email: owner.email }))
          : [],
        phoneNumber: phoneNumber,
        // For addresses and websites, we use the same value from the main form.
        ownerAddress: address,
        ownerWebsite: website,
        companyName: companyName,
        companyAddress: address,
      };

      // Construct the API URL with the userId
      const url = `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Owner details updated successfully!');
        // Delay to allow the user to see the notification before navigating
        setTimeout(() => {
          router.push('/register/commercial-both-registration/agreement');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to update owner details.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
              placeholder="Company name"
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

          {/* Address and Website details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company's Address
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

          {/* Owners List & Add Form (only if multipleOwners is 'yes') */}
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
                        <button
                          type="button"
                          onClick={() => handleEditOwner(index)}
                          className="text-[#039994] hover:text-[#027e7e] focus:outline-none"
                        >
                          <FaEdit size={14} />
                        </button>
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

              {/* Add / Update Button */}
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
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}
// Note: The above code is a React component that handles the registration process for a commercial entity. It includes form fields for company and owner details, a toggle for multiple owners, and functionality to add/edit/remove owners. The form submission is handled with an API call, and loading state is managed with a spinner overlay.