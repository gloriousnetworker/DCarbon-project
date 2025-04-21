import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import FilterModal from "./FilterModal";
import {
  mainContainer,
  headingContainer,
  pageTitle,
} from "./styles";

export default function FacilityTableView({ onSelectFacility }) {
  const [facilities, setFacilities] = useState([]);
  const [metadata, setMetadata] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
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
    const userId = localStorage.getItem("userId"); // if needed in headers or params

    try {
      const params = { page, limit, ...filters };
      const res = await axios.get(
        "https://dcarbon-server.onrender.com/api/facility/get-all-facilities",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = res.data.data;
      setFacilities(data.facilities);
      setMetadata(data.metadata);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [page, filters]);

  const handleApplyFilter = (filterObj) => {
    const mapped = {};
    if (filterObj.name) mapped.name = filterObj.name;
    if (filterObj.role && filterObj.role !== "All") mapped.role = filterObj.role.toLowerCase();
    if (filterObj.entityType && filterObj.entityType !== "All") mapped.entityType = filterObj.entityType.toLowerCase();
    if (filterObj.utility && filterObj.utility !== "All") mapped.utility = filterObj.utility;
    if (filterObj.meterId) mapped.meterId = filterObj.meterId;
    if (filterObj.status && filterObj.status !== "All") mapped.status = filterObj.status.toLowerCase();
    if (filterObj.createdDate) mapped.createdDate = filterObj.createdDate;

    setFilters(mapped);
    setPage(1);
  };

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <h2 className={pageTitle}>All Facilities</h2>
        <button
          onClick={() => setShowFilter(true)}
          className="absolute right-4 top-0 flex items-center bg-[#039994] text-white px-3 py-1 rounded hover:bg-[#02857f] text-sm"
        >
          <FiFilter className="mr-1" /> Filter
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {loading ? (
        <div className="py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2">S/N</th>
                  <th className="px-4 py-2">Facility ID</th>
                  <th className="px-4 py-2">Facility Name</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Utility Provider</th>
                  <th className="px-4 py-2">Meter ID</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date Created</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {facilities.map((f, i) => (
                  <tr
                    key={f.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectFacility && onSelectFacility(f)}
                  >
                    <td className="px-4 py-2 text-[#039994] font-medium">
                      {i + 1 + (page - 1) * limit}
                    </td>
                    <td className="px-4 py-2">{f.id}</td>
                    <td className="px-4 py-2">{f.facilityName}</td>
                    <td className="px-4 py-2">{f.address}</td>
                    <td className="px-4 py-2">{f.utilityProvider || "-"}</td>
                    <td className="px-4 py-2">{f.meterId || "-"}</td>
                    <td className="px-4 py-2 capitalize">{f.status.toLowerCase()}</td>
                    <td className="px-4 py-2">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 w-full max-w-md">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!metadata.hasPrevPage}
              className={`flex items-center ${
                !metadata.hasPrevPage
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              <FiChevronLeft className="text-[#039994] mr-1" /> Prev
            </button>

            <div className="text-sm text-gray-600">
              <span className="font-semibold text-black">
                {metadata.page}
              </span>{" "}of {metadata.totalPages}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={!metadata.hasNextPage}
              className={`flex items-center ${
                !metadata.hasNextPage
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700"
              }`}
            >
              Next <FiChevronRight className="text-[#039994] ml-1" />
            </button>
          </div>
        </>
      )}

      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}
    </div>
  );
}
