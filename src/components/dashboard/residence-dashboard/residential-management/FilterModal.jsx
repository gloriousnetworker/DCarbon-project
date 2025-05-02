// FilterModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { labelClass, selectClass, buttonPrimary } from "./styles";

export default function FilterModal({ onClose, onApplyFilter }) {
  const [name, setName] = useState("");
  const [utilities, setUtilities] = useState([]);
  const [utility, setUtility] = useState("All");
  const [meterId, setMeterId] = useState("");
  const [status, setStatus] = useState("All");
  const [createdDate, setCreatedDate] = useState("");
  const [financeType, setFinanceType] = useState("All");
  const [installer, setInstaller] = useState("All");
  const [installers, setInstallers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem("authToken");
      try {
        // Fetch utilities
        const utilitiesRes = await axios.get(
          "https://services.dcarbon.solutions/api/auth/utility-providers",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setUtilities(utilitiesRes.data.data || []);

        // Fetch installers (you might need to replace this with actual endpoint)
        const installersRes = await axios.get(
          "https://services.dcarbon.solutions/api/installers", // Replace with actual endpoint
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setInstallers(installersRes.data.data || []);
      } catch (err) {
        console.error("Failed to load filter data", err);
      }
    };
    fetchData();
  }, []);

  const handleClear = () => {
    setName("");
    setUtility("All");
    setMeterId("");
    setStatus("All");
    setCreatedDate("");
    setFinanceType("All");
    setInstaller("All");
  };

  const handleDone = () => {
    onApplyFilter({ 
      name, 
      utility, 
      meterId, 
      status, 
      createdDate,
      financeType,
      installer
    });
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

        {/* Address (full width) */}
        <div className="mb-4">
          <label className={labelClass}>By Address</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none text-sm"
            placeholder="Type facility address"
          />
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
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Finance Type & Installer */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>By Finance Type</label>
            <select
              value={financeType}
              onChange={e => setFinanceType(e.target.value)}
              className={selectClass}
            >
              <option>All</option>
              <option value="loan">Loan</option>
              <option value="lease">Lease</option>
              <option value="cash">Cash</option>
              <option value="ppa">PPA</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>By Installer</label>
            <select
              value={installer}
              onChange={e => setInstaller(e.target.value)}
              className={selectClass}
            >
              <option>All</option>
              {installers.map(inst => (
                <option key={inst.id} value={inst.name}>{inst.name}</option>
              ))}
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