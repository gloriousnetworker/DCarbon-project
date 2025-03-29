import React, { useState } from "react";
import {
  FiArrowLeft,
  FiX,
  FiEye,
  FiEdit,
  FiFileText,
} from "react-icons/fi";

// Import the two new modals
import EditFacilityDetailsModal from "./EditFacilityDetailsModal";
import UploadFacilityDocumentModal from "./UploadFacilityDocumentModal";

export default function FacilityDetails({ facility, onBack }) {
  // Local states to control the modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="bg-white rounded-md shadow p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-[#039994] hover:underline mb-4"
      >
        <FiArrowLeft className="mr-1" />
        Back to Facilities
      </button>

      {/* Header: "Facility Details" + Edit button */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: "#039994" }}>
          Facility Details
        </h3>
        <button
          onClick={() => setShowEditModal(true)}
          className="
            flex items-center
            gap-2
            bg-[#1E1E1E]
            text-white
            px-4
            py-2
            rounded-full
            text-sm
            hover:bg-black
            transition-colors
          "
        >
          <FiEdit size={16} />
          <span>Edit Facility Details</span>
        </button>
      </div>

      {/* Top Section: Left (Details) + Right (Documents) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side info (light green background, green border) */}
        <div
          className="border border-[#039994] rounded-md p-4"
          style={{ backgroundColor: "#069B960D" }}
        >
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="font-semibold text-gray-800">Owner Name:</span>
            <span className="text-gray-700">{facility.ownerName}</span>

            <span className="font-semibold text-gray-800">Operator Name:</span>
            <span className="text-gray-700">{facility.operatorName}</span>

            <span className="font-semibold text-gray-800">Facility ID:</span>
            <span className="text-gray-700">{facility.id}</span>

            <span className="font-semibold text-gray-800">Utility Provider:</span>
            <span className="text-gray-700">{facility.utilityProvider}</span>

            <span className="font-semibold text-gray-800">Meter ID:</span>
            <span className="text-gray-700">{facility.meterId}</span>

            <span className="font-semibold text-gray-800">Address:</span>
            <span className="text-gray-700">{facility.address}</span>

            <span className="font-semibold text-gray-800">Date created:</span>
            <span className="text-gray-700">{facility.dateCreated}</span>
          </div>
        </div>

        {/* Right side: Documents */}
        <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 text-base mb-4">
            Facility Documents
          </h4>
          <button
            onClick={() => setShowUploadModal(true)}
            className="
              bg-[#039994]
              text-white
              text-sm
              px-3 py-2
              rounded-md
              hover:bg-[#028c8c]
              mb-4
            "
          >
            + Upload Facility Document
          </button>

          {/* Example Documents List */}
          {/* Document #1 */}
          <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <FiFileText className="text-gray-400" />
              <span className="text-sm text-gray-700">Doc1.jpg</span>
              {/* Eye icon to preview */}
              <button className="text-gray-500 hover:text-gray-700">
                <FiEye size={16} />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-[#00B929]">Approved</span>
              <button className="text-[#F04438] hover:text-red-700">
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Document #2 */}
          <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <FiFileText className="text-gray-400" />
              <span className="text-sm text-gray-700">Doc2.jpg</span>
              {/* Eye icon to preview */}
              <button className="text-gray-500 hover:text-gray-700">
                <FiEye size={16} />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-[#FBA100]">Pending</span>
              <button className="text-[#F04438] hover:text-red-700">
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-300" />

      {/* Bottom Section: Energy Production (chart) + Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Production chart */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#039994] font-semibold text-lg">
              Energy Production
            </h4>
            {/* Example year/time pickers */}
            <div className="flex items-center space-x-2">
              <select className="border border-gray-300 rounded p-1 text-sm">
                <option>Yearly</option>
                <option>Monthly</option>
              </select>
              <select className="border border-gray-300 rounded p-1 text-sm">
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
          </div>
          {/* Test-tube style chart image placeholder */}
          <div className="flex items-center justify-center bg-gray-50 h-48 rounded-md overflow-hidden">
            <img
              src="/dashboard_images/graph.png"
              alt="Test-tube Bar Chart"
              className="object-contain h-full"
            />
          </div>
        </div>

        {/* Stats: RECs Generated, Total RECs sold */}
        <div className="flex flex-col space-y-4">
          <div className="border border-[#039994] rounded-md p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-1">RECs Generated</p>
            <p className="text-2xl font-bold text-[#039994]">100</p>
          </div>
          <div className="border border-[#039994] rounded-md p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-1">Total RECs sold</p>
            <p className="text-2xl font-bold text-[#039994]">20</p>
          </div>
        </div>
      </div>

      {/* Conditionally render the modals */}
      {showEditModal && (
        <EditFacilityDetailsModal
          facility={facility}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedData) => {
            // TODO: update facility details in your state or API
            console.log("Updated facility data:", updatedData);
            setShowEditModal(false);
          }}
        />
      )}

      {showUploadModal && (
        <UploadFacilityDocumentModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
