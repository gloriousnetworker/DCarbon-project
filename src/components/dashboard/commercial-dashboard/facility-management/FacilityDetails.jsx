import React, { useState } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiFileText,
  FiEye,
  FiDownload,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiChevronDown
} from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import EditFacilityDetailsModal from "./EditFacilityDetailsModal";
import { pageTitle, labelClass, inputClass } from "./styles";

// Mock data for the energy production chart
const energyData = [
  { month: 'Jan', kwh: 45 },
  { month: 'Feb', kwh: 30 },
  { month: 'Mar', kwh: 85 },
  { month: 'Apr', kwh: 25 },
  { month: 'May', kwh: 180 },
  { month: 'Jun', kwh: 90 },
  { month: 'Jul', kwh: 20 },
  { month: 'Aug', kwh: 35 },
  { month: 'Sep', kwh: 60 },
  { month: 'Oct', kwh: 120 },
  { month: 'Nov', kwh: 85 },
  { month: 'Dec', kwh: 95 }
];

export default function FacilityDetails({ facility, onBack, onFacilityUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [facilityData, setFacilityData] = useState(facility);

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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "text-green-600";
      case "PENDING":
        return "text-yellow-600";
      case "REJECTED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const uploadDocument = async (docType, file) => {
    setUploadingDoc(docType);
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Authentication token not found. Please login again.');
      setUploadingDoc("");
      return;
    }

    const facilityId = facilityData.id;
    const baseUrl = 'https://services.dcarbon.solutions';
    
    // Define endpoints for different document types
    const endpoints = {
      financeAgreement: `${baseUrl}/api/facility/update-facility-financial-agreement/${facilityId}`,
      proofOfAddress: `${baseUrl}/api/facility/update-facility-proof-of-address/${facilityId}`,
      infoReleaseAuth: `${baseUrl}/api/facility/update-facility-info-release-auth/${facilityId}`,
      wregisAssignment: `${baseUrl}/api/facility/update-facility-wregis-assignment/${facilityId}`,
      multipleOwnerDecl: `${baseUrl}/api/facility/update-facility-multiple-owner/${facilityId}`,
      sysOpDataAccess: `${baseUrl}/api/facility/update-facility-sys-op-data-access/${facilityId}`
    };

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoints[docType], {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Update the facility data with the new document info
        setFacilityData(prevData => ({
          ...prevData,
          ...result.data
        }));
        
        // Notify parent component if callback exists
        if (onFacilityUpdated) {
          onFacilityUpdated(result.data);
        }
        
        alert('Document uploaded successfully!');
      } else {
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploadingDoc("");
    }
  };

  const handleFileSelect = (docType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadDocument(docType, file);
      }
    };
    input.click();
  };

  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const DocumentCard = ({ title, status, url, onUpload, onView, docType }) => (
    <div className="mb-3">
      {/* Document title and status */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-black text-sm font-medium">{title}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBgColor(status)}`}>
          {status || "PENDING"}
        </span>
      </div>
      
      {/* Document placeholder/upload area */}
      <div 
        className="bg-[#F0F0F0] rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center h-16"
        onClick={() => onUpload(docType)}
      >
        {url ? (
          <div className="flex items-center space-x-3">
            <FiFileText className="text-gray-600" size={20} />
            <span className="text-sm text-gray-700">Document uploaded</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(url);
              }}
              className="p-1 hover:bg-gray-300 rounded"
            >
              <FiEye className="text-[#039994]" size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <FiEye className="text-gray-600" size={20} />
            <span className="text-sm text-gray-700">
              {uploadingDoc === docType ? "Uploading..." : "Click to upload"}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const allDocuments = [
    {
      title: "Finance Agreement",
      status: facilityData.financeAgreementStatus || "PENDING",
      url: facilityData.financeAgreementUrl,
      docType: "financeAgreement"
    },
    {
      title: "Proof of Address",
      status: facilityData.proofOfAddressStatus || "PENDING",
      url: facilityData.proofOfAddressUrl,
      docType: "proofOfAddress"
    },
    {
      title: "Info Release Authorization",
      status: facilityData.infoReleaseAuthStatus || "PENDING",
      url: facilityData.infoReleaseAuthUrl,
      docType: "infoReleaseAuth"
    },
    {
      title: "WREGIS Assignment",
      status: facilityData.wregisAssignmentStatus || "PENDING",
      url: facilityData.wregisAssignmentUrl,
      docType: "wregisAssignment"
    },
    {
      title: "Multiple Owner Declaration",
      status: facilityData.multipleOwnerDeclStatus || "PENDING",
      url: facilityData.multipleOwnerDeclUrl,
      docType: "multipleOwnerDecl"
    },
    {
      title: "System Operator Data Access",
      status: facilityData.sysOpDataAccessStatus || "PENDING",
      url: facilityData.sysOpDataAccessUrl,
      docType: "sysOpDataAccess"
    }
  ];

  const visibleDocuments = showAllDocs ? allDocuments : allDocuments.slice(0, 3);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-[#039994] hover:text-[#027a75] mb-3"
        >
          <FiArrowLeft className="mr-2" size={16} />
          <span className="font-medium text-sm">Facility Details</span>
        </button>

        <div className="flex justify-between items-center">
          <h1 className={pageTitle}>
            {facilityData.facilityName}
          </h1>
          <div className="flex space-x-2">
            {facilityData.commercialRole?.toLowerCase() === "owner" && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-1 bg-[#039994] text-white px-3 py-1.5 rounded text-xs hover:bg-[#027a75] transition-colors"
              >
                <FiUsers size={12} />
                <span>Invite Collaborator</span>
              </button>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-1 bg-[#1E1E1E] text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
            >
              <FiEdit size={12} />
              <span>Edit Facility Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Facility Information */}
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

          {/* Facility Documents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#039994] mb-3">Facility Documents</h3>
            
            <div className={`${showAllDocs ? 'max-h-80 overflow-y-auto' : ''}`}>
              {visibleDocuments.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  status={doc.status}
                  url={doc.url}
                  onUpload={handleFileSelect}
                  onView={handleViewDocument}
                  docType={doc.docType}
                />
              ))}
            </div>

            <button 
              onClick={() => setShowAllDocs(!showAllDocs)}
              className="w-full mt-3 py-1.5 text-xs text-[#039994] hover:text-[#027a75] transition-colors"
            >
              {showAllDocs ? 'View less' : 'View more'}
            </button>
          </div>
        </div>

        {/* Energy Production Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-black">Energy Production</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                  <option>Yearly</option>
                  <option>Monthly</option>
                </select>
                <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                  <option>2025</option>
                  <option>2024</option>
                </select>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#666' }}
                    label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px' } }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="kwh" 
                    stroke="#039994" 
                    strokeWidth={2}
                    dot={{ fill: '#039994', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#039994' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
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

      {/* Modals */}
      {showInviteModal && (
        <InviteCollaboratorModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          inviterRole={facilityData.commercialRole}
        />
      )}

      {showEditModal && (
        <EditFacilityDetailsModal
          facility={facilityData}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedFacility) => {
            setFacilityData(updatedFacility);
            onFacilityUpdated?.(updatedFacility);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}