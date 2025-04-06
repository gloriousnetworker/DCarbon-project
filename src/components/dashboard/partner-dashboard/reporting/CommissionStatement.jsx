import React, { useState } from 'react';
import FilterModal from './CustomerReportFilterModal';
import ExportModal from './CustomerReportExportModal';
import ExportSuccessModal from './CustomerReportExportSuccessModal';

const CommissionStatement = () => {
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
        <h2 className="text-xl font-semibold">Commission Statement</h2>
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

      {/* Example Commission Statement Summary */}
      <div className="border border-gray-200 rounded p-4 bg-gray-50">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Billing to</h3>
          <p>DCarbon Solutions, Inc.</p>
          <p>8 The Green, STE A, Dover DE, 19901</p>
          <p>support@dcarbon.solutions</p>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>Total Active Commercial Generators</span>
            <span>200</span>
          </li>
          <li className="flex justify-between">
            <span>Total Active Resi. Groups</span>
            <span>200</span>
          </li>
          <li className="flex justify-between">
            <span>Total Active MWh (Commercial)</span>
            <span>20.0 MWh</span>
          </li>
          <li className="flex justify-between">
            <span>Total Active MWh (Residential)</span>
            <span>20.0 MWh</span>
          </li>
          <li className="flex justify-between">
            <span>Total Commercial MWh</span>
            <span>20.0 MWh</span>
          </li>
          <li className="flex justify-between">
            <span>Total Residential MWh</span>
            <span>20.0 MWh</span>
          </li>
          <li className="flex justify-between">
            <span>Total TREC Sold (Commercial)</span>
            <span>150 TREC</span>
          </li>
          <li className="flex justify-between">
            <span>Total TREC Sold (Residential)</span>
            <span>50 TREC</span>
          </li>
          <li className="flex justify-between">
            <span>Avg. $/TREC/Price</span>
            <span>$15/TREC</span>
          </li>
          <li className="flex justify-between">
            <span>Avg. Commission % (Commercial)</span>
            <span>2%</span>
          </li>
          <li className="flex justify-between">
            <span>Avg. Commission % (Residential)</span>
            <span>3%</span>
          </li>
          <li className="flex justify-between font-semibold">
            <span>Total Commission Payable</span>
            <span>$200.00</span>
          </li>
        </ul>
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

export default CommissionStatement;
