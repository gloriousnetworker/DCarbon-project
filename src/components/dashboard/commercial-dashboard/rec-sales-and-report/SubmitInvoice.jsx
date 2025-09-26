import React, { useState, useEffect } from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const mainContainer = "flex items-center justify-center min-h-screen p-4";
const headingContainer = "flex items-center mb-6";
const backArrow = "mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors";
const pageTitle = "text-2xl font-bold text-gray-800";
const formWrapper = "bg-white p-8 rounded-xl shadow-lg w-full";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
const disabledInputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed";
const selectClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
const rowWrapper = "flex flex-wrap -mx-2 mb-4";
const halfWidth = "w-full md:w-1/2 px-2 mb-4 md:mb-0";
const buttonPrimary = "w-full bg-green-900 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed";

const generateInvoiceNumber = (year, quarter) => {
  const timestamp = Date.now().toString().slice(-8);
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

const SubmitInvoice = ({ onBack }) => {
  const [formData, setFormData] = useState({
    quarter: '',
    year: '',
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    amount: '',
    description: '',
    invoiceDocument: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    
    if (!formData.invoiceDocument.trim()) {
      alert('Please provide the invoice document URL');
      return;
    }

    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        alert('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        userId: userId,
        quarter: parseInt(formData.quarter),
        year: parseInt(formData.year),
        invoiceNo: formData.invoiceNumber,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount),
        description: formData.description,
        invoiceDocument: formData.invoiceDocument
      };

      const response = await fetch('https://services.dcarbon.solutions/api/quarterly-statements/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setShowSuccess(true);
        setFormData({
          quarter: formData.quarter,
          year: formData.year,
          invoiceNumber: generateInvoiceNumber(formData.year, formData.quarter),
          issueDate: '',
          dueDate: '',
          amount: '',
          description: '',
          invoiceDocument: ''
        });
        
        setTimeout(() => {
          setShowSuccess(false);
          if (onBack) {
            onBack();
          }
        }, 3000);
      } else {
        alert(result.message || 'Failed to submit invoice. Please try again.');
      }
    } catch (error) {
      console.error('Invoice submission error:', error);
      alert('An error occurred while submitting the invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={mainContainer}>
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Success!</h2>
            <p className="text-green-700">Invoice submitted successfully</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={mainContainer}>
      <div className="w-full max-w-2xl mx-auto">
        <div className={headingContainer}>
          <button onClick={onBack} className={backArrow}>
            <HiOutlineArrowLeft className="h-6 w-6" />
          </button>
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

          <div className="mb-4">
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

          <div className={rowWrapper}>
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
          </div>

          <div className="mb-4">
            <label className={labelClass}>Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={inputClass}
              step="0.01"
              min="0"
              required
            />
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
            <label className={labelClass}>Invoice Document URL</label>
            <input
              type="url"
              name="invoiceDocument"
              value={formData.invoiceDocument}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="https://example.com/invoice.pdf"
              required
            />
          </div>

          <button 
            onClick={handleSubmit} 
            className={buttonPrimary}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitInvoice;