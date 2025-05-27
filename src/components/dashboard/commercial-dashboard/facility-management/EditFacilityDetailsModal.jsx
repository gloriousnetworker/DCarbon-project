import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { labelClass, inputClass } from "./styles";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  const [formData, setFormData] = useState({
    facilityName: facility.facilityName || "",
    address: facility.address || "",
    utilityProvider: facility.utilityProvider || "",
    meterId: Array.isArray(facility.meterIds) ? facility.meterIds.join(", ") : facility.meterIds || "",
    utilityUsername: facility.utilityUsername || "",
    commercialRole: facility.commercialRole || "owner",
    entityType: facility.entityType || "company",
    name: facility.name || "",
    website: facility.website || ""
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
      
      // Convert meterId back to array if it contains commas
      const processedData = {
        ...formData,
        meterId: formData.meterId.includes(',') 
          ? formData.meterId.split(',').map(id => id.trim()) 
          : formData.meterId
      };

      const response = await axios.put(
        `https://services.dcarbon.solutions/api/facility/update-facility/${facility.id}`,
        processedData,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Facility Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`${labelClass} mb-2`}>
                Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Owner Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`${labelClass} mb-2`}>
                Installation Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`${inputClass}`}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Utility Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="utilityProvider"
                value={formData.utilityProvider}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Meter ID(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="meterId"
                value={formData.meterId}
                onChange={handleChange}
                placeholder="Separate multiple IDs with commas"
                className={`${inputClass}`}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">For multiple meter IDs, separate with commas</p>
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Utility Username
              </label>
              <input
                type="text"
                name="utilityUsername"
                value={formData.utilityUsername}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Commercial Role <span className="text-red-500">*</span>
              </label>
              <select
                name="commercialRole"
                value={formData.commercialRole}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
                required
              >
                <option value="owner">Owner</option>
                <option value="operator">Operator</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Entity Type <span className="text-red-500">*</span>
              </label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
                required
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#027a75] transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}