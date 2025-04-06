import React, { useState } from 'react';
import FilterModal from './CustomerReportFilterModal';
import ExportModal from './CustomerReportExportModal';
import ExportSuccessModal from './CustomerReportExportSuccessModal';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const CustomerReport = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Sample data matching the uploaded image
  const customerData = [
    { id: 1, status: 'Terminated', type: 'Residential' },
    { id: 2, status: 'Invited', type: 'Commercial' },
    { id: 3, status: 'Registered', type: 'Commercial' },
    { id: 4, status: 'Terminated', type: 'Resi. Group' },
    { id: 5, status: 'Registered', type: 'Commercial' },
    { id: 6, status: 'Active', type: 'Commercial' },
    { id: 7, status: 'Active', type: 'Resi. Group' },
    { id: 8, status: 'Invited', type: 'Commercial' },
    { id: 9, status: 'Active', type: 'Resi. Group' },
    { id: 10, status: 'Registered', type: 'Resi. Group' },
  ];

  // Status badge styling
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Terminated': return 'bg-[#FF0000]';
      case 'Invited': return 'bg-[#FFB200]';
      case 'Registered': return 'bg-[#000000]';
      case 'Active': return 'bg-[#00B4AE]';
      default: return 'bg-gray-500';
    }
  };

  // Handlers
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
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Year</span>
          <button className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
            2025
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={openFilterModal}
            className="px-4 py-2 rounded border border-[#039994] text-[#039994] hover:bg-[#039994]/10"
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

      {/* Report Heading */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold">Customer Report</h2>
        <ChevronDownIcon className="w-5 h-5 text-[#039994]" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {['S/N', 'Name', 'Email Address', 'Customer Type', 'Utility Provider', 'Address', 'Date Reg.', 'Cus. Status'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customerData.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3">{customer.id}</td>
                <td className="px-4 py-3">Name</td>
                <td className="px-4 py-3">name@domain..</td>
                <td className="px-4 py-3">{customer.type}</td>
                <td className="px-4 py-3">Utility</td>
                <td className="px-4 py-3">Address</td>
                <td className="px-4 py-3">16-03-2025</td>
                <td className="px-4 py-3">
                  <span className={`${getStatusStyle(customer.status)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white`}>
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end items-center gap-4">
        <button className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
          Previous
        </button>
        <span className="text-gray-600">1 of 4</span>
        <button className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
          Next &gt;
        </button>
      </div>

      {/* Modals */}
      {isFilterOpen && <FilterModal onClose={closeFilterModal} />}
      {isExportOpen && <ExportModal onClose={closeExportModal} onExportSuccess={openSuccessModal} />}
      {isSuccessOpen && <ExportSuccessModal onClose={closeSuccessModal} />}
    </div>
  );
};

export default CustomerReport;