import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";

export default function FacilityTableView({ onSelectFacility }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    role: "All",
    entityType: "All",
    utility: "All",
    meterId: "",
    status: "All",
    createdDate: "",
  });

  const fetchUserFacilities = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!userId || !token) {
      setError("Authentication required");
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        setFacilities(res.data.data.facilities);
      } else {
        throw new Error(res.data.message || "Failed to load facilities");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load facilities";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFacilities();
  }, []);

  const handleApplyFilter = (filterObj) => {
    setFilters(filterObj);
    setShowFilter(false);
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      role: "All",
      entityType: "All",
      utility: "All",
      meterId: "",
      status: "All",
      createdDate: "",
    });
  };

  const formatMeterIds = (meterIds) => {
    if (!meterIds || meterIds.length === 0) return "N/A";
    if (meterIds.length === 1) return meterIds[0];
    return `${meterIds[0]} (+${meterIds.length - 1})`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredFacilities = facilities.filter(f => {
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
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[#039994]">
          My Facilities
        </h2>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded hover:bg-[#02857f] text-sm transition-colors duration-200"
        >
          <FiFilter className="mr-2" size={16} /> Filter
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex-shrink-0">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="text-center py-12 flex-1 flex items-center justify-center">
          <div>
            <div className="text-gray-500 text-lg mb-2">No facilities found</div>
            <div className="text-gray-400 text-sm">
              {facilities.length === 0 ? "You haven't created any facilities yet." : "No facilities match your current filters."}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    S/N
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Facility Name
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Address
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Role
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Entity Type
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Utility Provider
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Meter IDs
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border-b">
                    Date Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredFacilities.map((facility, index) => (
                  <tr
                    key={facility.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100"
                    onClick={() => onSelectFacility && onSelectFacility(facility)}
                  >
                    <td className="px-2 py-2 text-xs font-medium text-[#039994]">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]" title={facility.facilityName}>
                        {facility.facilityName}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs text-gray-900 truncate max-w-[150px]" title={facility.address}>
                        {facility.address}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs text-gray-900 capitalize">
                        {facility.commercialRole}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs text-gray-900 capitalize">
                        {facility.entityType}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs text-gray-900 truncate max-w-[120px]" title={facility.utilityProvider}>
                        {facility.utilityProvider || "N/A"}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div 
                        className="text-xs text-gray-900"
                        title={facility.meterIds ? facility.meterIds.join(", ") : "N/A"}
                      >
                        {formatMeterIds(facility.meterIds)}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        facility.status.toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : facility.status.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {facility.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-900">
                      {formatDate(facility.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onApplyFilter={handleApplyFilter}
          currentFilters={filters}
        />
      )}
    </div>
  );
}