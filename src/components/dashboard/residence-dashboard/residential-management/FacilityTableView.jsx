// FacilityTableView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import Filters from "./Filters";

const mainContainer = "w-full p-4 bg-white rounded-lg shadow";
const headingContainer = "relative mb-6";
const pageTitle = "text-xl font-bold text-gray-800";

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
        "https://services.dcarbon.solutions/api/residential-facility/get-all-residential-facility",
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <h2 className={pageTitle}>All Residential Facilities</h2>
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
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table headers and rows remain the same as before */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utility Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zip Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finance Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#039994]">
                        {index + 1 + (page - 1) * limit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.address || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.utilityProvider || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.meterId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.zipCode || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.installer || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {facility.financeType || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {statusBadge(facility.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(facility.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
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