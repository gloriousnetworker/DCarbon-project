import React from "react";
import {
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Transaction = () => {
  return (
    <div className="bg-white p-6 rounded-md shadow">
      {/* Header: Title + Buttons */}
      <div className="flex items-center justify-between mb-4">
        {/* Title in green */}
        <h2 className="text-xl font-semibold text-[#039994]">REC Sales Report</h2>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Filter by Button */}
          <button
            className="
              flex items-center space-x-1
              border border-gray-300
              px-3 py-2
              rounded-md
              text-sm
              text-gray-700
              hover:bg-gray-50
            "
          >
            <FiFilter />
            <span>Filter by</span>
          </button>

          {/* Export Report Button */}
          <button
            className="
              flex items-center space-x-1
              bg-[#039994]
              text-white
              px-3 py-2
              rounded-md
              text-sm
              hover:bg-[#028c8c]
            "
          >
            <FiDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="px-4 py-2">S/N</th>
              <th className="px-4 py-2">Facility ID</th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Utility Provider</th>
              <th className="px-4 py-2">Meter ID</th>
              <th className="px-4 py-2">Latitude</th>
              <th className="px-4 py-2">Longitude</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {Array.from({ length: 12 }).map((_, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">REC ID</td>
                <td className="px-4 py-2">User ID</td>
                <td className="px-4 py-2">Residential</td>
                <td className="px-4 py-2">Utility</td>
                <td className="px-4 py-2">Meter ID</td>
                <td className="px-4 py-2">30° North</td>
                <td className="px-4 py-2">40° West</td>
                <td className="px-4 py-2">16-03-2025</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        {/* Previous Button (Disabled on Page 1) */}
        <button
          disabled
          className="
            flex items-center
            text-gray-400
            cursor-not-allowed
          "
        >
          <FiChevronLeft className="text-[#039994] mr-1" />
          <span>Previous</span>
        </button>

        {/* Page Indicator */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-black">1</span> of 4
        </div>

        {/* Next Button */}
        <button
          className="
            flex items-center
            text-gray-700
          "
        >
          <span>Next</span>
          <FiChevronRight className="text-[#039994] ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Transaction;
