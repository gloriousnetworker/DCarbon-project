import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUsers,
  FiAlertCircle,
  FiChevronDown
} from "react-icons/fi";
import { toast } from 'react-hot-toast';
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import AssignInstallerModal from "./AssignInstallerModal";
import EditFacility from "./EditFacility";
import { pageTitle, labelClass } from "./styles";
import CommercialDetailsGraph from "./CommercialDetailsGraph";
import CommercialDocuments, { PDFViewerModal } from "./CommercialDocuments";

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

export default function FacilityDetails({ facility, customerEmail, onBack, onFacilityUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditFacilityModal, setShowEditFacilityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [facilityData, setFacilityData] = useState(facility);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);
  const [partnerType, setPartnerType] = useState(null);
  const [hasMeters, setHasMeters] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [currentPDF, setCurrentPDF] = useState({ url: "", title: "" });
  const [operators, setOperators] = useState([]);
  const [expandedOperators, setExpandedOperators] = useState(false);
  const [isFacilityComplete, setIsFacilityComplete] = useState(false);
  const [allDocumentsApproved, setAllDocumentsApproved] = useState(false);

  const checkPartnerRole = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const result = await response.json();

      if (result?.status === 'success') {
        setPartnerType(result.data.user.partnerType);
      }
    } catch (error) {
      console.error('Error checking partner role:', error);
      setPartnerType(null);
    }
  };

  const fetchOperators = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/get-operators/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      const result = await response.json();
      if (result.status === "success") {
        setOperators(result.data);
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  const toggleOperatorDropdown = () => {
    setExpandedOperators(prev => !prev);
  };

  const fetchFacilityDetails = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/commercial-facility/${facilityData.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      const result = await response.json();
      if (result.status === "success") {
        const updatedFacility = result.data;
        setFacilityData(updatedFacility);
        checkFacilityCompletion(updatedFacility);
        checkDocumentCompletion(updatedFacility);
        return updatedFacility;
      }
    } catch (error) {
      console.error("Error fetching facility details:", error);
    }
    return null;
  };

  const checkFacilityCompletion = (facility) => {
    const requiredFields = [
      { field: facility.commercialOperationDate, name: 'Commercial Operation Date' },
      { field: facility.interconnectedUtilityId, name: 'Interconnected Utility ID' },
      { field: facility.eiaPlantId, name: 'EIA Plant ID' },
      { field: facility.energyStorageCapacity, name: 'Energy Storage Capacity' },
      { field: facility.hasOnSiteLoad, name: 'On-site Load' },
      { field: facility.hasNetMetering, name: 'Net-Metering' },
      { field: facility.wregisEligibilityDate, name: 'WREGIS Eligibility Date' },
      { field: facility.wregisId, name: 'WREGIS ID' },
      { field: facility.rpsId, name: 'RPS ID' }
    ];

    const isComplete = requiredFields.every(item => {
      const value = item.field;
      if (value === null || value === undefined || value === '' || value === 'N/A') {
        return false;
      }
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return true;
      return true;
    });

    setIsFacilityComplete(isComplete);
    return isComplete;
  };

  const checkDocumentCompletion = (facility) => {
    const requiredDocuments = [
      facility.assignmentOfRegistrationRightStatus,
      facility.wregisAssignmentStatus,
      facility.financeAgreementStatus,
      facility.solarInstallationContractStatus,
      facility.interconnectionAgreementStatus,
      facility.ptoLetterStatus,
      facility.singleLineDiagramStatus,
      facility.sitePlanStatus,
      facility.panelInverterDatasheetStatus,
      facility.revenueMeterDataStatus,
      facility.utilityMeterPhotoStatus,
      facility.acknowledgementOfStationServiceStatus
    ];

    const allApproved = requiredDocuments.every(status => 
      status?.toUpperCase() === "APPROVED"
    );

    setAllDocumentsApproved(allApproved);
    return allApproved;
  };

  useEffect(() => {
    checkPartnerRole();
    fetchOperators();
    fetchFacilityDetails();
  }, []);

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
          
          const metersExist = result.status === 'success' && 
                           Array.isArray(result.data) &&
                           result.data.length > 0 &&
                           result.data.some(item => 
                             Array.isArray(item.meters) &&
                             item.meters.length > 0
                           );
          
          setHasMeters(metersExist);
          return metersExist;
        } catch (error) {
          return false;
        }
      };

      const checkStage6 = () => {
        return facilityData.status?.toLowerCase() === 'verified' || allDocumentsApproved;
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
  }, [facilityData.status, allDocumentsApproved]);

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
      panelInverterDatasheet: `${baseUrl}/api/facility/update-commercial-panel-inverter-datasheet/${facilityId}`,
      revenueMeterDatasheet: `${baseUrl}/api/facility/update-facility-revenue-meter-data/${facilityId}`,
      utilityMeterPhoto: `${baseUrl}/api/facility/update-commercial-utility-meter-photo/${facilityId}`,
      assignmentOfRegistrationRight: `${baseUrl}/api/facility/update-assignment-of-registration-right/${facilityId}`
    };

    const fieldNames = {
      wregisAssignment: 'wregisAssignmentUrl',
      financeAgreement: 'financeAgreementUrl',
      solarInstallationContract: 'solarInstallationContractUrl',
      utilityInterconnectionAgreement: 'interconnectionAgreementUrl',
      utilityPTO: 'ptoLetterUrl',
      singleLineDiagram: 'singleLineDiagramUrl',
      installationSitePlan: 'file',
      panelInverterDatasheet: 'panelInverterDatasheetUrl',
      revenueMeterDatasheet: 'file',
      utilityMeterPhoto: 'utilityMeterPhotoUrl',
      assignmentOfRegistrationRight: 'file'
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
        setFacilityData(prevData => ({
          ...prevData,
          ...result.data
        }));
      
        if (onFacilityUpdated) {
          onFacilityUpdated(result.data);
        }
        
        await fetchFacilityDetails();
        
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

  const handleViewDocument = (url, title) => {
    setCurrentPDF({ url, title });
    setShowPDFModal(true);
  };

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

  const deleteFacility = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://services.dcarbon.solutions/api/commercial-facility/${facilityData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Facility deleted successfully');
        onBack();
      } else {
        toast.error(`Delete failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = [
      'Facility ID', 'Email', 'Commercial Role', 'Entity Type', 'Utility Provider', 
      'Meter ID', 'System Size', 'Installation Address', 'Enrollment Date', 'Status',
      'Commercial Operation Date', 'Interconnected Utility ID', 'EIA Plant ID',
      'Energy Storage Capacity', 'On-site Load', 'Net-Metering', 
      'WREGIS Eligibility Date', 'WREGIS ID', 'RPS ID', 'RECs Generated', 'RECs Sold', 'Earnings', 'Energy Generated'
    ];

    const data = [
      facilityData.id || '',
      customerEmail || '',
      facilityData.commercialRole || '',
      facilityData.entityType || '',
      facilityData.utilityProvider || '',
      facilityData.meterId || formatMeterIds(facilityData.meterIds) || '',
      '12 kW/AC',
      facilityData.address || '',
      formatDate(facilityData.createdAt) || '',
      facilityData.status || '',
      formatDate(facilityData.commercialOperationDate) || '',
      facilityData.interconnectedUtilityId || '',
      facilityData.eiaPlantId || '',
      facilityData.energyStorageCapacity || '',
      facilityData.hasOnSiteLoad ? 'Yes' : 'No',
      facilityData.hasNetMetering ? 'Yes' : 'No',
      formatDate(facilityData.wregisEligibilityDate) || '',
      facilityData.wregisId || '',
      facilityData.rpsId || '',
      facilityData.recGenerated || facilityData.totalRecs || 0,
      facilityData.recSold || 0,
      facilityData.revenueEarned || '0.00',
      facilityData.energyProduced || 0
    ];

    const csvContent = [
      headers.join(','),
      data.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${facilityData.facilityName || 'commercial_facility'}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStageClick = (stageId) => {
    if (stageId === 6 && facilityData.status?.toLowerCase() !== 'verified' && !allDocumentsApproved) {
      toast('Please complete all document uploads to verify your facility', { icon: 'ℹ️' });
    }
    if (stageId === 5 && !hasMeters) {
      toast('Please complete meter selection first', { icon: 'ℹ️' });
    }
  };

  const showAssignInstallerButton = partnerType === "FINANCE_COMPANY";

  const handleFacilityUpdate = (updatedFacility) => {
    setFacilityData(updatedFacility);
    checkFacilityCompletion(updatedFacility);
    checkDocumentCompletion(updatedFacility);
    if (onFacilityUpdated) {
      onFacilityUpdated(updatedFacility);
    }
  };

  const isOwner = facilityData.commercialRole?.toLowerCase() === "owner";

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

        {isOwner && !hasMeters && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={16} />
              <div>
                <p className="text-xs font-medium text-yellow-800 mb-1">Pending Operator Utility Authorization</p>
                <p className="text-xs text-yellow-700">Has your Operator authorized utility for your meters to be fetched? Click the Resend button to remind them.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className={pageTitle}>
            {facilityData.facilityName}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={downloadCSV}
              className="flex items-center space-x-1 bg-[#1E1E1E] text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
            >
              <FiDownload size={12} />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => setShowEditFacilityModal(true)}
              className="flex items-center space-x-1 bg-[#1E1E1E] text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
            >
              <FiEdit size={12} />
              <span>Edit Facility</span>
            </button>
            <button
              onClick={deleteFacility}
              disabled={loading}
              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <FiTrash2 size={12} />
              <span>{loading ? "Deleting..." : "Delete Facility"}</span>
            </button>
            {facilityData.commercialRole?.toLowerCase() === "owner" && (
              <div className="relative">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className={`flex items-center space-x-1 bg-[#039994] text-white px-3 py-1.5 rounded text-xs hover:bg-[#027a75] transition-colors ${!hasMeters ? 'pr-6' : ''}`}
                  title={!hasMeters ? "Pending Operator Utility Authorization" : ""}
                >
                  <FiUsers size={12} />
                  <span>Resend Invite</span>
                </button>
                {!hasMeters && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
            )}
            {showAssignInstallerButton && (
              <button
                onClick={() => setShowEditModal(true)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs transition-colors ${
                  isFacilityComplete 
                    ? "bg-[#1E1E1E] text-white hover:bg-black"
                    : "bg-green-500 text-white hover:bg-green-600 animate-pulse shadow-lg"
                }`}
              >
                <FiEdit size={12} />
                <span>{isFacilityComplete ? "Edit Facility Details" : "Complete Facility Details"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Email</span>
                  <span className="text-gray-600 text-xs">{customerEmail || "N/A"}</span>
                </div>
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

            {isOwner && operators.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div 
                  className="flex items-center justify-between p-2 rounded cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
                  onClick={toggleOperatorDropdown}
                >
                  <span className="text-sm font-medium text-gray-700">Your Operator</span>
                  {expandedOperators ? <FiChevronDown className="text-gray-500 transform rotate-180" /> : <FiChevronDown className="text-gray-500" />}
                </div>
                
                {expandedOperators && (
                  <div className="mt-2 p-2 rounded border bg-gray-50 border-gray-200">
                    {operators.map((operator, index) => (
                      <div key={index} className="grid grid-cols-2 gap-y-1 text-xs">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="truncate">{operator.name}</span>
                        
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="break-all">{operator.inviteeEmail}</span>
                        
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`font-medium ${operator.status === 'ACCEPTED' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {operator.status === 'ACCEPTED' ? 'Accepted' : 'Pending'}
                        </span>
                        
                        <span className="font-medium text-gray-700">Invited:</span>
                        <span>{formatDate(operator.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[#039994]">Additional Facility Details</h3>
                {!isFacilityComplete && (
                  <div className="absolute -top-2 -right-2">
                    <div className="relative">
                      <div className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-green-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></div>
                    </div>
                  </div>
                )}
              </div>
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
                  <span className="text-gray-600 text-xs">{facilityData.hasOnSiteLoad ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${labelClass} text-xs`}>Net-Metering</span>
                  <span className="text-gray-600 text-xs">{facilityData.hasNetMetering ? "Yes" : "No"}</span>
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
              {!isFacilityComplete && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-yellow-500 mr-2" size={14} />
                    <span className="text-yellow-700 text-xs">
                      Complete all facility details to finish onboarding
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CommercialDocuments
            facilityData={facilityData}
            onFileSelect={handleFileSelect}
            onViewDocument={handleViewDocument}
            showAllDocs={showAllDocs}
            setShowAllDocs={setShowAllDocs}
            partnerType={partnerType}
            onFacilityUpdated={handleFacilityUpdate}
          />
        </div>

        <CommercialDetailsGraph facilityId={facilityData.id} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
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

      {showInviteModal && (
        <InviteCollaboratorModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          inviterRole={facilityData.commercialRole}
        />
      )}

      {showEditModal && (
        <AssignInstallerModal
          facility={facilityData}
          customerEmail={customerEmail}
          onClose={() => setShowEditModal(false)}
          onSave={handleFacilityUpdate}
          isOpen={showEditModal}
        />
      )}

      {showEditFacilityModal && (
        <EditFacility
          facility={facilityData}
          onClose={() => setShowEditFacilityModal(false)}
          onSave={handleFacilityUpdate}
        />
      )}

      <PDFViewerModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        url={currentPDF.url}
        title={currentPDF.title}
      />
    </div>
  );
}