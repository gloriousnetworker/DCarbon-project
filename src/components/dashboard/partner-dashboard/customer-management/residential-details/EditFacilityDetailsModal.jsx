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
} from "./styles";

export default function EditResidentialFacilityModal({ facility, onClose = () => {}, onSave = () => {}, isOpen = false }) {
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
  const [installers, setInstallers] = useState([]);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [utilityAccount, setUtilityAccount] = useState("N/A");

  useEffect(() => {
    if (isOpen) {
      fetchPartnerDetails();
      fetchUserInstallers();
      if (facility.utilityAuthEmail) {
        setUtilityAccount(facility.utilityAuthEmail);
      }
    }
  }, [isOpen, facility]);

  const fetchPartnerDetails = async () => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!authToken || !userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://services.dcarbon.solutions/api/user/partner/user/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.status === "success") {
        setPartnerDetails(response.data.data);
        setIsAuthorized(response.data.data.name === facility.financeCompany);
      }
    } catch (error) {
      toast.error("Failed to load partner details");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInstallers = async () => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!authToken || !userId) return;
    setLoadingInstallers(true);
    try {
      const response = await axios.get(`https://services.dcarbon.solutions/api/user/get-users-referrals/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.status === "success") {
        const validInstallers = response.data.data.referrals.filter(
          referral => referral.role === "INSTALLER" && referral.status === "ACCEPTED"
        ).map(installer => ({
          id: installer.id,
          name: installer.name || "Unnamed Installer",
          email: installer.inviteeEmail
        }));
        setInstallers(validInstallers);
      }
    } catch (error) {
      toast.error("Failed to load installers");
    } finally {
      setLoadingInstallers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const updateData = {
        installer: formData.installer === "not_available" ? "N/A" : formData.installer,
        systemCapacity: Number(formData.systemCapacity),
        zipCode: formData.zipCode,
        meterId: formData.meterId || facility.meterId,
        utilityProvider: formData.utilityProvider,
        address: formData.address,
        financeType: formData.financeType,
        financeCompany: formData.financeType !== "Cash" ? formData.financeCompany : ""
      };
      const { data } = await axios.put(`https://services.dcarbon.solutions/api/residential-facility/update-facility/${facility.id}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (data.status === "success") {
        toast.success("Installer assigned successfully");
        onSave(data.data);
        onClose();
      } else throw new Error(data.message || "Failed to assign installer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign installer");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

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
          <h2 className="text-xl font-semibold">
            Assign Installer to Facility And Earn Commission
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" disabled={loading}>
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          {!isAuthorized ? (
            <div className="text-center py-8">
              <p className="text-red-500 font-medium">You are not authorized to assign an installer for this facility.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Installer <span className="text-red-500">*</span></label>
                <select name="installer" value={formData.installer} onChange={handleChange} className={selectClass} required disabled={loading || loadingInstallers}>
                  <option value="">Select installer</option>
                  {loadingInstallers ? (
                    <option value="" disabled>Loading installers...</option>
                  ) : installers.length > 0 ? (
                    installers.map(installer => (
                      <option key={installer.id} value={installer.name}>{installer.name}</option>
                    ))
                  ) : (
                    <option value="not_available">Not Yet Available</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Utility Provider</label>
                  <input type="text" name="utilityProvider" value={formData.utilityProvider} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div>
                  <label className={labelClass}>Utility Account</label>
                  <input type="text" value={utilityAccount} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div>
                  <label className={labelClass}>Meter ID</label>
                  <input type="text" name="meterId" value={formData.meterId || "N/A"} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <textarea name="address" value={formData.address} rows={3} className={`${inputClass} bg-gray-100`} disabled={true} />
                </div>
                <div>
                  <label className={labelClass}>Zip Code</label>
                  <input type="text" name="zipCode" value={formData.zipCode} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div>
                  <label className={labelClass}>System Capacity (kW)</label>
                  <input type="number" name="systemCapacity" value={formData.systemCapacity} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div>
                  <label className={labelClass}>Finance Type</label>
                  <input type="text" name="financeType" value={formData.financeType} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
                </div>
                <div>
                  <label className={labelClass}>Finance Company</label>
                  <input type="text" name="financeCompany" value={formData.financeCompany} className={`${inputClass} bg-gray-100 cursor-not-allowed`} readOnly disabled />
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
                  <span>Assign Installer</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}