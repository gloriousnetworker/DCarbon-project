import React, { useState, useEffect } from 'react';
import { HiOutlineFilter, HiOutlineDownload, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import GeneratorReportFilter from './GeneratorReportFilter';
import GeneratorReportExportReport from './GeneratorReportExportReport';

const GeneratorReport = () => {
  const [generatorData, setGeneratorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userId = localStorage.getItem('userId') || '5d37cbae-d7c0-4731-95e6-94000ddf9b4e';
      const authToken = localStorage.getItem('authToken') || '';
      return { userId, authToken };
    } catch (error) {
      return { userId: '5d37cbae-d7c0-4731-95e6-94000ddf9b4e', authToken: '' };
    }
  };

  // Fetch Generator Report Data with filters
  const fetchGeneratorReport = async () => {
    setLoading(true);
    try {
      const { userId, authToken } = getUserData();
      let url = `https://services.dcarbon.solutions/api/facility/generator-report/${userId}?page=${currentPage}`;
      
      // Add filters to URL if they exist
      if (filters.dateFrom) url += `&dateFrom=${filters.dateFrom}`;
      if (filters.dateTo) url += `&dateTo=${filters.dateTo}`;
      if (filters.status !== 'all') url += `&status=${filters.status}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setGeneratorData(data.data);
      }
    } catch (error) {
      console.error('Error fetching generator report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneratorReport();
  }, [currentPage, filters]);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    const totalPages = generatorData?.metadata?.totalPages || 1;
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setShowFilterModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-[#039994] font-[600] text-[24px] leading-[100%] tracking-[-0.05em] font-sfpro">
          Generator Report
        </h1>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button 
            onClick={() => setShowFilterModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-md text-sm min-w-[120px] justify-center font-sfpro"
          >
            <HiOutlineFilter className="mr-2 h-4 w-4" />
            Filter by
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#039994] text-white hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
          >
            <HiOutlineDownload className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Generator Report Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3 font-sfpro">Total Active Generators</th>
              <th className="px-4 py-3 font-sfpro">Total Pending Generators</th>
              <th className="px-4 py-3 font-sfpro">Total Terminated Generators</th>
              <th className="px-4 py-3 font-sfpro">Total Active Capacity (MWh)</th>
              <th className="px-4 py-3 font-sfpro">Total Net Exports (MWh)</th>
              <th className="px-4 py-3 font-sfpro">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {generatorData?.reports?.map((report, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-sfpro">{report.activeFacilities}</td>
                <td className="px-4 py-3 font-sfpro">{report.pendingFacilities}</td>
                <td className="px-4 py-3 font-sfpro">{report.terminatedFacilities}</td>
                <td className="px-4 py-3 font-sfpro">27</td>
                <td className="px-4 py-3 font-sfpro">200</td>
                <td className="px-4 py-3 font-sfpro">{new Date(report.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
        <p className="text-sm text-gray-600 font-sfpro">
          Showing {generatorData?.reports?.length || 0} of {generatorData?.metadata?.total || 0} entries
        </p>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 font-sfpro"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            <HiOutlineChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          <span className="px-3 py-1 text-sm font-medium text-gray-700 font-sfpro">
            {currentPage} of {generatorData?.metadata?.totalPages || 1}
          </span>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 font-sfpro"
            disabled={currentPage === (generatorData?.metadata?.totalPages || 1)}
            onClick={goToNextPage}
          >
            Next
            <HiOutlineChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <GeneratorReportFilter 
          currentFilters={filters}
          onApply={applyFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <GeneratorReportExportReport 
          onClose={() => setShowExportModal(false)}
          data={generatorData}
        />
      )}
    </div>
  );
};

export default GeneratorReport;