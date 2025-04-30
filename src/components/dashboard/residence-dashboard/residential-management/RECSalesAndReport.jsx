import React, { useState } from 'react';
import {
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import FilterModal from './FilterModal';
import ExportReportModal from './ExportReportModal';
import {
  mainContainer,
  headingContainer,
  pageTitle,
  buttonPrimary,
} from './styles';

const RECSalesAndReport = () => {
  const tableData = [
    {
      generatorId: 'W23135',
      reportingUnitId: 'W23135',
      vintage: 'Mar-25',
      startDate: '01/01/2025',
      endDate: '03/31/2025',
      totalMWh: '0.0524',
    },
    {
      generatorId: 'W23134',
      reportingUnitId: 'W23134',
      vintage: 'Mar-25',
      startDate: '01/01/2025',
      endDate: '03/31/2025',
      totalMWh: '0.10234',
    },
    {
      generatorId: 'W23111',
      reportingUnitId: 'W23111',
      vintage: 'Mar-25',
      startDate: '01/01/2025',
      endDate: '03/31/2025',
      totalMWh: '1.2344',
    },
    {
      generatorId: 'W23112',
      reportingUnitId: 'W23112',
      vintage: 'Apr-25',
      startDate: '04/01/2025',
      endDate: '04/30/2025',
      totalMWh: '0.8765',
    },
    {
      generatorId: 'W23113',
      reportingUnitId: 'W23113',
      vintage: 'Apr-25',
      startDate: '04/01/2025',
      endDate: '04/30/2025',
      totalMWh: '1.5432',
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const [filters, setFilters] = useState({
    generatorId: '',
    reportingUnitId: '',
    vintage: '',
    startDate: '',
    endDate: '',
  });

  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState('all');
  const [exportCustomStart, setExportCustomStart] = useState('');
  const [exportCustomEnd, setExportCustomEnd] = useState('');

  const filteredData = tableData.filter((item) => {
    return (
      (filters.generatorId === '' || item.generatorId.includes(filters.generatorId)) &&
      (filters.reportingUnitId === '' || item.reportingUnitId.includes(filters.reportingUnitId)) &&
      (filters.vintage === '' || item.vintage.includes(filters.vintage)) &&
      (filters.startDate === '' || new Date(item.startDate) >= new Date(filters.startDate)) &&
      (filters.endDate === '' || new Date(item.endDate) <= new Date(filters.endDate))
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      generatorId: '',
      reportingUnitId: '',
      vintage: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExport = () => {
    let dataToExport = [...filteredData];
    
    if (exportRange === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      dataToExport = dataToExport.filter(item => 
        new Date(item.startDate) >= threeMonthsAgo
      );
    } else if (exportRange === 'custom' && exportCustomStart && exportCustomEnd) {
      dataToExport = dataToExport.filter(item => 
        new Date(item.startDate) >= new Date(exportCustomStart) &&
        new Date(item.endDate) <= new Date(exportCustomEnd)
      );
    }
    
    const headers = Object.keys(dataToExport[0]).join(',');
    const csv = [
      headers,
      ...dataToExport.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'rec_sales_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setExportOpen(false);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className={`${mainContainer} bg-white p-6 rounded-lg shadow w-full`}>
      {/* Header Section */}
      <div className={`${headingContainer} flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4`}>
        <h2 className={pageTitle} style={{ color: '#039994' }}>
          REC Sales
        </h2>

        <div className="mt-2 sm:mt-0 flex items-center space-x-4">
          {/* Filter Button with adjusted width */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-md text-sm min-w-[120px] justify-center"
          >
            <HiOutlineFilter className="mr-2 h-4 w-3" />
            Filter by
            <HiOutlineChevronDown className="ml-2 h-4 w-3" />
          </button>
          
          {/* Export Button */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${buttonPrimary}`}
          >
            <HiOutlineDownload className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">Generator ID</th>
              <th scope="col" className="px-4 py-3">Reporting Unit ID</th>
              <th scope="col" className="px-4 py-3">Vintage</th>
              <th scope="col" className="px-4 py-3">Start Date</th>
              <th scope="col" className="px-4 py-3">End Date</th>
              <th scope="col" className="px-4 py-3">Total MWh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.generatorId}</td>
                <td className="px-4 py-3">{item.reportingUnitId}</td>
                <td className="px-4 py-3">{item.vintage}</td>
                <td className="px-4 py-3">{item.startDate}</td>
                <td className="px-4 py-3">{item.endDate}</td>
                <td className="px-4 py-3">{item.totalMWh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing {paginatedData.length} of {filteredData.length} entries
        </p>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            <HiOutlineChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-medium text-gray-700">
            {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            Next
            <HiOutlineChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
      />
      
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setExportOpen(false)}
        exportRange={exportRange}
        setExportRange={setExportRange}
        exportCustomStart={exportCustomStart}
        setExportCustomStart={setExportCustomStart}
        exportCustomEnd={exportCustomEnd}
        setExportCustomEnd={setExportCustomEnd}
        onExport={handleExport}
      />
    </div>
  );
};

export default RECSalesAndReport;