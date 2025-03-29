import React, { useState } from 'react';

const PaymentModal = ({ onClose }) => {
  // Local states for demonstration (replace or remove as needed)
  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    // Logic for uploading invoiceFile
    console.log('Upload clicked for:', invoiceFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit or handle payout logic
    console.log({
      bank,
      accountType,
      accountNumber,
      invoiceFile,
    });
    onClose(); // Close modal after submission if desired
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg mx-4 p-6 rounded shadow">
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#FF0000] hover:opacity-80"
        >
          X
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-semibold text-[#039994] mb-4">Payout Setup</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Choose bank & Account type */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="w-full">
              <label className="block text-sm text-gray-600 mb-1">Choose bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
              >
                <option value="">None</option>
                <option value="Bank A">Bank A</option>
                <option value="Bank B">Bank B</option>
                <option value="Bank C">Bank C</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm text-gray-600 mb-1">Account type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
              >
                <option value="">Choose type</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
          </div>

          {/* Row 2: Account Number */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Number</label>
            <input
              type="text"
              placeholder="Input number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>

          {/* Row 3: Account Name (read-only or pre-filled) */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Name</label>
            <input
              type="text"
              value="Bright Awele"
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 focus:outline-none"
            />
          </div>

          {/* Row 4: Upload Invoice */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Upload Invoice</label>
            <div className="flex items-center space-x-2">
              {/* File input (hidden) + text field to show chosen file name */}
              <div className="flex-1">
                <input
                  type="file"
                  id="invoiceFile"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="invoiceFile"
                  className="block w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100"
                >
                  {invoiceFile ? invoiceFile.name : 'Choose file...'}
                </label>
              </div>
              <button
                type="button"
                onClick={handleUploadClick}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[#039994] text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
            >
              Request Payout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
