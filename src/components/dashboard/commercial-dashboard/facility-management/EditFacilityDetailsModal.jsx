import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  inputClass,
  buttonPrimary,
  spinnerOverlay,
  spinner
} from "./styles";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  const [formData, setFormData] = useState({
    facilityName: facility.facilityName || "",
    address: facility.address || "",
    utilityProvider: facility.utilityProvider || "",
    meterId: facility.meterId || "",
    commercialRole: facility.commercialRole || "",
    entityType: facility.entityType || ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `https://dcarbon-server.onrender.com/api/facility/update-facility/${facility.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Facility updated successfully");
        onSave(response.data.data);
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update facility");
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      toast.error(error.response?.data?.message || "Failed to update facility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800">Edit Facility Details</h2>
        <hr className="my-3 border-gray-200" />

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Facility Name</label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              rows={2}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>Utility Provider</label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>Meter ID</label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>Commercial Role</label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            >
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Entity Type</label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-1/2 ${buttonPrimary}`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}