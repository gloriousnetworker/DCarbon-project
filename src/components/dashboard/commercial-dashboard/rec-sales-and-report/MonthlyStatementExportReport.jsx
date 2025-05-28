import React, { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const MonthlyStatementExportReport = ({ onClose, data, periodType, selectedPeriod }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeFacilities, setIncludeFacilities] = useState(true);
  const [includeSales, setIncludeSales] = useState(true);

  const handleExport = () => {
    // In a real implementation, this would generate and download the report
    console.log(`Exporting as ${exportFormat} with:
      Period: ${periodType === 'monthly' ? selectedPeriod.month : selectedPeriod.year}
      Include Details: ${includeDetails}
      Include Facilities: ${includeFacilities}
      Include Sales: ${includeSales}
    `);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 font-sfpro">Export Monthly Statement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">Export Format</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                />
                <span className="ml-2 font-sfpro">PDF</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                />
                <span className="ml-2 font-sfpro">CSV</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">Content to Include</label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#039994] focus:ring-[#039994]"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 font-sfpro">User Details and REC Summary</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#039994] focus:ring-[#039994]"
                  checked={includeFacilities}
                  onChange={(e) => setIncludeFacilities(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 font-sfpro">Facilities List</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#039994] focus:ring-[#039994]"
                  checked={includeSales}
                  onChange={(e) => setIncludeSales(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 font-sfpro">Sales Transactions</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
            >
              Export Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatementExportReport;