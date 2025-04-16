import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function UploadFacilityDocumentModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);

  // Called when user selects a file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Called when user clicks the top "Upload" next to file input
  const handleUploadClick = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("File to upload:", selectedFile);
    // Implement your file upload logic here (API call, etc.)
  };

  // Called when user clicks bottom "Upload" to finalize
  const handleFinalUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("Final upload triggered for:", selectedFile);
    // Implement final upload logic
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-labelledby="upload-facility-document-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Close (X) button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-lg font-semibold text-gray-800">
          Upload Facility Document
        </h2>
        <hr className="my-3 border-gray-200" />

        {/* File Input + Green Upload Button side by side */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none p-2 w-full"
          />
          <button
            onClick={handleUploadClick}
            className="bg-[#039994] text-white text-sm px-3 py-2 rounded-md hover:bg-[#028c8c]"
          >
            Upload
          </button>
        </div>

        <hr className="mb-4 border-gray-200" />

        {/* Bottom buttons: Cancel & Upload, equal width */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalUpload}
            className="w-1/2 py-2 text-white text-sm rounded-md"
            style={{ backgroundColor: "#039994" }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
