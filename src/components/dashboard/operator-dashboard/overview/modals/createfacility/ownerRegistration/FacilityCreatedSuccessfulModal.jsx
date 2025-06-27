import React from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { pageTitle, buttonPrimary } from "../../styles";

export default function FacilityCreatedSuccessfulModal({ isOpen, onClose, facilityData }) {
  if (!isOpen) return null;

  const handleCloseAndReload = () => {
    onClose(); // Close the modal
    window.location.reload(); // Reload the page
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
        <button
          onClick={handleCloseAndReload}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FiX size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className={pageTitle}>Facility Created Successfully!</h2>

          <div className="mt-4 text-gray-600 space-y-2">
            <p className="font-medium">
              Facility Name: <span className="text-[#039994]">{facilityData?.facilityName}</span>
            </p>
            <p>
              Nickname: <span className="font-medium">{facilityData?.nickname}</span>
            </p>
            <p>
              Role: <span className="font-medium capitalize">{facilityData?.commercialRole}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Created on: {new Date(facilityData?.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleCloseAndReload}
            className={`mt-6 w-full ${buttonPrimary}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
