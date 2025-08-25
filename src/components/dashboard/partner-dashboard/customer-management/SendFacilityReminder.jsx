import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SendReminderModal = ({ isOpen, onClose, customerEmail }) => {
  const [reminderReason, setReminderReason] = useState('Facility Creation');
  const [reminderDescription, setReminderDescription] = useState('Please create a facility so an installer can be assigned to you.');
  const [isSending, setIsSending] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [summary, setSummary] = useState({
    totalEmails: 0,
    processedEmails: 0
  });

  useEffect(() => {
    if (isOpen) {
      setReminderReason('Facility Creation');
      setReminderDescription('Please create a facility so an installer can be assigned to you.');
    }
  }, [isOpen]);

  const resetForm = () => {
    setReminderReason('Facility Creation');
    setReminderDescription('Please create a facility so an installer can be assigned to you.');
    setEmailStatuses([]);
    setSummary({
      totalEmails: 0,
      processedEmails: 0
    });
    setShowResults(false);
  };

  const handleSendReminder = async () => {
    if (!customerEmail) {
      toast.error('No email address found for this customer');
      return;
    }

    setIsSending(true);
    setShowResults(false);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!authToken || !userId) {
        toast.error('Authentication credentials not found. Please log in again.');
        setIsSending(false);
        return;
      }

      const body = {
        emails: [customerEmail],
        reason: reminderReason,
        description: reminderDescription,
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/operator-reminders/${userId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.data?.status === 'success') {
        setEmailStatuses([{
          email: customerEmail,
          status: 'Reminder sent successfully',
          canSendReminder: true
        }]);
        setSummary({
          totalEmails: 1,
          processedEmails: 1
        });
        setShowResults(true);
        
        toast.success('Facility reminder sent successfully!');
      } else {
        toast.error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(error.response?.data?.message || 'Error sending reminder');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="font-sfpro text-xl font-semibold mb-2 text-[#039994]">
          Send Facility Reminder
        </h2>

        <hr className="border-black my-2" />

        {!showResults ? (
          <>
            <div className="mb-4">
              <label className="block font-sfpro text-sm font-medium mb-2">
                Customer Email
              </label>
              <div className="w-full px-3 py-2 rounded-md text-sm font-sfpro bg-[#F1F1F1]">
                {customerEmail}
              </div>
            </div>

            <label className="block font-sfpro text-sm font-medium mb-2">
              Reminder Reason
            </label>
            <select
              className="w-full px-3 py-2 rounded-md mb-4 text-sm font-sfpro bg-[#F1F1F1]"
              value={reminderReason}
              onChange={(e) => setReminderReason(e.target.value)}
            >
              <option value="Facility Creation">Facility Creation</option>
              <option value="Registration">Registration</option>
              <option value="Document Upload">Document Upload</option>
              <option value="Document Verification">Document Verification</option>
            </select>

            <label className="block font-sfpro text-sm font-medium mb-2">
              Reminder Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-md text-sm font-sfpro bg-[#F1F1F1]"
              rows={3}
              placeholder="Description"
              value={reminderDescription}
              onChange={(e) => setReminderDescription(e.target.value)}
            />

            <hr className="my-4" />

            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="w-1/2 py-2 rounded-md text-sm font-sfpro bg-[#F2F2F2]"
                disabled={isSending}
              >
                Clear
              </button>
              <button
                onClick={handleSendReminder}
                className="w-1/2 py-2 rounded-md text-white text-sm font-sfpro bg-[#039994] hover:bg-[#02857f] disabled:opacity-50"
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-sfpro font-medium text-lg mb-2">Reminder Results</h3>
              <div className="space-y-3">
                {emailStatuses.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{status.email}</p>
                      <p className="text-sm text-gray-600">{status.status}</p>
                    </div>
                    {status.canSendReminder ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded mb-4">
              <h4 className="font-sfpro font-medium mb-1">Summary</h4>
              <p className="text-sm">
                Total emails: {summary.totalEmails} | 
                Processed: {summary.processedEmails}
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full py-2 rounded-md text-white text-sm font-sfpro bg-[#039994] hover:bg-[#02857f]"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SendReminderModal;