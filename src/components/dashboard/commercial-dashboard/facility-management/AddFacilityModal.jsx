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

export default function AddFacilityModal({ onClose }) {
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
  const [userMeterData, setUserMeterData] = useState([]); // This will store the full response
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");

  // Fetch utility providers on modal open
  useEffect(() => {
    fetchUtilityProviders();
    fetchUserMeters();
  }, []);

  // Update address when location choice changes
  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        // Use meter's service address
        setFormData(prev => ({
          ...prev,
          address: selectedMeter.base.service_address
        }));
      } else {
        // Clear address for manual input
        setFormData(prev => ({
          ...prev,
          address: ""
        }));
      }
    }
  }, [selectedMeter, isSameLocation]);

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
        setUserMeterData(response.data.data);
        // Auto-select the first utility auth email with meters if available
        const firstWithMeters = response.data.data.find(item => item.meters?.meters?.length > 0);
        if (firstWithMeters) {
          setSelectedUtilityAuthEmail(firstWithMeters.utilityAuthEmail);
        }
      }
    } catch (error) {
      console.error("Error fetching user meters:", error);
      toast.error("Failed to load meter information");
    } finally {
      setUserMetersLoading(false);
    }
  };

  // Get the currently selected meters based on utility auth email
  const getCurrentMeters = () => {
    if (!selectedUtilityAuthEmail) return [];
    
    const selectedData = userMeterData.find(
      item => item.utilityAuthEmail === selectedUtilityAuthEmail
    );
    
    if (!selectedData || !selectedData.meters?.meters) return [];
    
    return selectedData.meters.meters.filter(
      meter => meter.base.service_class === "electric"
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "meterId") {
      const currentMeters = getCurrentMeters();
      const meter = currentMeters.find(m => m.uid === value);
      setSelectedMeter(meter || null);
      setIsSameLocation(null); // Reset location choice when meter changes
      // Clear address when meter changes
      setFormData(prev => ({
        ...prev,
        address: ""
      }));
    }
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
    // Reset meter selection when changing utility auth email
    setFormData(prev => ({
      ...prev,
      meterId: ""
    }));
    setSelectedMeter(null);
    setIsSameLocation(null);
  };

  const handleLocationChoice = (choice) => {
    setIsSameLocation(choice);
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
      const payload = {
        facilityName: formData.facilityName,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterId: formData.meterId,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/facility/create-new-facility/${userId}`,
        payload,
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
        
        // Reset form
        setFormData({
          facilityName: "",
          address: "",
          utilityProvider: "",
          meterId: "",
          commercialRole: "both",
          entityType: "company"
        });
        setSelectedMeter(null);
        setIsSameLocation(null);
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
    (selectedMeter ? isSameLocation !== null : true);

  // Get utility auth emails that have meters
  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  // Get current meters based on selected utility auth email
  const currentMeters = getCurrentMeters();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 overflow-y-auto py-4">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg p-4 relative my-4">
        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
            <Loader />
          </div>
        )}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        {/* Heading */}
        <h2 className={`${pageTitle} text-left mb-4 text-lg`}>
          Add Commercial Facility
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Facility Name */}
          <div className="mb-3">
            <label className={`${labelClass} text-sm`}>
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={`${inputClass} text-sm py-2`}
              placeholder="Enter facility name"
              required
              disabled={loading}
            />
          </div>

          {/* Utility Provider */}
          <div className="mb-3">
            <label className={`${labelClass} text-sm`}>
              Utility Provider <span className="text-red-500">*</span>
            </label>
            <select
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={`${selectClass} text-sm py-2`}
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

          {/* Utility Auth Email Selection */}
          <div className="mb-3">
            <label className={`${labelClass} text-sm`}>
              Utility Account <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedUtilityAuthEmail}
              onChange={handleUtilityAuthEmailChange}
              className={`${selectClass} text-sm py-2`}
              required
              disabled={loading || userMetersLoading}
            >
              <option value="">Select utility account</option>
              {userMetersLoading ? (
                <option value="" disabled>Loading accounts...</option>
              ) : utilityAuthEmailsWithMeters.length === 0 ? (
                <option value="" disabled>No utility accounts found</option>
              ) : (
                utilityAuthEmailsWithMeters.map(item => (
                  <option key={item.id} value={item.utilityAuthEmail}>
                    {item.utilityAuthEmail}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the utility account containing your meters
            </p>
          </div>

          {/* Meter Selection - only shown when a utility auth email is selected */}
          {selectedUtilityAuthEmail && (
            <div className="mb-3">
              <label className={`${labelClass} text-sm`}>
                Please Select the Solar Meter you want to Register <span className="text-red-500">*</span>
              </label>
              <select
                name="meterId"
                value={formData.meterId}
                onChange={handleChange}
                className={`${selectClass} text-sm py-2`}
                required
                disabled={loading || currentMeters.length === 0}
              >
                <option value="">Select meter</option>
                {currentMeters.length === 0 ? (
                  <option value="" disabled>No electric meters found for this account</option>
                ) : (
                  currentMeters.map(meter => (
                    <option key={meter.uid} value={meter.uid}>
                      {meter.base.meter_numbers[0]} - {meter.base.service_tariff}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only electric meters are shown
              </p>
            </div>
          )}

          {/* Location Confirmation */}
          {selectedMeter && (
            <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              <p className="font-medium mb-2">Service Address: {selectedMeter.base.service_address}</p>
              <p className="font-medium mb-2">
                Is this the same location for the solar installation?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md border text-sm ${
                    isSameLocation === true ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLocationChoice(true)}
                  disabled={loading}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md border text-sm ${
                    isSameLocation === false ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLocationChoice(false)}
                  disabled={loading}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Address Field */}
          {selectedMeter && isSameLocation !== null && (
            <div className="mb-3">
              <label className={`${labelClass} text-sm`}>
                Facility Address <span className="text-red-500">*</span>
              </label>
              {isSameLocation === true ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  className={`${inputClass} text-sm py-2 bg-gray-100`}
                  disabled={true}
                  placeholder="Address will be auto-filled from meter service address"
                />
              ) : (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClass} text-sm py-2`}
                  placeholder="Enter facility address"
                  required
                  disabled={loading}
                />
              )}
              <p className="mt-1 text-xs text-gray-500">
                {isSameLocation === true 
                  ? "Using meter service address" 
                  : "Enter the facility address manually"
                }
              </p>
            </div>
          )}

          {/* Commercial Role */}
          <div className="mb-3">
            <label className={`${labelClass} text-sm`}>
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={`${selectClass} text-sm py-2`}
              required
              disabled={loading}
            >
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Entity Type */}
          <div className="mb-3">
            <label className={`${labelClass} text-sm`}>
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={`${selectClass} text-sm py-2`}
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
            className={`${buttonPrimary} mt-4 w-full py-2 text-sm ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading || !isFormComplete}
          >
            {loading ? "Processing..." : "Add Facility"}
          </button>
        </form>
      </div>
    </div>
  );
}