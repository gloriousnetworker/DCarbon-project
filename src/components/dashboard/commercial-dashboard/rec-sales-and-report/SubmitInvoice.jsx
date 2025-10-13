import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const formWrapper = 'w-full max-w-md space-y-6';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const disabledInputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400]';
const rowWrapper = 'flex space-x-4';
const halfWidth = 'w-1/2';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const uploadFieldWrapper = 'flex items-center space-x-3';
const uploadInputLabel = 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro';
const uploadIconContainer = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400';
const uploadButtonStyle = 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors disabled:opacity-50';
const noteText = 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      {message}
    </div>
  );
};

const generateInvoiceNumber = (year, quarter) => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const quarterStr = `Q${quarter}`;
  return `DCARBON-INV-${year}-${quarterStr}-${randomDigits}`;
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 3; i++) {
    years.push(i);
  }
  return years;
};

const SubmitInvoice = ({ onBack, onInvoiceSubmitted }) => {
  const [formData, setFormData] = useState({
    quarter: '',
    year: '',
    invoiceNumber: '',
    amount: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let currentQuarter = 1;
    if (currentMonth <= 3) currentQuarter = 1;
    else if (currentMonth <= 6) currentQuarter = 2;
    else if (currentMonth <= 9) currentQuarter = 3;
    else currentQuarter = 4;

    setFormData(prev => ({
      ...prev,
      year: currentYear.toString(),
      quarter: currentQuarter.toString()
    }));
  }, []);

  useEffect(() => {
    if (formData.year && formData.quarter) {
      const newInvoiceNumber = generateInvoiceNumber(formData.year, formData.quarter);
      setFormData(prev => ({ ...prev, invoiceNumber: newInvoiceNumber }));
    }
  }, [formData.year, formData.quarter]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileUrl('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    if (!formData.quarter || !formData.invoiceNumber) {
      showToast('Please select quarter and year first', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        showToast('Authentication required. Please log in.', 'error');
        setIsUploading(false);
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', selectedFile);

      const response = await fetch(`https://services.dcarbon.solutions/api/file-storage/upload/${formData.invoiceNumber}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadedFileUrl(result.data.url);
        showToast('File uploaded successfully', 'success');
      } else {
        showToast(result.message || 'Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('File upload error:', error);
      showToast('An error occurred while uploading the file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.quarter || !formData.year || !formData.amount) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!uploadedFileUrl) {
      showToast('Please upload an invoice document first', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        showToast('Authentication required. Please log in.', 'error');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        userId: userId,
        amount: parseFloat(formData.amount),
        userType: 'COMMERCIAL',
        invoiceId: uploadedFileUrl
      };

      const response = await fetch('https://services.dcarbon.solutions/api/payout-request/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        showToast('Invoice submitted successfully', 'success');
        
        if (onInvoiceSubmitted) {
          onInvoiceSubmitted(formData.amount);
        }
        
        setFormData({
          quarter: formData.quarter,
          year: formData.year,
          invoiceNumber: generateInvoiceNumber(formData.year, formData.quarter),
          amount: ''
        });
        setSelectedFile(null);
        setUploadedFileUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setTimeout(() => {
          if (onBack) {
            onBack();
          }
        }, 2000);
      } else {
        showToast(result.message || 'Failed to submit invoice', 'error');
      }
    } catch (error) {
      console.error('Invoice submission error:', error);
      showToast('An error occurred while submitting the invoice', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {(isLoading || isUploading) && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className={mainContainer}>
        <div className="w-full max-w-md">
          <div className={headingContainer}>
            {onBack && (
              <button onClick={onBack} className={backArrow}>
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className={pageTitle}>Submit Invoice</h1>
          </div>

          <div className={formWrapper}>
            <div className={rowWrapper}>
              <div className={halfWidth}>
                <label className={labelClass}>Quarter</label>
                <select
                  name="quarter"
                  value={formData.quarter}
                  onChange={handleInputChange}
                  className={selectClass}
                  required
                >
                  <option value="">Select Quarter</option>
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </div>
              <div className={halfWidth}>
                <label className={labelClass}>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={selectClass}
                  required
                >
                  <option value="">Select Year</option>
                  {getYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                className={disabledInputClass}
                readOnly
                disabled
              />
            </div>

            <div>
              <label className={labelClass}>Amount ($)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={inputClass}
                step="0.01"
                min="0"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Invoice Document</label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : 'Choose file...'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <div className={uploadIconContainer}>
                    <Upload size={16} />
                  </div>
                </label>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className={uploadButtonStyle}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadedFileUrl && (
                <p className={noteText}>
                  ✓ File uploaded successfully
                </p>
              )}
              <p className={noteText}>
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>

            <button 
              onClick={handleSubmit} 
              className={buttonPrimary}
              disabled={isLoading || !uploadedFileUrl}
            >
              {isLoading ? 'Submitting...' : 'Submit Invoice'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SubmitInvoice;