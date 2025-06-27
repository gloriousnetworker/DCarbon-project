import React, { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const GeneratorReportFilter = ({ currentFilters, onApply, onClose }) => {
  const [filters, setFilters] = useState(currentFilters);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate date range
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      alert('Date From cannot be later than Date To');
      return;
    }
    
    onApply(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      status: 'all'
    };
    setFilters(resetFilters);
  };

  const handleApplyReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      status: 'all'
    };
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 font-sfpro">Filter Generator Report</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#039994] rounded"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994] sm:text-sm font-sfpro"
                max={filters.dateTo || undefined}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994] sm:text-sm font-sfpro"
                min={filters.dateFrom || undefined}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994] sm:text-sm font-sfpro"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleApplyReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
            >
              Reset & Apply
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratorReportFilter;