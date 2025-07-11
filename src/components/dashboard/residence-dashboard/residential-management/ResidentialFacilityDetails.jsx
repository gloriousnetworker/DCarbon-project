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
  FiAlertTriangle
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const buttonPrimary = "bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors";
const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const spinner = "animate-spin rounded-full h-8 w-8 border-b-2 border-white";
const uploadButtonStyle = "bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";
const selectClass = "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent";
const backArrow = "flex items-center text-[#039994] hover:underline";

const DOCUMENT_TYPES = {
  recAgreement: { 
    name: "REC Agreement", 
    endpoint: "rec-agreement",
    urlField: "recAgreementUrl",
    statusField: "recAgreementStatus",
    rejectionField: "recAgreementRejectionReason"
  },
  infoReleaseAuth: { 
    name: "Info Release Auth", 
    endpoint: "info-release",
    urlField: "infoReleaseAuthUrl",
    statusField: "infoReleaseAuthStatus",
    rejectionField: "infoReleaseAuthRejectionReason"
  },
  solarInstallationContract: { 
    name: "Solar Installation Contract", 
    endpoint: "installation-contract",
    urlField: "solarInstallationContractUrl",
    statusField: "solarInstallationStatus",
    rejectionField: "solarInstallationRejectionReason"
  },
  interconnectionAgreement: { 
    name: "Interconnection Agreement", 
    endpoint: "interconnection",
    urlField: "interconnectionAgreementUrl",
    statusField: "interconnectionStatus",
    rejectionField: "interconnectionRejectionReason"
  },
  singleLineDiagram: { 
    name: "Single Line Diagram", 
    endpoint: "single-line",
    urlField: "singleLineDiagramUrl",
    statusField: "singleLineDiagramStatus",
    rejectionField: "singleLineDiagramRejectionReason"
  },
  systemSpecs: { 
    name: "System Specs", 
    endpoint: "system-specs",
    urlField: "systemSpecsUrl",
    statusField: "systemSpecsStatus",
    rejectionField: "systemSpecsRejectionReason"
  },
  ptoLetter: { 
    name: "PTO Letter", 
    endpoint: "pto-letter",
    urlField: "ptoLetterUrl",
    statusField: "ptoLetterStatus",
    rejectionField: "ptoLetterRejectionReason"
  },
  utilityMeterPhoto: { 
    name: "Utility Meter Photo", 
    endpoint: "meter-photo",
    urlField: "utilityMeterPhotoUrl",
    statusField: "utilityMeterPhotoStatus",
    rejectionField: "utilityMeterPhotoRejectionReason"
  },
  utilityAccessAuth: { 
    name: "Utility Access Auth", 
    endpoint: "utility-auth",
    urlField: "utilityAccessAuthUrl",
    statusField: "utilityAccessAuthStatus",
    rejectionField: "utilityAccessAuthRejectionReason"
  },
  utilityAccountInfo: { 
    name: "Utility Account Info", 
    endpoint: "utility-account-info",
    urlField: "utilityAccountInfoUrl",
    statusField: "utilityAccountInfoStatus",
    rejectionField: "utilityAccountInfoRejectionReason"
  },
  ownershipDeclaration: { 
    name: "Ownership Declaration", 
    endpoint: "ownership-decl",
    urlField: "ownershipDeclarationUrl",
    statusField: "ownershipDeclarationStatus",
    rejectionField: "ownershipDeclarationRejectionReason"
  },
  alternateLocation: { 
    name: "Alternate Location", 
    endpoint: "alternate-location",
    urlField: "alternateLocationUrl",
    statusField: "alternateLocationStatus",
    rejectionField: "alternateLocationRejectionReason"
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
          <h3 className="font-sfpro text-[18px] font-[600] text-[#1E1E1E]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
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
            className="flex items-center gap-2 bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors"
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
        <h3 className="font-sfpro text-[18px] font-[600] leading-[100%] tracking-[-0.05em] text-[#1E1E1E] mb-4">
          Upload {DOCUMENT_TYPES[docType]?.name}
        </h3>
        
        <div className="mb-4">
          <label className="block mb-2">
            <span className={labelClass}>Select File</span>
            <div className="flex items-center">
              <label className={uploadButtonStyle + " cursor-pointer"}>
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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [currentPDF, setCurrentPDF] = useState({ url: "", title: "" });

  const mockFacility = facility || {
    id: "b8d97949-160a-40f4-9c57-0325e006b27b",
    address: "123 Solar Street, Green City",
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

  useEffect(() => {
    fetchDocuments();
  }, [mockFacility?.id]);

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
      case "REJECTED":
        return "bg-[#F04438] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getDocumentList = () => {
    const docList = [];
    
    Object.keys(DOCUMENT_TYPES).forEach(key => {
      const docType = DOCUMENT_TYPES[key];
      
      docList.push({
        type: key,
        name: docType.name,
        url: documents?.[docType.urlField] || null,
        status: documents?.[docType.statusField] || "REQUIRED",
        rejectionReason: documents?.[docType.rejectionField] || null
      });
    });

    return docList;
  };

  const documentList = getDocumentList();
  const visibleDocs = showAllDocs ? documentList : documentList.slice(0, 3);

  const handleDocumentUpload = () => {
    fetchDocuments();
  };

  const handleUploadClick = (docType) => {
    setUploadDocType(docType);
    setShowUploadModal(true);
  };

  const handleViewDocument = (url, title) => {
    setCurrentPDF({ url, title });
    setShowPDFModal(true);
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
          <button
            onClick={onBack}
            className="flex items-center text-[#039994] hover:underline mr-4"
          >
            <FiArrowLeft className="mr-1" size={18} />
            <span className="font-sfpro text-[14px] font-[400]">Back</span>
          </button>
          <h2 className="font-sfpro text-[20px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994]">
            {mockFacility.facilityName || mockFacility.address || "Residential Facility"}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#039994] rounded-lg p-4" style={{ backgroundColor: "#069B960D" }}>
          <h3 className="font-sfpro text-[16px] font-[600] leading-[100%] tracking-[-0.05em] text-[#039994] mb-3">
            Facility Information
          </h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {[
              ["Facility ID", mockFacility.id],
              ["Utility Provider", mockFacility.utilityProvider || "N/A"],
              ["Installer", mockFacility.installer || "N/A"],
              ["Meter ID", mockFacility.meterId || "N/A"],
              ["Address", mockFacility.address || "N/A"],
              ["Zip Code", mockFacility.zipCode || "N/A"],
              ["Status", (mockFacility.status?.toLowerCase() || "N/A")],
              ["Finance Type", mockFacility.financeType || "N/A"],
              ["Finance Company", mockFacility.financeCompany || "N/A"],
              ["Date Created", formatDate(mockFacility.createdAt)]
            ].map(([label, value], index) => (
              <React.Fragment key={index}>
                <span className="font-sfpro text-[12px] font-[600] text-gray-800">{label}:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700 capitalize">{value}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

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
                
                {doc.status === "REJECTED" && doc.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="font-sfpro text-[11px] font-[600] text-red-700 mb-1">Rejection Reason:</p>
                      <p className="font-sfpro text-[11px] font-[400] text-red-600">{doc.rejectionReason}</p>
                    </div>
                  </div>
                )}
                
                <div 
                  className="bg-[#F0F0F0] rounded-md p-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => doc.url ? handleViewDocument(doc.url, doc.name) : handleUploadClick(doc.type)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
            <div className="text-gray-500 text-center">
              <FiFileText size={48} className="mx-auto mb-2 opacity-50" />
              <p className="font-sfpro text-[14px]">Energy Production Chart</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="border border-[#039994] rounded-lg p-4 flex flex-col items-center">
            <p className="font-sfpro text-[12px] font-[400] text-gray-500 mb-1">Total RECs Generated</p>
            <p className="font-sfpro text-[24px] font-[700] text-[#039994]">{mockFacility.totalRecs || 0}</p>
            <p className="font-sfpro text-[10px] font-[300] text-gray-500 mt-1">
              Last calculated: {formatDate(mockFacility.lastRecCalculation)}
            </p>
          </div>
          
          <div className="border border-[#039994] rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-sfpro text-[12px] font-[500] text-gray-800">System Capacity:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700">{mockFacility.systemCapacity || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sfpro text-[12px] font-[500] text-gray-800">DGG ID:</span>
                <span className="font-sfpro text-[12px] font-[400] text-gray-700">{mockFacility.dggId || "N/A"}</span>
              </div>
            </div>
          </div>
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
    </div>
  );
}