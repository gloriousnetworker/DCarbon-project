import React from "react";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";

export default function FacilityTabs({
  viewMode,
  setViewMode,
  onAddFacility,
  onFilter,
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Left side: two icons (Grid / List) */}
      <div className="flex items-center space-x-4">
        {/* Grid Icon */}
        <button
          onClick={() => setViewMode("cards")}
          className={`
            p-2 rounded-full flex items-center justify-center
            ${viewMode === "cards" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500"}
          `}
        >
          <FiGrid size={18} />
        </button>

        {/* List Icon */}
        <button
          onClick={() => setViewMode("table")}
          className={`
            p-2 rounded-full flex items-center justify-center
            ${viewMode === "table" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500"}
          `}
        >
          <FiList size={18} />
        </button>

    </div>

      {/* Right side: Filter + Add Facility */}
      <div className="flex items-center space-x-2">
        {/* <button
          onClick={onFilter}
          className="flex items-center space-x-1 border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <FiFilter />
          <span>Filter by</span>
        </button> */}

        <button
          onClick={onAddFacility}
          className="bg-[#039994] text-white px-3 py-2 rounded-md text-sm hover:bg-[#028c8c]"
        >
          + Add Residential Facility
        </button>
      </div>
    </div>
  );
}
