import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  inputClass,
  selectClass,
  buttonPrimary,
  uploadNoteStyle
} from "../styles";

export default function EditResidentialFacilityModal({ facility, onClose = () => { }, onSave = () => { }, isOpen = false }) {
  const [formData, setFormData] = useState({
    installer: facility.installer || "",
    systemCapacity: facility.systemCapacity || "",
    zipCode: facility.zipCode || "",
    utilityProvider: facility.utilityProvider || "",
    address: facility.address || "",
    financeType: facility.financeType || "",
    financeCompany: facility.financeCompany || "",
    commercialOperationDate: facility.commercialOperationDate ? facility.commercialOperationDate.split('T')[0] : "",
    interconnectedUtilityId: facility.interconnectedUtilityId || "",
    eiaPlantId: facility.eiaPlantId || "",
    energyStorageCapacity: facility.energyStorageCapacity || 0,
    hasOnSiteLoad: facility.hasOnSiteLoad || false,
    hasNetMetering: facility.hasNetMetering || false,
    meterId: facility.meterId || ""
  });

  const [loading, setLoading] = useState(false);
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [loadingFinanceCompanies, setLoadingFinanceCompanies] = useState(false);
  const [loadingUtilityProviders, setLoadingUtilityProviders] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");
  const [meterAgreementAccepted, setMeterAgreementAccepted] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [originalMeterId, setOriginalMeterId] = useState(facility.meterId || "");

  useEffect(() => {
    if (isOpen) {
      fetchFinanceTypes();
      fetchInstallers();
      fetchFinanceCompanies();
      fetchUtilityProviders();
      fetchUserMeters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        const serviceAddress = selectedMeter.base.service_address;
        const zipMatch = serviceAddress.match(/\b\d{5}(?:-\d{4})?\b/);
        const zipCode = zipMatch ? zipMatch[0] : "";
        
        setFormData(prev => ({
          ...prev,
          address: serviceAddress,
          zipCode: zipCode
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          address: facility.address || "",
          zipCode: facility.zipCode || ""
        }));
      }
    }
  }, [selectedMeter, isSameLocation]);

  const fetchUtilityProviders = async () => {
    setLoadingUtilityProviders(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
      setLoadingUtilityProviders(false);
    }
  };

  const fetchFinanceTypes = async () => {
    setLoadingFinanceTypes(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("https://services.dcarbon.solutions/api/user/financial-types", { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.status === "success") {
        const approvedTypes = response.data.data.types.filter(type => type.status === "APPROVED" || type.name.toLowerCase() === "cash");
        setFinanceTypes(approvedTypes);
      }
    } catch (error) {
      toast.error("Failed to load finance types");
    } finally {
      setLoadingFinanceTypes(false);
    }
  };

  const fetchFinanceCompanies = async () => {
    setLoadingFinanceCompanies(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("https://services.dcarbon.solutions/api/user/partner/finance-companies", { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.status === "success") {
        setFinanceCompanies(response.data.data.financeCompanies || []);
      }
    } catch (error) {
      toast.error("Failed to load finance companies");
    } finally {
      setLoadingFinanceCompanies(false);
    }
  };

  const fetchInstallers = async () => {
    setLoadingInstallers(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("https://services.dcarbon.solutions/api/user/partner/get-all-installer", { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.status === "success") setInstallers(response.data.data.installers || []);
    } catch (error) {
      toast.error("Failed to load installers");
    } finally {
      setLoadingInstallers(false);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleMeterChange = (e) => {
    const meterId = e.target.value;
    const currentMeters = getCurrentMeters();
    const meter = currentMeters.find(m => m.uid === meterId);
    
    setSelectedMeter(meter || null);
    setIsSameLocation(null);
    setMeterAgreementAccepted(false);
    
    setFormData(prev => ({
      ...prev,
      meterId: meterId
    }));
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
    setSelectedMeter(null);
    setIsSameLocation(null);
    setMeterAgreementAccepted(false);
    setFormData(prev => ({
      ...prev,
      meterId: ""
    }));
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
      toast.error(error.response?.data?.message || "Failed to accept meter agreement");
    } finally {
      setAcceptingAgreement(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      
      const updateData = {
        installer: formData.installer === "not_available" ? "N/A" : formData.installer,
        systemCapacity: Number(formData.systemCapacity),
        zipCode: formData.zipCode,
        utilityProvider: formData.utilityProvider,
        address: formData.address,
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        commercialOperationDate: formData.commercialOperationDate ? `${formData.commercialOperationDate}T00:00:00Z` : null,
        interconnectedUtilityId: formData.interconnectedUtilityId,
        eiaPlantId: formData.eiaPlantId,
        energyStorageCapacity: parseFloat(formData.energyStorageCapacity),
        hasOnSiteLoad: formData.hasOnSiteLoad,
        hasNetMetering: formData.hasNetMetering,
        meterId: formData.meterId
      };
      
      const { data } = await axios.put(`https://services.dcarbon.solutions/api/residential-facility/update-facility/${facility.id}`, updateData, { headers: { Authorization: `Bearer ${authToken}` } });
      if (data.status === "success") {
        toast.success("Facility updated successfully");
        onSave(data.data);
        onClose();
      } else throw new Error(data.message || "Failed to update facility");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update facility");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isCashType = formData.financeType.toLowerCase() === 'cash';
  const showFinanceCompany = !isCashType && formData.financeType !== '';

  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  const currentMeters = getCurrentMeters();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackdropClick}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
            <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
          </div>
        )}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Facility Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" disabled={loading}>
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Utility Provider</label>
                <select
                  name="utilityProvider"
                  value={formData.utilityProvider}
                  onChange={handleChange}
                  className={selectClass}
                  disabled={loading || loadingUtilityProviders}
                >
                  <option value="">Select utility provider</option>
                  {loadingUtilityProviders ? (
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
                <label className={labelClass}>Utility Account</label>
                <select
                  value={selectedUtilityAuthEmail}
                  onChange={handleUtilityAuthEmailChange}
                  className={selectClass}
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
              </div>

              {selectedUtilityAuthEmail && (
                <div>
                  <label className={labelClass}>Solar Meter</label>
                  <select
                    value={formData.meterId}
                    onChange={handleMeterChange}
                    className={selectClass}
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
                </div>
              )}

              {selectedMeter && (
                <div className="md:col-span-2">
                  <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
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
                </div>
              )}

              {selectedMeter && formData.meterId !== originalMeterId && (
                <div className="md:col-span-2">
                  <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="font-medium mb-2">
                      By clicking "Accept Meter Agreement", you agree that the selected meter can be used for this residential facility.
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
                <label className={labelClass}>Installation Address</label>
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
                    className={inputClass}
                    disabled={loading}
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

              <div>
                <label className={labelClass}>Zip Code</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClass} disabled={loading} />
              </div>
              
              <div>
                <label className={labelClass}>System Capacity (kW)</label>
                <input type="number" name="systemCapacity" value={formData.systemCapacity} onChange={handleChange} className={inputClass} min="0" step="0.1" disabled={loading} />
              </div>
              
              <div>
                <label className={labelClass}>Installer</label>
                <select name="installer" value={formData.installer} onChange={handleChange} className={selectClass} disabled={loading || loadingInstallers}>
                  <option value="">Select installer</option>
                  {loadingInstallers ? <option value="" disabled>Loading installers...</option> : installers.map(installer => (
                    <option key={installer.id} value={installer.name}>{installer.name}</option>
                  ))}
                  <option value="not_available">Not Yet Available</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Finance Type</label>
                <select name="financeType" value={formData.financeType} onChange={handleChange} className={selectClass} disabled={loading || loadingFinanceTypes}>
                  <option value="">Select finance type</option>
                  {loadingFinanceTypes ? <option value="" disabled>Loading finance types...</option> : financeTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {showFinanceCompany && (
                <div>
                  <label className={labelClass}>Finance Company</label>
                  <select name="financeCompany" value={formData.financeCompany} onChange={handleChange} className={selectClass} disabled={loading || loadingFinanceCompanies}>
                    <option value="">Select finance company</option>
                    {loadingFinanceCompanies ? <option value="" disabled>Loading finance companies...</option> : financeCompanies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className={labelClass}>Commercial Operation Date</label>
                <input type="date" name="commercialOperationDate" value={formData.commercialOperationDate} onChange={handleChange} className={inputClass} disabled={loading} />
              </div>
              
              <div>
                <label className={labelClass}>Interconnected Utility ID</label>
                <input type="text" name="interconnectedUtilityId" value={formData.interconnectedUtilityId} onChange={handleChange} className={inputClass} disabled={loading} />
              </div>
              
              <div>
                <label className={labelClass}>EIA Plant ID</label>
                <input type="text" name="eiaPlantId" value={formData.eiaPlantId} onChange={handleChange} className={inputClass} disabled={loading} />
              </div>
              
              <div>
                <label className={labelClass}>Energy Storage Capacity (kWh)</label>
                <input type="number" name="energyStorageCapacity" value={formData.energyStorageCapacity} onChange={handleChange} className={inputClass} step="0.1" min="0" disabled={loading} />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" name="hasOnSiteLoad" checked={formData.hasOnSiteLoad} onChange={handleChange} className="mr-2" disabled={loading} />
                <label className={labelClass}>Has On-Site Load</label>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" name="hasNetMetering" checked={formData.hasNetMetering} onChange={handleChange} className="mr-2" disabled={loading} />
                <label className={labelClass}>Has Net-Metering</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-32 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (formData.meterId !== originalMeterId && !meterAgreementAccepted)}
                className={`w-32 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${loading ? 'bg-[#039994] opacity-50 cursor-not-allowed' : 'bg-[#039994] hover:bg-[#027d7b]'} text-white`}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}