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
    hasNetMetering: facility.hasNetMetering || false
  });

  const [loading, setLoading] = useState(false);
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [loadingFinanceCompanies, setLoadingFinanceCompanies] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFinanceTypes();
      fetchInstallers();
      fetchFinanceCompanies();
    }
  }, [isOpen]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
        hasNetMetering: formData.hasNetMetering
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
                <label className={labelClass}>Utility Provider</label>
                <input type="text" name="utilityProvider" value={formData.utilityProvider} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
              </div>
              <div>
                <label className={labelClass}>Meter ID</label>
                <input type="text" value={facility.meterId || ""} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                <p className={uploadNoteStyle}>Meter ID cannot be changed</p>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass} disabled={loading} required />
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
                  <option value="not_available">Not Yet Available</option>
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
              {showFinanceCompany && (
                <div>
                  <label className={labelClass}>Finance Company <span className="text-red-500">*</span></label>
                  <select name="financeCompany" value={formData.financeCompany} onChange={handleChange} className={selectClass} required disabled={loading || loadingFinanceCompanies}>
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
                disabled={loading}
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