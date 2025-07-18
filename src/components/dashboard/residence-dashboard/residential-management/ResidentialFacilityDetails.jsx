import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiEye,
  FiEdit,
  FiFileText,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiX,
  FiAlertTriangle,
  FiChevronLeft
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import EditResidentialFacilityModal from "./EditFacilityDetailsModal";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const buttonPrimary = "bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors";
const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const spinner = "animate-spin rounded-full h-8 w-8 border-b-2 border-white";
const uploadButtonStyle = "bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";
const selectClass = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";

const DOCUMENT_TYPES = {
  wregisAssignment: { 
    name: "WREGIS Assignment of Registration Rights", 
    endpoint: "wregis-assignment",
    urlField: "wregisAssignmentUrl",
    statusField: "wregisAssignmentStatus",
    rejectionField: "wregisAssignmentRejectionReason",
    mandatory: true
  },
  financeAgreement: { 
    name: "Finance Agreement/PPA", 
    endpoint: "finance-agreement",
    urlField: "financeAgreementUrl",
    statusField: "financeAgreementStatus",
    rejectionField: "financeAgreementRejectionReason",
    mandatory: false
  },
  solarInstallationContract: { 
    name: "Solar Installation Contract", 
    endpoint: "installation-contract",
    urlField: "solarInstallationContractUrl",
    statusField: "solarInstallationStatus",
    rejectionField: "solarInstallationRejectionReason",
    mandatory: true
  },
  nemAgreement: { 
    name: "NEM Agreement", 
    endpoint: "nem-agreement",
    urlField: "nemAgreementUrl",
    statusField: "nemAgreementStatus",
    rejectionField: "nemAgreementRejectionReason",
    mandatory: true
  },
  utilityPtoLetter: { 
    name: "Utility PTO Email/Letter", 
    endpoint: "pto-letter",
    urlField: "ptoLetterUrl",
    statusField: "ptoLetterStatus",
    rejectionField: "ptoLetterRejectionReason",
    mandatory: true
  },
  installationSitePlan: { 
    name: "Installation Site Plan", 
    endpoint: "site-plan",
    urlField: "sitePlanUrl",
    statusField: "sitePlanStatus",
    rejectionField: "sitePlanRejectionReason",
    mandatory: true
  },
  panelInverterDataSheet: { 
    name: "Panel/Inverter Data Sheet", 
    endpoint: "panel-inverter-datasheet",
    urlField: "panelInverterDatasheetUrl",
    statusField: "panelInverterDatasheetStatus",
    rejectionField: "panelInverterDatasheetRejectionReason",
    mandatory: false
  },
  revenueMeterDataSheet: { 
    name: "Revenue Meter Data Sheet", 
    endpoint: "revenue-meter-data",
    urlField: "revenueMeterDataUrl",
    statusField: "revenueMeterDataStatus",
    rejectionField: "revenueMeterDataRejectionReason",
    mandatory: false
  },
  utilityMeterPhoto: { 
    name: "Utility/Revenue Meter Photo w/Serial ID", 
    endpoint: "meter-photo",
    urlField: "utilityMeterPhotoUrl",
    statusField: "utilityMeterPhotoStatus",
    rejectionField: "utilityMeterPhotoRejectionReason",
    mandatory: true
  }
};

