import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function EmailVerificationModal({ closeModal, onSkip }) {
  const [email, setEmail] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const roleOptions = [
    { label: 'Solar Owner', value: 'owner' },
  ];

  const handleSubmit = async () => {
    setLoading(true);

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Missing user credentials. Please log in again.');
      setLoading(false);
      return;
    }

    const roleMapping = roleOptions.find(opt => opt.label === selectedLabel);

    if (!email || !roleMapping) {
      toast.error('Please fill out all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/invite-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          inviteeEmail: email,
          role: roleMapping.value,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Invitation sent successfully!');
        closeModal(); // This will trigger the next modal in the parent component
      } else {
        throw new Error(result.message || 'Failed to send invitation');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast('You can invite owners later from your dashboard', {
      icon: 'ℹ️',
    });
    onSkip(); // Call the onSkip prop to trigger the registration modal
  };

  return (
    <div className={spinnerOverlay}>
      <div className="relative w-full max-w-md bg-white rounded-md shadow-md p-6 space-y-6">
        {/* Invite Owner Icon */}
        <div className="flex justify-center">
          <Image 
            src="/vectors/CloudArrowDown.png" // Replace with your actual image path
            alt="Invite owner"
            width={80}
            height={80}
            className="mb-2"
          />
        </div>
        
        <h2 className={modalHeading}>
          Invite a Solar Owner
        </h2>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E.g. name@domain.com"
            className={inputClass}
            required
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label htmlFor="role" className={labelClass}>
            Select Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className={selectClass}
            required
          >
            <option value="" disabled>Select a role</option>
            {roleOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Buttons - side by side */}
        <div className="flex space-x-4">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={loading}
            className={skipButtonStyle}
          >
            Skip for Now
          </button>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={submitButtonStyle}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Style constants
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro';
const modalHeading = 'text-2xl font-semibold text-[#039994] text-center';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const skipButtonStyle = 'flex-1 py-2 rounded-md border border-[#039994] text-[#039994] hover:bg-[#f5fdfd] transition font-sfpro disabled:opacity-50';
const submitButtonStyle = 'flex-1 py-2 rounded-md text-white transition font-sfpro bg-[#039994] hover:bg-[#02857f] disabled:bg-gray-400 disabled:cursor-not-allowed';