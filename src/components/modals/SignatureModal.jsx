import React, { useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const SignatureModal = ({ isOpen, onClose, onSaveSignature }) => {
  // Active tab: "draw", "type", or "upload"
  const [activeTab, setActiveTab] = useState("draw");

  // For typed signature
  const [typedSignature, setTypedSignature] = useState("");

  // For file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

  // Trigger hidden file input
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      simulateUploadProgress();
    }
  };

  // Simulate upload progress
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const nextVal = Math.min(prev + 23, 100);
        if (nextVal >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
        }
        return nextVal;
      });
    }, 600);
  };

  // Handle updating the signature (instead of "Sign Agreement")
  const handleSignatureUpload = async () => {
    let signatureResult = "";

    // If "Draw" tab
    if (activeTab === "draw") {
      signatureResult = "Drawn Signature";
      onSaveSignature(signatureResult);
    }
    // If "Type" tab
    else if (activeTab === "type") {
      signatureResult = typedSignature || "Typed Signature";
      onSaveSignature(signatureResult);
    }
    // If "Upload" tab
    else if (activeTab === "upload") {
      if (!selectedFile || !uploadComplete) {
        alert("Please upload a signature image first.");
        return;
      }

      // Build FormData with "signature" as the key
      const formData = new FormData();
      formData.append("signature", selectedFile);

      // Retrieve userId, authToken from localStorage
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      try {
        // NOTE: If your endpoint is still named 'update-user-agreement', keep it:
        const response = await fetch(
          `https://dcarbon-server.onrender.com/api/user/update-user-agreement/${userId}`,
          // OR if you rename it, do something like:
          // `https://dcarbon-server.onrender.com/api/user/update-user-signature/${userId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          }
        );

        const data = await response.json();
        if (response.ok) {
          // We got a successful response back
          signatureResult = "Uploaded Signature";
          onSaveSignature(signatureResult);
        } else {
          alert("Failed to update signature: " + data.message);
        }
      } catch (error) {
        console.error("Error updating signature:", error);
        alert("An error occurred while updating the signature.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-xl bg-white rounded-md shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-[#039994]">Upload Signature</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <ul className="flex space-x-6 border-b border-gray-200">
            <li>
              <button
                onClick={() => setActiveTab("draw")}
                className={`pb-2 transition-colors ${
                  activeTab === "draw"
                    ? "text-[#039994] border-b-2 border-[#039994]"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                Draw
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("type")}
                className={`pb-2 transition-colors ${
                  activeTab === "type"
                    ? "text-[#039994] border-b-2 border-[#039994]"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                Type
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("upload")}
                className={`pb-2 transition-colors ${
                  activeTab === "upload"
                    ? "text-[#039994] border-b-2 border-[#039994]"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                Upload
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="px-6 py-4 min-h-[250px]">
          {/* Draw */}
          {activeTab === "draw" && (
            <div className="space-y-4">
              <div className="border rounded-md h-32 flex items-center justify-center bg-gray-50 text-gray-400">
                Draw signature here
              </div>
            </div>
          )}

          {/* Type */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">
                  Select typeface
                </label>
                <select className="border rounded p-1 w-1/2 sm:w-1/3 mb-4">
                  <option>Signika</option>
                  <option>Great Vibes</option>
                  <option>Dancing Script</option>
                </select>

                <label className="text-sm text-gray-700 mb-1">Enter Name</label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="border rounded p-1 w-full sm:w-1/2"
                  placeholder="Your Name"
                />
              </div>

              <div className="border rounded-md h-24 flex items-center justify-center bg-gray-50 text-gray-700">
                <span className="text-2xl" style={{ fontFamily: "cursive" }}>
                  {typedSignature || "Typed Signature Preview"}
                </span>
              </div>
            </div>
          )}

          {/* Upload */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {/* Upload UI */}
              {!uploadComplete ? (
                <>
                  {uploadProgress > 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-gray-500">
                      <p>Please wait...</p>
                      <div className="w-full bg-gray-200 h-2 rounded mt-2">
                        <div
                          className="bg-[#039994] h-2 rounded"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-sm mt-2">
                        {selectedFile && selectedFile.name} uploading {uploadProgress}%
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500 text-center">
                      <p>Drag &amp; drop a signature image or scan</p>
                      <p className="my-2">or</p>
                      <button
                        onClick={handleSelectImage}
                        className="px-4 py-2 bg-[#039994] text-white rounded-md"
                      >
                        Select image
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-2 border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-[#039994]">
                  <p className="font-medium text-lg mb-2">
                    Signature image uploaded
                  </p>
                  <div className="w-full bg-[#039994] h-2 rounded">
                    <div className="bg-[#039994] h-2 rounded w-full" />
                  </div>
                  <p className="text-sm mt-2 text-gray-600">
                    {selectedFile && selectedFile.name} &nbsp; ✓
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* (Optional) Explanation Text */}
        <div className="px-6 text-sm text-gray-600">
          By uploading this signature, I acknowledge it will be used wherever a
          signature is required in my user profile.
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSignatureUpload}
            className="px-4 py-2 rounded-md bg-[#039994] text-white hover:bg-[#027f7d]"
          >
            Update Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
