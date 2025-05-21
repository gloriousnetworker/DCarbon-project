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
    entityType: "company",
    isAddressSame: ""
  });
  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeters, setUserMeters] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);

  // Fetch utility providers on modal open
  useEffect(() => {
    fetchUtilityProviders();
    fetchUserMeters();
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

  const fetchUserMeters = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setUserMetersLoading(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        // Filter only electric meters
        const electricMeters = response.data.data.meters.filter(
          meter => meter.base.service_class === "electric"
        );
        setUserMeters(electricMeters);
      }
    } catch (error) {
      console.error("Error fetching user meters:", error);
      toast.error("Failed to load meter information");
    } finally {
      setUserMetersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If meter ID is selected, update the selectedMeter and address
    if (name === "meterId" && value) {
      const meter = userMeters.find(m => m.uid === value);
      if (meter) {
        setSelectedMeter(meter);
        // Reset the isAddressSame value when meter changes
        setFormData(prev => ({
          ...prev,
          [name]: value,
          isAddressSame: ""
        }));
      }
    }
  };

  const handleAddressConfirm = (isAddressSame) => {
    if (isAddressSame === "yes") {
      setFormData(prev => ({
        ...prev,
        address: selectedMeter?.base?.service_address || "",
        isAddressSame: "yes"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: "",
        isAddressSame: "no"
      }));
    }
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
          entityType: "company",
          isAddressSame: ""
        });
        setSelectedMeter(null);
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

  // Check if form is complete
  const isFormComplete = 
    formData.facilityName && 
    formData.address && 
    formData.utilityProvider && 
    formData.meterId && 
    formData.isAddressSame;

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

          {/* Meter ID - Changed to dropdown */}
          <div className="mb-4">
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <select
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={loading || userMetersLoading}
            >
              <option value="">Select meter ID</option>
              {userMetersLoading ? (
                <option value="" disabled>Loading meters...</option>
              ) : userMeters.length === 0 ? (
                <option value="" disabled>No electric meters found</option>
              ) : (
                userMeters.map(meter => (
                  <option key={meter.uid} value={meter.uid}>
                    {meter.base.meter_numbers[0]} - {meter.base.service_tariff}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only electric meters are available for selection
            </p>
          </div>

          {/* Billing Address Display */}
          {selectedMeter && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-1">Billing Information</h3>
              <p className="text-sm text-gray-600">{selectedMeter.base.billing_address}</p>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Is this the same address for solar installation?
                </p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md border ${
                      formData.isAddressSame === "yes" 
                        ? "bg-green-100 border-green-500 text-green-700" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleAddressConfirm("yes")}
                    disabled={loading}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md border ${
                      formData.isAddressSame === "no" 
                        ? "bg-blue-100 border-blue-500 text-blue-700" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleAddressConfirm("no")}
                    disabled={loading}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address Input Field - Only show if "No" is selected */}
          {formData.isAddressSame === "no" && (
            <div className="mb-4">
              <label className={labelClass}>
                Installation Address <span className="text-red-500">*</span>
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
          )}

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
            className={`${buttonPrimary} mt-6 w-full ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || !isFormComplete}
          >
            {loading ? "Processing..." : "Add Facility"}
          </button>
        </form>
      </div>
    </div>
  );
}