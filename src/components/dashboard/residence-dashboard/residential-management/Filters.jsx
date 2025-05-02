// Filters.jsx
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "REJECTED", label: "Rejected" }
];

const financeTypeOptions = [
  { value: "All", label: "All Types" },
  { value: "cash", label: "Cash" },
  { value: "loan", label: "Loan" },
  { value: "lease", label: "Lease" }
];

const Filters = ({ onClose, onApplyFilter, currentFilters }) => {
  const [filters, setFilters] = useState({
    facilityName: currentFilters.facilityName || "",
    utilityProvider: currentFilters.utilityProvider || "All",
    meterId: currentFilters.meterId || "",
    status: currentFilters.status || "All",
    zipCode: currentFilters.zipCode || "",
    financeType: currentFilters.financeType || "All",
    dateFrom: currentFilters.dateFrom || "",
    dateTo: currentFilters.dateTo || ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      facilityName: "",
      utilityProvider: "All",
      meterId: "",
      status: "All",
      zipCode: "",
      financeType: "All",
      dateFrom: "",
      dateTo: ""
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Filter Facilities</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Facility Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
            <input
              type="text"
              name="facilityName"
              value={filters.facilityName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              placeholder="Search by facility name"
            />
          </div>

          {/* Utility Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utility Provider</label>
            <input
              type="text"
              name="utilityProvider"
              value={filters.utilityProvider === "All" ? "" : filters.utilityProvider}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              placeholder="Search by utility provider"
            />
          </div>

          {/* Meter ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meter ID</label>
            <input
              type="text"
              name="meterId"
              value={filters.meterId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              placeholder="Search by meter ID"
            />
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={filters.zipCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              placeholder="Search by zip code"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Finance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finance Type</label>
            <select
              name="financeType"
              value={filters.financeType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              {financeTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f]"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Filters;