const PDFViewerModal = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  const renderFileContent = () => {
    if (!url) return <div>No document available</div>;
    
    const extension = url.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={url} 
            alt={title} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (extension === 'pdf') {
      return (
        <div className="w-full h-full">
          <iframe
            src={`${url}#view=fitH`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Preview not available for this file type</p>
            <a 
              href={url} 
              download 
              className="text-[#039994] hover:underline mt-2 inline-block"
            >
              Download file
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {renderFileContent()}
        </div>
        <div className="p-4 border-t flex justify-end">
          <a
            href={url}
            download
            className="flex items-center gap-2 bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580]"
          >
            <FiDownload size={16} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadModal = ({ isOpen, onClose, onUpload, docType, facilityId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
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
      setFile(null);
      setFileName('');
      setFileInputKey(Date.now());
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileName('');
      setFileInputKey(Date.now());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Upload {DOCUMENT_TYPES[docType]?.name}</h3>
        <div className="mb-4">
          <label className="block mb-2">
            <span className={labelClass}>Select File</span>
            <div className="flex items-center">
              <label className={`${uploadButtonStyle} cursor-pointer`}>
                <input
                  key={fileInputKey}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                Choose File
              </label>
              {fileName && (
                <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                  {fileName}
                </span>
              )}
            </div>
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setFile(null);
              setFileName('');
              setFileInputKey(Date.now());
              onClose();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
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

export default function FacilityDetails({ facility, onBack, onFacilityUpdated, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [currentPDF, setCurrentPDF] = useState({ url: "", title: "" });
  const [financeType, setFinanceType] = useState("Cash");

  const mockFacility = facility || {
    id: "b151ec59-42f7-444d-a017-5fbae1a1b126",
    address: "123 Solar Street",
    utilityProvider: "Green Energy Co",
    installer: "Solar Pros Inc",
    meterId: "MTR-12345",
    zipCode: "12345",
    status: "active",
    financeType: "Cash",
    financeCompany: "N/A",
    createdAt: "2025-01-15T10:00:00.000Z",
    totalRecs: 1250,
    lastRecCalculation: "2025-06-01T10:00:00.000Z",
    systemCapacity: "10.5 kW",
    dggId: "DGG-789"
  };

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

  const fetchDocuments = async () => {
    if (!mockFacility?.id) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/residential-docs/${mockFacility.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setDocuments(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(error.response?.data?.message || "Failed to fetch documents");
      setDocuments({});
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceType = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    
    if (!userId || !authToken) return;

    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success" && response.data.data.financialInfo) {
        setFinanceType(response.data.data.financialInfo.financialType);
      }
    } catch (error) {
      console.error("Error fetching finance type:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchFinanceType();
  }, [mockFacility?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-[#00B929] text-white";
      case "SUBMITTED": return "bg-[#FBA100] text-white";
      case "REQUIRED": return "bg-[#F04438] text-white";
      case "PENDING": return "bg-[#FBA100] text-white";
      case "REJECTED": return "bg-[#F04438] text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDocumentList = () => {
    const docList = [];
    Object.keys(DOCUMENT_TYPES).forEach(key => {
      const docType = DOCUMENT_TYPES[key];
      const isFinanceAgreementOptional = key === 'financeAgreement' && financeType === 'Cash';
      
      if (!isFinanceAgreementOptional || !docType.mandatory) {
        docList.push({
          type: key,
          name: docType.name,
          url: documents?.[docType.urlField] || null,
          status: documents?.[docType.statusField] || "REQUIRED",
          rejectionReason: documents?.[docType.rejectionField] || null,
          mandatory: docType.mandatory && !isFinanceAgreementOptional
        });
      }
    });
    return docList;
  };

  const documentList = getDocumentList();
  const visibleDocs = showAllDocs ? documentList : documentList.slice(0, 3);

  const handleDocumentUpload = (updatedDocs) => {
    setDocuments(updatedDocs);
  };

  const handleUploadClick = (docType) => {
    setUploadDocType(docType);
    setShowUploadModal(true);
  };

  const handleViewDocument = (url, title) => {
    setCurrentPDF({ url, title });
    setShowPDFModal(true);
  };

  const handleSave = (updatedFacility) => {
    if (onFacilityUpdated) {
      onFacilityUpdated(updatedFacility);
    }
    setShowEditModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="text-[#039994] hover:text-[#028580] mr-2">
            <FiChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold text-[#039994]">
            {mockFacility.facilityName || mockFacility.address || "Residential Facility"}
          </h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-[#1E1E1E] text-white px-3 py-1.5 rounded-md text-sm hover:bg-black"
          >
            <FiEdit size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this facility?")) {
                onDelete();
              }
            }}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600"
          >
            <FiTrash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#039994] rounded-lg p-4 bg-[#069B960D] h-fit">
          <h3 className="text-[#039994] mb-3">Solar Home Details</h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {[
              ["Facility ID", mockFacility.id],
              ["Utility Provider", mockFacility.utilityProvider || "N/A"],
              ["Installer", mockFacility.installer || "N/A"],
              ["Meter ID", mockFacility.meterId || "N/A"],
              ["Address", mockFacility.address || "N/A"],
              ["Zip Code", mockFacility.zipCode || "N/A"],
              ["Status", mockFacility.status?.toLowerCase() || "N/A"],
              ["Finance Type", mockFacility.financeType || "N/A"],
              ["Finance Company", mockFacility.financeCompany || "N/A"],
              ["Date Created", formatDate(mockFacility.createdAt)]
            ].map(([label, value], index) => (
              <React.Fragment key={index}>
                <span className="font-semibold text-sm">{label}:</span>
                <span className="text-sm">{value}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-[#039994] mb-2">Documentation</h3>
          <hr className="border-black mb-4" />
          <div className="space-y-3">
            {visibleDocs.map((doc) => (
              <div key={doc.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{doc.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                {doc.status === "REJECTED" && doc.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="font-semibold text-xs text-red-700 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-600">{doc.rejectionReason}</p>
                    </div>
                  </div>
                )}
                <div 
                  className="bg-[#F0F0F0] rounded-md p-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                  onClick={() => doc.url ? handleViewDocument(doc.url, doc.name) : handleUploadClick(doc.type)}
                >
                  {doc.url ? (
                    <div className="flex items-center space-x-2">
                      <FiEye className="text-gray-600" size={16} />
                      <span className="text-sm text-gray-600">View Document</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiUpload className="text-gray-600" size={16} />
                      <span className="text-sm text-gray-600">Upload Document</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {documentList.length > 3 && (
              <button
                onClick={() => setShowAllDocs(!showAllDocs)}
                className="w-full mt-3 px-3 py-2 bg-[#039994] text-white rounded hover:bg-[#028580] text-sm font-medium"
              >
                {showAllDocs ? "View Less" : "View More"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="border border-[#039994] rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-1">Total TRECs Generated</p>
          <p className="text-[#039994] text-2xl font-bold">{mockFacility.totalRecs || 0}</p>
          <p className="text-gray-500 text-xs mt-1">
            Cumulative since installation
          </p>
        </div>
      </div>

      <PDFViewerModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        url={currentPDF.url}
        title={currentPDF.title}
      />

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleDocumentUpload}
        docType={uploadDocType}
        facilityId={mockFacility.id}
      />

      <EditResidentialFacilityModal
        facility={mockFacility}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        isOpen={showEditModal}
      />
    </div>
  );
}