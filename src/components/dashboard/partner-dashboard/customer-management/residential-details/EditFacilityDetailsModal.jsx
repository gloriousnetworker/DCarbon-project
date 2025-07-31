import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/loader/Loader.jsx";
import {
  labelClass,
  inputClass,
  selectClass,
  spinnerOverlay,
  buttonPrimary,
  uploadNoteStyle
} from "./styles";

export default function EditResidentialFacilityModal({ facility, onClose = () => { }, onSave = () => { }, isOpen = false }) {
  const [formData, setFormData] = useState({
    installer: facility.installer || "",
    systemCapacity: facility.systemCapacity || "",
    zipCode: facility.zipCode || "",
    meterId: facility.meterId || "",
    utilityProvider: facility.utilityProvider || "",
    address: facility.address || "",
    financeType: facility.financeType || "",
    financeCompany: facility.financeCompany || ""
  });

  const [loading, setLoading] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");
  const [meterAgreementAccepted, setMeterAgreementAccepted] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [originalMeterId, setOriginalMeterId] = useState(facility.meterId || "");
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      fetchUserMeters();
      fetchFinanceTypes();
      fetchInstallers();
    }
  }, [isOpen]);

  const fetchUtilityProviders = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;
    setUtilityProvidersLoading(true);
    try {
      const response = await axios.get("https://services.dcarbon.solutions/api/auth/utility-providers", { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.data.status === "success") setUtilityProviders(response.data.data);
    } catch (error) {
      toast.error("Failed to load utility providers");
    } finally {
      setUtilityProvidersLoading(false);
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
        setFinanceCompanies(["Company 1", "Company 2", "Company 3", "Other"]);
      }
    } catch (error) {
      toast.error("Failed to load finance types");
    } finally {
      setLoadingFinanceTypes(false);
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
      const response = await axios.get(`https://services.dcarbon.solutions/api/auth/user-meters/${userId}`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.data.status === "success") {
        setUserMeterData(response.data.data);
        const firstWithMeters = response.data.data.find(item => item.meters?.meters?.length > 0);
        if (firstWithMeters) setSelectedUtilityAuthEmail(firstWithMeters.utilityAuthEmail);
      }
    } catch (error) {
      toast.error("Failed to load meter information");
    } finally {
      setUserMetersLoading(false);
    }
  };

  const getCurrentMeters = () => {
    if (!selectedUtilityAuthEmail) return [];
    const selectedData = userMeterData.find(item => item.utilityAuthEmail === selectedUtilityAuthEmail);
    if (!selectedData || !selectedData.meters?.meters) return [];
    return selectedData.meters.meters.filter(meter => meter.base.service_class === "electric");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setFormData(prev => ({ ...prev, meterId: "" }));
    setSelectedMeter(null);
    setIsSameLocation(null);
    setMeterAgreementAccepted(false);
  };

  const handleLocationChoice = (choice) => {
    setIsSameLocation(choice);
    if (choice && selectedMeter) setFormData(prev => ({ ...prev, address: selectedMeter.base.service_address }));
    else setFormData(prev => ({ ...prev, address: facility.address || "" }));
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
      const response = await axios.put(`https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.data.status === "success") {
        setMeterAgreementAccepted(true);
        toast.success("Meter agreement accepted successfully");
      }
    } catch (error) {
      toast.error("Failed to accept meter agreement");
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
        installer: formData.installer,
        systemCapacity: Number(formData.systemCapacity),
        zipCode: formData.zipCode,
        meterId: formData.meterId,
        utilityProvider: formData.utilityProvider,
        address: formData.address,
        financeType: formData.financeType,
        financeCompany: formData.financeType !== "Cash" ? formData.financeCompany : ""
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

  const utilityAuthEmailsWithMeters = userMeterData.filter(item => item.meters?.meters?.length > 0);
  const currentMeters = getCurrentMeters();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackdropClick}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                <label className={labelClass}>Utility Provider <span className="text-red-500">*</span></label>
                <input type="text" name="utilityProvider" value={formData.utilityProvider} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
              </div>
              <div>
                <label className={labelClass}>Utility Account <span className="text-red-500">*</span></label>
                <select value={selectedUtilityAuthEmail} onChange={handleUtilityAuthEmailChange} className={selectClass} required disabled={loading || userMetersLoading}>
                  <option value="">Select utility account</option>
                  {userMetersLoading ? <option value="" disabled>Loading accounts...</option> : utilityAuthEmailsWithMeters.length === 0 ? <option value="" disabled>No utility accounts found</option> : utilityAuthEmailsWithMeters.map(item => (
                    <option key={item.id} value={item.utilityAuthEmail}>{item.utilityAuthEmail}</option>
                  ))}
                </select>
                <p className={uploadNoteStyle}>Select the utility account containing your meters</p>
              </div>
              {selectedUtilityAuthEmail && (
                <div>
                  <label className={labelClass}>Meter ID <span className="text-red-500">*</span></label>
                  <select name="meterId" value={formData.meterId} onChange={handleChange} className={selectClass} required disabled={loading || currentMeters.length === 0}>
                    <option value="">Select meter</option>
                    {currentMeters.length === 0 ? <option value="" disabled>No electric meters found for this account</option> : currentMeters.map(meter => (
                      <option key={meter.uid} value={meter.uid}>{meter.base.meter_numbers[0]} - {meter.base.service_tariff}</option>
                    ))}
                  </select>
                  <p className={uploadNoteStyle}>Only electric meters are shown</p>
                </div>
              )}
              {selectedMeter && (
                <div className="md:col-span-2">
                  <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="font-medium mb-2">Service Address: {selectedMeter.base.service_address}</p>
                    <p className="font-medium mb-2">Is this the same location for the solar installation? <span className="text-red-500">*</span></p>
                    <div className="flex gap-2">
                      <button type="button" className={`px-3 py-1 rounded-md border text-sm ${isSameLocation === true ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleLocationChoice(true)} disabled={loading}>Yes</button>
                      <button type="button" className={`px-3 py-1 rounded-md border text-sm ${isSameLocation === false ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleLocationChoice(false)} disabled={loading}>No</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                {selectedMeter && isSameLocation === true ? (
                  <textarea name="address" value={formData.address} rows={3} className={`${inputClass} bg-gray-100`} disabled={true} />
                ) : (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass} disabled={loading} required />
                )}
              </div>
              <div>
                <label className={labelClass}>Zip Code <span className="text-red-500">*</span></label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClass} required disabled={loading} />
              </div>
              <div>
                <label className={labelClass}>System Capacity (kW) <span className="text-red-500">*</span></label>
                <input type="number" name="systemCapacity" value={formData.systemCapacity} onChange={handleChange} className={inputClass} min="0" step="0.1" required disabled={loading} />
              </div>
              <div>
                <label className={labelClass}>Installer <span className="text-red-500">*</span></label>
                <select name="installer" value={formData.installer} onChange={handleChange} className={selectClass} required disabled={loading || loadingInstallers}>
                  <option value="">Select installer</option>
                  {loadingInstallers ? <option value="" disabled>Loading installers...</option> : installers.map(installer => (
                    <option key={installer.id} value={installer.name}>{installer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Finance Type <span className="text-red-500">*</span></label>
                <select name="financeType" value={formData.financeType} onChange={handleChange} className={selectClass} required disabled={loading || loadingFinanceTypes}>
                  <option value="">Select finance type</option>
                  {loadingFinanceTypes ? <option value="" disabled>Loading finance types...</option> : financeTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              {formData.financeType && formData.financeType !== "Cash" && (
                <div>
                  <label className={labelClass}>Finance Company <span className="text-red-500">*</span></label>
                  <select name="financeCompany" value={formData.financeCompany} onChange={handleChange} className={selectClass} required disabled={loading}>
                    <option value="">Select finance company</option>
                    {financeCompanies.map((company, index) => (
                      <option key={index} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {formData.meterId !== originalMeterId && !meterAgreementAccepted && (
              <div className="md:col-span-2 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-medium mb-2">By clicking "Accept Meter Agreement", you agree that the selected meter can be used for this facility.</p>
                <button type="button" onClick={handleAcceptMeterAgreement} className={`w-full py-2 rounded-md text-white font-medium ${meterAgreementAccepted ? 'bg-green-600' : 'bg-[#039994] hover:bg-[#02857f]'}`} disabled={meterAgreementAccepted || acceptingAgreement || loading}>
                  {acceptingAgreement ? 'Processing...' : meterAgreementAccepted ? 'Meter Agreement Accepted' : 'Accept Meter Agreement'}
                </button>
              </div>
            )}
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
                className={`w-32 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${loading || (formData.meterId !== originalMeterId && !meterAgreementAccepted) ? 'bg-[#039994] opacity-50 cursor-not-allowed' : 'bg-[#039994] hover:bg-[#027d7b]'} text-white`}
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