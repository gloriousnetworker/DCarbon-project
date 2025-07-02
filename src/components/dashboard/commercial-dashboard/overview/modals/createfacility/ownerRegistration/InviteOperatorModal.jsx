import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  buttonPrimary,
  spinnerOverlay,
  spinner,
  labelClass,
  inputClass,
  termsTextContainer
} from '../../styles.js';

export default function InviteOperatorModal({ isOpen, onClose, onBack, onDashboardRefresh }) {
  const [loading, setLoading] = useState(false);
  const [currentModal, setCurrentModal] = useState('invite');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "Please join the DCarbon Platform as my Operator!"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter operator name');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending invitation...');

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      const payload = {
        invitees: [
          {
            email: formData.email.trim(),
            role: "OPERATOR",
            name: formData.name.trim(),
            customerType: "COMMERCIAL",
            message: formData.message.trim()
          }
        ]
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-operator/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Invitation sent successfully!', { id: toastId });
        setCurrentModal('emailSent');
      } else {
        throw new Error(response.data.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Invitation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send invitation';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", email: "", message: "Please join our platform!" });
      setCurrentModal('invite');
      onClose();
    }
  };

  const handleBackClick = () => {
    if (!loading && onBack) {
      setFormData({ name: "", email: "", message: "Please join our platform!" });
      setCurrentModal('invite');
      onBack();
    }
  };

  const handleCompleteRegistration = () => {
    setCurrentModal('registrationSuccess');
  };

  const handleGoToDashboard = () => {
    setFormData({ name: "", email: "", message: "Please join our platform!" });
    setCurrentModal('invite');
    onClose();
    if (onDashboardRefresh) {
      onDashboardRefresh();
    }
    window.location.reload();
  };

  const getUserFirstName = () => {
    return localStorage.getItem('userFirstName') || 'User';
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden">
          {currentModal === 'invite' && (
            <div className="relative p-6">
              {onBack && (
                <button
                  onClick={handleBackClick}
                  disabled={loading}
                  className={`absolute left-6 top-6 text-[#039994] hover:text-[#02857f] transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Go back"
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
                onClick={handleClose}
                disabled={loading}
                className={`absolute top-6 right-6 text-red-500 hover:text-red-700 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Close modal"
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

              <div className="flex flex-col items-center mt-8 mb-8">
                <div className="mb-4">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M17 11L19 13L23 9" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
                  Invite an Operator
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`${labelClass} text-sm`}>
                    Operator's name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter operator's name"
                    className={inputClass}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelClass} text-sm`}>
                    Operator's email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter operator's email address"
                    className={inputClass}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className={`${labelClass} text-sm`}>
                    Custom message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your custom invitation message"
                    className={`${inputClass} min-h-[80px] resize-none`}
                    disabled={loading}
                    required
                    rows={3}
                  />
                </div>

                <div className={termsTextContainer}>
                  <p className="text-xs text-gray-500">
                    By inviting an operator, you agree to our{' '}
                    <a 
                      href="/terms" 
                      className="text-[#039994] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className={`${buttonPrimary} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
          )}

          {currentModal === 'emailSent' && (
            <div className="relative p-6">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Close modal"
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

              <div className="flex flex-col items-center mt-8 mb-8">
                <div className="mb-6">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <polyline 
                      points="22,6 12,13 2,6" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center mb-4">
                  Email Invitation sent
                </h2>

                <p className="text-sm text-gray-600 text-center mb-8 max-w-xs">
                  An email invite has been sent to your operator connected to this account.
                </p>

                <button 
                  onClick={handleCompleteRegistration}
                  className={`${buttonPrimary} w-full`}
                >
                  Complete Registration
                </button>
              </div>
            </div>
          )}

          {currentModal === 'registrationSuccess' && (
            <div className="relative p-6">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Close modal"
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

              <div className="flex flex-col items-center mt-8 mb-8">
                <div className="mb-6">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M12 8V12L14.5 14.5" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                      stroke="#039994" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center mb-4">
                  Almost Ready!
                </h2>

                <p className="text-sm text-gray-600 text-center mb-8 max-w-xs">
                  Your Operator will authorize Utility API access to generate your facilities. You're one step away from starting with DCarbon.
                </p>

                <button 
                  onClick={handleGoToDashboard}
                  className={`${buttonPrimary} w-full`}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}