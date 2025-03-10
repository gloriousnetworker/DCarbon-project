import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const SignatureModal = ({ isOpen, onClose, onSaveSignature }) => {
  // Track the active tab: "draw", "type", or "upload"
  const [activeTab, setActiveTab] = useState("draw");

  // For demonstration: track typed signature text, file upload progress, etc.
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Mock an upload
  const handleSelectImage = () => {
    setUploadProgress(0);
    setUploadComplete(false);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          return 100;
        }
        return prev + 23; // increments for demo
      });
    }, 600);
  };

  // Called when user clicks "Sign Agreement"
  const handleSignAgreement = () => {
    let signatureResult = "";

    if (activeTab === "draw") {
      // Replace with real signature pad data if using a library
      signatureResult = "Drawn Signature";
    } else if (activeTab === "type") {
      // Use typed text as the signature
      signatureResult = typedSignature || "Typed Signature";
    } else if (activeTab === "upload") {
      // If upload is complete, use a placeholder
      signatureResult = uploadComplete
        ? "Uploaded Signature"
        : "No file uploaded";
    }

    // Pass signature back to parent
    onSaveSignature(signatureResult);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-md shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-[#039994]">Signature</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs: Draw | Type | Upload */}
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

        {/* Content Area */}
        <div className="px-6 py-4 min-h-[250px]">
          {activeTab === "draw" && (
            <div className="space-y-4">
              {/* Signature Drawing Area */}
              <div className="border rounded-md h-32 flex items-center justify-center bg-gray-50 text-gray-400">
                {/* Replace this div with a real signature pad if needed */}
                Draw signature here
              </div>
            </div>
          )}

          {activeTab === "type" && (
            <div className="space-y-4">
              {/* Typed Signature Interface */}
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

              {/* Preview typed signature */}
              <div className="border rounded-md h-24 flex items-center justify-center bg-gray-50 text-gray-700">
                <span className="text-2xl" style={{ fontFamily: "cursive" }}>
                  {typedSignature || "Typed Signature Preview"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              {/* File Upload Area */}
              {!uploadComplete ? (
                <>
                  {uploadProgress > 0 ? (
                    // Show upload progress
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-gray-500">
                      <p>Please wait...</p>
                      <div className="w-full bg-gray-200 h-2 rounded mt-2">
                        <div
                          className="bg-[#039994] h-2 rounded"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-sm mt-2">
                        IMG1.jpg uploading {uploadProgress}%
                      </div>
                    </div>
                  ) : (
                    // Drag & drop area
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
                // Show upload complete
                <div className="border-2 border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-[#039994]">
                  <p className="font-medium text-lg mb-2">
                    Signature image uploaded
                  </p>
                  <div className="w-full bg-[#039994] h-2 rounded">
                    <div className="bg-[#039994] h-2 rounded w-full" />
                  </div>
                  <p className="text-sm mt-2 text-gray-600">IMG1.jpg &nbsp; ✓</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agreement Text */}
        <div className="px-6 text-sm text-gray-600">
          By signing this document with an electronic signature, I agree that
          such signature will be as valid as handwritten signatures to the
          extent allowed by local law
        </div>

        {/* Horizontal Rule */}
        <hr className="my-4 border-gray-200" />

        {/* Buttons: Cancel | Sign Agreement */}
        <div className="flex justify-end space-x-4 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSignAgreement}
            className="px-4 py-2 rounded-md bg-[#039994] text-white hover:bg-[#027f7d]"
          >
            Sign Agreement
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
