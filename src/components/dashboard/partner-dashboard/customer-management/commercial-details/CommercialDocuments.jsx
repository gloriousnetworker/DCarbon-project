import React, { useState } from "react";
import {
  FiFileText,
  FiEye,
  FiUpload,
  FiRefreshCw,
  FiChevronDown,
  FiAlertCircle
} from "react-icons/fi";
import { toast } from 'react-hot-toast';

const CommercialDocuments = ({ facilityData, partnerType, onFacilityUpdated }) => {
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [expandedRejections, setExpandedRejections] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState("");

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

  const canUploadDocument = (docType, currentStatus) => {
    if (!partnerType) return true;
    
    const approvedStatuses = ["APPROVED", "SUBMITTED", "PENDING"];
    if (approvedStatuses.includes(currentStatus?.toUpperCase())) {
      return false;
    }
    
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

  const uploadDocument = async (docType, file) => {
    const currentStatus = facilityData[`${docType}Status`];
    if (!canUploadDocument(docType, currentStatus)) {
      toast.error('You cannot modify this document at this stage');
      return;
    }

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
      panelInverterDatasheet: 'file',
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
        const updatedData = {
          ...result.data,
          panelInverterDatasheetUrl: result.data.inverterDatasheetUrl,
          panelInverterDatasheetStatus: result.data.inverterDatasheetStatus
        };
        
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
    const currentStatus = facilityData[`${docType}Status`];
    if (!canUploadDocument(docType, currentStatus)) {
      toast.error('You cannot modify this document at this stage');
      return;
    }

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
    const canUpload = canUploadDocument(docType, status);
    
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
          } ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !isUploading && canUpload && onUpload(docType)}
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
                {isRejected && canUpload && (
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
              <span className="text-sm text-gray-700">{canUpload ? "Click to upload" : "Upload not permitted"}</span>
            </div>
          )}
        </div>

        {isRejected && url && canUpload && (
          <div className="mt-1 text-xs text-red-600 flex items-center space-x-1">
            <FiAlertCircle size={10} />
            <span>Document rejected. Click to re-upload or use the refresh icon above.</span>
          </div>
        )}
      </div>
    );
  };

  const AcknowledgementCard = ({ title, status, url, onView, rejectionReason }) => {
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
    const displayStatus = status || "PENDING";

    return (
      <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm text-green-800">{title}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-green-600 text-white`}>
            {displayStatus}
          </span>
        </div>
        
        {isRejected && rejectionReason && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="font-semibold text-xs text-red-700 mb-1">Rejection Reason:</p>
              <p className="text-xs text-red-600">{rejectionReason}</p>
            </div>
          </div>
        )}
        
        {url ? (
          <div 
            className="bg-green-100 rounded-md p-2.5 flex items-center justify-center cursor-pointer hover:bg-green-200"
            onClick={() => onView(url)}
          >
            <div className="flex items-center space-x-2">
              <FiEye className="text-green-700" size={16} />
              <span className="text-sm text-green-700">View Acknowledgement</span>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 rounded-md p-2.5 flex items-center justify-center">
            <span className="text-sm text-green-700">Acknowledgement {displayStatus}</span>
          </div>
        )}
      </div>
    );
  };

  const allDocuments = [
    {
      title: "Assignment of Registration Right",
      status: facilityData.assignmentOfRegistrationRightStatus,
      url: facilityData.assignmentOfRegistrationRightUrl,
      docType: "assignmentOfRegistrationRight",
      rejectionReason: facilityData.assignmentOfRegistrationRightRejectionReason
    },
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

  const acknowledgementDocument = {
    title: "Acknowledgement of Station Service",
    status: facilityData.acknowledgementOfStationServiceStatus,
    url: facilityData.acknowledgementOfStationServiceUrl,
    rejectionReason: facilityData.acknowledgementOfStationServiceRejectionReason
  };

  const visibleDocuments = showAllDocs ? allDocuments : allDocuments.slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-[#039994] mb-3">Facility Documents</h3>
      
      <AcknowledgementCard
        title={acknowledgementDocument.title}
        status={acknowledgementDocument.status}
        url={acknowledgementDocument.url}
        onView={handleViewDocument}
        rejectionReason={acknowledgementDocument.rejectionReason}
      />
      
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
  );
};

export default CommercialDocuments;