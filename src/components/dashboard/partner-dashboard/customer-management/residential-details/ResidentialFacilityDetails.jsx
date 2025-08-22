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
  FiChevronLeft,
  FiAlertCircle
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import EditResidentialFacilityModal from "./EditFacilityDetailsModal";
import ResidentialDetailsGraph from "./ResidentialDetailsGraph";

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
  },
  singleLineDiagram: {
    name: "Single Line Diagram",
    endpoint: "single-line",
    urlField: "singleLineDiagramUrl",
    statusField: "singleLineDiagramStatus",
    rejectionField: "singleLineDiagramRejectionReason",
    mandatory: true
  }
};

const ProgressTracker = ({ currentStage, completedStages }) => {
  const stages = [
    { id: 1, name: "Dashboard Access", tooltip: "Welcome to your dashboard" },
    { id: 2, name: "Financial Info", tooltip: "Complete financial information" },
    { id: 3, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 4, name: "Utility Auth", tooltip: "Authorize utility access" },
    { id: 5, name: "Documents", tooltip: "Upload and verify documents" }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentStage} of {stages.length}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center group relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  completedStages.includes(stage.id)
                    ? "bg-[#039994] border-[#039994] text-white"
                    : stage.id === currentStage
                    ? "border-[#039994] text-[#039994]"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  completedStages.includes(stage.id) || stage.id === currentStage
                    ? "text-[#039994] font-medium"
                    : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              {completedStages.includes(stage.id) && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {stage.tooltip}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
          {stages.slice(0, stages.length - 1).map((stage) => (
            <div
              key={stage.id}
              className={`h-1 flex-1 mx-2 ${
                completedStages.includes(stage.id + 1) ? "bg-[#039994]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
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

export default function FacilityDetails({ facility, customerEmail, onBack, onFacilityUpdated, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [currentPDF, setCurrentPDF] = useState({ url: "", title: "" });
  const [financeType, setFinanceType] = useState("Cash");
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const [facilityData, setFacilityData] = useState(facility);
  const [partnerType, setPartnerType] = useState(null);

  const checkPartnerRole = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) return;

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.data?.status === 'success') {
        setPartnerType(response.data.data.user.partnerType);
      }
    } catch (error) {
      console.error('Error checking partner role:', error);
      setPartnerType(null);
    }
  };

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkStage5Completion = async (facilityId, authToken) => {
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/residential-docs/${facilityId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status !== "success") return false;

      const docData = response.data.data;
      const requiredDocs = Object.keys(DOCUMENT_TYPES).filter(key => 
        DOCUMENT_TYPES[key].mandatory && !(key === 'financeAgreement' && financeType === 'Cash')
      );

      return requiredDocs.every(key => {
        const docType = DOCUMENT_TYPES[key];
        return docData[docType.statusField] === "APPROVED";
      });
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const newCompletedStages = [1];
      let highestCompletedStage = 1;

      const stage2Completed = await checkStage2Completion(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        highestCompletedStage = 2;
      }

      const stage3Completed = await checkStage3Completion(userId, authToken);
      if (stage3Completed) {
        newCompletedStages.push(3);
        highestCompletedStage = 3;
      }

      const stage4Completed = await checkStage4Completion(userId, authToken);
      if (stage4Completed) {
        newCompletedStages.push(4);
        highestCompletedStage = 4;
      }

      const stage5Completed = await checkStage5Completion(facilityData.id, authToken);
      if (stage5Completed) {
        newCompletedStages.push(5);
        highestCompletedStage = 5;
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(highestCompletedStage < 5 ? highestCompletedStage + 1 : 5);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
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

  const fetchFacilityDetails = async () => {
    if (!facilityData?.id) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/get-one-residential-facility/${facilityData.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setFacilityData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch facility details");
      }
    } catch (error) {
      console.error("Error fetching facility details:", error);
      toast.error(error.response?.data?.message || "Failed to fetch facility details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!facilityData?.id) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/residential-docs/${facilityData.id}`,
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

  const downloadCSV = () => {
    const headers = [
      'Facility ID', 'Email', 'Address', 'Utility Provider', 'Installer', 
      'Meter ID', 'Zip Code', 'Status', 'Finance Type', 
      'Finance Company', 'Date Created', 'System Capacity', 
      'DGG ID', 'Total RECs', 'Last REC Calculation',
      'Commercial Operation Date', 'Interconnected Utility ID',
      'EIA Plant ID', 'Energy Storage Capacity', 'On-site Load',
      'Net-Metering', 'WREGIS Eligibility Date', 'WREGIS ID', 'RPS ID'
    ];

    const data = [
      facilityData.id || '',
      customerEmail || '',
      facilityData.address || '',
      facilityData.utilityProvider || '',
      facilityData.installer || '',
      facilityData.meterId || '',
      facilityData.zipCode || '',
      facilityData.status || '',
      facilityData.financeType || '',
      facilityData.financeCompany || '',
      formatDate(facilityData.createdAt) || '',
      facilityData.systemCapacity || '',
      facilityData.dggId || '',
      facilityData.totalRecs || 0,
      formatDate(facilityData.lastRecCalculation) || '',
      formatDate(facilityData.commercialOperationDate) || '',
      facilityData.interconnectedUtilityId || '',
      facilityData.eiaPlantId || '',
      facilityData.energyStorageCapacity || '',
      facilityData.hasOnSiteLoad ? 'Yes' : 'No',
      facilityData.hasNetMetering ? 'Yes' : 'No',
      formatDate(facilityData.wregisEligibilityDate) || '',
      facilityData.wregisId || '',
      facilityData.rpsId || ''
    ];

    const csvContent = [
      headers.join(','),
      data.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${facilityData.facilityName || 'residential_facility'}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchFacilityDetails();
    fetchDocuments();
    fetchFinanceType();
    checkUserProgress();
    checkPartnerRole();
  }, [facilityData?.id]);

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

  const canUploadDocument = (docType) => {
    if (!partnerType) return true;
    
    if (partnerType === "INSTALLER") {
      return docType === "solarInstallationContract" || docType === "installationSitePlan";
    }
    
    if (partnerType === "FINANCE_COMPANY") {
      return docType === "financeAgreement" || docType === "solarInstallationContract" || docType === "installationSitePlan";
    }
    
    if (partnerType === "SALES_AGENT") {
      return false;
    }
    
    return true;
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
          mandatory: docType.mandatory && !isFinanceAgreementOptional,
          canUpload: canUploadDocument(key)
        });
      }
    });
    return docList;
  };

  const documentList = getDocumentList();
  const visibleDocs = showAllDocs ? documentList : documentList.slice(0, 3);

  const handleDocumentUpload = (updatedDocs) => {
    setDocuments(updatedDocs);
    checkUserProgress();
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
    setFacilityData(updatedFacility);
    if (onFacilityUpdated) {
      onFacilityUpdated(updatedFacility);
    }
    setShowEditModal(false);
  };

  const showAssignInstallerButton = partnerType === "FINANCE_COMPANY";

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <ProgressTracker 
        currentStage={currentStage} 
        completedStages={completedStages} 
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="text-[#039994] hover:text-[#028580] mr-2">
            <FiChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold text-[#039994]">
            {facilityData.facilityName || facilityData.address || "Residential Facility"}
          </h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-[#1E1E1E] text-white px-3 py-1.5 rounded-md text-sm hover:bg-black"
          >
            <FiDownload size={14} />
            <span>Download CSV</span>
          </button>
          {showAssignInstallerButton && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 bg-[#1E1E1E] text-white px-3 py-1.5 rounded-md text-sm hover:bg-black"
            >
              <FiEdit size={14} />
              <span>Assign Installer to Facility</span>
            </button>
          )}
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
        <div className="space-y-6">
          <div className="border border-[#039994] rounded-lg p-4 bg-[#069B960D]">
            <h3 className="text-[#039994] mb-3">Solar Home Details</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                ["Facility ID", facilityData.id],
                ["Email", customerEmail || "N/A"],
                ["Utility Provider", facilityData.utilityProvider || "N/A"],
                ["Installer", facilityData.installer || "N/A"],
                ["Meter ID", facilityData.meterId || "N/A"],
                ["Address", facilityData.address || "N/A"],
                ["Zip Code", facilityData.zipCode || "N/A"],
                ["Status", facilityData.status?.toLowerCase() || "N/A"],
                ["Finance Type", facilityData.financeType || "N/A"],
                ["Finance Company", facilityData.financeCompany || "N/A"],
                ["Date Created", formatDate(facilityData.createdAt)]
              ].map(([label, value], index) => (
                <React.Fragment key={index}>
                  <span className="font-semibold text-sm">{label}:</span>
                  <span className="text-sm">{value}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[#039994] mb-3">Additional Facility Details</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                ["Commercial Operation Date", formatDate(facilityData.commercialOperationDate)],
                ["Interconnected Utility ID", facilityData.interconnectedUtilityId || "N/A"],
                ["EIA Plant ID", facilityData.eiaPlantId || "N/A"],
                ["Energy Storage Capacity", facilityData.energyStorageCapacity || "N/A"],
                ["On-site Load", facilityData.hasOnSiteLoad ? "Yes" : "No"],
                ["Net-Metering", facilityData.hasNetMetering ? "Yes" : "No"],
                ["WREGIS Eligibility Date", formatDate(facilityData.wregisEligibilityDate)],
                ["WREGIS ID", facilityData.wregisId || "N/A"],
                ["RPS ID", facilityData.rpsId || "N/A"],
                ["System Capacity", facilityData.systemCapacity || "N/A"],
                ["DGG ID", facilityData.dggId || "N/A"]
              ].map(([label, value], index) => (
                <React.Fragment key={index}>
                  <span className="font-semibold text-sm">{label}:</span>
                  <span className="text-sm">{value}</span>
                </React.Fragment>
              ))}
            </div>
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
                  className={`bg-[#F0F0F0] rounded-md p-2.5 flex items-center justify-center ${
                    doc.canUpload ? "cursor-pointer hover:bg-gray-200" : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (!doc.canUpload) return;
                    doc.url ? handleViewDocument(doc.url, doc.name) : handleUploadClick(doc.type);
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
      </div>

      <div className="mt-6">
        <ResidentialDetailsGraph facilityId={facilityData.id} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-[#039994] rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-1">Total TRECs Generated</p>
          <p className="text-[#039994] text-2xl font-bold">{facilityData.totalRecs || 0}</p>
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
        facilityId={facilityData.id}
      />

      <EditResidentialFacilityModal
        facility={facilityData}
        customerEmail={customerEmail}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        isOpen={showEditModal}
      />
    </div>
  );
}