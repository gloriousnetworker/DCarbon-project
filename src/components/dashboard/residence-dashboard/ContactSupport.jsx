"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const DashboardContactSupport = () => {
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactId, setContactId] = useState(localStorage.getItem('lastContactId') || null);
  const [reply, setReply] = useState(null);
  const [status, setStatus] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    if (contactId) {
      fetchContactDetails();
      const interval = setInterval(fetchContactDetails, 30000);
      return () => clearInterval(interval);
    }
  }, [contactId]);

  const fetchContactDetails = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/contact/${contactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReply(data.data.reply);
        setStatus(data.data.status);
        setCreatedAt(data.data.createdAt);
        setUpdatedAt(data.data.updatedAt);
        if (data.data.reply && !localStorage.getItem(`contact-${contactId}-read`)) {
          toast.success('You have a new reply from support!');
          localStorage.setItem(`contact-${contactId}-read`, 'true');
          localStorage.setItem('hasUnreadContact', 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User authentication required. Please login again.');
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading('Submitting your request...');

    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/contact/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subject,
          contactReason: reason,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Contact request submitted successfully!', { id: loadingToast });
        setSubject('');
        setReason('');
        setMessage('');
        setContactId(data.data.id);
        setStatus(data.data.status);
        setCreatedAt(data.data.createdAt);
        setUpdatedAt(data.data.updatedAt);
        localStorage.setItem('lastContactId', data.data.id);
        localStorage.setItem('hasUnreadContact', 'true');
      } else {
        toast.error(data.message || 'Failed to submit contact request', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pending</span>;
      case 'RESOLVED':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Resolved</span>;
      case 'IN_PROGRESS':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">In Progress</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
      <div className="relative w-full flex flex-col items-center mb-2">
        <button onClick={() => router.back()} className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10" aria-label="Back">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">Contact Support</h1>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="mb-6 font-sfpro text-[24px] leading-[100%] tracking-[-0.05em] font-[600] text-[#1E1E1E]">
          How can DCarbon be of service today?
        </h2>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject Request"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Contact Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]"
              required
            >
              <option value="">Choose reason</option>
              <option value="Billing">Billing</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Feedback">Feedback</option>
              <option value="New Feature Suggestion">New Feature Suggestion</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Support Message
            </label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] min-h-[120px]"
              required
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {(contactId || reply) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <h3 className="font-[600] text-[16px] text-[#039994] mb-2">Your Support Request</h3>
              <div className="flex items-center space-x-2">
                {status && getStatusBadge(status)}
                {createdAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(createdAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            {reply ? (
              <div className="mt-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-[600] text-[16px] text-[#039994] mb-2">Support Response</h3>
                  {updatedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-gray-800">{reply}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                <p className="text-gray-500 italic">Waiting for support response...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContactSupport;