import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { labelClass, inputClass, selectClass } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function EditFacilityDetailsModal({ facility, onClose = () => {}, onSave = () => {} }) {
  const [formData, setFormData] = useState({
    facilityName: facility.facilityName || "",
    nickname: facility.nickname || "",
    address: facility.address || "",
    utilityProvider: facility.utilityProvider || "",
    meterId: Array.isArray(facility.meterIds) ? facility.meterIds[0] : facility.meterIds || "",
    commercialRole: facility.commercialRole || "owner",
    entityType: facility.entityType || "company",
    name: facility.name || "",
    website: facility.website || "",
    multipleOwners: facility.multipleOwners || "",
    commercialOperationDate: facility.commercialOperationDate ? facility.commercialOperationDate.split('T')[0] : "",
    interconnectedUtilityId: facility.interconnectedUtilityId || "",
    eiaPlantId: facility.eiaPlantId || "",
    energyStorageCapacity: facility.energyStorageCapacity || 0,
    hasOnSiteLoad: facility.hasOnSiteLoad || false,
    hasNetMetering: facility.hasNetMetering || false
  });
  
  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");
  const [commercialUserLoading, setCommercialUserLoading] = useState(false);
  const [multipleOwnersData, setMultipleOwnersData] = useState([]);
  const [meterAgreementAccepted, setMeterAgreementAccepted] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [originalMeterId, setOriginalMeterId] = useState(
    Array.isArray(facility.meterIds) ? facility.meterIds[0] : facility.meterIds || ""
  );

  useEffect(() => {
    fetchUtilityProviders();
    fetchCommercialUser();
    
    const checkMeters = async () => {
      await fetchUserMeters();
    };
    checkMeters();
  }, []);

  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        setFormData(prev => ({
          ...prev,
          address: selectedMeter.base.service_address
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          address: facility.address || ""
        }));
      }
    }
  }, [selectedMeter, isSameLocation]);

  const fetchCommercialUser = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    if (!userId || !authToken) return;

    setCommercialUserLoading(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setFormData(prev => ({
          ...prev,
          name: response.data.data.commercialUser.ownerFullName || ""
        }));
        
        if (response.data.data.commercialUser.multipleUsers) {
          setMultipleOwnersData(response.data.data.commercialUser.multipleUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching commercial user:", error);
    } finally {
      setCommercialUserLoading(false);
    }
  };

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
      if (error.response && error.response.status === 404) {
        console.log("No meters found for this user");
      } else {
        console.error("Error fetching user meters:", error);
      }
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
    const { name, value, type, checked } = e.target;
    
    const editableFields = [
      "commercialOperationDate",
      "interconnectedUtilityId",
      "eiaPlantId",
      "energyStorageCapacity",
      "hasOnSiteLoad",
      "hasNetMetering"
    ];
    
    if (!editableFields.includes(name) && name !== "meterId") {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === "meterId") {
      const currentMeters = getCurrentMeters();
      const meter = currentMeters.find(m => m.uid === value);
      setSelectedMeter(meter || null);
      setIsSameLocation(null);
      setMeterAgreementAccepted(false);
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
    setMeterAgreementAccepted(false);
  };

  const handleLocationChoice = (choice) => {
    setIsSameLocation(choice);
  };

  const handleAcceptMeterAgreement = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    setAcceptingAgreement(true);
    try {
      const response = await axios.put(
        `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setMeterAgreementAccepted(true);
        toast.success("Meter agreement accepted successfully");
      }
    } catch (error) {
      console.error("Error accepting meter agreement:", error);
      toast.error("Failed to accept meter agreement");
    } finally {
      setAcceptingAgreement(false);
    }
  };

  const handleSave = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    if (formData.meterId !== originalMeterId && !meterAgreementAccepted) {
      toast.error("Please accept the meter agreement before saving");
      return;
    }

    try {
      setLoading(true);
      
      const processedData = {
        commercialOperationDate: formData.commercialOperationDate ? `${formData.commercialOperationDate}T00:00:00Z` : null,
        interconnectedUtilityId: formData.interconnectedUtilityId,
        eiaPlantId: formData.eiaPlantId,
        energyStorageCapacity: parseFloat(formData.energyStorageCapacity) || 0,
        hasOnSiteLoad: formData.hasOnSiteLoad,
        hasNetMetering: formData.hasNetMetering,
        meterId: formData.meterId
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
        const updatedFacility = {
          ...facility,
          ...processedData,
          commercialOperationDate: formData.commercialOperationDate,
          meterIds: formData.meterId ? [formData.meterId] : facility.meterIds
        };
        onSave(updatedFacility);
        onClose();
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      toast.error("Failed to update facility");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  const currentMeters = getCurrentMeters();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackdropClick}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
            <Loader />
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Facility Details</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              Only Commercial Operation Date, Interconnected Utility ID, EIA Plant ID, Energy Storage Capacity, On-site Load, Net Metering and Meter selection can be edited. All other fields are read-only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`${labelClass} mb-2`}>
                Facility Name
              </label>
              <input
                type="text"
                value={formData.facilityName}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Facility Nickname
              </label>
              <input
                type="text"
                value={formData.nickname}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Owner/Operator Name
              </label>
              <input
                type="text"
                value={formData.name}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Utility Provider
              </label>
              <input
                type="text"
                value={formData.utilityProvider}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div className="md:col-span-2">
              <label className={`${labelClass} mb-2`}>
                Meter Selection
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={selectedUtilityAuthEmail}
                    onChange={handleUtilityAuthEmailChange}
                    className={`${selectClass}`}
                    disabled={loading || userMetersLoading || utilityAuthEmailsWithMeters.length === 0}
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
                </div>

                <div>
                  <select
                    name="meterId"
                    value={formData.meterId}
                    onChange={handleChange}
                    className={`${selectClass}`}
                    disabled={loading || currentMeters.length === 0 || !selectedUtilityAuthEmail}
                  >
                    <option value="">Select meter</option>
                    {currentMeters.length === 0 ? (
                      <option value="" disabled>No electric meters found</option>
                    ) : (
                      currentMeters.map(meter => (
                        <option key={meter.uid} value={meter.uid}>
                          {meter.base.meter_numbers[0]} - {meter.base.service_tariff}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Only electric meters are shown
              </p>
            </div>

            {selectedMeter && formData.meterId !== originalMeterId && (
              <div className="md:col-span-2">
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="font-medium mb-2">
                    Service Address: {selectedMeter.base.service_address}
                  </p>
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
              </div>
            )}

            {selectedMeter && formData.meterId !== originalMeterId && (
              <div className="md:col-span-2">
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="font-medium mb-2">
                    By clicking "Accept Meter Agreement", you agree that the selected meter can be used for this commercial facility.
                  </p>
                  <button
                    type="button"
                    onClick={handleAcceptMeterAgreement}
                    className={`w-full py-2 rounded-md text-white font-medium ${
                      meterAgreementAccepted ? 'bg-green-600' : 'bg-black hover:bg-gray-800'
                    }`}
                    disabled={meterAgreementAccepted || acceptingAgreement}
                  >
                    {acceptingAgreement ? 'Processing...' : meterAgreementAccepted ? 'Meter Agreement Accepted' : 'Accept Meter Agreement'}
                  </button>
                  {meterAgreementAccepted && (
                    <p className="mt-2 text-green-600 text-sm text-center">
                      Meter agreement accepted successfully
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className={`${labelClass} mb-2`}>
                Installation Address
              </label>
              <textarea
                value={formData.address}
                rows={3}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Multiple Owners
              </label>
              <input
                type="text"
                value={formData.multipleOwners}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Commercial Role
              </label>
              <input
                type="text"
                value={formData.commercialRole}
                className={`${inputClass} bg-gray-100 cursor-not-allowed capitalize`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Entity Type
              </label>
              <input
                type="text"
                value={formData.entityType}
                className={`${inputClass} bg-gray-100 cursor-not-allowed capitalize`}
                disabled={true}
                readOnly
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Commercial Operation Date
              </label>
              <input
                type="date"
                name="commercialOperationDate"
                value={formData.commercialOperationDate}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Interconnected Utility ID
              </label>
              <input
                type="text"
                name="interconnectedUtilityId"
                value={formData.interconnectedUtilityId}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                EIA Plant ID
              </label>
              <input
                type="text"
                name="eiaPlantId"
                value={formData.eiaPlantId}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
              />
            </div>

            <div>
              <label className={`${labelClass} mb-2`}>
                Energy Storage Capacity (kWh)
              </label>
              <input
                type="number"
                name="energyStorageCapacity"
                value={formData.energyStorageCapacity}
                onChange={handleChange}
                className={`${inputClass}`}
                disabled={loading}
                step="0.1"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasOnSiteLoad"
                checked={formData.hasOnSiteLoad}
                onChange={handleChange}
                className="mr-2"
                disabled={loading}
              />
              <label className={`${labelClass}`}>
                Has On-Site Load
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasNetMetering"
                checked={formData.hasNetMetering}
                onChange={handleChange}
                className="mr-2"
                disabled={loading}
              />
              <label className={`${labelClass}`}>
                Has Net Metering
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (formData.meterId !== originalMeterId && !meterAgreementAccepted)}
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