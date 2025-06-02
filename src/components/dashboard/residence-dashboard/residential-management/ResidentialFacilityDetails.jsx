import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiEye,
  FiEdit,
  FiFileText,
  FiTrash2,
  FiDownload,
  FiUpload
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import {
  labelClass,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  uploadButtonStyle,
  inputClass,
  selectClass,
  backArrow
} from "./styles";
import EditFacilityDetailsModal from "./EditFacilityDetailsModal";

// Document type mappings
const DOCUMENT_TYPES = {
  recAgreement: { name: "REC Agreement", endpoint: "rec-agreement" },
  infoReleaseAuth: { name: "Info Release Auth", endpoint: "info-release" },
  solarInstallationContract: { name: "Solar Installation Contract", endpoint: "installation-contract" },
  interconnectionAgreement: { name: "Interconnection Agreement", endpoint: "interconnection" },
  singleLineDiagram: { name: "Single Line Diagram", endpoint: "single-line" },
  systemSpecs: { name: "System Specs", endpoint: "system-specs" },
  ptoLetter: { name: "PTO Letter", endpoint: "pto-letter" },
  utilityMeterPhoto: { name: "Utility Meter Photo", endpoint: "meter-photo" },
  utilityAccessAuth: { name: "Utility Access Auth", endpoint: "utility-auth" },
  utilityAccountInfo: { name: "Utility Account Info", endpoint: "utility-auth" },
  ownershipDeclaration: { name: "Ownership Declaration", endpoint: "ownership-decl" },
  alternateLocation: { name: "Alternate Location", endpoint: "alternate-location" }
};

