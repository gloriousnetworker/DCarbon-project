import React, { useState } from "react";
import { FiFileText, FiEye, FiRefreshCw, FiUpload, FiAlertCircle, FiX, FiDownload, FiAlertTriangle, FiChevronDown } from "react-icons/fi";
import { toast } from 'react-hot-toast';

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
        className={`rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex items-center h-12 ${
          (displayStatus === "APPROVED" || displayStatus === "SUBMITTED") ? 
          'bg-gray-200 cursor-not-allowed' : 
          'bg-[#F0F0F0]'
        } ${isRejected ? 'border-2 border-red-200' : ''}`}
        onClick={() => {
          if (displayStatus === "APPROVED" || displayStatus === "SUBMITTED") return;
          onUpload(docType);
        }}
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
  const displayStatus = !url ? "REQUIRED" : status || "PENDING";

  return (
    <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-green-800">{title}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          displayStatus === "APPROVED" ? "bg-green-600 text-white" :
          displayStatus === "PENDING" || displayStatus === "SUBMITTED" ? "bg-yellow-500 text-white" :
          displayStatus === "REJECTED" ? "bg-red-500 text-white" :
          displayStatus === "REQUIRED" ? "bg-orange-500 text-white" : "bg-gray-500 text-white"
        }`}>
          {displayStatus}
        </span>
      </div>
      
      {isRejected && rejectionReason && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
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

export const PDFViewerModal = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  const getFileExtension = (url) => {
    if (!url) return '';
    return url.split('.').pop().toLowerCase();
  };

  const renderFileContent = () => {
    if (!url) return <div>No document available</div>;
    
    const extension = getFileExtension(url);
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={url} 
            alt={title} 
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{display: 'none'}} className="text-center">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Unable to load image</p>
          </div>
        </div>
      );
    } else if (extension === 'pdf') {
      const pdfViewerUrl = url.includes('drive.google.com') 
        ? url.replace('/view', '/preview')
        : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      
      return (
        <div className="w-full h-full relative">
          <iframe
            src={pdfViewerUrl}
            className="w-full h-full border-0"
            title={title}
            onError={() => {
              console.error('PDF viewer failed to load');
            }}
          />
          <div className="absolute inset-0 pointer-events-none"></div>
        </div>
      );
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      
      return (
        <div className="w-full h-full">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      );
    } else if (['txt', 'csv', 'json', 'xml'].includes(extension)) {
      return (
        <div className="w-full h-full p-4">
          <iframe
            src={url}
            className="w-full h-full border border-gray-300 rounded"
            title={title}
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FiFileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Preview not available for this file type</p>
            <p className="text-sm text-gray-500 mb-4">File extension: .{extension}</p>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = title || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="inline-flex items-center gap-2 bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#028580] transition-colors"
            >
              <FiDownload size={16} />
              Download File
            </button>
          </div>
        </div>
      );
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl h-full max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#039994] text-white px-3 py-1.5 rounded-md hover:bg-[#028580] transition-colors text-sm"
              title="Download file"
            >
              <FiDownload size={14} />
              Download
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Close preview"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-100">
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
};

const DocumentsModal = ({ 
  facilityData, 
  onFileSelect, 
  onViewDocument, 
  showAllDocs, 
  setShowAllDocs,
  partnerType,
  onFacilityUpdated
}) => {
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
        onView={(url) => onViewDocument(url, acknowledgementDocument.title)}
        rejectionReason={acknowledgementDocument.rejectionReason}
      />
      
      <div className={`${showAllDocs ? 'max-h-[500px] overflow-y-auto' : ''}`}>
        {visibleDocuments.map((doc, index) => (
          <DocumentCard
            key={index}
            title={doc.title}
            status={doc.status}
            url={doc.url}
            onUpload={onFileSelect}
            onView={(url) => onViewDocument(url, doc.title)}
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
  );
};

export default DocumentsModal;