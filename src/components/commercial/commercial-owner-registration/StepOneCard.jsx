'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  spinner,
  termsTextContainer,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle
} from './styles.js';

// List of finance types that require document upload
const documentRequiredTypes = ['loan', 'ppa', 'lease'];

/**
 * Helper to convert a Base64 data URL to a File object.
 */
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid dataURL');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [installer, setInstaller] = useState('');
  const [systemSize, setSystemSize] = useState('');
  const [cod, setCOD] = useState('');
  const [file, setFile] = useState(null);

  const router = useRouter();

  // Determine if the upload field should be rendered based on finance type.
  const showUploadField =
    documentRequiredTypes.includes(financeType.toLowerCase());

  // Called when a file is selected.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadSuccess(false);
    // Optionally, clear any previously stored file in local storage.
    localStorage.removeItem('tempFinancialAgreement');
  };

  /**
   * Instead of immediately uploading to the server,
   * read the file as a Base64 string and store it in localStorage.
   */
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem('tempFinancialAgreement', base64data);
        toast.success('File Upload Successful. Proceed to submit financial Information.');
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

  /**
   * When the user clicks Next, first create/update the financial info.
   * Then if a document is required, retrieve the locally stored file,
   * convert it back to a File and upload it.
   */
  const handleNext = async () => {
    // Validate required fields.
    if (!financeType || !financeCompany) {
      toast.error('Please fill in all required fields: Finance type and Finance company');
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (!userId || !token) {
        throw new Error('User ID or token not found in local storage');
      }

      // If a document is required, ensure a file is selected and stored.
      if (showUploadField) {
        if (!file) {
          toast.error('Please choose a file for your financial agreement');
          setLoading(false);
          return;
        }
        if (!uploadSuccess) {
          // Attempt to store the file if not already done.
          await handleUpload();
          // If still not successful, exit.
          if (!uploadSuccess) {
            setLoading(false);
            return;
          }
        }
      }

      // Create the payload for the financial information.
      const payload = {
        financialType: financeType,
        financeCompany: financeCompany,
        installer,
        systemSize,
        cod,
      };

      const infoUrl = `https://dcarbon-server.onrender.com/api/user/financial-info/${userId}`;
      await axios.put(infoUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Financial information updated successfully');

      // If a document is required, retrieve the stored file and upload it.
      if (showUploadField) {
        const base64data = localStorage.getItem('tempFinancialAgreement');
        if (!base64data) {
          toast.error('Stored file data is missing. Please re-upload the file.');
          setLoading(false);
          return;
        }
        // Convert the Base64 string back into a File.
        const fileToUpload = dataURLtoFile(base64data, file.name);
        const formData = new FormData();
        formData.append('financialAgreement', fileToUpload);

        const uploadUrl = `https://dcarbon-server.onrender.com/api/user/update-financial-agreement/${userId}`;
        await axios.put(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Financial agreement uploaded successfully');
        // Optionally, clear the temporary storage after successful upload.
        localStorage.removeItem('tempFinancialAgreement');
      }

      // Redirect to the next step.
      router.push('/register/commercial-owner-registration/step-two');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        'Operation failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Construct a conditional class for the Upload button.
  // When a file has been chosen and it is not uploading, turn the button green.
  const uploadButtonClass = `${uploadButtonStyle} ${file && !uploading ? 'bg-[#039994] hover:bg-[#039994]' : 'bg-gray-400 cursor-not-allowed'}`;

  return (
    <>
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Loading Spinner Overlay */}
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner} />
        </div>
      )}

      <div className={mainContainer}>
        {/* Heading + Back Arrow */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <h1 className={pageTitle}>Finance &amp; Installer information</h1>
        </div>

        {/* Progress bar */}
        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>02/03</span>
        </div>

        {/* Form Container */}
        <div className={formWrapper}>
          {/* Finance Type */}
          <div>
            <label className={labelClass}>Finance type</label>
            <select
              value={financeType}
              onChange={(e) => {
                setFinanceType(e.target.value);
                // Reset file fields when finance type changes.
                setFile(null);
                setUploadSuccess(false);
                localStorage.removeItem('tempFinancialAgreement');
              }}
              className={selectClass}
            >
              <option value="">Choose type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company */}
          <div>
            <label className={labelClass}>Finance company</label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose company</option>
              <option value="company1">Company 1</option>
              <option value="company2">Company 2</option>
              <option value="company3">Company 3</option>
              <option value="others">Others</option>
              <option value="n/a">N/A</option>
            </select>
          </div>

          {/* Conditionally Render the Upload Finance Agreement field */}
          {showUploadField && (
            <div>
              <label className={uploadHeading}>
                Upload Finance Agreement (Optional)
              </label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  {file ? file.name : 'Choose file...'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
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
                Note: You will need to upload a Finance Agreement to approve any transactions.
              </p>
            </div>
          )}

          {/* Select Installer */}
          <div>
            <label className={labelClass}>Select installer</label>
            <select
              value={installer}
              onChange={(e) => setInstaller(e.target.value)}
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

          {/* System Size & COD Row */}
          <div className={rowWrapper}>
            <div className={halfWidth}>
              <label className={labelClass}>Select System Size</label>
              <input
                type="text"
                placeholder="Input system size"
                value={systemSize}
                onChange={(e) => setSystemSize(e.target.value)}
                className={`${inputClass} bg-[#E8E8E8]`}
              />
            </div>
            <div className={halfWidth}>
              <label className={labelClass}>COD</label>
              <input
                type="text"
                placeholder="Input COD"
                value={cod}
                onChange={(e) => setCOD(e.target.value)}
                className={`${inputClass} bg-[#E8E8E8]`}
              />
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button onClick={handleNext} className={buttonPrimary}>
            Next
          </button>
        </div>

        {/* Terms & Privacy */}
        <div className={termsTextContainer}>
          By clicking on ‘Next’, you agree to our{' '}
          <a href="/terms" className="text-[#039994] font-[800] underline">
            Terms and Conditions
          </a>{' '}
          &amp;{' '}
          <a href="/privacy" className="text-[#039994] font-[800] underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}
