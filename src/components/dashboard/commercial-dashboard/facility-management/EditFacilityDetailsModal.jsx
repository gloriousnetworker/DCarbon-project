import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { labelClass, inputClass, selectClass } from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  const [formData, setFormData] = useState({
    facilityName: facility.facilityName || "",
    address: facility.address || "",
    utilityProvider: facility.utilityProvider || "",
    meterId: Array.isArray(facility.meterIds) ? facility.meterIds[0] : facility.meterIds || "",
    utilityUsername: facility.utilityUsername || "",
    commercialRole: facility.commercialRole || "owner",
    entityType: facility.entityType || "company",
    name: facility.name || "",
    website: facility.website || "",
    multipleOwners: facility.multipleOwners || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");

  useEffect(() => {
    fetchUtilityProviders();
    fetchUserMeters();
  }, []);

  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        setFormData(prev => ({
          ...prev,
          address: selectedMeter.base.service_address
        }));
      } else if (isSameLocation === false) {
        // Keep the current address if user chooses different location
        // Don't auto-clear it in edit mode
      }
    }
  }, [selectedMeter, isSameLocation]);

  const fetchUtilityProviders = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;

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
      setIsSameLocation(null);
    }
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
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

  const handleSave = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data to send
      const processedData = {
        facilityName: formData.facilityName,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterId: formData.meterId,
        utilityUsername: formData.utilityUsername,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType,
        name: formData.name,
        website: formData.website,
        multipleOwners: formData.multipleOwners
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

  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  const currentMeters = getCurrentMeters();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
            <Loader />
          </div>
        )}

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
            {/* Facility Name */}
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

            {/* Owner/Operator Name */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Owner/Operator Name
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

            {/* Utility Provider */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Utility Provider <span className="text-red-500">*</span>
              </label>
              <select
                name="utilityProvider"
                value={formData.utilityProvider}
                onChange={handleChange}
                className={`${selectClass}`}
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

            {/* Utility Username */}
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

            {/* Utility Account */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Utility Account <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUtilityAuthEmail}
                onChange={handleUtilityAuthEmailChange}
                className={`${selectClass}`}
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

            {/* Meter Selection */}
            {selectedUtilityAuthEmail && (
              <div>
                <label className={`${labelClass} mb-2`}>
                  Solar Meter <span className="text-red-500">*</span>
                </label>
                <select
                  name="meterId"
                  value={formData.meterId}
                  onChange={handleChange}
                  className={`${selectClass}`}
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
              <div className="md:col-span-2">
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="font-medium mb-2">Service Address: {selectedMeter.base.service_address}</p>
                  <p className="font-medium mb-2">
                    Is this the same location for the solar installation? <span className="text-red-500">*</span>
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
              </div>
            )}

            {/* Installation Address */}
            <div className="md:col-span-2">
              <label className={`${labelClass} mb-2`}>
                Installation Address <span className="text-red-500">*</span>
              </label>
              {selectedMeter && isSameLocation === true ? (
                <textarea
                  name="address"
                  value={formData.address}
                  rows={3}
                  className={`${inputClass} bg-gray-100`}
                  disabled={true}
                  placeholder="Address will be auto-filled from meter service address"
                />
              ) : (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass}`}
                  disabled={loading}
                  required
                />
              )}
              {selectedMeter && (
                <p className="mt-1 text-xs text-gray-500">
                  {isSameLocation === true 
                    ? "Using meter service address" 
                    : isSameLocation === false 
                    ? "Enter the facility address manually"
                    : "Please choose if installation is at the same location as meter"
                  }
                </p>
              )}
            </div>

            {/* Website */}
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

            {/* Multiple Owners */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Multiple Owners
              </label>
              <input
                type="text"
                name="multipleOwners"
                value={formData.multipleOwners}
                onChange={handleChange}
                placeholder="Enter multiple owners information"
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            {/* Commercial Role */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Commercial Role <span className="text-red-500">*</span>
              </label>
              <select
                name="commercialRole"
                value={formData.commercialRole}
                onChange={handleChange}
                className={`${selectClass}`}
                disabled={loading}
                required
              >
                <option value="owner">Owner</option>
                <option value="operator">Operator</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Entity Type */}
            <div>
              <label className={`${labelClass} mb-2`}>
                Entity Type <span className="text-red-500">*</span>
              </label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                className={`${selectClass}`}
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