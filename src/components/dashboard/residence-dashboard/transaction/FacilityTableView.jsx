import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function FacilityTableView({ facilities, onSelectFacility }) {
  return (
    <div className="mt-4">
      {/* Heading in #039994 */}
      <h2 className="text-xl font-semibold mb-4" style={{ color: "#039994" }}>
        Facilities
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-2">S/N</th>
              <th className="px-4 py-2">Facility ID</th>
              <th className="px-4 py-2">Owner Name</th>
              <th className="px-4 py-2">Operator Name</th>
              <th className="px-4 py-2">Utility Provider</th>
              <th className="px-4 py-2">Meter ID</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Date created</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {facilities.map((facility, index) => (
              <tr
                key={facility.id}
                className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectFacility(facility)}
              >
                <td className="px-4 py-2 text-[#039994] font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-2">{facility.id}</td>
                <td className="px-4 py-2">{facility.ownerName}</td>
                <td className="px-4 py-2">{facility.operatorName}</td>
                <td className="px-4 py-2">{facility.utilityProvider}</td>
                <td className="px-4 py-2">{facility.meterId}</td>
                <td className="px-4 py-2">{facility.address}</td>
                <td className="px-4 py-2">{facility.dateCreated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (optional) */}
      <div className="flex items-center justify-between mt-4">
        <button disabled className="flex items-center text-gray-400 cursor-not-allowed">
          <FiChevronLeft className="text-[#039994] mr-1" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-600">
          <span className="font-semibold text-black">1</span> of 4
        </div>

        <button className="flex items-center text-gray-700">
          <span>Next</span>
          <FiChevronRight className="text-[#039994] ml-1" />
        </button>
      </div>
    </div>
  );
}
