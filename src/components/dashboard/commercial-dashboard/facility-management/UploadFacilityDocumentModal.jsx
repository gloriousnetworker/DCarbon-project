import React, { useState } from "react";
import { FiX, FiPaperclip } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  uploadInputLabel,
  uploadIconContainer
} from "./styles";

export default function UploadFacilityDocumentModal({
  facilityId,
  docType,
  onClose,
  onUploadSuccess
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      const fieldName = docType === "financeAgreement" 
        ? "financeAgreementUrl" 
        : "proofOfAddressUrl";
      
      form.append(fieldName, selectedFile);

      const endpoints = {
        financeAgreement: `https://dcarbon-server.onrender.com/api/facility/update-facility-financial-agreement/${facilityId}`,
        proofOfAddress: `https://dcarbon-server.onrender.com/api/facility/update-facility-proof-of-address/${facilityId}`
      };

      const endpoint = endpoints[docType];

      const { data } = await axios.put(endpoint, form, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success(data.message || "Document uploaded successfully");
      onUploadSuccess(data.data);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {uploading && (
        <div className={spinnerOverlay}>
          <div className={spinner} />
        </div>
      )}

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={uploading}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Upload {docType === "financeAgreement" ? "Finance Agreement" : "Proof of Address"}
        </h2>
        <hr className="mb-4 border-gray-200" />

        <div className="mb-4">
          <label className={labelClass}>
            Select File (PDF or Image)
          </label>
          <div className="flex items-center space-x-2">
            <label className={uploadInputLabel}>
              {selectedFile ? selectedFile.name : "Choose file..."}
              <FiPaperclip className={uploadIconContainer} />
              <input
                type="file"
                accept="application/pdf,image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <hr className="mb-4 border-gray-200" />

        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className={`w-1/2 ${buttonPrimary}`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}