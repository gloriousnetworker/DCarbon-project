// FacilityCardView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./FacilityDetails";
import { pageTitle } from "./styles";

export default function FacilityCardView() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    role: "All",
    entityType: "All",
    utility: "All",
    meterId: "",
    status: "All",
    createdDate: "",
  });
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      if (!userId || !authToken) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(
          `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (data.status === "success") setFacilities(data.data.facilities);
        else throw new Error(data.message);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to load facilities");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApplyFilter = newFilters => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMeterIds = meterIds => {
    if (!meterIds || meterIds.length === 0) return "N/A";
    if (meterIds.length === 1) return meterIds[0];
    return `${meterIds[0]} (+${meterIds.length - 1} more)`;
  };

  const filteredFacilities = facilities
    .filter(f => {
      if (
        filters.name &&
        !f.facilityName.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (
        filters.role !== "All" &&
        f.commercialRole.toLowerCase() !== filters.role.toLowerCase()
      )
        return false;
      if (
        filters.entityType !== "All" &&
        f.entityType.toLowerCase() !== filters.entityType.toLowerCase()
      )
        return false;
      if (filters.utility !== "All" && f.utilityProvider !== filters.utility)
        return false;
      if (
        filters.meterId &&
        !f.meterIds?.some(id => 
          id.toLowerCase().includes(filters.meterId.toLowerCase())
        )
      )
        return false;
      if (
        filters.status !== "All" &&
        f.status.toLowerCase() !== filters.status.toLowerCase()
      )
        return false;
      if (filters.createdDate) {
        const d = new Date(f.createdAt).toISOString().slice(0, 10);
        if (d !== filters.createdDate) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // If a facility is selected, render the details view:
  if (selectedFacility) {
    return (
      <div className="p-2">
        <FacilityDetails
          facility={selectedFacility}
          onBack={() => setSelectedFacility(null)}
        />
      </div>
    );
  }

  // Otherwise render the filter + grid
  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className={pageTitle} style={{ color: "#039994" }}>
          My Facilities
        </h2>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-3 py-1 border border-[#039994] text-[#039994] text-sm rounded hover:bg-[#03999421]"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No facilities found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFacilities.map(facility => (
            <div
              key={facility.id}
              onClick={() => setSelectedFacility(facility)}
              className="border border-[#039994] rounded-lg bg-white cursor-pointer hover:shadow transition-shadow flex flex-col justify-between p-2"
            >
              <div>
                <h3 className="font-semibold text-base text-[#039994] mb-1">
                  {facility.facilityName}
                </h3>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="font-medium">Role:</span>
                  <span className="capitalize">{facility.commercialRole}</span>

                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{facility.entityType}</span>

                  <span className="font-medium">Utility:</span>
                  <span>{facility.utilityProvider}</span>

                  <span className="font-medium">Meter ID:</span>
                  <span title={facility.meterIds ? facility.meterIds.join(", ") : "N/A"}>
                    {formatMeterIds(facility.meterIds)}
                  </span>

                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{facility.status}</span>

                  <span className="font-medium">Created:</span>
                  <span>{formatDate(facility.createdAt)}</span>
                </div>
              </div>
              <div
                className="flex items-center justify-between mt-2 px-1 py-1"
                style={{ backgroundColor: "#069B9621" }}
              >
                <span className="text-[#039994] text-xs font-medium">
                  View details
                </span>
                <FiChevronRight size={16} className="text-[#039994]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}
    </div>
  );
}