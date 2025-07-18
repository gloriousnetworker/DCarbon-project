// FacilityTableView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import Filters from "./Filters";

const mainContainer = "w-full p-4 bg-white rounded-lg shadow";
const headingContainer = "relative mb-6";
const pageTitle = "text-xl font-bold text-[#039994]";

export default function FacilityTableView({ onSelectFacility }) {
  const [facilities, setFacilities] = useState([]);
  const [metadata, setMetadata] = useState({ 
    page: 1, 
    totalPages: 1, 
    hasNextPage: false, 
    hasPrevPage: false,
    total: 0
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});

  const fetchFacilities = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      // Clean up filters before sending
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== "All") {
          cleanFilters[key] = filters[key];
        }
      });

      const params = { page, limit, ...cleanFilters };
      const res = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const { facilities, metadata } = res.data.data;
      setFacilities(facilities);
      setMetadata({
        page: metadata.page,
        totalPages: metadata.totalPages,
        hasNextPage: metadata.hasNextPage,
        hasPrevPage: metadata.hasPrevPage,
        total: metadata.total
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load facilities");
      console.error("Error fetching facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [page, filters]);

  const handleApplyFilter = (filterObj) => {
    setFilters(filterObj);
    setPage(1);
  };

  const statusBadge = (status) => {
    const statusClasses = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-red-100 text-red-800",
      REJECTED: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`px-1 py-0.5 rounded-full text-[9px] font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <h2 className={pageTitle}>Solar System Management</h2>
        <button
          onClick={() => setShowFilter(true)}
          className="absolute right-4 top-0 flex items-center bg-[#039994] text-white px-3 py-1 rounded hover:bg-[#02857f] text-sm"
        >
          <FiFilter className="mr-1" /> Filter
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">S/N</th>
                  <th className="w-20 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">ID</th>
                  <th className="w-24 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Address</th>
                  <th className="w-20 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Provider</th>
                  <th className="w-16 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Meter</th>
                  <th className="w-12 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Zip</th>
                  <th className="w-16 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Installer</th>
                  <th className="w-16 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Finance</th>
                  <th className="w-18 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Company</th>
                  <th className="w-16 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Status</th>
                  <th className="w-18 px-1 py-1 text-left text-[10px] font-bold text-gray-700 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facilities.length > 0 ? (
                  facilities.map((facility, index) => (
                    <tr 
                      key={facility.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectFacility && onSelectFacility(facility)}
                    >
                      <td className="px-1 py-1 text-[10px] font-medium text-[#039994]">
                        {index + 1 + (page - 1) * limit}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate" title={facility.id}>
                        {facility.id?.slice(-8) || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate" title={facility.address || "-"}>
                        {facility.address || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate" title={facility.utilityProvider || "-"}>
                        {facility.utilityProvider || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate">
                        {facility.meterId || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600">
                        {facility.zipCode || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate" title={facility.installer || "-"}>
                        {facility.installer || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 capitalize truncate" title={facility.financeType || "-"}>
                        {facility.financeType || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600 truncate" title={facility.financeCompany || "-"}>
                        {facility.financeCompany || "-"}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600">
                        {statusBadge(facility.status)}
                      </td>
                      <td className="px-1 py-1 text-[10px] text-gray-600">
                        {new Date(facility.createdAt).toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-1 py-4 text-center text-xs text-gray-500">
                      No facilities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * limit, metadata.total)}</span> of{" "}
              <span className="font-medium">{metadata.total}</span> results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!metadata.hasPrevPage}
                className={`px-3 py-1 rounded-md flex items-center ${
                  !metadata.hasPrevPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiChevronLeft className="mr-1" /> Previous
              </button>

              <div className="text-sm text-gray-600 mx-2">
                Page <span className="font-semibold">{metadata.page}</span> of{" "}
                <span className="font-semibold">{metadata.totalPages}</span>
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={!metadata.hasNextPage}
                className={`px-3 py-1 rounded-md flex items-center ${
                  !metadata.hasNextPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            </div>
          </div>
        </>
      )}

      {showFilter && (
        <Filters
          onClose={() => setShowFilter(false)}
          onApplyFilter={handleApplyFilter}
          currentFilters={filters}
        />
      )}
    </div>
  );
}