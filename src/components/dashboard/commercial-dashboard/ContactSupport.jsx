import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashboardContactSupport = () => {
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User authentication required. Please login again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`https://dcarbon-server.onrender.com/api/contact/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          contactReason: reason,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Contact request submitted successfully!');
        setSubject('');
        setReason('');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to submit contact request');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header */}
      <h2 className="text-2xl font-semibold text-[#039994]">
        How can DCarbon be of service today?
      </h2>
      <hr className="my-4" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Field */}
        <div className="flex flex-col">
          <label className="block text-sm text-gray-700 font-medium mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject Request"
            className="w-full md:w-1/2 bg-[#F0F0F0] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#039994] border border-transparent"
            required
          />
        </div>

        {/* Contact Reason Dropdown */}
        <div className="flex flex-col">
          <label className="block text-sm text-gray-700 font-medium mb-1">
            Contact Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full md:w-1/2 bg-[#F0F0F0] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#039994] border border-transparent"
            required
          >
            <option value="">Choose reason</option>
            <option value="Billing">Billing</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Support Message */}
        <div className="flex flex-col">
          <label className="block text-sm text-gray-700 font-medium mb-1">
            Support Message
          </label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Description"
            className="w-full bg-[#F0F0F0] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#039994] border border-transparent"
            required
          />
        </div>

        <hr className="my-4" />

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-[#039994] text-white rounded-md hover:opacity-90 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]
                       ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardContactSupport;