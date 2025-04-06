import React from 'react';

const ExportModal = ({ onClose, onExportSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-5">
        <h2 className="text-lg font-semibold mb-3">Export Report</h2>
        <h3 className="text-sm font-medium mb-5 text-gray-600">Filter by</h3>

        <div className="space-y-6">
          {/* Progress Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">By Progress Status:</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#039994] rounded border-gray-300"
                defaultChecked
              />
              <span className="text-sm">Pending</span>
            </label>
          </div>

          {/* Customer Type */}
          <div>
            <h4 className="text-sm font-medium mb-3">By Customer Type:</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#039994] rounded border-gray-300"
                defaultChecked
              />
              <span className="text-sm">Residential</span>
            </label>
          </div>

          {/* Document Type */}
          <div>
            <h4 className="text-sm font-medium mb-3">Choose document type</h4>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>

          {/* Page Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">Page to export</h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                All pages
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Current
              </button>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Select Pages
                </button>
                <span className="text-sm text-gray-500">1-4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onExportSuccess}
            className="px-4 py-2 text-sm font-medium bg-[#039994] hover:bg-[#027671] text-white rounded"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;