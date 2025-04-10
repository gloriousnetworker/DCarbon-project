import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function EmailVerificationModal({ closeModal }) {
  const [email, setEmail] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const roleOptions = [
    { label: 'Commercial Owner', value: 'owner' },
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
      toast.error('Please fill out all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://dcarbon-server.onrender.com/api/user/invite-user/${userId}`, {
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
        toast.success(result.message || 'Invitation sent!');
        closeModal();
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sf-pro-text">
      <div className="bg-white rounded-lg w-full max-w-4xl sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 p-6 space-y-6">
        <h2 className="text-[#039994] font-semibold text-[36px] leading-[100%] tracking-[-0.05em] text-center">
          Invite an Owner
        </h2>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-[#1E1E1E] text-[14px] font-normal tracking-[-0.05em]">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E.g. name@domain.com"
            className="w-full p-3 mt-2 bg-[#F0F0F0] text-[#626060] placeholder-[#626060] border border-gray-300 rounded-md text-[14px] font-normal tracking-[-0.05em] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label htmlFor="role" className="block text-[#1E1E1E] text-[14px] font-normal tracking-[-0.05em]">
            Select Role
          </label>
          <select
            id="role"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="w-full p-3 mt-2 bg-[#F0F0F0] text-[#626060] border border-gray-300 rounded-md text-[14px] font-normal tracking-[-0.05em] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
          >
            <option value="" disabled>Select a role</option>
            {roleOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-t-2 border-gray-200" />

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-md text-white font-semibold transition duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#039994] hover:bg-[#02857f]'
            }`}
          >
            {loading ? 'Sending...' : 'Send Email Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
