import React, { useState, useEffect } from "react";
import axios from "axios";

const REPORT_OPTIONS = [
  { label: "Partner Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Earnings Statement", value: "commission" }
];

const QUARTERS = [
  { label: "Q1 (Jan-Mar)", value: "1" },
  { label: "Q2 (Apr-Jun)", value: "2" },
  { label: "Q3 (Jul-Sep)", value: "3" },
  { label: "Q4 (Oct-Dec)", value: "4" }
];

const YEARS = ["2025", "2024", "2023"];

export default function GenerationReport({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
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

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/generation/${userId}`,
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
      setError("Failed to load generation data");
      setTableData([]);
      setTotalPages(1);
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
    try {
      const requestBody = {
        format: exportParams.format,
        email: exportParams.email,
        reportType: "generation",
        quarter: selectedQuarter,
        year: selectedYear,
        page: currentPage
      };

      if (exportParams.format !== "csv") {
        const response = await axios.post(
          "https://services.dcarbon.solutions/api/reports/export-generation-report",
          requestBody,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            responseType: "blob"
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `generation-report.${exportParams.format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportParams.email) {
        alert(`CSV generation report will be sent to ${exportParams.email} when ready`);
      }
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

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
              disabled={tableData.length === 0}
              className={`px-4 py-1 rounded text-sm text-white ${
                tableData.length > 0 ? "bg-[#039994] hover:bg-[#028c87]" : "bg-gray-400 cursor-not-allowed"
              }`}
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
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#039994] mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading generation data...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Please try again or adjust your filters</p>
            </div>
          )}

          {!loading && !error && tableData.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No generation records found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}

          {!loading && !error && tableData.length > 0 && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Customer ID</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Name</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Address</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Zipcode</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Customer Type</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Generation (MWh)</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-gray-700 whitespace-nowrap">Commission Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-2 px-2 text-xs">{item.customerId}</td>
                      <td className="py-2 px-2 text-xs">{item.name}</td>
                      <td className="py-2 px-2 text-xs">{item.address}</td>
                      <td className="py-2 px-2 text-xs">{item.zipcode}</td>
                      <td className="py-2 px-2 text-xs">{item.customerType}</td>
                      <td className="py-2 px-2 text-xs">{item.generation}</td>
                      <td className="py-2 px-2 text-xs">${item.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && tableData.length > 0 && totalPages > 1 && (
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

      {showExportModal && tableData.length > 0 && (
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
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
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