import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa'; // or any search icon you prefer

// Import your style exports from styles.js (adjust as needed)
import {
  mainContainer,
  headingContainer,
  pageTitle,
  formWrapper,
  labelClass,
  inputClass,
  selectClass,
  buttonPrimary,
} from './styles';

const SendReminderModal = ({ isOpen, onClose }) => {
  // Local state to control which range is selected
  const [rangeType, setRangeType] = useState('individual'); // 'individual' or 'bulk'
  // For single email input
  const [singleEmail, setSingleEmail] = useState('');
  // For multiple emails in bulk
  const [bulkEmails, setBulkEmails] = useState(['']);
  // For the selected reminder reason
  const [reminderReason, setReminderReason] = useState('');
  // For the reminder description
  const [reminderDescription, setReminderDescription] = useState('');

  if (!isOpen) return null;

  // Handler: Add a new email field for bulk
  const handleAddBulkEmail = () => {
    setBulkEmails([...bulkEmails, '']);
  };

  // Handler: Update a specific email in bulk
  const handleBulkEmailChange = (index, value) => {
    const updated = [...bulkEmails];
    updated[index] = value;
    setBulkEmails(updated);
  };

  // Handler: Remove a specific email in bulk
  const handleRemoveBulkEmail = (index) => {
    const updated = [...bulkEmails];
    updated.splice(index, 1);
    setBulkEmails(updated);
  };

  // Handler: Clear fields
  const handleClear = () => {
    setRangeType('individual');
    setSingleEmail('');
    setBulkEmails(['']);
    setReminderReason('');
    setReminderDescription('');
  };

  // Handler: Send Reminder (calls the backend API)
  const handleSendReminder = async () => {
    try {
      // If 'individual', use [singleEmail], else use bulkEmails
      const emails =
        rangeType === 'individual' ? [singleEmail] : bulkEmails.filter(Boolean);

      // Build the request body
      const body = {
        emails,
        reason: reminderReason,
        description: reminderDescription,
      };

      // Example: read auth token from localStorage
      const authToken = localStorage.getItem('authToken');

      const response = await axios.post(
        'https://dcarbon-server.onrender.com/api/user/referral-reminders',
        body,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Optional: handle success or error
      if (response?.data?.status === 'success') {
        console.log('Reminders sent successfully:', response.data);
      } else {
        console.log('Reminders sending failed:', response.data);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
      // Handle error (e.g., show alert or toast)
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal container */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Close (X) button in top-right (#F04438) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        {/* Title: "Send Reminder" in #039994 */}
        <h2
          className="font-sfpro text-xl font-semibold mb-2"
          style={{ color: '#039994' }}
        >
          Send Reminder
        </h2>

        {/* Black line */}
        <hr className="border-black my-2" />

        {/* Select Range */}
        <label className="block font-sfpro text-sm font-medium mt-2 mb-2">
          Select Range
        </label>
        {/* Radio Buttons: Individual vs Bulk */}
        <div className="flex items-center space-x-6 mb-4">
          <label className="inline-flex items-center space-x-2">
            <input
              type="radio"
              name="rangeType"
              checked={rangeType === 'individual'}
              onChange={() => setRangeType('individual')}
            />
            <span className="text-sm font-sfpro">Individual Customer</span>
          </label>

          <label className="inline-flex items-center space-x-2">
            <input
              type="radio"
              name="rangeType"
              checked={rangeType === 'bulk'}
              onChange={() => setRangeType('bulk')}
            />
            <span className="text-sm font-sfpro">Bulk Customer</span>
          </label>
        </div>

        {/* "Search Customer" label + search bar */}
        <label className="block font-sfpro text-sm font-medium mb-2">
          Search Customer
        </label>
        {/* If INDIVIDUAL => 1 input; if BULK => multiple inputs */}
        {rangeType === 'individual' ? (
          <div className="relative mb-4">
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full px-10 py-2 rounded-md focus:outline-none text-sm font-sfpro"
              style={{ backgroundColor: '#F1F1F1' }}
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
            />
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {bulkEmails.map((email, idx) => (
              <div key={idx} className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-10 py-2 rounded-md focus:outline-none text-sm font-sfpro"
                  style={{ backgroundColor: '#F1F1F1' }}
                  value={email}
                  onChange={(e) => handleBulkEmailChange(idx, e.target.value)}
                />
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
                {idx > 0 && (
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-sm text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveBulkEmail(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddBulkEmail}
              className="text-sm text-[#039994] hover:underline"
            >
              + Add another email
            </button>
          </div>
        )}

        {/* Reminder Reason (dropdown) */}
        <label className="block font-sfpro text-sm font-medium mb-2">
          Reminder Reason
        </label>
        <select
          className="w-full px-3 py-2 rounded-md mb-4 text-sm font-sfpro"
          style={{ backgroundColor: '#F1F1F1' }}
          value={reminderReason}
          onChange={(e) => setReminderReason(e.target.value)}
        >
          <option value="" disabled>
            Choose reason
          </option>
          <option value="Registration">Registration</option>
          <option value="Incorrect Customer Information">
            Incorrect Customer Information
          </option>
          <option value="Document Upload">Document Upload</option>
          <option value="Document Verification">Document Verification</option>
          <option value="Document Rejection">Document Rejection</option>
          <option value="Document Requirement">Document Requirement</option>
        </select>

        {/* Reminder Description */}
        <label className="block font-sfpro text-sm font-medium mb-2">
          Reminder Description
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-md text-sm font-sfpro"
          style={{ backgroundColor: '#F1F1F1' }}
          rows={3}
          placeholder="Description"
          value={reminderDescription}
          onChange={(e) => setReminderDescription(e.target.value)}
        />

        {/* hr line */}
        <hr className="my-4" />

        {/* Bottom Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleClear}
            className="w-1/2 py-2 rounded-md text-sm font-sfpro"
            style={{ backgroundColor: '#F2F2F2' }}
          >
            Clear
          </button>
          <button
            onClick={handleSendReminder}
            className="w-1/2 py-2 rounded-md text-white text-sm font-sfpro"
            style={{ backgroundColor: '#039994' }}
          >
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendReminderModal;
