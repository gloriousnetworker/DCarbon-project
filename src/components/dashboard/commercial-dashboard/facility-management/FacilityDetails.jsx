import React, { useState } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiFileText,
  FiEye,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiChevronDown,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";
import { toast } from 'react-hot-toast';
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import EditFacilityDetailsModal from "./EditFacilityDetailsModal";
import { pageTitle, labelClass } from "./styles";

export default function FacilityDetails({ facility, onBack, onFacilityUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [facilityData, setFacilityData] = useState(facility);
  const [expandedRejections, setExpandedRejections] = useState({});

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
      case "SUBMITTED":
        return "text-yellow-600";
      case "REJECTED":
        return "text-red-600";
      case "REQUIRED":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
      case "SUBMITTED":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      case "REQUIRED":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const toggleRejectionReason = (docType) => {
    setExpandedRejections(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
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
      financeAgreement: `${baseUrl}/api/facility/update-facility-finance-agreement/${facilityId}`,
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

  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const DocumentCard = ({ title, status, url, onUpload, onView, docType, rejectionReason }) => {
    const fileName = getDocumentFileName(url);
    const isUploading = uploadingDoc === docType;
    const isRejected = status?.toUpperCase() === "REJECTED";
    const isExpanded = expandedRejections[docType];
    const displayStatus = !url ? "REQUIRED" : status || "PENDING";
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-black text-sm font-medium">{title}</span>
          <div className="flex items-center space-x-2">
            {isRejected && (
              <button
                onClick={() => toggleRejectionReason(docType)}
                className="p-1 hover:bg-gray-100 rounded"
                title="View rejection reason"
              >
                <FiAlertCircle className="text-red-500" size={14} />
              </button>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBgColor(displayStatus)}`}>
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
          className={`bg-[#F0F0F0] rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center h-12 ${
            isRejected ? 'border-2 border-red-200' : ''
          }`}
          onClick={() => !isUploading && onUpload(docType)}
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#039994]"></div>
              <span className="text-sm text-gray-700">Uploading...</span>
            </div>
          ) : url ? (
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
            <div className="flex items-center space-x-2">
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
      status: facilityData.panelInverterDatasheetStatus,
      url: facilityData.panelInverterDatasheetUrl,
      docType: "panelInverterDatasheet",
      rejectionReason: facilityData.panelInverterDatasheetRejectionReason
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

        <div className="flex justify-between items-center">
          <h1 className={pageTitle}>
            {facilityData.facilityName}
          </h1>
          <div className="flex space-x-2">
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

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
                  rejectionReason={doc.rejectionReason}
                />
              ))}
            </div>

            <button 
              onClick={() => setShowAllDocs(!showAllDocs)}
              className="w-full mt-3 py-1.5 text-xs text-[#039994] hover:text-[#027a75] transition-colors flex items-center justify-center space-x-1"
            >
              <span>{showAllDocs ? 'View less' : 'View more'}</span>
              <FiChevronDown className={`transform transition-transform ${showAllDocs ? 'rotate-180' : ''}`} size={12} />
            </button>
          </div>
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