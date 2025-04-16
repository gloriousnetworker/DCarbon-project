import React, { useState } from 'react';
import {
  mainContainer,
  headingContainer,
  pageTitle
} from './styles';

// Optional modals - if you already have these, keep or remove as needed
import AddFacilityModal from './AddFacilityModal';
import FacilityCreatedModal from './FacilityCreatedModal';
import FilterModal from './FilterModal';

export default function FacilityManagement() {
  // State for modals (if applicable)
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [showFacilityCreatedModal, setShowFacilityCreatedModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Sample table data
  const tableData = [
    {
      sn: 1,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Residential',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Terminated', // Will be displayed with a red tag
    },
    {
      sn: 2,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Commercial',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Invited', // Orange tag
    },
    {
      sn: 3,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Resi. Group',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Registered', // Black tag
    },
    {
      sn: 4,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Commercial',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Active', // #00B4AE tag
    },
    {
      sn: 5,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Residential',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Terminated',
    },
    {
      sn: 6,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Commercial',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Invited',
    },
    {
      sn: 7,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Resi. Group',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Registered',
    },
    {
      sn: 8,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Commercial',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Active',
    },
    {
      sn: 9,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Residential',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Terminated',
    },
    {
      sn: 10,
      name: 'Name',
      email: 'name@domain.com',
      customerType: 'Resi. Group',
      utilityProvider: 'Utility',
      address: '123 Street, City, State',
      dateReg: '16-03-2025',
      status: 'Registered',
    },
  ];

  // Dummy pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Handlers for modals / actions (optional)
  const handleOpenAddFacilityModal = () => setShowAddFacilityModal(true);
  const handleFacilityAdded = () => {
    setShowAddFacilityModal(false);
    setShowFacilityCreatedModal(true);
  };
  const handleCloseFacilityCreatedModal = () => {
    setShowFacilityCreatedModal(false);
  };
  const handleOpenFilterModal = () => {
    setShowFilterModal(true);
  };
  const handleApplyFilter = (filters) => {
    console.log('Applied filters: ', filters);
    setShowFilterModal(false);
  };

  // Pagination Handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Helper to render the status with correct background color
  const renderStatusTag = (status) => {
    let bgColor = '#00B4AE'; // default Active color
    if (status === 'Terminated') bgColor = '#FF0000';
    else if (status === 'Invited') bgColor = '#FFB200';
    else if (status === 'Registered') bgColor = '#000000';
    else if (status === 'Active') bgColor = '#00B4AE';

    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-white text-sm"
        style={{ backgroundColor: bgColor }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className={`relative ${mainContainer}`}>
      {/* Top section: Year dropdown, 2025 dropdown, Filter button, Export button */}
      <div className="flex items-center justify-between w-full max-w-6xl mb-4">
        {/* Left side: Year and 2025 dropdowns */}
        <div className="flex items-center space-x-2">
          {/* "Year" dropdown */}
          <select
            className="border border-black text-black bg-transparent rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option>Year</option>
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>

          {/* Another dropdown for actual year (e.g., 2025) */}
          <select
            className="border border-black text-black bg-transparent rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>

        {/* Right side: Filter button and Export button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleOpenFilterModal}
            className="border border-black text-black bg-transparent px-4 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Filter
          </button>
          <button
            className="bg-[#039994] text-white px-4 py-1 rounded hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Title section: "Customer Report" (with a dropdown if needed) */}
      <div className="w-full max-w-6xl mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-[#039994] text-2xl font-semibold">
            Customer Report
          </span>
          {/* If you want a dropdown next to "Customer Report" */}
          {/* 
          <select
            className="border border-gray-300 bg-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          */}
        </div>
      </div>

      {/* Table */}
      <div className="w-full max-w-6xl overflow-auto">
        <table className="min-w-full border-collapse">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 px-2 text-left">S/N</th>
              <th className="py-2 px-2 text-left">Name</th>
              <th className="py-2 px-2 text-left">Email Address</th>
              <th className="py-2 px-2 text-left">Customer Type</th>
              <th className="py-2 px-2 text-left">Utility Provider</th>
              <th className="py-2 px-2 text-left">Address</th>
              <th className="py-2 px-2 text-left">Date Reg.</th>
              <th className="py-2 px-2 text-left">Cust. Status</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {tableData.map((item) => (
              <tr
                key={item.sn}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-2 px-2">{item.sn}</td>
                <td className="py-2 px-2">{item.name}</td>
                <td className="py-2 px-2">{item.email}</td>
                <td className="py-2 px-2">{item.customerType}</td>
                <td className="py-2 px-2">{item.utilityProvider}</td>
                <td className="py-2 px-2">{item.address}</td>
                <td className="py-2 px-2">{item.dateReg}</td>
                <td className="py-2 px-2">
                  {renderStatusTag(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="text-[#00B4AE] disabled:opacity-50"
        >
          &lt; Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="text-[#00B4AE] disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>

      {/* Add Facility Modal (if used) */}
      {showAddFacilityModal && (
        <AddFacilityModal
          onClose={() => setShowAddFacilityModal(false)}
          onFacilityAdded={handleFacilityAdded}
        />
      )}

      {/* Facility Created Modal (if used) */}
      {showFacilityCreatedModal && (
        <FacilityCreatedModal onClose={handleCloseFacilityCreatedModal} />
      )}

      {/* Filter Modal (if used) */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}
    </div>
  );
}
