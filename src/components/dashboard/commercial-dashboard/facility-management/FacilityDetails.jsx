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
        return "bg-green-100";
      case "PENDING":
        return "bg-yellow-100";
      case "REJECTED":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const handleFileUpload = async (docType, file) => {
    // Mock upload functionality
    console.log(`Uploading ${docType}:`, file.name);
  };

  const handleFileSelect = (docType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(docType, file);
      }
    };
    input.click();
  };

  const DocumentCard = ({ title, status, url, onUpload, docType }) => (
    <div className="relative">
      <div 
        className="bg-[#F0F0F0] rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors relative"
        onClick={() => onUpload(docType)}
      >
        {/* Status tag positioned at top right */}
        <div className="absolute -top-2 -right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(status)} ${getStatusColor(status)}`}>
            {status || "PENDING"}
          </span>
        </div>
        
        <div className="flex items-center justify-center h-12">
          {url ? (
            <div className="flex items-center space-x-2">
              <FiFileText className="text-gray-600" size={16} />
              <span className="text-xs text-gray-700">Document uploaded</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FiUpload className="text-gray-600" size={14} />
              <span className="text-xs text-gray-700">
                {uploadingDoc === docType ? "Uploading..." : "Upload"}
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-700 mt-1 text-center">{title}</p>
    </div>
  );

  const allDocuments = [
    {
      title: "Finance Agreement",
      status: facility.financeAgreementStatus || "Pending",
      url: facility.financeAgreementUrl,
      docType: "financeAgreement"
    },
    {
      title: "Proof of Address",
      status: facility.proofOfAddressStatus || "Pending",
      url: facility.proofOfAddressUrl,
      docType: "proofOfAddress"
    },
    {
      title: "Info Release Authorization",
      status: facility.infoReleaseAuthStatus || "Pending",
      url: facility.infoReleaseAuthUrl,
      docType: "infoReleaseAuth"
    },
    {
      title: "WREGIS Assignment",
      status: facility.wregisAssignmentStatus || "Pending",
      url: facility.wregisAssignmentUrl,
      docType: "wregisAssignment"
    },
    {
      title: "Multiple Owner Declaration",
      status: facility.multipleOwnerDeclStatus || "Pending",
      url: facility.multipleOwnerDeclUrl,
      docType: "multipleOwnerDecl"
    },
    {
      title: "System Operator Data Access",
      status: facility.sysOpDataAccessStatus || "Pending",
      url: facility.sysOpDataAccessUrl,
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
            {facility.facilityName}
          </h1>
          <div className="flex space-x-2">
            {facility.commercialRole?.toLowerCase() === "owner" && (
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
                  {facility.commercialRole || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Entity Type</span>
                <span className="text-gray-600 text-xs capitalize">
                  {facility.entityType || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Facility ID</span>
                <span className="text-gray-600 text-xs">{facility.id || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Utility Provider</span>
                <span className="text-gray-600 text-xs">{facility.utilityProvider || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Meter ID</span>
                <span className="text-gray-600 text-xs">{formatMeterIds(facility.meterIds) || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>System Size</span>
                <span className="text-gray-600 text-xs">12 kW/AC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Installation Address</span>
                <span className="text-gray-600 text-xs">{facility.address || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Enrollment Date</span>
                <span className="text-gray-600 text-xs">{formatDate(facility.createdAt) || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${labelClass} text-xs`}>Status</span>
                <span className="text-[#039994] text-xs font-medium capitalize">
                  {facility.status || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Facility Documents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Facility Documents</h3>
            
            <div className={`grid grid-cols-2 gap-3 ${showAllDocs ? 'max-h-40 overflow-y-auto' : ''}`}>
              {visibleDocuments.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  status={doc.status}
                  url={doc.url}
                  onUpload={handleFileSelect}
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
              <p className="text-lg font-bold text-[#039994]">{facility.totalRecs || 0}</p>
            </div>
            
            <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
              <p className="text-black text-xs mb-1">Total RECs sold</p>
              <p className="text-lg font-bold text-[#039994]">0</p>
            </div>

            <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
              <p className="text-black text-xs mb-1">Earnings</p>
              <p className="text-lg font-bold text-[#039994]">$0.00</p>
            </div>

            <div className="bg-white border-2 border-[#039994] rounded-lg p-3 text-center">
              <p className="text-black text-xs mb-1">Energy Generated</p>
              <p className="text-sm font-bold text-[#039994]">0MWh</p>
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
          inviterRole={facility.commercialRole}
        />
      )}

      {showEditModal && (
        <EditFacilityDetailsModal
          facility={facility}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedFacility) => {
            onFacilityUpdated?.(updatedFacility);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}