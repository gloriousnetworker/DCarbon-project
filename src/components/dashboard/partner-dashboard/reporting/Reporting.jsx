import React, { useState } from 'react';
import CustomerReport from './CustomerReport';
import GenerationReport from './GenerationReport';
import CommissionStatement from './CommissionStatement';

const Reporting = () => {
  // The currently selected report. Default: 'customer'
  const [selectedReport, setSelectedReport] = useState('customer');

  // Handler for changing the dropdown
  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Header and Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label htmlFor="reportType" className="mr-2 font-semibold text-gray-700">
            Select Report:
          </label>
          <select
            id="reportType"
            value={selectedReport}
            onChange={handleReportChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            <option value="customer">Customer Report</option>
            <option value="generation">Generation Report</option>
            <option value="commission">Commission Statement</option>
          </select>
        </div>
      </div>

      {/* Render the selected report */}
      {selectedReport === 'customer' && <CustomerReport />}
      {selectedReport === 'generation' && <GenerationReport />}
      {selectedReport === 'commission' && <CommissionStatement />}
    </div>
  );
};

export default Reporting;
