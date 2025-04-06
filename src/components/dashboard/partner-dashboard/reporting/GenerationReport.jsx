import React, { useState } from 'react';
import FilterModal from './CustomerReportFilterModal';
import ExportModal from './CustomerReportExportModal';
import ExportSuccessModal from './CustomerReportExportSuccessModal';

const GenerationReport = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const openFilterModal = () => setIsFilterOpen(true);
  const closeFilterModal = () => setIsFilterOpen(false);

  const openExportModal = () => setIsExportOpen(true);
  const closeExportModal = () => setIsExportOpen(false);

  const openSuccessModal = () => {
    setIsExportOpen(false);
    setIsSuccessOpen(true);
  };
  const closeSuccessModal = () => setIsSuccessOpen(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generation Report</h2>
        <div className="space-x-2">
          <button
            onClick={openFilterModal}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Filter By
          </button>
          <button
            onClick={openExportModal}
            className="px-4 py-2 rounded bg-[#039994] hover:bg-[#027671] text-white"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Example table for the Generation Report */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Customer ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Zipcode</th>
              <th className="px-4 py-2 text-left">Customer Type</th>
              <th className="px-4 py-2 text-left">Generation (MWh)</th>
              <th className="px-4 py-2 text-left">Commission Earned</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-2">Serial ID</td>
                <td className="px-4 py-2">Name</td>
                <td className="px-4 py-2">Street Address</td>
                <td className="px-4 py-2">900109</td>
                <td className="px-4 py-2">
                  {index % 2 === 0 ? 'Resi. Group' : 'Commercial'}
                </td>
                <td className="px-4 py-2">20.0</td>
                <td className="px-4 py-2">$750</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && <FilterModal onClose={closeFilterModal} />}

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal
          onClose={closeExportModal}
          onExportSuccess={openSuccessModal}
        />
      )}

      {/* Export Success Modal */}
      {isSuccessOpen && <ExportSuccessModal onClose={closeSuccessModal} />}
    </div>
  );
};

export default GenerationReport;
