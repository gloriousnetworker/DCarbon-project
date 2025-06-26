import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import UtilityAuthorizationModal from "./UtilityAuthorizationModal";
import {
  labelClass,
  selectClass,
  inputClass,
  buttonPrimary,
  pageTitle,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle,
  spinnerOverlay
} from "../../styles";

export default function AddResidentialFacilityModal({ 
  isOpen, 
  onClose, 
  onBack,
  selectedMeters = [],
  utilityAuthEmail
}) {
  const [formData, setFormData] = useState({
    nickname: "",
    address: "",
    utilityProvider: "",
    meterIds: selectedMeters,
    zipCode: "",
    systemCapacity: "",
    installer: "",
    financeType: "",
    financeCompany: "",
    financeAgreement: null,
    facilityTypeNamingCode: 2,
    utilityProviderNamingCode: "",
    installerNamingCode: "",
    financeNamingCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [installers, setInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeTypesLoading, setFinanceTypesLoading] = useState(false);
  const [showUtilityAuthModal, setShowUtilityAuthModal] = useState(false);
  const [showFinanceTypeRequestModal, setShowFinanceTypeRequestModal] = useState(false);
  const [newFinanceType, setNewFinanceType] = useState("");

  const isCashType = formData.financeType.toLowerCase() === 'cash';
  const showUploadField = !isCashType && formData.financeType !== '';
  const showFinanceCompany = !isCashType && formData.financeType !== '';

  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      fetchInstallers();
      fetchFinanceTypes();
    }
  }, [isOpen]);

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

  const fetchInstallers = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return;

    setInstallersLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/user/partner/get-all-installer",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setInstallers(response.data.data.installers);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "utilityProvider") {
      const selectedProvider = utilityProviders.find(provider => provider.name === value);
      setFormData(prev => ({
        ...prev,
        utilityProviderNamingCode: selectedProvider?.namingCode || ""
      }));
    }

    if (name === "installer") {
      const selectedInstaller = installers.find(installer => installer.name === value);
      setFormData(prev => ({
        ...prev,
        installerNamingCode: selectedInstaller?.namingCode || ""
      }));
    }

    if (name === "financeType") {
      const selectedFinanceType = financeTypes.find(type => type.name === value);
      setFormData(prev => ({
        ...prev,
        financeNamingCode: selectedFinanceType?.namingCode || "",
        financeCompany: "",
        financeAgreement: null
      }));
      setFile(null);
      setUploadSuccess(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormData(prev => ({
        ...prev,
        financeAgreement: file.name
      }));
      
      toast.success('Financial agreement uploaded successfully!');
      setUploadSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
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

    if (!formData.nickname || !formData.address || !formData.utilityProvider || 
        formData.meterIds.length === 0 || !formData.zipCode || !formData.systemCapacity || 
        !formData.installer || !formData.financeType) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (showUploadField && !formData.financeAgreement) {
      toast.error("Please upload the financial agreement");
      setLoading(false);
      return;
    }

    if (showFinanceCompany && !formData.financeCompany) {
      toast.error("Please select a finance company");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        nickname: formData.nickname,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterIds: formData.meterIds,
        zipCode: formData.zipCode,
        systemCapacity: Number(formData.systemCapacity),
        installer: formData.installer,
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        financeAgreement: formData.financeAgreement,
        facilityTypeNamingCode: formData.facilityTypeNamingCode,
        utilityProviderNamingCode: Number(formData.utilityProviderNamingCode),
        installerNamingCode: Number(formData.installerNamingCode),
        financeNamingCode: Number(formData.financeNamingCode),
        utilityAuthEmail: utilityAuthEmail
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/residential-facility/create-residential-facility/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success(`Residence created successfully: ${response.data.data.facilityName}`);
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create residence");
      }
    } catch (error) {
      console.error("Error creating residence:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create residence"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUtilityAuthModal = () => {
    setShowUtilityAuthModal(true);
  };

  const handleCloseUtilityAuthModal = () => {
    setShowUtilityAuthModal(false);
  };

  const handleOpenAddFinanceTypeModal = () => {
    setShowFinanceTypeRequestModal(true);
  };

  const handleCloseAddFinanceTypeModal = () => {
    setShowFinanceTypeRequestModal(false);
    setNewFinanceType("");
  };

  const handleRequestFinanceType = async () => {
    if (!newFinanceType.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-financial-type/${userId}`,
        { name: newFinanceType },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Finance type request submitted successfully");
        handleCloseAddFinanceTypeModal();
        fetchFinanceTypes();
      } else {
        throw new Error(response.data.message || "Failed to request finance type");
      }
    } catch (error) {
      console.error("Error requesting finance type:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to request finance type"
      );
    }
  };

  const isFormComplete = 
    formData.nickname &&
    formData.address &&
    formData.utilityProvider &&
    formData.meterIds.length > 0 &&
    formData.zipCode &&
    formData.systemCapacity &&
    formData.installer &&
    formData.financeType &&
    (isCashType || (formData.financeCompany && (!showUploadField || formData.financeAgreement)));

  if (!isOpen) return null;

  if (showUtilityAuthModal) {
    return (
      <UtilityAuthorizationModal 
        isOpen={true}
        onClose={handleCloseUtilityAuthModal}
        onBack={() => setShowUtilityAuthModal(false)}
      />
    );
  }

  if (showFinanceTypeRequestModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
        <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
          <button
            onClick={handleCloseAddFinanceTypeModal}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX size={20} />
          </button>

          <h2 className={pageTitle}>Request New Finance Type</h2>

          <div className="space-y-4 mt-6">
            <div>
              <label className={labelClass}>Finance Type Name</label>
              <input
                type="text"
                value={newFinanceType}
                onChange={(e) => setNewFinanceType(e.target.value)}
                className={inputClass}
                placeholder="Enter finance type name (e.g. PPA)"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCloseAddFinanceTypeModal}
                className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestFinanceType}
                className={`flex-1 ${buttonPrimary}`}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      {loading && (
        <div className={spinnerOverlay}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
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

        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-6 top-6 text-[#039994] hover:text-[#02857f]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <h2 className={pageTitle}>Add Residence</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className={labelClass}>Facility Nickname <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility nickname"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Utility Provider <span className="text-red-500">*</span></label>
            <select
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={utilityProvidersLoading}
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
            <label className={labelClass}>Authorized Meters <span className="text-red-500">*</span></label>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              {selectedMeters.length > 0 ? (
                <p className="text-sm">{selectedMeters.length} meter(s) selected</p>
              ) : (
                <p className="text-sm text-gray-500">No meters selected</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenUtilityAuthModal}
              className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
            >
              {selectedMeters.length > 0 ? 'Change selected meters' : 'Add Utility account'}
            </button>
          </div>

          <div>
            <label className={labelClass}>Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter address"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Zip Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter zip code"
              required
              pattern="\d{5}(-\d{4})?"
              title="Enter a valid US zip code (5 or 9 digits)"
            />
          </div>

          <div>
            <label className={labelClass}>System Capacity (kW) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="systemCapacity"
              value={formData.systemCapacity}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter system capacity"
              required
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className={labelClass}>Installer <span className="text-red-500">*</span></label>
            <select
              name="installer"
              value={formData.installer}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={installersLoading}
            >
              <option value="">Select installer</option>
              {installersLoading ? (
                <option value="" disabled>Loading installers...</option>
              ) : (
                installers.map(installer => (
                  <option key={installer.id} value={installer.name}>
                    {installer.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className={labelClass}>Finance Type <span className="text-red-500">*</span></label>
            <select
              name="financeType"
              value={formData.financeType}
              onChange={handleChange}
              className={selectClass}
              required
              disabled={financeTypesLoading}
            >
              <option value="">Select finance type</option>
              {financeTypesLoading ? (
                <option value="" disabled>Loading finance types...</option>
              ) : (
                financeTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={handleOpenAddFinanceTypeModal}
              className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
            >
              Finance Type not available? Request new type
            </button>
          </div>

          {showFinanceCompany && (
            <div>
              <label className={labelClass}>Finance Company <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="financeCompany"
                value={formData.financeCompany}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter finance company"
                required
              />
            </div>
          )}

          {showUploadField && (
            <div>
              <label className={uploadHeading}>
                Finance Agreement <span className="text-red-500">*</span>
              </label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  {file ? file.name : 'Choose file...'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <span className={uploadIconContainer}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.5 12.5l7-7a2.121 2.121 0 013 3L10 17a4 4 0 01-5.657-5.657l7-7"
                      />
                    </svg>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || uploading || uploadSuccess}
                  className={`${uploadButtonStyle} ${
                    !file || uploading || uploadSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#039994]'
                  }`}
                >
                  {uploading ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 animate-spin text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : uploadSuccess ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
              <p className={uploadNoteStyle}>
                Required for loan, PPA, and lease agreements
              </p>
            </div>
          )}

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
              {loading ? "Processing..." : "Add Residence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}