import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  mainContainer,
  headingContainer,
  pageTitle,
  selectClass,
  buttonPrimary,
  labelClass,
} from "./styles";

import ExportReportModal from "./ExportReportModal";

const MONTHS = [
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

const REPORT_OPTIONS = [
  { label: "Customer Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Commission Statement", value: "commission" }
];

export default function CommissionStatement({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [monthFilter, setMonthFilter] = useState("March");
  const [viewType, setViewType] = useState("Month");
  const [commissionData, setCommissionData] = useState({});

  useEffect(() => {
    const mockCommissionData = {
      userInfo: {
        name: "Customer Name",
        address: "Address",
        email: "name@domain.com",
        phone: "+234-000-0000-000"
      },
      billingTo: {
        company: "DCarbon Solutions, Inc.",
        address: "8 The Green, STE A, Dover DE, 19901",
        email: "support@dcarbon.solutions"
      },
      metrics: [
        { label: "Total Active Commercial Generators", value: "200" },
        { label: "Total Active Resi. Groups", value: "200" },
        { label: "Total Active MW (Commercial)", value: "20.0" },
        { label: "Total Active MW (Residential)", value: "20.0" },
        { label: "Total Commercial MWh", value: "20.0" },
        { label: "Total Resi. Groups MWh", value: "20.0" },
        { label: "Total REC Sold (Commercial)", value: "24" },
        { label: "Total REC Sold (DGG)", value: "54" },
        { label: "Average $/REC price", value: "$15.00" },
        { label: "Avg. Commission % (Commercial)", value: "12%" },
        { label: "Avg. Commission % (Residential)", value: "24%" },
        { label: "Commission payable ($) (Commercial)", value: "$100.00" },
        { label: "Commission payable ($) (Residential)", value: "$100.00" }
      ],
      totalCommission: "$200.00"
    };
    setCommissionData(mockCommissionData);
  }, []);

  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    if (onNavigate) {
      onNavigate(reportType);
    }
  };

  const handleMonthSelect = (month) => {
    setMonthFilter(month);
    setShowMonthDropdown(false);
  };

  const handleExportReport = async (exportParams) => {
    try {
      if (exportParams.format !== "csv" || exportParams.email) {
        const token = localStorage.getItem("authToken");
        
        const requestBody = {
          format: exportParams.format,
          email: exportParams.email,
          reportType: 'commission',
          month: monthFilter,
          data: commissionData
        };

        console.log("Exporting commission statement with params:", requestBody);

        if (exportParams.format !== "csv") {
          try {
            const response = await axios.post(
              "https://services.dcarbon.solutions/api/reports/export-commission-statement",
              requestBody,
              {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
              }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `commission-statement.${exportParams.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch (error) {
            console.error("Backend export error:", error);
            if (exportParams.email) {
              alert(`Commission statement will be sent to ${exportParams.email} when ready`);
            } else {
              throw error;
            }
          }
        } else if (exportParams.email) {
          alert(`CSV commission statement will also be sent to ${exportParams.email} when ready`);
        }
      }
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  return (
    <div className={`${mainContainer} text-sm`}>
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="relative">
            <button
              onClick={() => setShowReportDropdown(!showReportDropdown)}
              className="flex items-center text-2xl font-semibold text-[#039994]"
            >
              Commission Statement
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
                      option.value === 'commission' ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewType(viewType === "Month" ? "Year" : "Month")}
              className="border border-gray-300 px-4 py-1 rounded text-xs hover:bg-gray-50"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
            >
              {viewType}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="flex items-center border border-gray-300 px-4 py-1 rounded text-xs hover:bg-gray-50"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
              >
                {monthFilter}
                <svg 
                  className={`ml-2 w-4 h-4 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showMonthDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  {MONTHS.map((month) => (
                    <button
                      key={month.value}
                      onClick={() => handleMonthSelect(month.label)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        monthFilter === month.label ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="border border-green px-4 py-1 rounded bg-[#039994] text-xs text-white"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
            >
              Export Report
            </button>
            
            <button
              className="border border-black px-4 py-1 rounded bg-[#1E1E1E] text-xs text-white"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
            >
              Submit Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 rounded-lg p-4 bg-[#069B960D]">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E1E]">Name</span>
                <span className="text-[#1E1E1E]">{commissionData.userInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E1E]">Address</span>
                <span className="text-[#1E1E1E]">{commissionData.userInfo?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E1E]">Email Address</span>
                <span className="text-[#1E1E1E]">{commissionData.userInfo?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E1E]">Phone number</span>
                <span className="text-[#1E1E1E]">{commissionData.userInfo?.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-[#EFEFEF80] p-4 rounded-lg">
            <div className="text-lg font-semibold text-[#039994]">Billing to</div>
            <div className="text-[#1E1E1E]">{commissionData.billingTo?.company}</div>
            <div className="text-[#1E1E1E]">{commissionData.billingTo?.address}</div>
            <div className="text-[#1E1E1E]">{commissionData.billingTo?.email}</div>
          </div>
        </div>

        <div className="space-y-0 mb-6">
          {commissionData.metrics?.map((metric, index) => (
            <div 
              key={index} 
              className={`flex justify-between py-2 px-4 border-b border-gray-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#F3F3F3]'
              }`}
            >
              <span className="font-bold text-black">• {metric.label}</span>
              <span className="font-bold text-black">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#039994] text-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Commission Payable</span>
            <span className="text-xl font-bold">{commissionData.totalCommission}</span>
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          reportType="commission"
        />
      )}
    </div>
  );
}