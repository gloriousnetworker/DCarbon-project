import React, { useState, useEffect } from 'react';
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

const API_BASE_URL = 'https://services.dcarbon.solutions';

export default function UploadDocumentsModal({ isOpen, onClose }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);

  // Fetch facilities when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFacilities();
    }
  }, [isOpen]);

  const fetchFacilities = async () => {
    setIsLoadingFacilities(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!authToken || !userId) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/residential-facility/get-user-facilities/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch facilities (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.facilities) {
        setFacilities(data.data.facilities);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      console.error('Error fetching facilities:', err);
      toast.error(err.message || 'Failed to load facilities');
      setFacilities([]);
    } finally {
      setIsLoadingFacilities(false);
    }
  };

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

  const buildEndpoint = (documentType, facilityId) => {
    // All document types use the residential-facility path with facility ID
    return `${API_BASE_URL}/api/residential-facility/residential-docs/${documentType}/${facilityId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFacility) {
      toast.error('Please select a facility');
      return;
    }

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
      // Get authToken from localStorage
      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create FormData and append ONLY the file
      const formData = new FormData();
      
      // Try both 'file' and 'File' keys to see which one works
      formData.append('file', file);

      // Build the endpoint using facility ID
      const endpoint = buildEndpoint(selectedDocumentType, selectedFacility);

      console.log('Uploading to endpoint:', endpoint);
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      console.log('Document type:', selectedDocumentType);
      console.log('Facility ID:', selectedFacility);

      const response = await fetch(endpoint, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Don't set Content-Type header - let the browser set it automatically for FormData
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Failed to upload document';
        
        try {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            // If not JSON, use the text as error message
            errorMessage = errorText || response.statusText || errorMessage;
          }
        } catch (textError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      // Try to parse response, but don't fail if it's not JSON
      let responseData = {};
      try {
        const responseText = await response.text();
        console.log('Success response body:', responseText);
        
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (jsonError) {
        // Response might not be JSON, which is fine for successful uploads
        console.log('Response is not JSON, but upload was successful');
      }

      toast.success('Document uploaded successfully!', { id: uploadToast });
      resetForm();
      onClose(); // Close the modal after successful upload
      
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'An error occurred during upload', { id: uploadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFacility('');
    setSelectedDocumentType('');
    setFile(null);
  };

  const getSelectedFacilityInfo = () => {
    const facility = facilities.find(f => f.id === selectedFacility);
    return facility;
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
        <div className="relative bg-white p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div
            className={backArrow}
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            &#8592; Back
          </div>
          <h2 className={pageTitle}>Upload Residential Documents</h2>

          {isLoadingFacilities ? (
            <div className="flex items-center justify-center py-8">
              <div className={spinner} />
              <span className="ml-2">Loading facilities...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={formWrapper}>
              {/* Facility Selection */}
              <div>
                <label htmlFor="facility" className={labelClass}>
                  Select Facility
                </label>
                <select
                  id="facility"
                  value={selectedFacility}
                  onChange={(e) => {
                    setSelectedFacility(e.target.value);
                    // Reset document type and file when facility changes
                    setSelectedDocumentType('');
                    setFile(null);
                  }}
                  className={inputClass}
                  required
                >
                  <option value="">Select a facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.address} - {facility.utilityProvider}
                    </option>
                  ))}
                </select>
                {facilities.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No facilities found. Please create a facility first.
                  </p>
                )}
              </div>

              {/* Facility Info Display */}
              {selectedFacility && getSelectedFacilityInfo() && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <div className="font-medium text-gray-700">Selected Facility:</div>
                  <div className="text-gray-600">
                    <div>Address: {getSelectedFacilityInfo().address}</div>
                    <div>Utility: {getSelectedFacilityInfo().utilityProvider}</div>
                    <div>Meter ID: {getSelectedFacilityInfo().meterId}</div>
                    <div>Status: {getSelectedFacilityInfo().status}</div>
                  </div>
                </div>
              )}

              {/* Document Type Selection */}
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
                  disabled={!selectedFacility}
                >
                  <option value="">
                    {selectedFacility ? 'Select a document type' : 'Please select a facility first'}
                  </option>
                  {DOCUMENT_TYPES.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
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
                      disabled={!selectedDocumentType}
                    />
                    <span>
                      {file ? file.name : 
                       selectedDocumentType ? 'Choose a file...' : 'Select document type first'}
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
                disabled={isLoading || !selectedFacility || !selectedDocumentType || !file}
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          )}

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