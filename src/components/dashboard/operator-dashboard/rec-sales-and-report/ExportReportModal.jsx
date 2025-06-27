import React from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { inputClass, labelClass, buttonPrimary } from './styles';

const ExportReportModal = ({ 
  isOpen, 
  onClose, 
  exportRange, 
  setExportRange, 
  exportCustomStart, 
  setExportCustomStart, 
  exportCustomEnd, 
  setExportCustomEnd, 
  onExport 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Export REC Sales Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className={labelClass}>Export Range</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="exportAll"
                  name="exportRange"
                  value="all"
                  checked={exportRange === 'all'}
                  onChange={() => setExportRange('all')}
                  className="h-4 w-4 text-[#039994] focus:ring-[#039994]"
                />
                <label htmlFor="exportAll" className="ml-2 text-sm text-gray-700">
                  All data
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="export3Months"
                  name="exportRange"
                  value="3months"
                  checked={exportRange === '3months'}
                  onChange={() => setExportRange('3months')}
                  className="h-4 w-4 text-[#039994] focus:ring-[#039994]"
                />
                <label htmlFor="export3Months" className="ml-2 text-sm text-gray-700">
                  Last 3 months
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="exportCustom"
                  name="exportRange"
                  value="custom"
                  checked={exportRange === 'custom'}
                  onChange={() => setExportRange('custom')}
                  className="h-4 w-4 text-[#039994] focus:ring-[#039994]"
                />
                <label htmlFor="exportCustom" className="ml-2 text-sm text-gray-700">
                  Custom range
                </label>
              </div>
            </div>
          </div>
          {exportRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="customStart" className={labelClass}>
                  Start Date
                </label>
                <input
                  type="date"
                  id="customStart"
                  value={exportCustomStart}
                  onChange={(e) => setExportCustomStart(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="customEnd" className={labelClass}>
                  End Date
                </label>
                <input
                  type="date"
                  id="customEnd"
                  value={exportCustomEnd}
                  onChange={(e) => setExportCustomEnd(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end p-4 border-t space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onExport}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${buttonPrimary}`}
            disabled={exportRange === 'custom' && (!exportCustomStart || !exportCustomEnd)}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;