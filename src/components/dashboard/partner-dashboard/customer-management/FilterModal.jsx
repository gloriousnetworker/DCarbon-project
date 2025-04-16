import React from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';

/**
 * A modal that closely replicates the second uploaded image:
 * - Gray overlay
 * - White modal with "Filter" heading
 * - Red "X" icon top-right (#F04438)
 * - Rounded corners (rounded-lg)
 * - Thin <hr> lines after heading and between form sections
 * - Extended "Clear" & "Done" buttons side by side
 * - "By Date" with a calendar icon on the right; clicking opens the native date picker
 */
const FilterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Example "clear" and "done" logic
  const handleClear = () => {
    // Clear any filter states here
    console.log('Cleared filters');
  };

  const handleDone = () => {
    // Apply filter logic here
    console.log('Filters applied');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-labelledby="filter-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        {/* Close (X) button in red (#F04438) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
        <hr className="my-3 border-gray-200" />

        {/* By Facility */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Facility:
          </label>
          <select className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none">
            <option>Choose Facility</option>
            <option>Facility 1</option>
            <option>Facility 2</option>
            {/* Add more facilities as needed */}
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* By Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Date:
          </label>
          <div className="relative">
            {/* Native date input triggers browser's built-in calendar */}
            <input
              type="date"
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
            />
            {/* Calendar icon on the right */}
            <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
              <FiCalendar size={16} />
            </div>
          </div>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* Buttons: extended width, side by side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleClear}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md"
          >
            Clear
          </button>
          <button
            onClick={handleDone}
            className="w-1/2 py-2 text-white text-sm rounded-md"
            style={{ backgroundColor: '#039994' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
