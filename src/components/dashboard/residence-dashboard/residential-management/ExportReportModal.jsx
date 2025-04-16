import React from 'react';
import { FiX } from 'react-icons/fi';

/**
 * A modal that closely replicates the third uploaded image:
 * - Gray overlay
 * - White modal with "Export Report" heading
 * - Red "X" icon top-right (#F04438)
 * - Rounded corners (rounded-lg)
 * - Thin <hr> lines after heading and below "Choose document type"
 * - Extended "Cancel" & "Export" buttons side by side
 */
const ExportReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    // Any additional cancel logic
    onClose();
  };

  const handleExport = () => {
    // Export logic here (PDF, Excel, etc.)
    console.log('Export triggered');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-labelledby="export-modal"
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
        <h2 className="text-lg font-semibold text-gray-800">Export Report</h2>
        <hr className="my-3 border-gray-200" />

        {/* By Facility */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Facility:
          </label>
          <select className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none">
            <option>None</option>
            <option>Facility 1</option>
            <option>Facility 2</option>
            {/* Add more facilities as needed */}
          </select>
        </div>

        {/* Choose document type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose document type
          </label>
          <select className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none">
            <option>PDF</option>
            <option>Excel</option>
            {/* Add more doc types as needed */}
          </select>
        </div>

        <hr className="mb-4 border-gray-200" />

        {/* Buttons: extended width, side by side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="w-1/2 py-2 text-white text-sm rounded-md"
            style={{ backgroundColor: '#039994' }}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
