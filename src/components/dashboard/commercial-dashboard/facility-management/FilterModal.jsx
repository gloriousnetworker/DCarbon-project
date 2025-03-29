import React, { useState } from "react";
import { FiX } from "react-icons/fi";

/**
 * A modal for filtering facilities by:
 *  - Type (Individual/Company Owner/Operator)
 *  - Location
 *  - Time (Recent/Latest)
 *
 * Matches the design with:
 *  - Title in #039994
 *  - Red close icon (#F04438)
 *  - Horizontal lines (hr) between sections
 *  - Clear and Done buttons side by side
 */
export default function FilterModal({ onClose, onApplyFilter }) {
  // Local state for dropdowns
  const [type, setType] = useState("Choose Type");
  const [location, setLocation] = useState("Choose Location");
  const [time, setTime] = useState("Recent");

  // Resets all fields to default
  const handleClear = () => {
    setType("Choose Type");
    setLocation("Choose Location");
    setTime("Recent");
  };

  // Applies the filters and closes
  const handleDone = () => {
    onApplyFilter({ type, location, time });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal container */}
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        {/* Close Icon (X) - in red (#F04438) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-semibold" style={{ color: "#039994" }}>
          Filter Facilities
        </h2>
        <hr className="my-4 border-gray-200" />

        {/* By Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            <option value="Choose Type">Choose Type</option>
            <option value="Individual Owner">Individual Owner</option>
            <option value="Individual Operator">Individual Operator</option>
            <option value="Company Owner">Company Owner</option>
            <option value="Company Operator">Company Operator</option>
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* By Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            <option value="Choose Location">Choose Location</option>
            <option value="New York">New York</option>
            <option value="California">California</option>
            <option value="Texas">Texas</option>
            {/* Add more as needed */}
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* By Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            By Time
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            <option value="Recent">Recent</option>
            <option value="Latest">Latest</option>
          </select>
        </div>

        <hr className="mb-4 border-gray-200" />

        {/* Buttons: Clear and Done side by side */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClear}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Clear
          </button>
          <div className="mx-2" />
          <button
            onClick={handleDone}
            className="w-1/2 py-2 text-white text-sm rounded-md hover:opacity-90"
            style={{ backgroundColor: "#039994" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
