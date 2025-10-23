import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiChevronLeft,
  FiAlertCircle
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import EditResidentialFacilityModal from "./EditFacilityDetailsModal";
import ResidentialDetailsGraph from "./ResidentialDetailsGraph";
import ResidentialDocumentsModal, { PDFViewerModal, DocumentUploadModal } from "./ResidentialDocumentsModal";

const spinnerOverlay = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const spinner = "animate-spin rounded-full h-8 w-8 border-b-2 border-white";

const DOCUMENT_TYPES = {
  sitePhoto: { label: "Site Photo", mandatory: true, statusField: "sitePhotoStatus" },
  interconnectionAgreement: { label: "Interconnection Agreement", mandatory: true, statusField: "interconnectionAgreementStatus" },
  utilityBill: { label: "Utility Bill", mandatory: true, statusField: "utilityBillStatus" },
  financeAgreement: { label: "Finance Agreement", mandatory: false, statusField: "financeAgreementStatus" },
  permit: { label: "Permit", mandatory: true, statusField: "permitStatus" },
  installationPhoto: { label: "Installation Photo", mandatory: true, statusField: "installationPhotoStatus" }
};

const ProgressTracker = ({ currentStage, completedStages }) => {
  const stages = [
    { id: 1, name: "Dashboard Access", tooltip: "Welcome to your dashboard" },
    { id: 2, name: "Financial Info", tooltip: "Complete financial information" },
    { id: 3, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 4, name: "Utility Auth", tooltip: "Authorize utility access" },
    { id: 5, name: "Documents", tooltip: "Upload and verify documents" },
    { id: 6, name: "Facility Details", tooltip: "Complete facility information" }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Facility Onboarding</h2>
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

export default function ResidentialFacilityDetails({ facility, onBack, onFacilityUpdated, onDelete }) {
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

  const checkStage5Completion = (facility) => {
    return facility.status === 'verified' || facility.status === 'VERIFIED';
  };

  const checkStage6Completion = (facility) => {
    const requiredFields = [
      { field: facility.commercialOperationDate, name: 'Commercial Operation Date' },
      { field: facility.interconnectedUtilityId, name: 'Interconnected Utility ID' },
      { field: facility.eiaPlantId, name: 'EIA Plant ID' },
      { field: facility.energyStorageCapacity, name: 'Energy Storage Capacity' },
      { field: facility.hasOnSiteLoad, name: 'On-site Load' },
      { field: facility.hasNetMetering, name: 'Net-Metering' },
      { field: facility.wregisEligibilityDate, name: 'WREGIS Eligibility Date' },
      { field: facility.rpsId, name: 'RPS ID' }
    ];

    return requiredFields.every(item => {
      const value = item.field;
      if (value === null || value === undefined || value === '' || value === 'N/A') {
        return false;
      }
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return true;
      return true;
    });
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

      const stage5Completed = checkStage5Completion(facilityData);
      if (stage5Completed) {
        newCompletedStages.push(5);
        highestCompletedStage = 5;
      }

      const stage6Completed = checkStage6Completion(facilityData);
      if (stage6Completed) {
        newCompletedStages.push(6);
        highestCompletedStage = 6;
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(highestCompletedStage < 6 ? highestCompletedStage + 1 : 6);
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
      'Facility ID', 'Address', 'Utility Provider', 'Installer', 
      'Meter ID', 'Zip Code', 'Status', 'Finance Type', 
      'Finance Company', 'Date Created', 'System Capacity', 
      'DGG ID', 'Total RECs', 'Last REC Calculation',
      'Commercial Operation Date', 'Interconnected Utility ID',
      'EIA Plant ID', 'Energy Storage Capacity', 'On-site Load',
      'Net-Metering', 'WREGIS Eligibility Date', 'WREGIS ID', 'RPS ID'
    ];

    const data = [
      facilityData.id || '',
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
  }, [facilityData?.id]);

  useEffect(() => {
    checkUserProgress();
  }, [facilityData]);

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
    checkUserProgress();
  };

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
        <div className="space-y-6">
          <div className="border border-[#039994] rounded-lg p-4 bg-[#069B960D]">
            <h3 className="text-[#039994] mb-3">Solar Home Details</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                ["Facility ID", facilityData.id],
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

        <ResidentialDocumentsModal
          facilityData={facilityData}
          documents={documents}
          financeType={financeType}
          onUploadClick={handleUploadClick}
          onViewDocument={handleViewDocument}
          showAllDocs={showAllDocs}
          setShowAllDocs={setShowAllDocs}
        />
      </div>

      <div className="mt-6">
        <ResidentialDetailsGraph facilityId={facilityData.id} meterId={facilityData.meterId} />
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
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        isOpen={showEditModal}
      />
    </div>
  );
}