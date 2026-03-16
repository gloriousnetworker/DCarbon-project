import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../lib/config";
import ResponsiveTable from "../../shared/ResponsiveTable";

const getDynamicQuarters = () => {
  const quarterLabels = {
    1: 'Q1 (Jan-Mar)',
    2: 'Q2 (Apr-Jun)',
    3: 'Q3 (Jul-Sep)',
    4: 'Q4 (Oct-Dec)',
  };

  return [
    { label: quarterLabels[1], value: '1' },
    { label: quarterLabels[2], value: '2' },
    { label: quarterLabels[3], value: '3' },
    { label: quarterLabels[4], value: '4' },
  ];
};

const getDynamicYears = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  return [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
};

const REPORT_OPTIONS = [
  { label: "Partner Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Earnings Statement", value: "commission" }
];

const QUARTERS = getDynamicQuarters();
const YEARS = getDynamicYears();

export default function GenerationReport({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState(YEARS[0] || "2025");
  const [error, setError] = useState("");
  const [generationMetrics, setGenerationMetrics] = useState({
    totalGeneration: "0",
    totalCommission: "0",
    totalCustomers: "0"
  });

  const userId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (userId && authToken) {
      fetchGenerationData();
    }
  }, [selectedQuarter, selectedYear, currentPage]);

  const fetchGenerationData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: currentPage,
        limit: 10
      };

      if (selectedQuarter) {
        params.quarter = selectedQuarter;
      }
      if (selectedYear) {
        params.year = selectedYear;
      }

      const response = await axiosInstance.get(
        `/api/facility/generator-report/${userId}`,
        {
          params: params,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setTableData(response.data.data.items || []);
        setTotalPages(response.data.data.totalPages || 1);
        setGenerationMetrics({
          totalGeneration: response.data.data.totalGeneration || "0",
          totalCommission: response.data.data.totalCommission || "0",
          totalCustomers: response.data.data.totalCustomers || "0"
        });
      }
    } catch (error) {
      console.error("Error fetching generation data:", error);
      setTableData([]);
      setTotalPages(1);
      setGenerationMetrics({
        totalGeneration: "0",
        totalCommission: "0",
        totalCustomers: "0"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    if (onNavigate) {
      onNavigate(reportType);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
  };

  const handleExportReport = async (exportParams) => {
    if (!tableData || tableData.length === 0) {
      throw new Error('No data available to export');
    }

    const headers = ['Customer ID', 'Name', 'Address', 'Zipcode', 'Customer Type', 'Generation (MWh)', 'Commission Earned'];
    const rows = tableData.map(item => [
      item.customerId, item.name, item.address, item.zipcode,
      item.customerType, item.generation, item.commission
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `generation-report-${selectedYear}-${selectedQuarter || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  };

  const defaultTableData = [
    {
      id: "1",
      customerId: "-",
      name: "No data available",
      address: "-",
      zipcode: "-",
      customerType: "-",
      generation: "0",
      commission: "0"
    }
  ];

  const displayData = tableData.length > 0 ? tableData : defaultTableData;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-start justify-between w-full mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedQuarter}
              onChange={handleQuarterChange}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="">All Quarters</option>
              {QUARTERS.map((quarter) => (
                <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1 rounded text-sm text-white bg-[#039994] hover:bg-[#028c87]"
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="flex items-center justify-start w-full mb-6">
          <div className="relative">
            <button
              onClick={() => setShowReportDropdown(!showReportDropdown)}
              className="flex items-center text-2xl font-semibold text-[#039994]"
            >
              Generation Report
              <svg
                className={`ml-2 w-5 h-5 transition-transform ${showReportDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showReportDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                {REPORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReportNavigation(option.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      option.value === "generation" ? "bg-gray-50 font-medium" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Total Generation</div>
            <div className="text-2xl font-bold text-[#039994]">
              {generationMetrics.totalGeneration} MWh
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Total Commission</div>
            <div className="text-2xl font-bold text-[#039994]">
              ${generationMetrics.totalCommission}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Active Customers</div>
            <div className="text-2xl font-bold text-[#039994]">
              {generationMetrics.totalCustomers}
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
          <ResponsiveTable
            loading={loading}
            data={displayData}
            emptyTitle="No generation data found"
            emptyDescription="Generation data for the selected period will appear here."
            columns={[
              { key: 'customerId', label: 'Customer ID' },
              { key: 'name', label: 'Name' },
              { key: 'address', label: 'Address' },
              { key: 'zipcode', label: 'Zipcode' },
              { key: 'customerType', label: 'Customer Type' },
              { key: 'generation', label: 'Generation (MWh)' },
              { key: 'commission', label: 'Commission Earned', render: (v) => `$${v}` },
            ]}
          />
        </div>

        {!loading && tableData.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
            >
              &lt; Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          selectedQuarter={selectedQuarter}
          selectedYear={selectedYear}
        />
      )}
    </div>
  );
}

function ExportReportModal({ onClose, onExport, selectedQuarter, selectedYear }) {
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setLoading(true);
    try {
      await onExport({ format, email });
      onClose();
    } catch (err) {
      setError(err.message || "Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getQuarterLabel = (quarterValue) => {
    const quarter = QUARTERS.find(q => q.value === quarterValue);
    return quarter ? quarter.label : "All Quarters";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#039994]">Export Generation Report</h2>
          <button
            onClick={onClose}
            className="text-[#F04438] hover:text-red-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="csv">CSV</option>
              <option value="pdf" disabled>PDF (Coming soon)</option>
              <option value="excel" disabled>Excel (Coming soon)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">Export Details:</p>
            <div className="text-xs text-blue-600">
              <span className="block">• Year: {selectedYear || "All Years"}</span>
              <span className="block">• Quarter: {getQuarterLabel(selectedQuarter)}</span>
              <span className="block">• Report Type: Generation Report</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028c87] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}