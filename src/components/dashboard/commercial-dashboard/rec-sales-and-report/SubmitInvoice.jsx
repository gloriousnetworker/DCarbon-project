import React, { useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineUpload } from 'react-icons/hi';

const mainContainer = "flex items-center justify-center min-h-screen p-4";
const headingContainer = "flex items-center mb-6";
const backArrow = "mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors";
const pageTitle = "text-2xl font-bold text-gray-800";
const formWrapper = "bg-white p-8 rounded-xl shadow-lg w-full";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
const rowWrapper = "flex flex-wrap -mx-2 mb-4";
const halfWidth = "w-full md:w-1/2 px-2 mb-4 md:mb-0";
const uploadHeading = "block text-sm font-medium text-gray-700 mb-2";
const uploadFieldWrapper = "flex items-center border border-gray-300 rounded-lg overflow-hidden";
const uploadInputLabel = "flex-grow px-4 py-2 text-gray-600 truncate cursor-pointer";
const uploadIconContainer = "inline-flex items-center justify-center ml-2";
const uploadButtonStyle = "px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors border-l border-gray-300";
const uploadNoteStyle = "text-xs text-gray-500 mt-2";
const buttonPrimary = "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-6";

const SubmitInvoice = ({ onBack }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    amount: '',
    description: '',
    file: null
  });

  const [fileName, setFileName] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Invoice submitted:', formData);
    alert('Invoice submitted successfully!');
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className={mainContainer}>
      <div className="w-full max-w-2xl mx-auto">
        <div className={headingContainer}>
          <button onClick={onBack} className={backArrow}>
            <HiOutlineArrowLeft className="h-6 w-6" />
          </button>
          <h1 className={pageTitle}>Submit Invoice</h1>
        </div>

        <form onSubmit={handleSubmit} className={formWrapper}>
          <div className={rowWrapper}>
            <div className={halfWidth}>
              <label className={labelClass}>Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div className={halfWidth}>
              <label className={labelClass}>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className={rowWrapper}>
            <div className={halfWidth}>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div className={halfWidth}>
              <label className={labelClass}>Amount ($)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={inputClass}
              rows="3"
              required
            />
          </div>

          <div className="mb-6">
            <label className={uploadHeading}>Upload Invoice Document</label>
            <div className={uploadFieldWrapper}>
              <label className={uploadInputLabel}>
                {fileName || 'Choose file...'}
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <div className={uploadIconContainer}>
                  <HiOutlineUpload className="h-5 w-5" />
                </div>
              </label>
              <button 
                type="button" 
                onClick={triggerFileInput}
                className={uploadButtonStyle}
              >
                Browse
              </button>
            </div>
            <p className={uploadNoteStyle}>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
          </div>

          <button type="submit" className={buttonPrimary}>
            Submit Invoice
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitInvoice;