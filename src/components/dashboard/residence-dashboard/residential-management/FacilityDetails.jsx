import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiX,
  FiEye,
  FiEdit,
  FiFileText,
  FiTrash2,
  FiDownload
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  uploadButtonStyle,
  uploadInputLabel,
  uploadIconContainer
} from "./styles";
import EditFacilityDetailsModal from "./EditFacilityDetailsModal";
import UploadFacilityDocumentModal from "./UploadFacilityDocumentModal";

export default function FacilityDetails({ 
  facility, 
  onBack, 
  onFacilityUpdated,
  onDelete 
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
    if (facility) {
      const docs = [];
      if (facility.financeAgreementUrl) {
        docs.push({
          name: "Finance Agreement",
          url: facility.financeAgreementUrl,
          status: facility.financeAgreementStatus || "PENDING",
          type: "financeAgreement"
        });
      }
      if (facility.proofOfAddressUrl) {
        docs.push({
          name: "Proof of Address",
          url: facility.proofOfAddressUrl,
          status: facility.proofOfAddressStatus || "PENDING",
          type: "proofOfAddress"
        });
      }
      setDocuments(docs);
    }
  }, [facility]);

  const handleDocumentUploadSuccess = (updatedFacility) => {
    toast.success("Document uploaded successfully");
    if (onFacilityUpdated) {
      onFacilityUpdated(updatedFacility);
    }
    setShowUploadModal(false);
  };

  const handleDeleteDocument = async (docType) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const endpoint = docType === "financeAgreement" 
        ? `https://services.dcarbon.solutions/facility/update-facility-financial-agreement/${facility.id}`
        : `https://services.dcarbon.solutions/api/facility/update-facility-proof-of-address/${facility.id}`;

      const fieldName = docType === "financeAgreement" 
        ? "financeAgreementUrl" 
        : "proofOfAddressUrl";

      const { data } = await axios.put(
        endpoint,
        { [fieldName]: null },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      toast.success("Document removed successfully");
      if (onFacilityUpdated) {
        onFacilityUpdated(data.data);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(error.response?.data?.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center text-[#039994] hover:underline mb-4"
      >
        <FiArrowLeft className="mr-1" />
        Back to Facilities
      </button>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold" style={{ color: "#039994" }}>
          Residential Facility Details
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-[#1E1E1E] text-white px-4 py-2 rounded-full text-sm hover:bg-black transition-colors"
          >
            <FiEdit size={16} />
            <span>Edit</span>
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this facility?")) {
                  onDelete();
                }
              }}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600 transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="border border-[#039994] rounded-md p-4"
          style={{ backgroundColor: "#069B960D" }}
        >
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="font-semibold text-gray-800">Facility Name:</span>
            <span className="text-gray-700">{facility.facilityName}</span>

            <span className="font-semibold text-gray-800">Commercial Role:</span>
            <span className="text-gray-700 capitalize">{facility.commercialRole}</span>

            <span className="font-semibold text-gray-800">Entity Type:</span>
            <span className="text-gray-700 capitalize">{facility.entityType}</span>

            <span className="font-semibold text-gray-800">Facility ID:</span>
            <span className="text-gray-700">{facility.id}</span>

            <span className="font-semibold text-gray-800">Utility Provider:</span>
            <span className="text-gray-700">{facility.utilityProvider}</span>

            <span className="font-semibold text-gray-800">Meter ID:</span>
            <span className="text-gray-700">{facility.meterId}</span>

            <span className="font-semibold text-gray-800">Address:</span>
            <span className="text-gray-700">{facility.address}</span>

            <span className="font-semibold text-gray-800">Status:</span>
            <span className="text-gray-700 capitalize">{facility.status?.toLowerCase()}</span>

            <span className="font-semibold text-gray-800">Date Created:</span>
            <span className="text-gray-700">{formatDate(facility.createdAt)}</span>
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 text-base mb-4">
            Residential Facility Documents
          </h4>
          
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                setDocType("financeAgreement");
                setShowUploadModal(true);
              }}
              className={`${uploadButtonStyle} text-sm px-3 py-2`}
            >
              + Finance Agreement
            </button>
            <button
              onClick={() => {
                setDocType("proofOfAddress");
                setShowUploadModal(true);
              }}
              className={`${uploadButtonStyle} text-sm px-3 py-2`}
            >
              + Proof of Address
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.url} className="flex items-center justify-between mb-3 bg-gray-50 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <FiFileText className="text-gray-400" />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiEye size={16} />
                  </a>
                  <a 
                    href={doc.url} 
                    download
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiDownload size={16} />
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span 
                    className={`text-sm font-medium ${
                      doc.status === "APPROVED" ? "text-[#00B929]" :
                      doc.status === "PENDING" ? "text-[#FBA100]" :
                      "text-[#F04438]"
                    }`}
                  >
                    {doc.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteDocument(doc.type)}
                    className="text-[#F04438] hover:text-red-700"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#039994] font-semibold text-lg">
              Energy Production
            </h4>
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
          <div className="flex items-center justify-center bg-gray-50 h-48 rounded-md overflow-hidden">
            <img
              src="/dashboard_images/graph.png"
              alt="Test-tube Bar Chart"
              className="object-contain h-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="border border-[#039994] rounded-md p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-1">RECs Generated</p>
            <p className="text-2xl font-bold text-[#039994]">{facility.recGenerated || 0}</p>
          </div>
          <div className="border border-[#039994] rounded-md p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-1">Total RECs sold</p>
            <p className="text-2xl font-bold text-[#039994]">{facility.recSold || 0}</p>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditFacilityDetailsModal
          facility={facility}
          onClose={() => setShowEditModal(false)}
          onSave={onFacilityUpdated}
        />
      )}

      {showUploadModal && (
        <UploadFacilityDocumentModal
          facilityId={facility.id}
          docType={docType}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleDocumentUploadSuccess}
        />
      )}
    </div>
  );
}