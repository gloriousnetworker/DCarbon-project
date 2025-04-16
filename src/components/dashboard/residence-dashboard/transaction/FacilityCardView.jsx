import React from "react";
import { FiChevronRight } from "react-icons/fi";

export default function FacilityCardView({ facilities, onSelectFacility }) {
  return (
    <div>
      {/* Heading in #039994 */}
      <h2 className="text-xl font-semibold mb-4" style={{ color: "#039994" }}>
        Facilities
      </h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            onClick={() => onSelectFacility(facility)}
            className="
              border border-[#039994]
              rounded-lg
              bg-white
              cursor-pointer
              hover:shadow-lg
              transition-shadow
              flex
              flex-col
              justify-between
            "
          >
            {/* Card content */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="font-semibold text-gray-800">Facility ID:</span>
                <span className="text-gray-600">{facility.id}</span>

                <span className="font-semibold text-gray-800">User ID:</span>
                <span className="text-gray-600">{facility.operatorName}</span>

                <span className="font-semibold text-gray-800">Utility Provider:</span>
                <span className="text-gray-600">{facility.utilityProvider}</span>

                <span className="font-semibold text-gray-800">Meter ID:</span>
                <span className="text-gray-600">{facility.meterId}</span>

                <span className="font-semibold text-gray-800">Date created:</span>
                <span className="text-gray-600">{facility.dateCreated}</span>
              </div>
            </div>

            {/* View more row */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ backgroundColor: "#069B9621" }}
            >
              <span className="text-[#039994] text-sm font-medium">View more</span>
              <FiChevronRight size={18} className="text-[#039994]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