const DocumentUploadModal = ({ isOpen, onClose, onUpload, docType, facilityId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = DOCUMENT_TYPES[docType]?.endpoint;
      if (!endpoint) {
        toast.error("Invalid document type");
        return;
      }

      const response = await axios.put(
        `https://services.dcarbon.solutions/api/residential-facility/residential-docs/${endpoint}/${facilityId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Document uploaded successfully");
      onUpload(response.data.data);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="font-sfpro text-[18px] font-[600] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-4">
          Upload {DOCUMENT_TYPES[docType]?.name}
        </h3>
        
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className={inputClass}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-sfpro text-[14px] font-[400] text-gray-600 hover:text-gray-800"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={uploadButtonStyle}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FacilityDetails({ 
  facility, 
  onBack, 
  onFacilityUpdated,
  onDelete 
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!facility?.id) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/residential-docs/${facility.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setDocuments(response.data.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [facility?.id]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-[#00B929] text-white";
      case "SUBMITTED":
        return "bg-[#FBA100] text-white";
      case "REQUIRED":
        return "bg-[#F04438] text-white";
      case "PENDING":
        return "bg-[#FBA100] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Prepare document list for display - Updated to show all documents by default
  const getDocumentList = () => {
    const docList = [];
    
    // Show all document types, regardless of whether they have been uploaded or not
    Object.keys(DOCUMENT_TYPES).forEach(key => {
      const urlKey = `${key}Url`;
      const statusKey = `${key}Status`;
      
      docList.push({
        type: key,
        name: DOCUMENT_TYPES[key].name,
        url: documents?.[urlKey] || null,
        status: documents?.[statusKey] || "REQUIRED"
      });
    });

    return docList;
  };

  const documentList = getDocumentList();
  const visibleDocs = showAllDocs ? documentList : documentList.slice(0, 3);

  const handleDocumentUpload = () => {
    fetchDocuments(); // Refresh documents after upload
  };

  const handleUploadClick = (docType) => {
    setUploadDocType(docType);
    setShowUploadModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-[#039994] hover:underline mr-4"
          >
            <FiArrowLeft className="mr-1" size={18} />
            <span className="font-sfpro text-[14px] font-[400]">Back</span>
          </button>
          <h2 className="font-sfpro text-[20px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994]">
            {facility.address || "Residential Facility"}
          </h2>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-[#1E1E1E] text-white px-3 py-1.5 rounded-md text-sm hover:bg-black transition-colors font-sfpro"
          >
            <FiEdit size={14} />
            <span>Edit</span>
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this facility?")) {
                  onDelete();
                }
              }}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition-colors font-sfpro"
            >
              <FiTrash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Facility Details */}
        <div className="border border-[#039994] rounded-lg p-4" style={{ backgroundColor: "#069B960D" }}>
          <h3 className="font-sfpro text-[16px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994] mb-3">
            Facility Information
          </h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {[
              ["Facility ID", facility.id],
              ["Utility Provider", facility.utilityProvider || "N/A"],
              ["Installer", facility.installer || "N/A"],
              ["Meter ID", facility.meterId || "N/A"],
              ["Address", facility.address || "N/A"],
              ["Zip Code", facility.zipCode || "N/A"],
              ["Status", (facility.status?.toLowerCase() || "N/A")],
              ["Finance Type", facility.financeType || "N/A"],
              ["Finance Company", facility.financeCompany || "N/A"],
              ["Date Created", formatDate(facility.createdAt)]
            ].map(([label, value], index) => (
              <React.Fragment key={index}>
                <span className="font-sfpro text-[12px] font-[600] text-gray-800">{label}:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700 capitalize">{value}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Documentation Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-sfpro text-[16px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994] mb-2">
            Documentation
          </h3>
          <hr className="border-black mb-4" />
          
          <div className="space-y-3">
            {visibleDocs.map((doc) => (
              <div key={doc.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[13px] font-[500] text-black">{doc.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sfpro font-[600] ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                
                <div 
                  className="bg-[#F0F0F0] rounded-md p-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => doc.url ? window.open(doc.url, '_blank') : handleUploadClick(doc.type)}
                >
                  {doc.url ? (
                    <div className="flex items-center space-x-2">
                      <FiEye className="text-gray-600" size={16} />
                      <span className="font-sfpro text-[12px] font-[400] text-gray-600">View Document</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiUpload className="text-gray-600" size={16} />
                      <span className="font-sfpro text-[12px] font-[400] text-gray-600">Upload Document</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {documentList.length > 3 && (
              <button
                onClick={() => setShowAllDocs(!showAllDocs)}
                className="w-full mt-3 px-3 py-2 bg-[#039994] text-white rounded hover:bg-[#028580] transition-colors font-sfpro text-[12px] font-[500]"
              >
                {showAllDocs ? "View Less" : "View More"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Energy Production & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Energy Production Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-sfpro text-[16px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994]">
              Energy Production
            </h4>
            <div className="flex items-center space-x-2">
              <select className={`${selectClass} text-[12px] py-1 px-2`}>
                <option>Yearly</option>
                <option>Monthly</option>
              </select>
              <select className={`${selectClass} text-[12px] py-1 px-2`}>
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center bg-gray-50 h-40 rounded-md overflow-hidden">
            <img
              src="/dashboard_images/graph.png"
              alt="Energy Production Chart"
              className="object-contain h-full"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col space-y-4">
          <div className="border border-[#039994] rounded-lg p-4 flex flex-col items-center">
            <p className="font-sfpro text-[12px] font-[400] text-gray-500 mb-1">Total RECs Generated</p>
            <p className="font-sfpro text-[24px] font-[700] text-[#039994]">{facility.totalRecs || 0}</p>
            <p className="font-sfpro text-[10px] font-[300] text-gray-500 mt-1">
              Last calculated: {formatDate(facility.lastRecCalculation)}
            </p>
          </div>
          
          <div className="border border-[#039994] rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-sfpro text-[12px] font-[500] text-gray-800">System Capacity:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700">{facility.systemCapacity || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sfpro text-[12px] font-[500] text-gray-800">DGG ID:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700">{facility.dggId || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFacilityDetailsModal
          facility={facility}
          onClose={() => setShowEditModal(false)}
          onSave={onFacilityUpdated}
        />
      )}

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleDocumentUpload}
        docType={uploadDocType}
        facilityId={facility.id}
      />
    </div>
  );
}