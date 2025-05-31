import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import {
  labelClass,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  inputClass,
  selectClass,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle
} from "./styles";

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

  // Reset form to initial state
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
        
        // Check if onSave is a function before calling it
        if (typeof onSave === 'function') {
          onSave(data.data);
        }
        
        // Reset form after successful submission
        resetForm();
        
        // Close modal
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        throw new Error(data.message || "Failed to update facility");
      }
    } catch (err) {
      console.error("Error updating facility:", err);
      toast.error(err.response?.data?.message || "Failed to update facility");
      
      // Reset form even on error to clear any temporary states
      setLoading(false);
    }
  };

  // Handle modal close with form reset
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
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className={`${buttonPrimary} bg-[#039994] hover:bg-[#02857f] text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {loading && (
          <div className={spinnerOverlay}>
            <div className={spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
}