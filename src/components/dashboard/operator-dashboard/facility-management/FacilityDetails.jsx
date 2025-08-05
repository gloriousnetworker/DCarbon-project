import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiFileText,
  FiEye,
  FiUpload,
  FiChevronDown,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload
} from "react-icons/fi";
import { toast } from 'react-hot-toast';
import CommercialDetailsGraph from "./CommercialDetailsGraph";
import { pageTitle, labelClass } from "./styles";

const ProgressTracker = ({ currentStage, nextStage, onStageClick }) => {
  const stages = [
    { id: 1, name: "App Registration", tooltip: "Account creation completed" },
    { id: 2, name: "Solar Install Details", tooltip: "Owner details and address completed" },
    { id: 3, name: "DCarbon Service Agreements", tooltip: "Terms and conditions signed" },
    { id: 4, name: "Utility Authorization", tooltip: "Financial information submitted" },
    { id: 5, name: "Utility Meter Selection", tooltip: "Utility meters connected" },
    { id: 6, name: "Solar Document Uploads", tooltip: "All required documents uploaded" }
  ];

  const currentDisplayStage = currentStage > 6 ? 6 : currentStage;

  const handleClick = (stageId) => {
    if (stageId <= currentStage || stageId === nextStage) {
      onStageClick(stageId);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentDisplayStage} of {stages.length}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="flex flex-col items-center group relative"
              onClick={() => handleClick(stage.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  stage.id < currentDisplayStage ? "bg-[#039994] text-white" : 
                  stage.id === currentDisplayStage ? "bg-[#039994] text-white" : 
                  stage.id === nextStage ? "border-2 border-[#039994] bg-white text-gray-600" : "bg-gray-200 text-gray-600"
                } ${stage.id <= currentDisplayStage ? 'hover:bg-[#028a85]' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  stage.id <= currentDisplayStage ? "text-[#039994] font-medium" : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                {stage.tooltip}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
          {stages.slice(0, stages.length - 1).map((stage) => (
            <div
              key={stage.id}
              className={`h-1 flex-1 mx-2 ${
                stage.id < currentDisplayStage ? "bg-[#039994]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ title, status, url, onUpload, onView, docType, rejectionReason }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDocumentFileName = (url) => {
    if (!url) return null;
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName).replace(/^\d+-/, '');
    } catch (error) {
      return 'Document';
    }
  };

  const fileName = getDocumentFileName(url);
  const isRejected = status?.toUpperCase() === "REJECTED";
  const displayStatus = !url ? "REQUIRED" : status || "PENDING";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-black text-sm font-medium">{title}</span>
        <div className="flex items-center space-x-2">
          {isRejected && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
              title="View rejection reason"
            >
              <FiAlertCircle className="text-red-500" size={14} />
            </button>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            displayStatus === "APPROVED" ? "bg-green-500" :
            displayStatus === "PENDING" || displayStatus === "SUBMITTED" ? "bg-yellow-500" :
            displayStatus === "REJECTED" ? "bg-red-500" :
            displayStatus === "REQUIRED" ? "bg-orange-500" : "bg-gray-500"
          }`}>
            {displayStatus}
          </span>
        </div>
      </div>

      {isRejected && rejectionReason && isExpanded && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start space-x-2">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-xs text-red-700">{rejectionReason}</p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className={`bg-[#F0F0F0] rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex items-center h-12 ${
          isRejected ? 'border-2 border-red-200' : ''
        }`}
        onClick={() => onUpload(docType)}
      >
        {url ? (
          <div className="flex items-center space-x-3 w-full">
            <FiFileText className="text-gray-600" size={18} />
            <span className="text-sm text-gray-700 flex-1 truncate">
              {fileName || 'Document uploaded'}
            </span>
            <div className="flex items-center space-x-1">
              {isRejected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload(docType);
                  }}
                  className="p-1 hover:bg-gray-300 rounded flex-shrink-0"
                  title="Re-upload document"
                >
                  <FiRefreshCw className="text-orange-600" size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(url);
                }}
                className="p-1 hover:bg-gray-300 rounded flex-shrink-0"
                title="View document"
              >
                <FiEye className="text-[#039994]" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 w-full">
            <FiUpload className="text-gray-600" size={18} />
            <span className="text-sm text-gray-700">Click to upload</span>
          </div>
        )}
      </div>

      {isRejected && url && (
        <div className="mt-1 text-xs text-red-600 flex items-center space-x-1">
          <FiAlertCircle size={10} />
          <span>Document rejected. Click to re-upload or use the refresh icon above.</span>
        </div>
      )}
    </div>
  );
};

export default function FacilityDetails({ facility, onBack, onFacilityUpdated }) {
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [facilityData, setFacilityData] = useState(facility);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);

  useEffect(() => {
    const checkUserProgress = async () => {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const checkStage2 = async () => {
        try {
          const response = await fetch(
            `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
          );
          const result = await response.json();
          return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
        } catch (error) {
          return false;
        }
      };

      const checkStage3 = async () => {
        try {
          const response = await fetch(
            `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
          );
          const result = await response.json();
          return result.status === 'success' && result.data?.termsAccepted;
        } catch (error) {
          return false;
        }
      };

      const checkStage4 = async () => {
        try {
          const response = await fetch(
            `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
          );
          const result = await response.json();
          return result.status === 'success' && result.data?.financialInfo;
        } catch (error) {
          return false;
        }
      };

      const checkStage5 = async () => {
        try {
          const response = await fetch(
            `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
          );
          const result = await response.json();
          return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
        } catch (error) {
          return false;
        }
      };

      const checkStage6 = () => {
        return facilityData.status?.toLowerCase() === 'verified';
      };

      const stageChecks = [
        { stage: 2, check: checkStage2 },
        { stage: 3, check: checkStage3 },
        { stage: 4, check: checkStage4 },
        { stage: 5, check: checkStage5 },
        { stage: 6, check: checkStage6 }
      ];

      let highestCompletedStage = 1;

      for (const { stage, check } of stageChecks) {
        const isCompleted = await check();
        if (isCompleted) {
          highestCompletedStage = stage;
        }
      }

      const newStage = highestCompletedStage === 6 ? 6 : highestCompletedStage;
      const newNextStage = highestCompletedStage === 6 ? 6 : highestCompletedStage + 1;
      
      setCurrentStage(newStage);
      setNextStage(newNextStage);
    };

    checkUserProgress();
  }, [facilityData.status]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatMeterIds = (meterIds) => {
    if (!meterIds || meterIds.length === 0) return "N/A";
    return meterIds.join(", ");
  };

  const handleFileSelect = (docType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }
        uploadDocument(docType, file);
      }
    };
    input.click();
  };

  const uploadDocument = async (docType, file) => {
    setUploadingDoc(docType);
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('Authentication token not found. Please login again.');
      setUploadingDoc("");
      return;
    }

    const facilityId = facilityData.id;
    const baseUrl = 'https://services.dcarbon.solutions';
    
    const endpoints = {
      wregisAssignment: `${baseUrl}/api/facility/update-wregis-assignment/${facilityId}`,
      financeAgreement: `${baseUrl}/api/facility/update-facility-financial-agreement/${facilityId}`,
      solarInstallationContract: `${baseUrl}/api/facility/update-commercial-solar-installation-contract/${facilityId}`,
      utilityInterconnectionAgreement: `${baseUrl}/api/facility/update-commercial-interconnection-agreement/${facilityId}`,
      utilityPTO: `${baseUrl}/api/facility/update-commercial-pto-letter/${facilityId}`,
      singleLineDiagram: `${baseUrl}/api/facility/update-commercial-single-line-diagram/${facilityId}`,
      installationSitePlan: `${baseUrl}/api/facility/update-facility-site-plan/${facilityId}`,
      panelInverterDatasheet: `${baseUrl}/api/facility/update-facility-inverter-datasheet/${facilityId}`,
      revenueMeterDatasheet: `${baseUrl}/api/facility/update-facility-revenue-meter-data/${facilityId}`,
      utilityMeterPhoto: `${baseUrl}/api/facility/update-commercial-utility-meter-photo/${facilityId}`
    };

    const fieldNames = {
      wregisAssignment: 'wregisAssignmentUrl',
      financeAgreement: 'financeAgreementUrl',
      solarInstallationContract: 'solarInstallationContractUrl',
      utilityInterconnectionAgreement: 'interconnectionAgreementUrl',
      utilityPTO: 'ptoLetterUrl',
      singleLineDiagram: 'singleLineDiagramUrl',
      installationSitePlan: 'file',
      panelInverterDatasheet: 'file',
      revenueMeterDatasheet: 'file',
      utilityMeterPhoto: 'utilityMeterPhotoUrl'
    };

    const formData = new FormData();
    formData.append(fieldNames[docType], file);

    try {
      toast.loading('Uploading document...', { id: 'upload-toast' });
      
      const response = await fetch(endpoints[docType], {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        const updatedData = {
          ...result.data,
          panelInverterDatasheetUrl: result.data.inverterDatasheetUrl,
          panelInverterDatasheetStatus: result.data.inverterDatasheetStatus
        };
        
        setFacilityData(prevData => ({
          ...prevData,
          ...updatedData
        }));
      
        if (onFacilityUpdated) {
          onFacilityUpdated(updatedData);
        }
        
        toast.success('Document uploaded successfully!', { id: 'upload-toast' });
      } else {
        toast.error(`Upload failed: ${result.message || 'Unknown error'}`, { id: 'upload-toast' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`, { id: 'upload-toast' });
    } finally {
      setUploadingDoc("");
    }
  };

  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleStageClick = (stageId) => {
    if (stageId === 6 && facilityData.status?.toLowerCase() !== 'verified') {
      toast('Please complete all document uploads to verify your facility', { icon: 'ℹ️' });
    }
  };

  const downloadCSV = () => {
    const headers = [
      'Facility ID', 'Facility Name', 'Commercial Role', 'Entity Type', 
      'Utility Provider', 'Meter ID', 'System Size', 'Address', 
      'Enrollment Date', 'Status', 'RECs Generated', 'RECs Sold', 
      'Earnings', 'Energy Generated', 'Commercial Operation Date',
      'Interconnected Utility ID', 'EIA Plant ID', 'Energy Storage Capacity',
      'On-site Load', 'Net-Metering'
    ];

    const data = [
      facilityData.id || '',
      facilityData.facilityName || '',
      facilityData.commercialRole || '',
      facilityData.entityType || '',
      facilityData.utilityProvider || '',
      facilityData.meterId || formatMeterIds(facilityData.meterIds) || '',
      '12 kW/AC',
      facilityData.address || '',
      formatDate(facilityData.createdAt) || '',
      facilityData.status || '',
      facilityData.recGenerated || facilityData.totalRecs || 0,
      facilityData.recSold || 0,
      facilityData.revenueEarned || '0.00',
      facilityData.energyProduced || 0,
      formatDate(facilityData.commercialOperationDate) || '',
      facilityData.interconnectedUtilityId || '',
      facilityData.eiaPlantId || '',
      facilityData.energyStorageCapacity || '',
      facilityData.onSiteLoad ? 'Yes' : 'No',
      facilityData.netMetering ? 'Yes' : 'No'
    ];

    const csvContent = [
      headers.join(','),
      data.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${facilityData.facilityName || 'facility'}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allDocuments = [
    {
      title: "WREGIS Assignment of Registration Rights",
      status: facilityData.wregisAssignmentStatus,
      url: facilityData.wregisAssignmentUrl,
      docType: "wregisAssignment",
      rejectionReason: facilityData.wregisAssignmentRejectionReason
    },
    {
      title: "Finance Agreement/PPA",
      status: facilityData.financeAgreementStatus,
      url: facilityData.financeAgreementUrl,
      docType: "financeAgreement",
      rejectionReason: facilityData.financeAgreementRejectionReason
    },
    {
      title: "Solar Installation Contract",
      status: facilityData.solarInstallationContractStatus,
      url: facilityData.solarInstallationContractUrl,
      docType: "solarInstallationContract",
      rejectionReason: facilityData.solarInstallationContractRejectionReason
    },
    {
      title: "Utility Interconnection Agreement",
      status: facilityData.interconnectionAgreementStatus,
      url: facilityData.interconnectionAgreementUrl,
      docType: "utilityInterconnectionAgreement",
      rejectionReason: facilityData.interconnectionAgreementRejectionReason
    },
    {
      title: "Utility PTO Email/Letter",
      status: facilityData.ptoLetterStatus,
      url: facilityData.ptoLetterUrl,
      docType: "utilityPTO",
      rejectionReason: facilityData.ptoLetterRejectionReason
    },
    {
      title: "Single Line Diagram",
      status: facilityData.singleLineDiagramStatus,
      url: facilityData.singleLineDiagramUrl,
      docType: "singleLineDiagram",
      rejectionReason: facilityData.singleLineDiagramRejectionReason
    },
    {
      title: "Installation Site Plan",
      status: facilityData.sitePlanStatus,
      url: facilityData.sitePlanUrl,
      docType: "installationSitePlan",
      rejectionReason: facilityData.sitePlanRejectionReason
    },
    {
      title: "Panel/Inverter Data Sheet",
      status: facilityData.inverterDatasheetStatus,
      url: facilityData.inverterDatasheetUrl,
      docType: "panelInverterDatasheet",
      rejectionReason: facilityData.inverterDatasheetRejectionReason
    },
    {
      title: "Revenue Meter Data Sheet",
      status: facilityData.revenueMeterDataStatus,
      url: facilityData.revenueMeterDataUrl,
      docType: "revenueMeterDatasheet",
      rejectionReason: facilityData.revenueMeterDataRejectionReason
    },
    {
      title: "Utility/Revenue Meter Photo w/Serial ID",
      status: facilityData.utilityMeterPhotoStatus,
      url: facilityData.utilityMeterPhotoUrl,
      docType: "utilityMeterPhoto",
      rejectionReason: facilityData.utilityMeterPhotoRejectionReason
    }
  ];

  const visibleDocuments = showAllDocs ? allDocuments : allDocuments.slice(0, 3);

  return (
    <div className="bg-white">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-[#039994] hover:text-[#027a75] mb-3"
        >
          <FiArrowLeft className="mr-2" size={16} />
          <span className="font-medium text-sm">Facility Details</span>
        </button>

        <ProgressTracker 
          currentStage={currentStage} 
          nextStage={nextStage} 
          onStageClick={handleStageClick}
        />

        <div className="flex justify-between items-center">
          <h1 className={pageTitle}>
            {facilityData.facilityName}
          </h1>
          <button
            onClick={downloadCSV}
            className="flex items-center space-x-1 bg-[#1E1E1E] text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
          >
            <FiDownload size={12} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Commercial Role</span>
                  <span className="text-gray-600 text-xs capitalize">
                    {facilityData.commercialRole || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Entity Type</span>
                  <span className="text-gray-600 text-xs capitalize">
                    {facilityData.entityType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Facility ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.id || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Utility Provider</span>
                  <span className="text-gray-600 text-xs">{facilityData.utilityProvider || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Meter ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.meterId || formatMeterIds(facilityData.meterIds) || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>System Size</span>
                  <span className="text-gray-600 text-xs">12 kW/AC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Installation Address</span>
                  <span className="text-gray-600 text-xs">{facilityData.address || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Enrollment Date</span>
                  <span className="text-gray-600 text-xs">{formatDate(facilityData.createdAt) || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Status</span>
                  <span className="text-[#039994] text-xs font-medium capitalize">
                    {facilityData.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[#039994] mb-3">Additional Facility Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Commercial Operation Date</span>
                  <span className="text-gray-600 text-xs">{formatDate(facilityData.commercialOperationDate) || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Interconnected Utility ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.interconnectedUtilityId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>EIA Plant ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.eiaPlantId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Energy Storage Capacity</span>
                  <span className="text-gray-600 text-xs">{facilityData.energyStorageCapacity || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>On-site Load</span>
                  <span className="text-gray-600 text-xs">{facilityData.onSiteLoad ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Net-Metering</span>
                  <span className="text-gray-600 text-xs">{facilityData.netMetering ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>WREGIS Eligibility Date</span>
                  <span className="text-gray-600 text-xs">{formatDate(facilityData.wregisEligibilityDate) || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>WREGIS ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.wregisId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>RPS ID</span>
                  <span className="text-gray-600 text-xs">{facilityData.rpsId || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#039994] mb-3">Facility Documents</h3>
            
            <div className={`${showAllDocs ? 'max-h-[500px] overflow-y-auto' : ''}`}>
              {visibleDocuments.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  status={doc.status}
                  url={doc.url}
                  onUpload={handleFileSelect}
                  onView={handleViewDocument}
                  docType={doc.docType}
                  rejectionReason={doc.rejectionReason}
                />
              ))}
            </div>

            {allDocuments.length > 3 && (
              <button 
                onClick={() => setShowAllDocs(!showAllDocs)}
                className="w-full mt-3 py-1.5 text-xs text-[#039994] hover:text-[#027a75] transition-colors flex items-center justify-center space-x-1"
              >
                <span>{showAllDocs ? 'View less' : 'View more'}</span>
                <FiChevronDown className={`transform transition-transform ${showAllDocs ? 'rotate-180' : ''}`} size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <CommercialDetailsGraph facilityId={facilityData.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
            <p className="text-black text-xs mb-1">RECs Generated</p>
            <p className="text-lg font-bold text-[#039994]">{facilityData.recGenerated || facilityData.totalRecs || 0}</p>
          </div>
          
          <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
            <p className="text-black text-xs mb-1">Total RECs sold</p>
            <p className="text-lg font-bold text-[#039994]">{facilityData.recSold || 0}</p>
          </div>

          <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
            <p className="text-black text-xs mb-1">Earnings</p>
            <p className="text-lg font-bold text-[#039994]">${facilityData.revenueEarned || '0.00'}</p>
          </div>

          <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
            <p className="text-black text-xs mb-1">Energy Generated</p>
            <p className="text-sm font-bold text-[#039994]">{facilityData.energyProduced || 0}MWh</p>
            <p className="text-xs text-gray-500">May</p>
          </div>
        </div>
      </div>
    </div>
  );
}