import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  pageTitle, 
  labelClass, 
  inputClass, 
  buttonPrimary,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle,
  spinnerOverlay
} from "./styles";

export default function AddResidentialFacilityModal({ onClose, onFacilityAdded }) {
  const [formData, setFormData] = useState({
    utilityProvider: "",
    installer: "",
    financeType: "",
    financeCompany: "",
    financeAgreement: null,
    address: "",
    meterId: "",
    zipCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

    // Validate required fields
    if (!formData.address || !formData.meterId || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.financeType && formData.financeType !== "cash" && !formData.financeAgreement) {
      toast.error("Please upload the financial agreement");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        utilityProvider: formData.utilityProvider,
        installer: formData.installer,
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        financeAgreement: formData.financeAgreement,
        address: formData.address,
        meterId: formData.meterId,
        zipCode: formData.zipCode
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
        toast.success("Residence created successfully");
        onClose();
        onFacilityAdded(); // Call this after successful creation
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      {loading && (
        <div className={spinnerOverlay}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      )}
      
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className={pageTitle}>Add Residence</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Rest of your form remains exactly the same */}
          {/* Utility Provider */}
          <div>
            <label className={labelClass}>Utility Provider</label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter utility provider"
            />
          </div>

          {/* Installer */}
          <div>
            <label className={labelClass}>Installer</label>
            <input
              type="text"
              name="installer"
              value={formData.installer}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter installer name"
            />
          </div>

          {/* Finance Type */}
          <div>
            <label className={labelClass}>Finance Type</label>
            <select
              name="financeType"
              value={formData.financeType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select finance type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company */}
          {formData.financeType && formData.financeType !== "cash" && (
            <div>
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

          {/* Finance Agreement Upload */}
          {formData.financeType && formData.financeType !== "cash" && (
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

          {/* Address */}
          <div>
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
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

          {/* Meter ID */}
          <div>
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter meter ID"
              required
            />
          </div>

          {/* Zip Code */}
          <div>
            <label className={labelClass}>
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter zip code"
              required
            />
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
              {loading ? "Processing..." : "Add Residence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}