import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  mainContainer,
  headingContainer,
  pageTitle,
  selectClass,
  buttonPrimary,
} from "./styles";

import AddFacilityModal from "./AddFacilityModal";
import FacilityCreatedModal from "./FacilityCreatedModal";
import FilterModal from "./FilterModal";
import ExportReportModal from "./ExportReportModal";

const MONTHS = [
  { label: "Month", value: "" },
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const YEARS = ["2023", "2024", "2025"];

const REPORT_OPTIONS = [
  { label: "Customer Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Commission Statement", value: "commission" }
];

export default function CustomerReport({ onNavigate }) {
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [showFacilityCreatedModal, setShowFacilityCreatedModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
    time: "Oldest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 10;
  const baseUrl = "https://services.dcarbon.solutions";

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const userId =
          localStorage.getItem("userId") ||
          "8b14b23d-3082-4846-9216-2c2e9f1e96bf";

        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.customerType)
          params.append("customerType", filters.customerType);

        if (yearFilter && monthFilter) {
          const y = yearFilter;
          const m = monthFilter.padStart(2, "0");
          const lastDay = new Date(y, Number(monthFilter), 0).getDate();
          params.append("startDate", `${y}-${m}-01`);
          params.append("endDate", `${y}-${m}-${lastDay}`);
        } else if (yearFilter) {
          params.append("startDate", `${yearFilter}-01-01`);
          params.append("endDate", `${yearFilter}-12-31`);
        }

        params.append("page", currentPage);
        params.append("limit", LIMIT);

        const res = await axios.get(
          `${baseUrl}/api/user/get-users-referrals/${userId}?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let { referrals, metadata } = res.data.data;

        referrals.sort((a, b) => {
          const da = new Date(a.createdAt),
            db = new Date(b.createdAt);
          return filters.time === "Newest" ? db - da : da - db;
        });

        setTableData(referrals);
        setTotalPages(metadata.totalPages);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [currentPage, filters, yearFilter, monthFilter]);

  const handleOpenFilterModal = () => setShowFilterModal(true);
  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleOpenAddFacilityModal = () => setShowAddFacilityModal(true);
  const handleFacilityAdded = () => {
    setShowAddFacilityModal(false);
    setShowFacilityCreatedModal(true);
  };
  const handleCloseFacilityCreatedModal = () =>
    setShowFacilityCreatedModal(false);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    if (onNavigate) {
      onNavigate(reportType);
    }
  };

  const handleExportReport = async (exportParams) => {
    try {
      if (exportParams.format !== "csv" || exportParams.email) {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";

        const requestBody = {
          format: exportParams.format,
          email: exportParams.email,
          filters: exportParams.includeFilters ? {
            ...filters,
            year: yearFilter,
            month: monthFilter,
            page: currentPage,
            limit: LIMIT
          } : null
        };

        console.log("Exporting with params:", requestBody);

        if (exportParams.format !== "csv") {
          try {
            const response = await axios.post(
              `${baseUrl}/api/reports/export-customer-report`,
              requestBody,
              {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
              }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `customer-report.${exportParams.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch (error) {
            console.error("Backend export error:", error);
            if (exportParams.email) {
              alert(`Report will be sent to ${exportParams.email} when ready`);
            } else {
              throw error;
            }
          }
        } else if (exportParams.email) {
          alert(`CSV report will also be sent to ${exportParams.email} when ready`);
        }
      }
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const handleClearFilters = () => {
    setYearFilter("");
    setMonthFilter("");
    setFilters({
      status: "",
      customerType: "",
      time: "Oldest"
    });
    setCurrentPage(1);
  };

  const renderStatusTag = (status) => {
    let bg = "#00B4AE";
    if (status === "PENDING") bg = "#FFB200";
    if (status === "ACCEPTED") bg = "#000000";
    if (status === "TERMINATED") bg = "#FF0000";
    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-white text-sm"
        style={{ backgroundColor: bg }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-start justify-between w-full mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="">Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {(yearFilter || monthFilter || filters.status || filters.customerType) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenFilterModal}
              className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100 text-sm bg-white"
            >
              Filter by
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1 rounded bg-[#039994] text-sm text-white hover:bg-[#028c87]"
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
              Customer Report
              <svg 
                className={`ml-2 w-5 h-5 transition-transform ${showReportDropdown ? 'rotate-180' : ''}`}
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
                      option.value === 'customer' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {(filters.status || filters.customerType) && (
            <div className="text-sm text-gray-600 ml-6">
              {filters.status && <span>Status: {filters.status} </span>}
              {filters.customerType && <span>Type: {filters.customerType} </span>}
              {filters.time && <span>Sort: {filters.time} first </span>}
            </div>
          )}
        </div>

        <div className="w-full overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading…</p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : tableData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No records found with these filters</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">S/N</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Email Address</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Customer Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Utility Provider</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Address</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date Reg.</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Cus. Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((ref, idx) => (
                  <tr
                    key={ref.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm">
                      {(currentPage - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="py-3 px-4 text-sm">{ref.name || "Name"}</td>
                    <td className="py-3 px-4 text-sm">{ref.inviteeEmail}</td>
                    <td className="py-3 px-4 text-sm">
                      {ref.customerType || "RESIDENTIAL"}
                    </td>
                    <td className="py-3 px-4 text-sm">Utility</td>
                    <td className="py-3 px-4 text-sm">Address</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(ref.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">{renderStatusTag(ref.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
          >
            &lt; Previous
          </button>
          <span className="text-sm text-gray-600">{currentPage} of {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {showAddFacilityModal && (
        <AddFacilityModal
          onClose={() => setShowAddFacilityModal(false)}
          onFacilityAdded={handleFacilityAdded}
        />
      )}
      {showFacilityCreatedModal && (
        <FacilityCreatedModal
          onClose={handleCloseFacilityCreatedModal}
        />
      )}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          initialFilters={filters}
        />
      )}
      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          initialFilters={filters}
          yearFilter={yearFilter}
          monthFilter={monthFilter}
          tableData={tableData}
        />
      )}
    </div>
  );
}