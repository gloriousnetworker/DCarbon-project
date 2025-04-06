import React from 'react';
import { MdNotificationsActive } from 'react-icons/md';

const docs = [
  {
    label: 'NEM Agreement (NEM)',
    status: 'Approved', // "Approved", "Required", "Submitted", "Rejected"
    fileName: 'Doc1.pdf',
  },
  {
    label: 'Meter ID Photo',
    status: 'Required',
    fileName: '',
  },
  {
    label: 'Installer Agreement',
    status: 'Submitted',
    fileName: 'Doc2.pdf',
  },
  {
    label: 'Single Line Diagram',
    status: 'Rejected',
    fileName: 'Doc3.pdf',
  },
  {
    label: 'Utility PTO Letter',
    status: 'Approved',
    fileName: 'Doc4.pdf',
  },
];

const CustomerDetails = ({ customer, onBackToList }) => {
  // Function to return color and label for document statuses
  const getDocStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return { color: '#00B4AE', label: 'Approved' };
      case 'Required':
        return { color: '#FFB200', label: 'Required' };
      case 'Submitted':
        return { color: '#000000', label: 'Submitted' };
      case 'Rejected':
        return { color: '#FF0000', label: 'Rejected' };
      default:
        return { color: '#000000', label: status };
    }
  };

  // Progress steps for customer onboarding
  const progressSteps = [
    { name: 'Invitation Sent', isActive: true },
    { name: 'Documents Pending', isActive: true },
    { name: 'Documents Rejected', isActive: false },
    { name: 'Registration Complete', isActive: false },
    { name: 'Active', isActive: false },
    { name: 'Terminated', isActive: false },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Top Section: Progress and Send Reminder */}
      <div className="flex flex-col md:flex-row md:justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#039994] mb-2">Customer Details</h2>
          <div className="flex flex-wrap gap-2">
            {progressSteps.map((step, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  step.isActive ? 'bg-[#00B4AE] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#039994] text-white"
          >
            <MdNotificationsActive className="mr-2" />
            Send Reminder
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Customer Name</p>
            <p className="text-base text-gray-700">{customer?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p className="text-base text-gray-700">name@domain.com</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone Number</p>
            <p className="text-base text-gray-700">+234-000-0000-000</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer Type</p>
            <p className="text-base text-gray-700">{customer?.customerType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Utility Provider</p>
            <p className="text-base text-gray-700">{customer?.utility}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Meter ID</p>
            <p className="text-base text-gray-700">1234567890</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-base text-gray-700">{customer?.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date Registered</p>
            <p className="text-base text-gray-700">{customer?.date}</p>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Documentation</h3>
      <div className="space-y-3">
        {docs.map((doc, idx) => {
          const { color, label } = getDocStatusColor(doc.status);
          return (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <p className="font-medium text-gray-700">{doc.label}</p>
                {doc.fileName && <p className="text-xs text-gray-500">{doc.fileName}</p>}
              </div>
              <span
                className="px-2 py-1 text-xs font-semibold rounded"
                style={{ backgroundColor: color, color: '#fff' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onBackToList}
          className="text-sm text-[#039994] underline"
        >
          &larr; Back to Customer Management
        </button>
      </div>
    </div>
  );
};

export default CustomerDetails;
