'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '@/components/loader/Loader';

// Import shared styles from styles.js
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  formWrapper,
  labelClass,
  selectClass,
  inputClass,
  fileInputWrapper,
  noteText,
  rowWrapper,
  halfWidth,
  grayPlaceholder,
  buttonPrimary,
  spinnerOverlay,
  termsTextContainer,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle
} from './styles.js';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingFinanceType, setRequestingFinanceType] = useState(false);
  const [requestedFinanceTypeName, setRequestedFinanceTypeName] = useState('');

  // Data states
  const [financeTypes, setFinanceTypes] = useState([]);
  const [installers, setInstallers] = useState([]);

  // Form states
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [installer, setInstaller] = useState('');
  const [customInstaller, setCustomInstaller] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const [cod, setCOD] = useState('');
  const [file, setFile] = useState(null);

  const router = useRouter();

  // Check if finance type requires document upload
  const isCashType = financeType.toLowerCase() === 'cash';
  const showUploadField = !isCashType && financeType !== '';
  const showFinanceCompany = !isCashType && financeType !== '';
  const showCustomInstaller = installer === 'others';

  // Fetch finance types and installers on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchFinanceTypes();
      await fetchInstallers();
    };
    fetchData();
  }, []);

  const fetchFinanceTypes = async () => {
    setLoadingFinanceTypes(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        'https://services.dcarbon.solutions/api/user/financial-types',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        // Filter only approved types and ensure 'cash' is included
        const approvedTypes = response.data.data.types.filter(type => 
          type.status === 'APPROVED' || type.name.toLowerCase() === 'cash'
        );
        
        // Remove duplicates by name (case insensitive)
        const uniqueTypes = approvedTypes.reduce((acc, current) => {
          const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        setFinanceTypes(uniqueTypes);
      }
    } catch (err) {
      console.error('Error fetching finance types:', err);
      toast.error('Failed to load finance types');
    } finally {
      setLoadingFinanceTypes(false);
    }
  };

  const fetchInstallers = async () => {
    setLoadingInstallers(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        'https://services.dcarbon.solutions/api/user/partner/get-all-installer',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setInstallers(response.data.data.installers || []);
      }
    } catch (err) {
      console.error('Error fetching installers:', err);
      toast.error('Failed to load installers');
    } finally {
      setLoadingInstallers(false);
    }
  };

  const handleRequestFinanceType = async () => {
    if (!requestedFinanceTypeName.trim()) {
      toast.error('Please enter a finance type name');
      return;
    }

    setRequestingFinanceType(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-financial-type/${userId}`,
        {
          name: requestedFinanceTypeName.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message || 'Finance type request submitted successfully!');
      setShowRequestModal(false);
      setRequestedFinanceTypeName('');
      // Refresh finance types after successful request
      await fetchFinanceTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setRequestingFinanceType(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF, JPEG, PNG, or Word documents.');
      return;
    }

    setFile(selectedFile);
    setUploadSuccess(false);
    localStorage.removeItem('tempFinancialAgreement');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem('tempFinancialAgreement', base64data);
        toast.success('Financial agreement uploaded successfully!');
        setUploadSuccess(true);
      };
      reader.onerror = () => {
        toast.error('Error reading file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    // Validate required fields
    if (!financeType) {
      toast.error('Please select a finance type');
      return;
    }

    if (showFinanceCompany && !financeCompany) {
      toast.error('Please select a finance company');
      return;
    }

    if (showUploadField && !uploadSuccess) {
      toast.error('Please upload the financial agreement');
      return;
    }

    if (showCustomInstaller && !customInstaller) {
      toast.error('Please enter your installer name');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving your information...');

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      // Determine the installer value
      const finalInstaller = showCustomInstaller ? customInstaller : installer;

      // Prepare payload according to new endpoint structure
      const payload = {
        financialType: financeType,
        ...(showFinanceCompany && { financeCompany }), // Only include if not cash
        ...(finalInstaller && { installer: finalInstaller }),
        ...(systemSize && { systemSize }),
        ...(cod && { cod }),
      };

      // First save the financial info
      const infoResponse = await axios.put(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Financial information saved successfully!', { id: toastId });

      // If document is required, upload it
      if (showUploadField && uploadSuccess) {
        const uploadToastId = toast.loading('Uploading financial agreement...');
        try {
          const base64data = localStorage.getItem('tempFinancialAgreement');
          if (!base64data) throw new Error('File data not found');
          
          // Convert base64 to blob for upload
          const response = await fetch(base64data);
          const blob = await response.blob();
          const fileToUpload = new File([blob], file.name, { type: blob.type });

          const formData = new FormData();
          formData.append('financialAgreement', fileToUpload);

          await axios.put(
            `https://services.dcarbon.solutions/api/user/update-financial-agreement/${userId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );

          toast.success('Financial agreement uploaded successfully!', { id: uploadToastId });
          localStorage.removeItem('tempFinancialAgreement');
        } catch (uploadErr) {
          toast.error(uploadErr.response?.data?.message || uploadErr.message || 'File upload failed', { id: uploadToastId });
          throw uploadErr; // Re-throw to prevent navigation
        }
      }

      router.push('/register/commercial-both-registration/step-three');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const uploadButtonClass = `${uploadButtonStyle} ${file && !uploading ? 'bg-[#039994]' : 'bg-gray-400 cursor-not-allowed'}`;

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <Loader />
        </div>
      )}

      {/* Request Finance Type Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Finance Type</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finance Type Name
              </label>
              <input
                type="text"
                value={requestedFinanceTypeName}
                onChange={(e) => setRequestedFinanceTypeName(e.target.value)}
                placeholder="Enter finance type name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestedFinanceTypeName('');
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={requestingFinanceType}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestFinanceType}
                disabled={requestingFinanceType}
                className="flex-1 px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028882] disabled:opacity-50"
              >
                {requestingFinanceType ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={mainContainer}>
        <div className={headingContainer}>
          <div className={backArrow} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h1 className={pageTitle}>Finance &amp; Installer information</h1>
        </div>

        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>02/03</span>
        </div>

        <div className={formWrapper}>
          {/* Finance Type - Required */}
          <div>
            <label className={labelClass}>
              Finance type <span className="text-red-500">*</span>
            </label>
            <select
              value={financeType}
              onChange={(e) => {
                setFinanceType(e.target.value);
                setFinanceCompany('');
                setFile(null);
                setUploadSuccess(false);
              }}
              className={selectClass}
              required
              disabled={loadingFinanceTypes}
            >
              <option value="">
                {loadingFinanceTypes ? 'Loading finance types...' : 'Choose type'}
              </option>
              {financeTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="text-[#039994] text-sm hover:underline"
              >
                Finance Type not listed?
              </button>
            </div>
          </div>

          {/* Finance Company - Conditionally Required */}
          {showFinanceCompany && (
            <div>
              <label className={labelClass}>
                Finance company <span className="text-red-500">*</span>
              </label>
              <select
                value={financeCompany}
                onChange={(e) => setFinanceCompany(e.target.value)}
                className={selectClass}
                required={showFinanceCompany}
              >
                <option value="">Choose company</option>
                <option value="company1">Company 1</option>
                <option value="company2">Company 2</option>
                <option value="company3">Company 3</option>
                <option value="others">Others</option>
                <option value="n/a">N/A</option>
              </select>
            </div>
          )}

          {/* Financial Agreement - Conditionally Required */}
          {showUploadField && (
            <div>
              <label className={uploadHeading}>
                Upload Finance Agreement <span className="text-red-500">*</span>
              </label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  {file ? file.name : 'Choose file...'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required={showUploadField}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <span className={uploadIconContainer}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.5 12.5l7-7a2.121 2.121 0 013 3L10 17a4 4 0 01-5.657-5.657l7-7"
                      />
                    </svg>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={uploadButtonClass}
                >
                  {uploading ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 animate-spin text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : uploadSuccess ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
              <p className={uploadNoteStyle}>
                Required for all finance types except Cash (PDF, JPEG, PNG, Word)
              </p>
            </div>
          )}

          {/* Installer - Optional */}
          <div>
            <label className={labelClass}>
              Select installer <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <select
              value={installer}
              onChange={(e) => {
                setInstaller(e.target.value);
                setCustomInstaller('');
              }}
              className={selectClass}
              disabled={loadingInstallers}
            >
              <option value="">
                {loadingInstallers ? 'Loading installers...' : 'Choose installer'}
              </option>
              {installers.map((installerItem) => (
                <option key={installerItem.id} value={installerItem.name}>
                  {installerItem.name}
                </option>
              ))}
              <option value="others">Others</option>
              <option value="unknown">Don't know</option>
            </select>
          </div>

          {/* Custom Installer Input - Conditionally Shown */}
          {showCustomInstaller && (
            <div>
              <label className={labelClass}>
                Installer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your installer name"
                value={customInstaller}
                onChange={(e) => setCustomInstaller(e.target.value)}
                className={inputClass}
                required={showCustomInstaller}
              />
            </div>
          )}

          {/* System Size & COD - Both Optional */}
          <div className={rowWrapper}>
            <div className={halfWidth}>
              <label className={labelClass}>
                System Size <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Input system size (watch video guide)"
                value={systemSize}
                onChange={(e) => setSystemSize(e.target.value)}
                className={`${inputClass} ${grayPlaceholder}`}
              />
            </div>
            <div className={halfWidth}>
              <label className={labelClass}>
                COD <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Input COD (watch video guide)"
                value={cod}
                onChange={(e) => setCOD(e.target.value)}
                className={`${inputClass} ${grayPlaceholder}`}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button onClick={handleNext} className={buttonPrimary}>
            Next
          </button>
        </div>

        <div className={termsTextContainer}>
          By clicking 'Next', you agree to our{' '}
          <a href="/terms" className="text-[#039994] font-[800] underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#039994] font-[800] underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}