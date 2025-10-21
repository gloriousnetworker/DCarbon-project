import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  mainContainer,
  headingContainer,
  pageTitle,
  selectClass,
  buttonPrimary,
} from "./styles";

import ExportReportModal from "./ExportReportModal";

const REPORT_OPTIONS = [
  { label: "Partner Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Earnings Statement", value: "commission" }
];

const QUARTERS = [
  { label: "Q1 (Jan-Mar)", value: "q1" },
  { label: "Q2 (Apr-Jun)", value: "q2" },
  { label: "Q3 (Jul-Sep)", value: "q3" },
  { label: "Q4 (Oct-Dec)", value: "q4" }
];

const YEARS = ["2023", "2024", "2025"];

export default function GenerationReport({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(4);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 2,
        customerId: "Customer ID",
        name: "Name",
        address: "Street Address",
        zipcode: "900109",
        customerType: "Commercial",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 3,
        customerId: "Customer ID",
        name: "Name",
        address: "Street Address",
        zipcode: "900109",
        customerType: "Commercial",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 4,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 5,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 6,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 7,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 8,
        customerId: "Customer ID",
        name: "Name",
        address: "Street Address",
        zipcode: "900109",
        customerType: "Commercial",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 9,
        customerId: "Serial ID",
        name: "Serial ID",
        address: "——————",
        zipcode: "900109",
        customerType: "Resi. Group",
        generation: "20",
        commission: "$750.00"
      },
      {
        id: 10,
        customerId: "Customer ID",
        name: "Name",
        address: "Street Address",
        zipcode: "900109",
        customerType: "Commercial",
        generation: "20",
        commission: "$750.00"
      }
    ];
    setTableData(mockData);
  }, []);

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

  const handleExportReport = async (exportParams) => {
    try {
      if (exportParams.format !== "csv" || exportParams.email) {
        const token = localStorage.getItem("authToken");
        
        const requestBody = {
          format: exportParams.format,
          email: exportParams.email,
          reportType: 'generation',
          data: tableData
        };

        console.log("Exporting generation report with params:", requestBody);

        if (exportParams.format !== "csv") {
          try {
            const response = await axios.post(
              "https://services.dcarbon.solutions/api/reports/export-generation-report",
              requestBody,
              {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
              }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `generation-report.${exportParams.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch (error) {
            console.error("Backend export error:", error);
            if (exportParams.email) {
              alert(`Generation report will be sent to ${exportParams.email} when ready`);
            } else {
              throw error;
            }
          }
        } else if (exportParams.email) {
          alert(`CSV generation report will also be sent to ${exportParams.email} when ready`);
        }
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
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="">All Quarters</option>
              {QUARTERS.map(quarter => <option key={quarter.value} value={quarter.value}>{quarter.label}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-4">
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
              Generation Report
              <svg className={`ml-2 w-5 h-5 transition-transform ${showReportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showReportDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                {REPORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleReportNavigation(option.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.value === 'generation' ? 'bg-gray-50 font-medium' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading…</p>
          ) : tableData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No generation records found</p>
          ) : (
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
                  {tableData.map((item, idx) => (
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
                      <td className="py-2 px-2 text-xs">{item.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          tableData={tableData}
          reportType="generation"
        />
      )}
    </div>
  );
}