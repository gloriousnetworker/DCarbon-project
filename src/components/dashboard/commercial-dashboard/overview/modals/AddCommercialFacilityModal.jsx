import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import AddUtilityProvider from "./AddUtilityProvider";
import {
  labelClass,
  selectClass,
  inputClass,
  buttonPrimary,
  pageTitle,
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function AddCommercialFacilityModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nickname: "",
    address: "",
    utilityProvider: "",
    meterIds: [],
    commercialRole: "both",
    entityType: "company",
    facilityTypeNamingCode: 1,
    utilityProviderNamingCode: "",
    installerNamingCode: "",
    financeNamingCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");
  const [installers, setInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeTypesLoading, setFinanceTypesLoading] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [showFinanceTypeRequestModal, setShowFinanceTypeRequestModal] = useState(false);
  const [newFinanceTypeName, setNewFinanceTypeName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      fetchUserMeters();
      fetchInstallers();
      fetchFinanceTypes();
    }
  }, [isOpen]);

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
          address: ""
        }));
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

  const fetchInstallers = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;

    setInstallersLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/admin/partners",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setInstallers(response.data.data.partners.filter(partner => partner.partnerType === "installer"));
      }
    } catch (error) {
      console.error("Error fetching installers:", error);
      toast.error("Failed to load installers");
    } finally {
      setInstallersLoading(false);
    }
  };

  const fetchFinanceTypes = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;

    setFinanceTypesLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/user/financial-types",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setFinanceTypes(response.data.data.types);
      }
    } catch (error) {
      console.error("Error fetching finance types:", error);
      toast.error("Failed to load finance types");
    } finally {
      setFinanceTypesLoading(false);
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
    
    if (name === "utilityProvider") {
      const selectedProvider = utilityProviders.find(provider => provider.name === value);
      setFormData(prev => ({
        ...prev,
        utilityProvider: value,
        utilityProviderNamingCode: selectedProvider ? selectedProvider.namingCode : ""
      }));
    } else if (name === "installerNamingCode") {
      const selectedInstaller = installers.find(installer => installer.namingCode.toString() === value);
      setFormData(prev => ({
        ...prev,
        installerNamingCode: value,
        installerName: selectedInstaller ? selectedInstaller.name : ""
      }));
    } else if (name === "financeNamingCode") {
      const selectedFinanceType = financeTypes.find(type => type.namingCode.toString() === value);
      setFormData(prev => ({
        ...prev,
        financeNamingCode: value,
        financeType: selectedFinanceType ? selectedFinanceType.name : ""
      }));
    } else if (name === "meterId") {
      const currentMeters = getCurrentMeters();
      const meter = currentMeters.find(m => m.uid === value);
      setSelectedMeter(meter || null);
      setIsSameLocation(null);
      setFormData(prev => ({
        ...prev,
        meterIds: [value],
        address: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
    setFormData(prev => ({
      ...prev,
      meterIds: []
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
          nickname: facilityData.nickname,
          commercialRole: facilityData.commercialRole,
          createdAt: facilityData.createdAt
        }
      ];
      localStorage.setItem(userFacilitiesKey, JSON.stringify(updatedFacilities));
    } catch (error) {
      console.error("Error storing facility data:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      nickname: "",
      address: "",
      utilityProvider: "",
      meterIds: [],
      commercialRole: "both",
      entityType: "company",
      facilityTypeNamingCode: 1,
      utilityProviderNamingCode: "",
      installerNamingCode: "",
      financeNamingCode: ""
    });
    setSelectedMeter(null);
    setIsSameLocation(null);
    setSelectedUtilityAuthEmail("");
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
        nickname: formData.nickname,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterIds: formData.meterIds,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType,
        facilityTypeNamingCode: formData.facilityTypeNamingCode,
        utilityProviderNamingCode: formData.utilityProviderNamingCode,
        installerNamingCode: formData.installerNamingCode,
        financeNamingCode: formData.financeNamingCode
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
        toast.success(`Facility created successfully: ${response.data.data.facilityName}`);
        storeFacilityData(response.data.data);
        resetForm();
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

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
    fetchUserMeters();
  };

  const handleRequestFinanceType = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!newFinanceTypeName.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-financial-type/${userId}`,
        { name: newFinanceTypeName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Finance type request submitted successfully");
        setShowFinanceTypeRequestModal(false);
        setNewFinanceTypeName("");
        fetchFinanceTypes();
      } else {
        throw new Error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error requesting finance type:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to submit finance type request"
      );
    }
  };

  const isFormComplete = 
    formData.nickname && 
    formData.address &&
    formData.utilityProvider && 
    formData.meterIds.length > 0 &&
    formData.utilityProviderNamingCode &&
    formData.installerNamingCode &&
    formData.financeNamingCode &&
    (selectedMeter ? isSameLocation !== null : true);

  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  const currentMeters = getCurrentMeters();

  if (!isOpen) return null;

  return (
    <>
      {!showAddUtilityModal && !showFinanceTypeRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
              <Loader />
            </div>
          )}
          
          <div className="relative bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={loading}
            >
              <FiX size={20} />
            </button>

            <h2 className={pageTitle}>Add Commercial Facility</h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className={labelClass}>
                  Facility Nickname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter facility nickname"
                  required
                  disabled={loading}
                />
              </div>

              <div>
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

              <div>
                <label className={labelClass}>
                  Utility Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUtilityAuthEmail}
                  onChange={handleUtilityAuthEmailChange}
                  className={selectClass}
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
                <button
                  type="button"
                  onClick={handleOpenAddUtilityModal}
                  className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
                >
                  Meters to be registered not listed? Add Utility account
                </button>
              </div>

              {selectedUtilityAuthEmail && (
                <div>
                  <label className={labelClass}>
                    Please Select the Solar Meter you want to Register <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="meterId"
                    value={formData.meterIds[0] || ""}
                    onChange={handleChange}
                    className={selectClass}
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

              {selectedMeter && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
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
              )}

              {selectedMeter && isSameLocation !== null && (
                <div>
                  <label className={labelClass}>
                    Facility Address <span className="text-red-500">*</span>
                  </label>
                  {isSameLocation === true ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      className={`${inputClass} bg-gray-100`}
                      disabled={true}
                      placeholder="Address will be auto-filled from meter service address"
                    />
                  ) : (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={inputClass}
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

              <div>
                <label className={labelClass}>
                  Installer <span className="text-red-500">*</span>
                </label>
                <select
                  name="installerNamingCode"
                  value={formData.installerNamingCode}
                  onChange={handleChange}
                  className={selectClass}
                  required
                  disabled={loading || installersLoading}
                >
                  <option value="">Select installer</option>
                  {installersLoading ? (
                    <option value="" disabled>Loading installers...</option>
                  ) : installers.length === 0 ? (
                    <option value="" disabled>No installers found</option>
                  ) : (
                    installers.map(installer => (
                      <option key={installer.id} value={installer.namingCode}>
                        {installer.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Finance Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="financeNamingCode"
                  value={formData.financeNamingCode}
                  onChange={handleChange}
                  className={selectClass}
                  required
                  disabled={loading || financeTypesLoading}
                >
                  <option value="">Select finance type</option>
                  {financeTypesLoading ? (
                    <option value="" disabled>Loading finance types...</option>
                  ) : financeTypes.length === 0 ? (
                    <option value="" disabled>No finance types found</option>
                  ) : (
                    financeTypes.map(type => (
                      <option key={type.id} value={type.namingCode}>
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowFinanceTypeRequestModal(true)}
                  className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
                >
                  Finance Type not listed?
                </button>
              </div>

              <div>
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

              <div>
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

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 ${buttonPrimary} ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || !isFormComplete}
                >
                  {loading ? "Processing..." : "Add Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddUtilityProvider
        isOpen={showAddUtilityModal}
        onClose={handleCloseAddUtilityModal}
      />

      {showFinanceTypeRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
            <button
              onClick={() => setShowFinanceTypeRequestModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiX size={20} />
            </button>

            <h2 className={pageTitle}>Request New Finance Type</h2>

            <div className="space-y-4 mt-6">
              <div>
                <label className={labelClass}>
                  Finance Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFinanceTypeName}
                  onChange={(e) => setNewFinanceTypeName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter finance type name"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFinanceTypeRequestModal(false)}
                  className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestFinanceType}
                  className={`flex-1 ${buttonPrimary} ${!newFinanceTypeName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!newFinanceTypeName.trim()}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}