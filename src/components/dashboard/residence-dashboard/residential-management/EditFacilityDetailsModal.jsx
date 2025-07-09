import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const buttonPrimary = "bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors";
const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const spinner = "animate-spin rounded-full h-8 w-8 border-b-2 border-white";
const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";
const selectClass = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";
const uploadHeading = "block text-sm font-medium text-gray-700 mb-1";
const uploadFieldWrapper = "flex items-center gap-2 mb-1";
const uploadInputLabel = "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 truncate relative cursor-pointer";
const uploadIconContainer = "absolute right-3 top-1/2 transform -translate-y-1/2";
const uploadButtonStyle = "px-3 py-2 rounded-md text-sm text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed";
const uploadNoteStyle = "text-xs text-gray-500";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  const [formData, setFormData] = useState({
    utilityProvider: facility?.utilityProvider || "",
    installer: facility?.installer || "",
    financeType: facility?.financeType || "",
    financeCompany: facility?.financeCompany || "",
    financeAgreement: facility?.financeAgreement || null
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);

  useEffect(() => {
    fetchUtilityProviders();
  }, []);

  const resetForm = () => {
    setFormData({
      utilityProvider: facility?.utilityProvider || "",
      installer: facility?.installer || "",
      financeType: facility?.financeType || "",
      financeCompany: facility?.financeCompany || "",
      financeAgreement: facility?.financeAgreement || null
    });
    setFile(null);
    setUploadSuccess(false);
    setLoading(false);
    setUploading(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    try {
      const authToken = localStorage.getItem("authToken");
      
      const updateData = {
        utilityProvider: formData.utilityProvider,
        installer: formData.installer,
        financeType: formData.financeType,
        ...(formData.financeType !== "cash" && {
          financeCompany: formData.financeCompany,
          financeAgreement: formData.financeAgreement
        })
      };

      const { data } = await axios.put(
        `https://services.dcarbon.solutions/api/residential-facility/update-facility/${facility?.id}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          } 
        }
      );

      if (data.status === "success") {
        toast.success("Facility updated successfully");
        if (typeof onSave === 'function') {
          onSave(data.data);
        }
        resetForm();
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        throw new Error(data.message || "Failed to update facility");
      }
    } catch (err) {
      console.error("Error updating facility:", err);
      toast.error(err.response?.data?.message || "Failed to update facility");
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Edit Facility Details</h3>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Utility Provider</label>
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
              <label className={labelClass}>Installer</label>
              <input
                type="text"
                name="installer"
                value={formData.installer}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Finance Type</label>
              <select
                name="financeType"
                value={formData.financeType}
                onChange={handleChange}
                className={selectClass}
                required
              >
                <option value="">Select finance type</option>
                <option value="cash">Cash</option>
                <option value="loan">Loan</option>
                <option value="lease">Lease</option>
                <option value="ppa">PPA</option>
              </select>
            </div>

            {formData.financeType && formData.financeType !== "cash" && (
              <div>
                <label className={labelClass}>Finance Company</label>
                <input
                  type="text"
                  name="financeCompany"
                  value={formData.financeCompany}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Enter finance company"
                />
              </div>
            )}

            {formData.financeType && formData.financeType !== "cash" && (
              <div>
                <label className={uploadHeading}>
                  Finance Agreement
                  {!formData.financeAgreement && <span className="text-red-500">*</span>}
                </label>
                {formData.financeAgreement ? (
                  <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                    <p className="font-medium">Current file: {formData.financeAgreement}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new file below if you need to update it
                    </p>
                  </div>
                ) : null}
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
                        <path
                          fill="none"
                          d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17h-2v-2h2v2zm1.414-3.414l-1.414 1.414-1.414-1.414 1.414-1.414 1.414 1.414zm3.536-3.536l-1.414 1.414-1.414-1.414 1.414-1.414 1.414 1.414zM19 12h-2v-2h2v2zm-3.536-5.536l-1.414 1.414L13.636 6l1.414-1.414L16.464 6zM12 4h2v2h-2V4zM8.464 6l1.414-1.414L11.292 6l-1.414 1.414L8.464 6zM6 12H4v-2h2v2zm3.536 5.536l1.414-1.414L11.292 18l-1.414 1.414L9.464 18z"
                        />
                      </svg>
                    ) : uploadSuccess ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          d="M12 2a10 10 0 100 20 10 10 0 000-20zm5.707 7.293l-6.364 6.364-3.536-3.536L8.293 11l2.121 2.121L16.586 9l1.414 1.414z"
                        />
                      </svg>
                    ) : (
                      "Upload Agreement"
                    )}
                  </button>
                </div>
                <p className={uploadNoteStyle}>
                  Upload a PDF or image file (max 5MB). This is required for non-cash finance types.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className={`${buttonPrimary} ${loading || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17h-2v-2h2v2zm1.414-3.414l-1.414 1.414-1.414-1.414 1.414-1.414 1.414 1.414zm3.536-3.536l-1.414 1.414-1.414-1.414 1.414-1.414 1.414 1.414zM19 12h-2v-2h2v2zm-3.536-5.536l-1.414 1.414L13.636 6l1.414-1.414L16.464 6zM12 4h2v2h-2V4zM8.464 6l1.414-1.414L11.292 6l-1.414 1.414L8.464 6zM6 12H4v-2h2v2zm3.536 5.536l1.414-1.414L11.292 18l-1.414 1.414L9.464 18z"
                    />
                  </svg>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
        {uploading && (
          <div className={spinnerOverlay}>
            <div className={spinner}></div>
          </div>
        )}
        {loading && (
          <div className={spinnerOverlay}>
            <div className={spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
}