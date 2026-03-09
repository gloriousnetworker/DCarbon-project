import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../lib/config";

const getDynamicQuarters = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);
  const quarters = [];
  for (let i = 0; i < 8; i++) {
    let q = currentQuarter - i;
    let y = currentYear;
    while (q < 1) { q += 4; y -= 1; }
    const months = q === 1 ? "Jan-Mar" : q === 2 ? "Apr-Jun" : q === 3 ? "Jul-Sep" : "Oct-Dec";
    quarters.push({ label: `Q${q} ${y}`, value: q.toString(), year: y.toString(), months });
  }
  return quarters;
};

const QUARTERS = getDynamicQuarters();

const REPORT_OPTIONS = [
  { label: "Partner Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Earnings Statement", value: "commission" },
];

export default function CommissionStatement({ onNavigate }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(QUARTERS[0]?.label || "");
  const [invoiceData, setInvoiceData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loadingPayout, setLoadingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    try {
      const quarterObj = QUARTERS.find((q) => q.label === selectedQuarter);
      if (!quarterObj) return;
      const response = await axiosInstance({
        method: "GET",
        url: `/api/commission/invoice/${userId}`,
        params: { quarter: quarterObj.value, year: quarterObj.year },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.status === "success") {
        setInvoiceData(response.data.data);
      } else {
        setInvoiceData(null);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `/api/revenue/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.status === "success" && response.data.data) {
        setWalletBalance(response.data.data.availableBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `/api/payout-request?userId=${userId}&userType=PARTNER`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.status === "success" && response.data.data) {
        setPayoutHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching payout history:", error);
    }
  };

  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    if (onNavigate) onNavigate(reportType);
  };

  const handleQuarterSelect = (quarter) => {
    setSelectedQuarter(quarter);
    setShowQuarterDropdown(false);
  };

  const handleSubmitPayout = async () => {
    try {
      setLoadingPayout(true);
      setPayoutMessage("");
      if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
        setPayoutMessage("Please enter a valid amount");
        return;
      }
      const response = await axiosInstance({
        method: "POST",
        url: "/api/payout-request/request",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        data: JSON.stringify({ userId, amount: parseFloat(payoutAmount), userType: "PARTNER" }),
      });
      if (response.data.status === "success") {
        setPayoutMessage("Payout request submitted successfully!");
        setPayoutAmount("");
        setShowPayoutModal(false);
        fetchWalletBalance();
        fetchPayoutHistory();
      } else {
        setPayoutMessage(response.data.message || "Failed to submit payout request");
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
    if (!dateString) return new Date().toLocaleDateString();
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const defaultInvoiceData = {
    invoiceNumber: "N/A",
    date: new Date().toISOString(),
    billTo: { firstName: "-", lastName: "-", email: "-", phoneNumber: "-" },
    items: [{ qty: 0, itemCode: "-", description: "No data available", unitPrice: 0, total: 0 }],
    subtotal: 0,
    vat: 0,
    total: 0,
  };

  const displayData = invoiceData || defaultInvoiceData;

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
              <svg className={`ml-2 w-5 h-5 transition-transform ${showReportDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showReportDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                {REPORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReportNavigation(option.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.value === "commission" ? "bg-gray-50 font-medium" : ""}`}
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
                <svg className={`ml-2 w-4 h-4 transition-transform ${showQuarterDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showQuarterDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px] max-h-60 overflow-y-auto">
                  {QUARTERS.map((quarter) => (
                    <button
                      key={quarter.label}
                      onClick={() => handleQuarterSelect(quarter.label)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedQuarter === quarter.label ? "bg-gray-50 font-medium" : ""}`}
                    >
                      {quarter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="border border-green px-4 py-1 rounded text-xs text-white bg-[#039994]"
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

        {!loading && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#039994] mb-2">INVOICE</h1>
                  <div className="text-sm text-gray-600">
                    <div>INVOICE #{displayData.invoiceNumber}</div>
                    <div>DATE: {formatDate(displayData.date)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Name</span>
                    <span className="text-gray-900">{displayData.billTo.firstName} {displayData.billTo.lastName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Address</span>
                    <span className="text-gray-900">-</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Email Address</span>
                    <span className="text-gray-900">{displayData.billTo.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Phone number</span>
                    <span className="text-gray-900">{displayData.billTo.phoneNumber || "-"}</span>
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
                <div className="text-gray-900">1. Invoice for {selectedQuarter} DCarbon Agent Commissions</div>
              </div>

              <div className="grid grid-cols-6 gap-4 mb-6 text-xs">
                {[["SALESPERSON", "-"], ["P.O. NUMBER", "-"], ["REQUISITIONER", "-"], ["SHIPPED VIA", "-"], ["F.O.B. POINT", "-"], ["TERMS", "Due on Receipt"]].map(([label, val]) => (
                  <div key={label}>
                    <div className="font-semibold text-gray-700">{label}</div>
                    <div className="text-gray-900">{val}</div>
                  </div>
                ))}
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

              {displayData.items.map((item, index) => (
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
                <div className="text-sm text-gray-900 mb-6">Please contact support@dcarbon.solutions for specific remittance instructions.</div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">SUBTOTAL</span>
                    <span className="text-gray-900">${displayData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">V.A.T.</span>
                    <span className="text-gray-900">${displayData.vat.toFixed(2)}</span>
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
                  <h2 className="text-2xl font-bold text-[#039994] mb-2">DCARBON AGENT STATEMENT – {selectedQuarter}</h2>
                  <div className="text-sm text-gray-600">DATE: {formatDate(displayData.date)}</div>
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
                {[["NEW MW DIR", "0"], ["ACTIVE MW DIR", "0"], ["MWH DIR", "0"], ["REC SOLD", "0"], ["NEW MW PARTNER", "0"], ["ACTIVE MW PARTNER", "0"], ["MWH PARTNER", "0"], ["REC PRICE", "$0.00"]].map(([label, val]) => (
                  <div key={label}>
                    <div className="font-bold text-gray-700 text-xs">{label}</div>
                    <div className="text-gray-900 text-sm">{val}</div>
                  </div>
                ))}
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

              {displayData.items.map((item, index) => (
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
                <div className="text-sm text-gray-900 mb-6">Please contact support@dcarbon.solutions for specific remittance instructions.</div>
              </div>

              <div className="flex justify-between items-start">
                <div className="bg-[#039994] text-white px-6 py-3 rounded-lg">
                  <div className="text-xs mb-1">Available Balance</div>
                  <div className="text-xl font-bold">${walletBalance.toFixed(2)}</div>
                </div>
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">SUBTOTAL</span>
                    <span className="text-gray-900">${displayData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">V.A.T.</span>
                    <span className="text-gray-900">${displayData.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">PAID</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                    <span className="font-bold text-gray-900">TOTAL (USD)</span>
                    <span className="font-bold text-gray-900">${displayData.total.toFixed(2)}</span>
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
                      {["Payout ID", "User Type", "Amount", "Status", "Admin Note", "Created At", "Approved By"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payoutHistory.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{payout.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payout.userType}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${payout.amountRequested}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(payout.status)}`}>{payout.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{payout.adminNote || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{new Date(payout.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payout.approvedBy ? payout.approvedBy.slice(0, 8) + "..." : "-"}</td>
                      </tr>
                    ))}
                    {payoutHistory.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">No payout history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          invoiceData={displayData}
          quarterFilter={selectedQuarter}
          walletBalance={walletBalance}
        />
      )}

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#039994] mb-4">Request Payout</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                placeholder="Enter amount"
              />
            </div>
            {payoutMessage && (
              <div className={`mb-4 p-3 rounded-md ${payoutMessage.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {payoutMessage}
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setShowPayoutModal(false); setPayoutMessage(""); setPayoutAmount(""); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button onClick={handleSubmitPayout} disabled={loadingPayout} className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] disabled:opacity-50">
                {loadingPayout ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportReportModal({ onClose, invoiceData, quarterFilter, walletBalance }) {
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildStatementRows = () => {
    const date = invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString() : new Date().toLocaleDateString();
    return {
      invoiceNumber: invoiceData?.invoiceNumber || "N/A",
      date,
      name: `${invoiceData?.billTo?.firstName || "-"} ${invoiceData?.billTo?.lastName || "-"}`,
      email: invoiceData?.billTo?.email || "-",
      phone: invoiceData?.billTo?.phoneNumber || "-",
      quarter: quarterFilter,
      items: invoiceData?.items || [],
      subtotal: invoiceData?.subtotal || 0,
      vat: invoiceData?.vat || 0,
      total: invoiceData?.total || 0,
      walletBalance: walletBalance || 0,
    };
  };

  const exportCSV = () => {
    const d = buildStatementRows();
    const lines = [
      ["DCarbon Earnings Statement"],
      ["Quarter", d.quarter],
      ["Invoice #", d.invoiceNumber],
      ["Date", d.date],
      [],
      ["BILL FROM"],
      ["Name", d.name],
      ["Email", d.email],
      ["Phone", d.phone],
      [],
      ["BILL TO"],
      ["Company", "DCarbon Solutions, Inc."],
      ["Address", "8 The Green, STE A, Dover DE, 19901"],
      ["Email", "support@dcarbon.solutions"],
      [],
      ["LINE ITEMS"],
      ["QTY", "Item Code", "Description", "Unit Price", "Total"],
      ...d.items.map((item) => [item.qty, item.itemCode, item.description, `$${item.unitPrice.toFixed(2)}`, `$${item.total.toFixed(2)}`]),
      [],
      ["SUMMARY"],
      ["Subtotal", `$${d.subtotal.toFixed(2)}`],
      ["V.A.T.", `$${d.vat.toFixed(2)}`],
      ["Total (USD)", `$${d.total.toFixed(2)}`],
      ["Available Balance", `$${d.walletBalance.toFixed(2)}`],
    ];

    const csv = lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `earnings-statement-${quarterFilter}.csv`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() => ({ default: window.jspdf.jsPDF }));
    const d = buildStatementRows();
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    const teal = [3, 153, 148];
    const black = [30, 30, 30];
    const gray = [100, 100, 100];

    doc.setFillColor(...teal);
    doc.rect(0, 0, pageWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...teal);
    doc.text("INVOICE", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    y += 16;
    doc.text(`Invoice #: ${d.invoiceNumber}`, margin, y);
    y += 12;
    doc.text(`Date: ${d.date}`, margin, y);
    y += 12;
    doc.text(`Quarter: ${d.quarter}`, margin, y);

    y += 24;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text("FROM:", margin, y);
    doc.text("BILL TO:", pageWidth / 2, y);

    doc.setFont("helvetica", "normal");
    y += 13;
    doc.setTextColor(...gray);
    doc.text(d.name, margin, y);
    doc.text("DCarbon Solutions, Inc.", pageWidth / 2, y);
    y += 11;
    doc.text(d.email, margin, y);
    doc.text("8 The Green, STE A, Dover DE, 19901", pageWidth / 2, y);
    y += 11;
    doc.text(d.phone, margin, y);
    doc.text("support@dcarbon.solutions", pageWidth / 2, y);

    y += 24;
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...teal);
    doc.text("LINE ITEMS", margin, y);
    y += 12;

    const colWidths = [30, 70, 250, 70, 60];
    const headers = ["QTY", "ITEM CODE", "DESCRIPTION", "UNIT PRICE", "TOTAL"];
    const colX = [margin];
    for (let i = 1; i < colWidths.length; i++) colX.push(colX[i - 1] + colWidths[i - 1]);

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 10, pageWidth - margin * 2, 16, "F");
    doc.setTextColor(...black);
    headers.forEach((h, i) => doc.text(h, colX[i], y));

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    d.items.forEach((item) => {
      const vals = [String(item.qty), item.itemCode, item.description, `$${item.unitPrice.toFixed(2)}`, `$${item.total.toFixed(2)}`];
      vals.forEach((v, i) => {
        const text = doc.splitTextToSize(v, colWidths[i] - 4);
        doc.text(text, colX[i], y);
      });
      y += 16;
      doc.setDrawColor(235, 235, 235);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
    });

    y += 12;
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    const summaryX = pageWidth - margin - 160;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    const summaryRows = [["Subtotal", `$${d.subtotal.toFixed(2)}`], ["V.A.T.", `$${d.vat.toFixed(2)}`], ["Paid", "$0.00"], ["TOTAL (USD)", `$${d.total.toFixed(2)}`]];
    summaryRows.forEach(([label, val], idx) => {
      if (idx === summaryRows.length - 1) {
        doc.setFillColor(...teal);
        doc.rect(summaryX - 8, y - 11, 170, 16, "F");
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(...gray);
      }
      doc.text(label, summaryX, y);
      doc.text(val, pageWidth - margin, y, { align: "right" });
      y += 16;
    });

    y += 8;
    doc.setFillColor(3, 153, 148, 20);
    doc.setDrawColor(...teal);
    doc.roundedRect(margin, y, 140, 36, 4, 4, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...teal);
    doc.text("Available Balance", margin + 10, y + 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`$${d.walletBalance.toFixed(2)}`, margin + 10, y + 28);

    y += 52;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("Remittance: Please contact support@dcarbon.solutions for specific remittance instructions.", margin, y);

    doc.setFillColor(...teal);
    doc.rect(0, doc.internal.pageSize.getHeight() - 8, pageWidth, 8, "F");

    const blob = doc.output("blob");
    triggerDownload(blob, `earnings-statement-${quarterFilter}.pdf`);
  };

  const exportDOCX = async () => {
    const d = buildStatementRows();

    const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer } = await import("https://unpkg.com/docx@8.5.0/build/index.js");

    const tealColor = "039994";
    const grayColor = "666666";

    const headerParagraph = (text) => new Paragraph({
      children: [new TextRun({ text, bold: true, size: 28, color: tealColor })],
      spacing: { after: 120 },
    });

    const labelValue = (label, value) => new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 18 }),
        new TextRun({ text: value, size: 18, color: grayColor }),
      ],
      spacing: { after: 60 },
    });

    const sectionTitle = (text) => new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, color: tealColor })],
      spacing: { before: 200, after: 100 },
    });

    const divider = () => new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" } },
      spacing: { after: 120 },
    });

    const itemsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ["QTY", "ITEM CODE", "DESCRIPTION", "UNIT PRICE", "TOTAL"].map((h) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 16, color: tealColor })] })],
              shading: { fill: "F5F5F5" },
            })
          ),
        }),
        ...d.items.map((item) =>
          new TableRow({
            children: [
              String(item.qty),
              item.itemCode,
              item.description,
              `$${item.unitPrice.toFixed(2)}`,
              `$${item.total.toFixed(2)}`,
            ].map((val) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: val, size: 16, color: grayColor })] })],
              })
            ),
          })
        ),
      ],
    });

    const summaryTable = new Table({
      width: { size: 40, type: WidthType.PERCENTAGE },
      rows: [
        ["Subtotal", `$${d.subtotal.toFixed(2)}`],
        ["V.A.T.", `$${d.vat.toFixed(2)}`],
        ["Paid", "$0.00"],
        ["TOTAL (USD)", `$${d.total.toFixed(2)}`],
      ].map(([label, val]) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: val, size: 18, color: grayColor })], alignment: AlignmentType.RIGHT })] }),
          ],
        })
      ),
    });

    const doc = new Document({
      sections: [{
        children: [
          headerParagraph("INVOICE – DCarbon Earnings Statement"),
          labelValue("Quarter", d.quarter),
          labelValue("Invoice #", d.invoiceNumber),
          labelValue("Date", d.date),
          divider(),
          sectionTitle("FROM"),
          labelValue("Name", d.name),
          labelValue("Email", d.email),
          labelValue("Phone", d.phone),
          sectionTitle("BILL TO"),
          labelValue("Company", "DCarbon Solutions, Inc."),
          labelValue("Address", "8 The Green, STE A, Dover DE, 19901"),
          labelValue("Email", "support@dcarbon.solutions"),
          divider(),
          sectionTitle("LINE ITEMS"),
          itemsTable,
          new Paragraph({ spacing: { after: 200 } }),
          sectionTitle("SUMMARY"),
          summaryTable,
          new Paragraph({ spacing: { after: 160 } }),
          new Paragraph({
            children: [new TextRun({ text: `Available Balance: $${d.walletBalance.toFixed(2)}`, bold: true, size: 20, color: tealColor })],
            spacing: { after: 200 },
          }),
          divider(),
          new Paragraph({
            children: [new TextRun({ text: "Remittance: Please contact support@dcarbon.solutions for specific remittance instructions.", size: 16, italics: true, color: grayColor })],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    triggerDownload(blob, `earnings-statement-${quarterFilter}.docx`);
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setError("");
    setLoading(true);
    try {
      if (format === "csv") {
        exportCSV();
      } else if (format === "pdf") {
        await exportPDF();
      } else if (format === "docx") {
        await exportDOCX();
      }
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#039994]">Export Earnings Statement</h2>
          <button onClick={onClose} className="text-[#F04438] hover:text-red-600 text-xl" disabled={loading}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ value: "csv", label: "CSV", icon: "📊" }, { value: "pdf", label: "PDF", icon: "📄" }, { value: "docx", label: "Word (.docx)", icon: "📝" }].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg text-sm transition-all ${format === opt.value ? "border-[#039994] bg-[#039994]/5 text-[#039994] font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  <span className="text-xl mb-1">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700 font-medium mb-1">Export Details</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Quarter: {quarterFilter}</div>
              <div>Invoice #: {invoiceData?.invoiceNumber}</div>
              <div>Date: {invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028c87] text-sm disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}