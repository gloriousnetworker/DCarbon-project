import React, { useState } from "react";
import { toast } from "react-hot-toast";
import InviteOperatorModal from './InviteOperatorModal.jsx';
import {
  buttonPrimary,
  spinnerOverlay,
  spinner,
  termsTextContainer
} from '../../styles.js';

export default function UploadFacilityDocumentsModal({ isOpen, onClose }) {
  const [uploading, setUploading] = useState(Array(6).fill(false));
  const [files, setFiles] = useState(Array(6).fill(null));
  const [documentStatuses, setDocumentStatuses] = useState(Array(6).fill('Required'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const documentTypes = [
    "Finance Agreement",
    "Facility Proof",
    "Info Release",
    "WREGIS",
    "Multiple Owner",
    "Sys Op Data Access"
  ];

  const documentKeys = [
    "financeAgreementUrl",
    "proofOfAddressUrl", 
    "proofOfAddressUrl",
    "proofOfAddressUrl",
    "proofOfAddressUrl",
    "sysOpDataAccessUrl"
  ];

  const endpoints = [
    "update-facility-financial-agreement",
    "update-facility-proof-of-address",
    "update-info-release-auth",
    "update-wregis-assignment",
    "update-multiple-owner-decl",
    "update-sys-op-data-access"
  ];

  const handleFileChange = (index, e) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  const handleUpload = async (index) => {
    if (!files[index]) return;
    
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
      toast.error('Authentication required. Please log in.');
      return;
    }
    
    setUploading(prev => {
      const newUploading = [...prev];
      newUploading[index] = true;
      return newUploading;
    });

    try {
      const formData = new FormData();
      formData.append(documentKeys[index], files[index]);

      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/${endpoints[index]}/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to upload ${documentTypes[index]}`);
      }

      // Update status to PENDING after successful upload
      setDocumentStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[index] = 'PENDING';
        return newStatuses;
      });

      toast.success(`${documentTypes[index]} uploaded successfully!`);
    } catch (err) {
      toast.error(err.message || `Failed to upload ${documentTypes[index]}`);
    } finally {
      setUploading(prev => {
        const newUploading = [...prev];
        newUploading[index] = false;
        return newUploading;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowInviteModal(true);
    } catch (err) {
      toast.error('Failed to complete facility creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    onClose(); // Close the main modal after invite modal closes
  };

  if (!isOpen) return null;

  return (
    <>
      {isSubmitting && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-red-500 hover:text-red-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Back Arrow */}
            <button
              onClick={onClose}
              className="absolute top-6 left-6 text-gray-600 hover:text-gray-800"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mt-8 text-center">
              Upload Facility Documents
            </h2>
            <div className="w-full h-1 bg-[#039994] rounded-full mt-2"></div>

            <div className="flex items-center mt-4 mb-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
                <div className="h-1 bg-[#039994] rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-500 font-sfpro">04/04</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4">
              {documentTypes.map((docType, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Document {index + 1}
                    </label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      documentStatuses[index] === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {documentStatuses[index]}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {files[index] ? files[index].name : 'Upload Document'}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                        <path d="M21.44 11.05L12.25 1.86C11.46 1.07 10.54 1.07 9.75 1.86L0.56 11.05C-0.19 11.8 0.31 13 1.31 13H4V19C4 20.1 4.9 21 6 21H10V15H14V21H18C19.1 21 20 20.1 20 19V13H22.69C23.69 13 24.19 11.8 23.44 11.05Z" fill="currentColor"/>
                      </svg>
                    </div>
                    
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  
                  {files[index] && (
                    <button
                      type="button"
                      onClick={() => handleUpload(index)}
                      disabled={uploading[index]}
                      className={`w-full px-3 py-2 rounded-md text-white text-sm ${
                        uploading[index] 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#039994] hover:bg-[#028882]'
                      }`}
                    >
                      {uploading[index] ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
              ))}

              <hr className="my-6 border-gray-200" />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${buttonPrimary} w-full flex items-center justify-center disabled:opacity-50 text-sm`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Complete Facility Creation'
                )}
              </button>

              <div className={`${termsTextContainer} text-sm text-center`}>
                <span>Terms and Conditions</span>
                <span className="mx-2">•</span>
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Operator Modal */}
      {showInviteModal && (
        <InviteOperatorModal closeModal={handleInviteModalClose} />
      )}
    </>
  );
}