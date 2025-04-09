// src/components/dashboard/Transaction.jsx
import React from 'react';
import { FiGrid } from 'react-icons/fi'; // Example icon from react-icons (optional)

const DashboardResidentialManagement = () => {
  // Mock data array for demonstration
  const facilities = [
    {
      id: 1,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
    {
      id: 2,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
    {
      id: 3,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
    {
      id: 4,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
    {
      id: 5,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
    {
      id: 6,
      facilityID: 'Facility ID',
      address: '1234 Main St. Dover, DE',
      capacity: '12MW',
      cod: 'COD',
      enrollmentDateLabel: 'Enrollment Date',
      enrollmentDateValue: '16-03-2025',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left side: icon + "Filter by" */}
        <div className="flex items-center gap-4">
          {/* Grid/Icon button (placeholder) */}
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition">
            {/* If you prefer a placeholder SVG: 
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v4H4V6zM4 14h4v4H4v-4zM14 6h4v4h-4V6zM14 14h4v4h-4v-4z" />
            </svg> 
            */}
            <FiGrid className="h-5 w-5 text-gray-600" />
          </button>

          {/* "Filter by" button */}
          <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
            Filter by
          </button>
        </div>

        {/* Right side: "Add New Residence" button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#039994] text-white rounded hover:opacity-90 transition">
          + Add New Residence
        </button>
      </div>

      {/* Main Heading */}
      <h2 className="text-2xl font-semibold text-[#039994] mt-6">
        Resident Management
      </h2>

      {/* Grid of facility cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {facilities.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{item.facilityID}</p>
              <p className="text-gray-800">{item.address}</p>

              <p className="text-sm font-medium text-gray-600">Capacity</p>
              <p className="text-gray-800">{item.capacity}</p>

              <p className="text-sm font-medium text-gray-600">{item.cod}</p>

              <p className="text-sm font-medium text-gray-600">
                {item.enrollmentDateLabel}
              </p>
              <p className="text-gray-800">{item.enrollmentDateValue}</p>
            </div>
            <div className="mt-3">
              <button
                className="border border-[#039994] text-[#039994] px-4 py-2 rounded 
                           hover:bg-[#039994] hover:text-white transition"
              >
                View more
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardResidentialManagement;
