import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function EditFacilityDetailsModal({ facility, onClose, onSave }) {
  // Local state for each editable field
  const [ownerName, setOwnerName] = useState(facility.ownerName);
  const [operatorName, setOperatorName] = useState(facility.operatorName);
  const [utilityProvider, setUtilityProvider] = useState(facility.utilityProvider);
  const [meterId, setMeterId] = useState(facility.meterId);
  const [address, setAddress] = useState(facility.address);

  // Called when user clicks "Save"
  const handleSave = () => {
    const updatedData = {
      ...facility,
      ownerName,
      operatorName,
      utilityProvider,
      meterId,
      address,
    };
    onSave(updatedData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-labelledby="edit-facility-modal"
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
        <h2 className="text-lg font-semibold text-gray-800">Edit Facility Details</h2>
        <hr className="my-3 border-gray-200" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Name
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utility Provider
            </label>
            <input
              type="text"
              value={utilityProvider}
              onChange={(e) => setUtilityProvider(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meter ID
            </label>
            <input
              type="text"
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:ring-1 focus:ring-[#039994] focus:outline-none"
              rows={2}
            />
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Buttons: Cancel and Save */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="w-1/2 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-1/2 py-2 text-white text-sm rounded-md"
            style={{ backgroundColor: "#039994" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
