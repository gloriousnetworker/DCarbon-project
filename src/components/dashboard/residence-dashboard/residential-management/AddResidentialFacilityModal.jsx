import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
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
  uploadNoteStyle
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function AddFacilityModal({ onClose, onFacilityAdded }) {
  // Form states
  const [formData, setFormData] = useState({
    facilityName: "",
    address: "",
    utilityProvider: "",
    meterId: "",
    commercialRole: "",
    entityType: "company", // Default to company
    financeType: "",
    financeCompany: "",
    financeAgreement: null
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Simulate a successful upload
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
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.facilityName || !formData.address || !formData.meterId) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.financeType && formData.financeType !== "cash" && !formData.financeAgreement) {
        toast.error("Please upload the financial agreement");
        setLoading(false);
        return;
      }

      // Prepare the payload
      // Prepare the request body - including the original fields plus new finance fields
      const payload = {
        facilityName: formData.facilityName,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterId: formData.meterId,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType,
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        financeAgreement: formData.financeAgreement
      };

      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/facility/create-new-facility/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create facility");
      }

      const data = await response.json();
      toast.success("Facility added successfully");
      onFacilityAdded(data.data); // Pass the created facility data to parent
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create facility");
      console.error("Error creating facility:", err);
    } finally {
      setLoading(false);
    }
  };

  // No isOpen check here as this component doesn't use that pattern

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
          <Loader />
        </div>
      )}
      
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        <h2 className={`${pageTitle} text-left mb-6`}>
          Add Commercial Facility
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Facility Name */}
          <div className="mb-4">
            <label className={labelClass}>
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility name"
              required
            />
          </div>

          {/* Utility Provider */}
          <div className="mb-4">
            <label className={labelClass}>
              Utility Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              placeholder="Utility company name"
              required
            />
          </div>

          {/* Finance Type - New field */}
          <div className="mb-4">
            <label className={labelClass}>Finance Type</label>
            <select
              name="financeType"
              value={formData.financeType}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select finance type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company - Conditionally shown */}
          {formData.financeType && formData.financeType !== "cash" && (
            <div className="mb-4">
              <label className={labelClass}>Finance Company</label>
              <input
                type="text"
                name="financeCompany"
                value={formData.financeCompany}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter finance company"
              />
            </div>
          )}

          {/* Finance Agreement Upload - Conditionally shown */}
          {formData.financeType && formData.financeType !== "cash" && (
            <div className="mb-4">
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

          {/* Address */}
          <div className="mb-4">
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street, City, County, State"
              required
            />
          </div>

          {/* Meter ID */}
          <div className="mb-4">
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Meter identification number"
              required
            />
          </div>

          {/* Commercial Role */}
          <div className="mb-4">
            <label className={labelClass}>
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="">Choose role</option>
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Entity Type */}
          <div className="mb-4">
            <label className={labelClass}>
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          {/* Form Actions */}
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
              className={`flex-1 ${buttonPrimary}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Add Facility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}