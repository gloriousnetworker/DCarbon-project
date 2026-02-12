import React, { useState, useEffect } from "react";
import axios from "axios";

const QUARTERS = [
  { label: "Q1 2025", value: "1", year: "2025", months: "Jan-Mar" },
  { label: "Q2 2025", value: "2", year: "2025", months: "Apr-Jun" },
  { label: "Q3 2025", value: "3", year: "2025", months: "Jul-Sep" },
  { label: "Q4 2025", value: "4", year: "2025", months: "Oct-Dec" },
  { label: "Q1 2024", value: "1", year: "2024", months: "Jan-Mar" },
  { label: "Q2 2024", value: "2", year: "2024", months: "Apr-Jun" },
  { label: "Q3 2024", value: "3", year: "2024", months: "Jul-Sep" },
  { label: "Q4 2024", value: "4", year: "2024", months: "Oct-Dec" }
];

const REPORT_OPTIONS = [
  { label: "Partner Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Earnings Statement", value: "commission" }
];

export default function CommissionStatement({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("Q1 2025");
  const [invoiceData, setInvoiceData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loadingPayout, setLoadingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (userId && authToken) {
      fetchInvoiceData();
      fetchWalletBalance();
      fetchPayoutHistory();
    }
  }, [selectedQuarter]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    setError("");
    try {
      const quarterObj = QUARTERS.find(q => q.label === selectedQuarter);
      if (!quarterObj) return;

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/commission/invoice/${userId}`,
        {
          params: {
            quarter: quarterObj.value,
            year: quarterObj.year
          },
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setInvoiceData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      setError("No earnings statement available for this quarter");
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/revenue/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const result = await response.json();
      if (result.status === "success" && result.data) {
        setWalletBalance(result.data.availableBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/payout-request?userId=${userId}&userType=PARTNER`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const result = await response.json();
      if (result.status === "success" && result.data) {
        setPayoutHistory(result.data);
      }
    } catch (error) {
      console.error("Error fetching payout history:", error);
    }
  };

  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    if (onNavigate) {
      onNavigate(reportType);
    }
  };

  const handleQuarterSelect = (quarter) => {
    setSelectedQuarter(quarter);
    setShowQuarterDropdown(false);
  };

  const handleExportReport = async (exportParams) => {
    try {
      const quarterObj = QUARTERS.find(q => q.label === selectedQuarter);
      
      const requestBody = {
        format: exportParams.format,
        email: exportParams.email,
        reportType: "commission",
        quarter: quarterObj.value,
        year: quarterObj.year,
        invoiceNumber: invoiceData?.invoiceNumber
      };

      if (exportParams.format !== "csv") {
        const response = await axios.post(
          "https://services.dcarbon.solutions/api/reports/export-commission-statement",
          requestBody,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            responseType: "blob"
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `commission-statement.${exportParams.format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportParams.email) {
        alert(`CSV commission statement will be sent to ${exportParams.email} when ready`);
      }
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const handleSubmitPayout = async () => {
    try {
      setLoadingPayout(true);
      setPayoutMessage("");

      if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
        setPayoutMessage("Please enter a valid amount");
        return;
      }

      const requestBody = {
        userId: userId,
        amount: parseFloat(payoutAmount),
        userType: "PARTNER"
      };

      const response = await fetch("https://services.dcarbon.solutions/api/payout-request/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.status === "success") {
        setPayoutMessage("Payout request submitted successfully!");
        setPayoutAmount("");
        setShowPayoutModal(false);
        fetchWalletBalance();
        fetchPayoutHistory();
      } else {
        setPayoutMessage(result.message || "Failed to submit payout request");
      }
    } catch (error) {
      console.error("Error submitting payout:", error);
      setPayoutMessage("An error occurred while submitting payout request");
    } finally {
      setLoadingPayout(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID": return "text-green-600";
      case "PENDING": return "text-yellow-600";
      case "REJECTED": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-sm">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="relative">
            <button
              onClick={() => setShowReportDropdown(!showReportDropdown)}
              className="flex items-center text-2xl font-semibold text-[#039994]"
            >
              Earnings Statement
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
                      option.value === "commission" ? "bg-gray-50 font-medium" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                className="flex items-center border border-gray-300 px-4 py-1 rounded text-xs hover:bg-gray-50"
              >
                {selectedQuarter}
                <svg 
                  className={`ml-2 w-4 h-4 transition-transform ${showQuarterDropdown ? "rotate-180" : ""}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showQuarterDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                  {QUARTERS.map((quarter) => (
                    <button
                      key={quarter.label}
                      onClick={() => handleQuarterSelect(quarter.label)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedQuarter === quarter.label ? "bg-gray-50 font-medium" : ""
                      }`}
                    >
                      {quarter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={!invoiceData}
              className={`border border-green px-4 py-1 rounded text-xs text-white ${
                invoiceData ? "bg-[#039994]" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Export Report
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="border border-black px-4 py-1 rounded bg-[#1E1E1E] text-xs text-white"
            >
              Request Payout
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039994] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading earnings statement...</p>
            </div>
          </div>
        )}

        {!loading && error && !invoiceData && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Try selecting a different quarter</p>
            </div>
          </div>
        )}

        {!loading && invoiceData && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#039994] mb-2">INVOICE</h1>
                  <div className="text-sm text-gray-600">
                    <div>INVOICE #{invoiceData.invoiceNumber}</div>
                    <div>DATE: {formatDate(invoiceData.date)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Name</span>
                    <span className="text-gray-900">
                      {invoiceData.billTo.firstName} {invoiceData.billTo.lastName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Address</span>
                    <span className="text-gray-900">-</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Email Address</span>
                    <span className="text-gray-900">{invoiceData.billTo.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Phone number</span>
                    <span className="text-gray-900">{invoiceData.billTo.phoneNumber || "-"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="font-semibold text-gray-700">BILL TO:</div>
                  <div className="text-gray-900">DCarbon Solutions, Inc.</div>
                  <div className="text-gray-900">8 The Green, STE A, Dover DE, 19901</div>
                  <div className="text-gray-900">support@dcarbon.solutions</div>
                  <div className="mt-4">
                    <div className="font-semibold text-gray-700">SHIP TO:</div>
                    <div className="text-gray-900">N/A</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="font-semibold text-gray-700 mb-2">COMMENTS OR SPECIAL INSTRUCTIONS:</div>
                <div className="text-gray-900">
                  1. Invoice for {selectedQuarter} DCarbon Agent Commissions
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 mb-6 text-xs">
                <div>
                  <div className="font-semibold text-gray-700">SALESPERSON</div>
                  <div className="text-gray-900">-</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">P.O. NUMBER</div>
                  <div className="text-gray-900">-</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">REQUISITIONER</div>
                  <div className="text-gray-900">-</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">SHIPPED VIA</div>
                  <div className="text-gray-900">-</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">F.O.B. POINT</div>
                  <div className="text-gray-900">-</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">TERMS</div>
                  <div className="text-gray-900">Due on Receipt</div>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-gray-300 py-2 mb-4">
                <div className="grid grid-cols-12 gap-2 font-semibold text-gray-700 text-xs">
                  <div className="col-span-1">QTY.</div>
                  <div className="col-span-2">ITEM CODE</div>
                  <div className="col-span-6">DESCRIPTION</div>
                  <div className="col-span-2 text-right">UNIT PRICE</div>
                  <div className="col-span-1 text-right">TOTAL</div>
                </div>
              </div>

              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 py-2 text-xs text-gray-900 border-b border-gray-200">
                  <div className="col-span-1">{item.qty}</div>
                  <div className="col-span-2">{item.itemCode}</div>
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-right">${item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-1 text-right">${item.total.toFixed(2)}</div>
                </div>
              ))}

              <div className="mt-6">
                <div className="text-sm text-gray-700 mb-2 font-semibold">Remittance instructions:</div>
                <div className="text-sm text-gray-900 mb-6">
                  Please contact support@dcarbon.solutions for specific remittance instructions.
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">SUBTOTAL</span>
                    <span className="text-gray-900">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">V.A.T.</span>
                    <span className="text-gray-900">${invoiceData.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">PAID</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#039994] mb-2">
                    DCARBON AGENT STATEMENT – {selectedQuarter}
                  </h2>
                  <div className="text-sm text-gray-600">
                    DATE: {formatDate(invoiceData.date)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <div className="font-semibold text-gray-700">BILL TO:</div>
                  <div className="text-gray-900">DCarbon Solutions, Inc.</div>
                  <div className="text-gray-900">8 The Green, STE A, Dover DE, 19901</div>
                  <div className="text-gray-900">support@dcarbon.solutions</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 mb-2">SHIP TO:</div>
                  <div className="text-gray-900">N/A</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
                <div>
                  <div className="font-bold text-gray-700 text-xs">NEW MW DIR</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">ACTIVE MW DIR</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">MWH DIR</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">REC SOLD</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">NEW MW PARTNER</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">ACTIVE MW PARTNER</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">MWH PARTNER</div>
                  <div className="text-gray-900 text-sm">0</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 text-xs">REC PRICE</div>
                  <div className="text-gray-900 text-sm">$0.00</div>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-gray-300 py-2 mb-4">
                <div className="grid grid-cols-12 gap-2 font-semibold text-gray-700 text-xs">
                  <div className="col-span-1">QTY.</div>
                  <div className="col-span-2">ITEM CODE</div>
                  <div className="col-span-6">DESCRIPTION</div>
                  <div className="col-span-2 text-right">UNIT PRICE</div>
                  <div className="col-span-1 text-right">TOTAL</div>
                </div>
              </div>

              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 py-2 text-xs text-gray-900 border-b border-gray-200">
                  <div className="col-span-1">{item.qty}</div>
                  <div className="col-span-2">{item.itemCode}</div>
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-right">${item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-1 text-right">${item.total.toFixed(2)}</div>
                </div>
              ))}

              <div className="mt-6">
                <div className="text-sm text-gray-700 mb-2 font-semibold">Remittance instructions:</div>
                <div className="text-sm text-gray-900 mb-6">
                  Please contact support@dcarbon.solutions for specific remittance instructions.
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="bg-[#039994] text-white px-6 py-3 rounded-lg">
                  <div className="text-xs mb-1">Available Balance</div>
                  <div className="text-xl font-bold">${walletBalance.toFixed(2)}</div>
                </div>
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">SUBTOTAL</span>
                    <span className="text-gray-900">${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">V.A.T.</span>
                    <span className="text-gray-900">${invoiceData.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">PAID</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                    <span className="font-bold text-gray-900">TOTAL (USD)</span>
                    <span className="font-bold text-gray-900">${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#039994] mb-4">Payout History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Note</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payoutHistory.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{payout.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payout.userType}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${payout.amountRequested}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                          {payout.adminNote || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {payout.approvedBy ? payout.approvedBy.slice(0, 8) + "..." : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && !invoiceData && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">Select a quarter to view earnings statement</p>
            </div>
          </div>
        )}
      </div>

      {showExportModal && invoiceData && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          invoiceData={invoiceData}
          quarterFilter={selectedQuarter}
          walletBalance={walletBalance}
        />
      )}

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#039994] mb-4">Request Payout</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                placeholder="Enter amount"
              />
            </div>
            {payoutMessage && (
              <div className={`mb-4 p-3 rounded-md ${
                payoutMessage.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {payoutMessage}
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutMessage("");
                  setPayoutAmount("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayout}
                disabled={loadingPayout}
                className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] disabled:opacity-50"
              >
                {loadingPayout ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportReportModal({ onClose, onExport, invoiceData, quarterFilter, walletBalance }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#039994]">Export Earnings Statement</h2>
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
              <span className="block">• Quarter: {quarterFilter}</span>
              <span className="block">• Invoice #: {invoiceData?.invoiceNumber}</span>
              <span className="block">• Date: {new Date(invoiceData?.date).toLocaleDateString()}</span>
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