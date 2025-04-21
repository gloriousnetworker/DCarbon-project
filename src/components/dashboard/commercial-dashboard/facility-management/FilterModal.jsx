// FilterModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { labelClass, selectClass, buttonPrimary } from "./styles";

export default function FilterModal({ onClose, onApplyFilter }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("All");
  const [entityType, setEntityType] = useState("All");
  const [utilities, setUtilities] = useState([]);
  const [utility, setUtility] = useState("All");
  const [meterId, setMeterId] = useState("");
  const [status, setStatus] = useState("All");
  const [createdDate, setCreatedDate] = useState("");

  useEffect(() => {
    const fetchUtilities = async () => {
      const authToken = localStorage.getItem("authToken");
      try {
        const res = await axios.get(
          "https://dcarbon-server.onrender.com/api/auth/utility-providers",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setUtilities(res.data.data || []);
      } catch (err) {
        console.error("Failed to load utilities", err);
      }
    };
    fetchUtilities();
  }, []);

  const handleClear = () => {
    setName("");
    setRole("All");
    setEntityType("All");
    setUtility("All");
    setMeterId("");
    setStatus("All");
    setCreatedDate("");
  };

  const handleDone = () => {
    onApplyFilter({ name, role, entityType, utility, meterId, status, createdDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-[#F04438] hover:text-red-600">
          <FiX size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4" style={{ color: "#039994" }}>
          Filter Facilities
        </h2>

        {/* Name (full width) */}
        <div className="mb-4">
          <label className={labelClass}>By Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none text-sm"
            placeholder="Type facility name"
          />
        </div>

        {/* Role & Entity Type */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>By Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className={selectClass}
            >
              <option>All</option>
              <option>Owner</option>
              <option>Operator</option>
              <option>Both</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>By Entity Type</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
              className={selectClass}
            >
              <option>All</option>
              <option>Individual</option>
              <option>Company</option>
            </select>
          </div>
        </div>

        {/* Utility (full width) */}
        <div className="mb-4">
          <label className={labelClass}>By Utility</label>
          <select
            value={utility}
            onChange={e => setUtility(e.target.value)}
            className={selectClass}
          >
            <option>All</option>
            {utilities.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Meter ID & Status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>By Meter ID</label>
            <input
              type="text"
              value={meterId}
              onChange={e => setMeterId(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none text-sm"
              placeholder="Meter ID"
            />
          </div>
          <div>
            <label className={labelClass}>By Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className={selectClass}
            >
              <option>All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Created Date (full width) */}
        <div className="mb-4">
          <label className={labelClass}>By Creation Date</label>
          <input
            type="date"
            value={createdDate}
            onChange={e => setCreatedDate(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={handleClear}
            className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 mr-2"
          >
            Clear
          </button>
          <button
            onClick={handleDone}
            className={`flex-1 py-2 text-sm rounded ${buttonPrimary}`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
);
}
