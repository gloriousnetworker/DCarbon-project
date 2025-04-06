import React, { useState } from 'react';

const DashboardContactSupport = () => {
  // Local state to manage form fields (optional)
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ subject, reason, message });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        How can DCarbon be of service today?
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Field */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject Request"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
          />
        </div>

        {/* Contact Reason Dropdown */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Contact Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            <option value="">Choose reason</option>
            <option value="Billing">Billing</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Support Message */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Support Message</label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Description"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#039994] text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardContactSupport;
