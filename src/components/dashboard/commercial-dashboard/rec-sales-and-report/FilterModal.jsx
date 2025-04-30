import React from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { inputClass, labelClass, buttonPrimary } from './styles';

const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Filter REC Sales</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="generatorId" className={labelClass}>
              Generator ID
            </label>
            <input
              type="text"
              id="generatorId"
              name="generatorId"
              value={filters.generatorId}
              onChange={onFilterChange}
              className={inputClass}
              placeholder="Enter Generator ID"
            />
          </div>
          <div>
            <label htmlFor="reportingUnitId" className={labelClass}>
              Reporting Unit ID
            </label>
            <input
              type="text"
              id="reportingUnitId"
              name="reportingUnitId"
              value={filters.reportingUnitId}
              onChange={onFilterChange}
              className={inputClass}
              placeholder="Enter Reporting Unit ID"
            />
          </div>
          <div>
            <label htmlFor="vintage" className={labelClass}>
              Vintage
            </label>
            <input
              type="text"
              id="vintage"
              name="vintage"
              value={filters.vintage}
              onChange={onFilterChange}
              className={inputClass}
              placeholder="Enter Vintage"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={labelClass}>
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={onFilterChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelClass}>
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={onFilterChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end items-center gap-3 p-4 border-t">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onApplyFilters}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${buttonPrimary}`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
