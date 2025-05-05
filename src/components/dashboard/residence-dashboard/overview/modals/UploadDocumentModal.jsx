// src/components/modals/UploadDocumentsModal.jsx
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  backArrow,
  pageTitle,
  formWrapper,
  labelClass,
  inputClass,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadNoteStyle,
  buttonPrimary,
  spinnerOverlay,
  spinner,
} from '../styles';

const DOCUMENT_TYPES = [
  { id: 'rec-agreement', label: 'REC Agreement' },
  { id: 'info-release', label: 'Information Release' },
  { id: 'installation-contract', label: 'Installation Contract' },
  { id: 'interconnection', label: 'Interconnection Agreement' },
  { id: 'single-line', label: 'Single Line Diagram' },
  { id: 'system-specs', label: 'System Specifications' },
  { id: 'pto-letter', label: 'PTO Letter' },
  { id: 'meter-photo', label: 'Meter Photo' },
  { id: 'utility-auth', label: 'Utility Authorization' },
  { id: 'ownership-decl', label: 'Ownership Declaration' },
  { id: 'alternate-location', label: 'Alternate Location Agreement' },
];

export default function UploadDocumentsModal({ isOpen, onClose, userId }) {
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please upload PDF, JPG, or PNG');
        return;
      }

      setFile(selectedFile);
      toast.success('File selected successfully');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDocumentType) {
      toast.error('Please select a document type');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    const uploadToast = toast.loading('Uploading document...');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = `https://services.dcarbon.solutions/api/user/residential-docs/${selectedDocumentType}/${userId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      toast.success('Document uploaded successfully!', { id: uploadToast });
      resetForm();
    } catch (err) {
      toast.error(err.message || 'An error occurred during upload', { id: uploadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDocumentType('');
    setFile(null);
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            style: {
              background: '#039994',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
          loading: {
            style: {
              background: '#1E1E1E',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
        <div className="relative bg-white p-8 rounded-lg w-full max-w-md">
          <div className={backArrow} onClick={() => {
            resetForm();
            onClose();
          }}>
            &#8592; Back
          </div>
          <h2 className={pageTitle}>Upload Residential Documents</h2>

          <form onSubmit={handleSubmit} className={formWrapper}>
            <div>
              <label htmlFor="documentType" className={labelClass}>
                Document Type
              </label>
              <select
                id="documentType"
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select a document type</option>
                {DOCUMENT_TYPES.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={uploadHeading}>Document File</label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <span>
                    {file ? file.name : 'Choose a file...'}
                  </span>
                  <div className={uploadIconContainer}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </label>
              </div>
              <p className={uploadNoteStyle}>
                Accepted formats: PDF, JPG, JPEG, PNG (Max 10MB)
              </p>
            </div>

            <button
              type="submit"
              className={buttonPrimary}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>

          {isLoading && (
            <div className={spinnerOverlay}>
              <div className={spinner} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}