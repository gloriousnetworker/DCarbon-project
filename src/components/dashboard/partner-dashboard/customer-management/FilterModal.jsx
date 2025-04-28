import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const FilterModal = ({ isOpen, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    customerType: initialFilters.customerType || '',
    dateRange: initialFilters.dateRange || '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({
      status: '',
      customerType: '',
      dateRange: '',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="font-sfpro text-xl font-semibold mb-2 text-[#039994]">
          Filter Customers
        </h2>

        <hr className="border-black my-2" />

        <div className="mb-4">
          <label className="block font-sfpro text-sm font-medium mb-2">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994] text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="EXPIRED">Expired</option>
            <option value="INVITED">Invited</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-sfpro text-sm font-medium mb-2">
            Customer Type
          </label>
          <select
            name="customerType"
            value={filters.customerType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994] text-sm"
          >
            <option value="">All Types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-sfpro text-sm font-medium mb-2">
            Date Range
          </label>
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994] text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleClear}
            className="w-1/2 py-2 rounded-md text-sm font-sfpro bg-[#F2F2F2]"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApply}
            className="w-1/2 py-2 rounded-md text-white text-sm font-sfpro bg-[#039994] hover:bg-[#02857f]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;