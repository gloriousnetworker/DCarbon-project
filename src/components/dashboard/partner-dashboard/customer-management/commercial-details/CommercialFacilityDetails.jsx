import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUsers
} from "react-icons/fi";
import { toast } from 'react-hot-toast';
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import AssignInstallerModal from "./AssignInstallerModal";
import EditFacility from "./EditFacility";
import { pageTitle, labelClass } from "./styles";
import CommercialDetailsGraph from "./CommercialDetailsGraph";
import CommercialDocuments from "./CommercialDocuments";

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
  const [facilityData, setFacilityData] = useState(facility);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);
  const [partnerType, setPartnerType] = useState(null);

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

  useEffect(() => {
    checkPartnerRole();
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
    'WREGIS Eligibility Date', 'WREGIS ID', 'RPS ID'
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
  link.setAttribute('download', `${facilityData.facilityName || 'commercial_facility'}_details.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleStageClick = (stageId) => {
  if (stageId === 6 && facilityData.status?.toLowerCase() !== 'verified') {
    toast('Please complete all document uploads to verify your facility', { icon: 'ℹ️' });
  }
};

const showAssignInstallerButton = partnerType === "FINANCE_COMPANY";

const handleFacilityUpdate = (updatedFacility) => {
  setFacilityData(updatedFacility);
  if (onFacilityUpdated) {
    onFacilityUpdated(updatedFacility);
  }
};

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
            className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 transition-colors"
          >
            <FiTrash2 size={12} />
            <span>Delete Facility</span>
          </button>
          {facilityData.commercialRole?.toLowerCase() === "owner" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-1 bg-[#039994] text-white px-3 py-1.5 rounded text-xs hover:bg-[#027a75] transition-colors"
            >
              <FiUsers size={12} />
              <span>Invite Collaborator</span>
            </button>
          )}
          {showAssignInstallerButton && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-1 bg-[#1E1E1E] text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
            >
              <FiEdit size={12} />
              <span>Assign Installer to Facility</span>
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
        </div>

        <CommercialDocuments 
          facilityData={facilityData}
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
  </div>
);
}