'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import styles from styles.js
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
  rowWrapper,
  halfWidth,
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

export default function StepThreeCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Toggles to show/hide edit cards
  const [showFinanceEdit, setShowFinanceEdit] = useState(false);
  const [showUtilityEdit, setShowUtilityEdit] = useState(false);

  // Finance fields
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [installer, setInstaller] = useState('');
  const [customInstaller, setCustomInstaller] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const [cod, setCOD] = useState('');
  const [file, setFile] = useState(null);
  const [financeAgreement, setFinanceAgreement] = useState('');

  // Utility fields
  const [utilityProvider, setUtilityProvider] = useState('');
  const [utilityDetails, setUtilityDetails] = useState('');

  // List of finance types that require document upload
  const documentRequiredTypes = ['loan', 'ppa', 'lease'];
  const showUploadField = documentRequiredTypes.includes(financeType.toLowerCase());
  const showFinanceCompany = financeType.toLowerCase() !== 'cash';
  const showCustomInstaller = installer === 'others';

  useEffect(() => {
    // Load financial info from local storage
    const financialInfo = JSON.parse(localStorage.getItem('financialInfoResponse'));
    if (financialInfo && financialInfo.data) {
      const { financialType, financeCompany, installer, systemSize, cod, financeAgreement } = financialInfo.data;
      setFinanceType(financialType || '');
      setFinanceCompany(financeCompany || '');
      setInstaller(installer || '');
      setSystemSize(systemSize || '');
      setCOD(cod || '');
      setFinanceAgreement(financeAgreement || '');
    }

    // Load utility info from local storage if available
    const utilityInfo = JSON.parse(localStorage.getItem('utilityInfoResponse'));
    if (utilityInfo && utilityInfo.data) {
      setUtilityProvider(utilityInfo.data.provider || '');
      setUtilityDetails(utilityInfo.data.details || '');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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
        setFinanceAgreement(file.name);
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

  const handleFinanceUpdate = async () => {
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

      // Save response to local storage
      localStorage.setItem('financialInfoResponse', JSON.stringify(infoResponse.data));

      // If document is required, upload it
      if (showUploadField && uploadSuccess) {
        const base64data = localStorage.getItem('tempFinancialAgreement');
        if (!base64data) throw new Error('File data not found');
        
        // Convert base64 to blob for upload
        const response = await fetch(base64data);
        const blob = await response.blob();
        const fileToUpload = new File([blob], file.name, { type: blob.type });

        const formData = new FormData();
        formData.append('financialAgreement', fileToUpload);

        const uploadResponse = await axios.put(
          `https://services.dcarbon.solutions/api/user/update-financial-agreement/${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Save upload response to local storage
        localStorage.setItem('financialAgreementResponse', JSON.stringify(uploadResponse.data));
        localStorage.removeItem('tempFinancialAgreement');
      }

      toast.success('Financial information updated successfully!');
      setShowFinanceEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    }
  };

  const handleUtilityUpdate = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      const payload = {
        provider: utilityProvider,
        details: utilityDetails
      };

      const response = await axios.put(
        `https://services.dcarbon.solutions/api/user/utility-info/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      localStorage.setItem('utilityInfoResponse', JSON.stringify(response.data));
      toast.success('Utility information updated successfully!');
      setShowUtilityEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed');
    }
  };

  const handleSubmit = () => {
    router.push('/register/residence-user-registration/agreement');
  };

  const uploadButtonClass = `${uploadButtonStyle} ${file && !uploading ? 'bg-[#039994]' : 'bg-gray-400 cursor-not-allowed'}`;

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      <div className={mainContainer}>
        <div className={headingContainer}>
          <div className={backArrow} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h1 className={pageTitle}>Account Summary</h1>
        </div>

        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>04/05</span>
        </div>

        <div className={formWrapper}>
          {/* FINANCE INFORMATION SECTION */}
          <div className="border border-gray-200 rounded-md p-4 shadow-sm bg-[#F5F5F5]">
            {/* Section Header with Edit button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#039994] font-normal">Finance Information</h2>
              <button
                onClick={() => setShowFinanceEdit(!showFinanceEdit)}
                className="text-[#039994] text-sm font-medium hover:underline"
              >
                {showFinanceEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Read-Only Finance Info (shown when NOT editing) */}
            {!showFinanceEdit && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Finance Type:</span>
                  <span className="ml-2 capitalize">{financeType || 'N/A'}</span>
                </div>
                {showFinanceCompany && (
                  <div className="flex justify-between">
                    <span className="font-medium">Finance Company:</span>
                    <span className="ml-2 uppercase">{financeCompany || 'N/A'}</span>
                  </div>
                )}
                {showUploadField && (
                  <div className="flex justify-between">
                    <span className="font-medium">Finance Agreement:</span>
                    <span className="ml-2">{financeAgreement || 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Installer:</span>
                  <span className="ml-2 capitalize">{installer || 'N/A'}</span>
                </div>
                {systemSize && (
                  <div className="flex justify-between">
                    <span className="font-medium">System Size:</span>
                    <span className="ml-2">{systemSize}</span>
                  </div>
                )}
                {cod && (
                  <div className="flex justify-between">
                    <span className="font-medium">COD:</span>
                    <span className="ml-2">{cod}</span>
                  </div>
                )}
              </div>
            )}

            {/* Editable Finance Card (shown when editing) */}
            {showFinanceEdit && (
              <div className="space-y-4">
                {/* Finance Type */}
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
                  >
                    <option value="">Choose type</option>
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                    <option value="ppa">PPA</option>
                    <option value="lease">Lease</option>
                  </select>
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
                      Required for loan, PPA, and lease agreements
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
                  >
                    <option value="">Choose installer</option>
                    <option value="installer1">Installer 1</option>
                    <option value="installer2">Installer 2</option>
                    <option value="installer3">Installer 3</option>
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
                      placeholder="Input system size"
                      value={systemSize}
                      onChange={(e) => setSystemSize(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className={halfWidth}>
                    <label className={labelClass}>
                      COD <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Input COD"
                      value={cod}
                      onChange={(e) => setCOD(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Save button for finance section */}
                <button
                  onClick={handleFinanceUpdate}
                  className={buttonPrimary}
                >
                  Save Finance Info
                </button>
              </div>
            )}
          </div>

          {/* UTILITY AUTHORIZATION SECTION */}
          <div className="border border-gray-200 rounded-md p-4 shadow-sm bg-[#F5F5F5]">
            {/* Section Header with Edit button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#039994] font-normal">Utility Authorization</h2>
              <button
                onClick={() => setShowUtilityEdit(!showUtilityEdit)}
                className="text-[#039994] text-sm font-medium hover:underline"
              >
                {showUtilityEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Read-Only Utility Info (shown when NOT editing) */}
            {!showUtilityEdit && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Utility Provider:</span>
                  <span className="ml-2">{utilityProvider || 'N/A'}</span>
                </div>
                <div>
                  <p className="font-medium">Utility Details:</p>
                  <p className="mt-1 whitespace-pre-line">{utilityDetails || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Editable Utility Card (shown when editing) */}
            {showUtilityEdit && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Utility Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={utilityProvider}
                    onChange={(e) => setUtilityProvider(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="Provider 1">Provider 1</option>
                    <option value="Provider 2">Provider 2</option>
                    <option value="Provider 3">Provider 3</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Utility Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={utilityDetails}
                    onChange={(e) => setUtilityDetails(e.target.value)}
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Save button for utility section */}
                <button
                  onClick={handleUtilityUpdate}
                  className={buttonPrimary}
                >
                  Save Utility Info
                </button>
              </div>
            )}
          </div>

          {/* NEXT BUTTON */}
          <button
            onClick={handleSubmit}
            className={buttonPrimary}
          >
            Next
          </button>

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
      </div>
    </>
  );
}