import React, { useState } from 'react';
import {
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

// Import your newly created modals
import FilterModal from './FilterModal';
import ExportReportModal from './ExportReportModal';

// Import style constants from styles.js
import {
  mainContainer,
  headingContainer,
  pageTitle,
  selectClass,
  buttonPrimary,
} from './styles';

const RECSalesAndReport = () => {
  // Example table data (replace with your own or fetch dynamically)
  const tableData = [
    {
      sn: 1,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Pending',
    },
    {
      sn: 2,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 3,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 4,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 5,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Pending',
    },
    {
      sn: 6,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 7,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 8,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    {
      sn: 9,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Pending',
    },
    {
      sn: 10,
      recId: 'REC ID',
      facilityId: 'Facility ID',
      recGen: 1,
      recSold: 1,
      avgPrice: '$10.00',
      totalPrice: '$10.00',
      date: '16-03-2025',
      status: 'Successful',
    },
    // Add any "Failed" entry if you want to test the "Failed" color
  ];

  // For demo purposes, these can be your pagination states
  const currentPage = 1;
  const totalPages = 4;

  // Modal open states
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  const openFilterModal = () => setFilterOpen(true);
  const closeFilterModal = () => setFilterOpen(false);

  const openExportModal = () => setExportOpen(true);
  const closeExportModal = () => setExportOpen(false);

  // Status color logic (text-only, no backgrounds)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Successful':
        return 'text-[#039994]'; // green text
      case 'Pending':
        return 'text-[#FFB200]'; // orange text
      case 'Failed':
        return 'text-[#FF0000]'; // red text
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`${mainContainer} bg-white p-6 rounded-lg shadow w-full`}>
      {/* Header Section */}
      <div className={`${headingContainer} flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4`}>
        {/* Title with #039994 color */}
        <h2 className={pageTitle} style={{ color: '#039994' }}>
          REC Sales
        </h2>

        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          {/* Filter Button */}
          <button
            type="button"
            onClick={openFilterModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-md"
          >
            <HiOutlineFilter className="mr-2" />
            Filter by
            <HiOutlineChevronDown className="ml-2" />
          </button>
          {/* Export Button */}
          <button
            type="button"
            onClick={openExportModal}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${buttonPrimary}`}
          >
            <HiOutlineDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">S/N</th>
              <th scope="col" className="px-4 py-3">REC ID</th>
              <th scope="col" className="px-4 py-3">Facility ID</th>
              <th scope="col" className="px-4 py-3">RECs Gen.</th>
              <th scope="col" className="px-4 py-3">RECs Sold</th>
              <th scope="col" className="px-4 py-3">Av. Price/REC</th>
              <th scope="col" className="px-4 py-3">Total Price</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.sn}</td>
                <td className="px-4 py-3">{item.recId}</td>
                <td className="px-4 py-3">{item.facilityId}</td>
                <td className="px-4 py-3">{item.recGen}</td>
                <td className="px-4 py-3">{item.recSold}</td>
                <td className="px-4 py-3">{item.avgPrice}</td>
                <td className="px-4 py-3">{item.totalPrice}</td>
                <td className="px-4 py-3">{item.date}</td>
                <td className={`px-4 py-3 font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <HiOutlineChevronLeft className="mr-1" />
            Previous
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
            <HiOutlineChevronRight className="ml-1" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <FilterModal isOpen={isFilterOpen} onClose={closeFilterModal} />
      <ExportReportModal isOpen={isExportOpen} onClose={closeExportModal} />
    </div>
  );
};

export default RECSalesAndReport;
