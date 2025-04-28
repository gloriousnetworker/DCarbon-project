import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  selectClass,
  inputClass,
  buttonPrimary,
  pageTitle,
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function AddFacilityModal({ onClose, onFacilityAdded }) {
  const [formData, setFormData] = useState({
    facilityName: "",
    address: "",
    utilityProvider: "",
    meterId: "",
    commercialRole: "both",
    entityType: "company"
  });
  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);

  // Fetch utility providers on modal open
  useEffect(() => {
    fetchUtilityProviders();
  }, []);

  const fetchUtilityProviders = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setUtilityProvidersLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setUtilityProviders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching utility providers:", error);
      toast.error("Failed to load utility providers");
    } finally {
      setUtilityProvidersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const storeFacilityData = (facilityData) => {
    const userId = localStorage.getItem("userId");
    const userFacilitiesKey = `user_${userId}_facilities`;
    
    try {
      const existingFacilities = JSON.parse(localStorage.getItem(userFacilitiesKey)) || [];
      const updatedFacilities = [
        ...existingFacilities,
        {
          id: facilityData.id,
          facilityName: facilityData.facilityName,
          commercialRole: facilityData.commercialRole,
          createdAt: facilityData.createdAt
        }
      ];
      localStorage.setItem(userFacilitiesKey, JSON.stringify(updatedFacilities));
    } catch (error) {
      console.error("Error storing facility data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/facility/create-new-facility/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Facility created successfully");
        storeFacilityData(response.data.data);
        onFacilityAdded(response.data.data);
        
        // Reset form
        setFormData({
          facilityName: "",
          address: "",
          utilityProvider: "",
          meterId: "",
          commercialRole: "both",
          entityType: "company"
        });
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create facility");
      }
    } catch (error) {
      console.error("Error creating facility:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to create facility"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
            <Loader />
          </div>
        )}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <FiX size={24} />
        </button>

        {/* Heading */}
        <h2 className={`${pageTitle} text-left mb-6`}>
          Add Commercial Facility
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Facility Name */}
          <div className="mb-4">
            <label className={labelClass}>
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility name"
              required
              disabled={loading}
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street, City, County, State"
              required
              disabled={loading}
            />
          </div>

          {/* Utility Provider */}
          <div className="mb-4">
            <label className={labelClass}>
              Utility Provider <span className="text-red-500">*</span>
            </label>
            <select
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={loading || utilityProvidersLoading}
            >
              <option value="">Select utility provider</option>
              {utilityProvidersLoading ? (
                <option value="" disabled>Loading providers...</option>
              ) : (
                utilityProviders.map(provider => (
                  <option key={provider.id} value={provider.name}>
                    {provider.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Meter ID */}
          <div className="mb-4">
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter unique meter ID"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              This must be a unique identifier for your meter
            </p>
          </div>

          {/* Commercial Role */}
          <div className="mb-4">
            <label className={labelClass}>
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={loading}
            >
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Entity Type */}
          <div className="mb-4">
            <label className={labelClass}>
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={loading}
            >
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`${buttonPrimary} mt-6 w-full`}
            disabled={
              loading || 
              !formData.facilityName || 
              !formData.address || 
              !formData.utilityProvider || 
              !formData.meterId
            }
          >
            {loading ? "Processing..." : "Add Facility"}
          </button>
        </form>
      </div>
    </div>
  );
}