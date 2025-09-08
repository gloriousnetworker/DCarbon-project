import React, { useState, useEffect } from "react";
import { FiFileText, FiEye, FiUpload, FiX, FiDownload, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

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
  },
  singleLineDiagram: {
    name: "Single Line Diagram",
    endpoint: "single-line",
    urlField: "singleLineDiagramUrl",
    statusField: "singleLineDiagramStatus",
    rejectionField: "singleLineDiagramRejectionReason",
    mandatory: true
  },
  assignmentOfRegistrationRight: {
    name: "Assignment of Registration Right",
    endpoint: "assignment-of-registration-right",
    urlField: "assignmentOfRegistrationRightUrl",
    statusField: "assignmentOfRegistrationRightStatus",
    rejectionField: "assignmentOfRegistrationRightRejectionReason",
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
            <span className="block text-sm font-medium text-gray-700 mb-1">Select File</span>
            <div className="flex items-center">
              <label className="bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors cursor-pointer">
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
            className="bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResidentialDocumentsModal = ({ 
  facilityData, 
  documents, 
  financeType, 
  onUploadClick, 
  onViewDocument, 
  showAllDocs, 
  setShowAllDocs 
}) => {
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

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-[#039994] mb-2">Documentation</h3>
      <hr className="border-black mb-4" />
      
      {documents?.acknowledgementOfStationServiceStatus === "APPROVED" && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm text-green-800">Acknowledgement of Station Service</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-green-600 text-white`}>
              {documents.acknowledgementOfStationServiceStatus || "PROVIDED"}
            </span>
          </div>
          {documents.acknowledgementOfStationServiceUrl ? (
            <div 
              className="bg-green-100 rounded-md p-2.5 flex items-center justify-center cursor-pointer hover:bg-green-200"
              onClick={() => onViewDocument(documents.acknowledgementOfStationServiceUrl, "Acknowledgement of Station Service")}
            >
              <div className="flex items-center space-x-2">
                <FiEye className="text-green-700" size={16} />
                <span className="text-sm text-green-700">View Acknowledgement</span>
              </div>
            </div>
          ) : (
            <div className="bg-green-100 rounded-md p-2.5 flex items-center justify-center">
              <span className="text-sm text-green-700">Acknowledgement Approved</span>
            </div>
          )}
        </div>
      )}

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
              className={`rounded-md p-2.5 flex items-center justify-center cursor-pointer ${
                doc.status === "APPROVED" || doc.status === "SUBMITTED" 
                  ? "bg-gray-200 cursor-not-allowed" 
                  : "bg-[#F0F0F0] hover:bg-gray-200"
              }`}
              onClick={() => {
                if (doc.status === "APPROVED" || doc.status === "SUBMITTED") return;
                doc.url ? onViewDocument(doc.url, doc.name) : onUploadClick(doc.type);
              }}
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
  );
};

export default ResidentialDocumentsModal;
export { PDFViewerModal, DocumentUploadModal };