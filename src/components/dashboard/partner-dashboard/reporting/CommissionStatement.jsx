import React, { useState, useEffect } from "react";
import axios from "axios";

const QUARTERS = [
  { label: "Q1 2025", value: "Q1-2025", months: "Jan-Mar" },
  { label: "Q2 2025", value: "Q2-2025", months: "Apr-Jun" },
  { label: "Q3 2025", value: "Q3-2025", months: "Jul-Sep" },
  { label: "Q4 2025", value: "Q4-2025", months: "Oct-Dec" },
  { label: "Q1 2024", value: "Q1-2024", months: "Jan-Mar" },
  { label: "Q2 2024", value: "Q2-2024", months: "Apr-Jun" },
  { label: "Q3 2024", value: "Q3-2024", months: "Jul-Sep" },
  { label: "Q4 2024", value: "Q4-2024", months: "Oct-Dec" },
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
  const [quarterFilter, setQuarterFilter] = useState("Q2 2025");
  const [commissionData, setCommissionData] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loadingPayout, setLoadingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");

  useEffect(() => {
    const mockCommissionData = {
      invoiceNumber: "1010101",
      invoiceDate: "4/07/2025",
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
      instructions: "Invoice for Q2, 2025 DCarbon Agent Commissions",
      terms: "Due on Receipt",
      metrics: {
        newMwDir: "2.5",
        activeMwDir: "8.2",
        mwhDir: "1,200",
        recSold: "5,520",
        newMwPartner: "12.0",
        activeMwPartner: "29.6",
        mwhPartner: "4,320",
        recPrice: "$12.22"
      },
      lineItems: [
        {
          qty: "2.5",
          itemCode: "DCarbon Dir Reg",
          description: "Q2 Direct Registration Commissions ($/MW)",
          unitPrice: "$1,000.00",
          total: "$2,500.00"
        },
        {
          qty: "12.0",
          itemCode: "DCarbon Part Reg",
          description: "Q2 Partner Registration Commissions ($/MW)",
          unitPrice: "$500.00",
          total: "$6,000.00"
        },
        {
          qty: "1,200",
          itemCode: "DCarbon Dir Comm",
          description: "Q2 Ongoing Direct Commissions $12.22/REC (2.5%)",
          unitPrice: "0.3055",
          total: "$366.60"
        },
        {
          qty: "4,320",
          itemCode: "DCarbon Ong Comm",
          description: "Q2 Ongoing Partner Commissions $12.22/REC (1.0%)",
          unitPrice: "0.1222",
          total: "$527.90"
        }
      ],
      remittanceInstructions: "Please contact support@dcarbon.solutions for specific remittance instructions.",
      subtotal: "$9,394.50",
      vat: "$0.00",
      paid: "$0.00",
      totalDue: "$9,394.50"
    };
    setCommissionData(mockCommissionData);
    fetchWalletBalance();
    fetchPayoutHistory();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      
      if (!userId || !authToken) return;

      const response = await fetch(`https://services.dcarbon.solutions/api/revenue/${userId}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

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
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      
      if (!userId || !authToken) return;

      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request?userId=${userId}&userType=PARTNER`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

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
    setQuarterFilter(quarter);
    setShowQuarterDropdown(false);
  };

  const handleExportReport = async (exportParams) => {
    try {
      if (exportParams.format !== "csv" || exportParams.email) {
        const token = localStorage.getItem("authToken");
        
        const requestBody = {
          format: exportParams.format,
          email: exportParams.email,
          reportType: 'commission',
          quarter: quarterFilter,
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

  const handleSubmitPayout = async () => {
    try {
      setLoadingPayout(true);
      setPayoutMessage("");
      
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      
      if (!userId || !authToken) {
        setPayoutMessage("Authentication required");
        return;
      }

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
          "Authorization": `Bearer ${authToken}`
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
            <div className="relative">
              <button
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                className="flex items-center border border-gray-300 px-4 py-1 rounded text-xs hover:bg-gray-50"
                style={{ paddingTop: '4px', paddingBottom: '4px' }}
              >
                {quarterFilter}
                <svg 
                  className={`ml-2 w-4 h-4 transition-transform ${showQuarterDropdown ? 'rotate-180' : ''}`}
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
                      key={quarter.value}
                      onClick={() => handleQuarterSelect(quarter.label)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        quarterFilter === quarter.label ? 'bg-gray-50 font-medium' : ''
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
              className="border border-green px-4 py-1 rounded bg-[#039994] text-xs text-white"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
            >
              Export Report
            </button>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              className="border border-black px-4 py-1 rounded bg-[#1E1E1E] text-xs text-white"
              style={{ paddingTop: '4px', paddingBottom: '4px' }}
            >
              Request Payout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#039994] mb-2">INVOICE</h1>
              <div className="text-sm text-gray-600">
                <div>INVOICE #{commissionData.invoiceNumber}</div>
                <div>DATE: {commissionData.invoiceDate}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold text-gray-700 w-32">Name</span>
                <span className="text-gray-900">{commissionData.userInfo?.name}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-700 w-32">Address</span>
                <span className="text-gray-900">{commissionData.userInfo?.address}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-700 w-32">Email Address</span>
                <span className="text-gray-900">{commissionData.userInfo?.email}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-700 w-32">Phone number</span>
                <span className="text-gray-900">{commissionData.userInfo?.phone}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-gray-700">BILL TO:</div>
              <div className="text-gray-900">{commissionData.billingTo?.company}</div>
              <div className="text-gray-900">{commissionData.billingTo?.address}</div>
              <div className="text-gray-900">{commissionData.billingTo?.email}</div>
              <div className="mt-4">
                <div className="font-semibold text-gray-700">SHIP TO:</div>
                <div className="text-gray-900">N/A</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-2">COMMENTS OR SPECIAL INSTRUCTIONS:</div>
            <div className="text-gray-900">1. {commissionData.instructions}</div>
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
              <div className="text-gray-900">{commissionData.terms}</div>
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

          {commissionData.lineItems?.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 py-2 text-xs text-gray-900 border-b border-gray-200">
              <div className="col-span-1">{item.qty}</div>
              <div className="col-span-2">{item.itemCode}</div>
              <div className="col-span-6">{item.description}</div>
              <div className="col-span-2 text-right">{item.unitPrice}</div>
              <div className="col-span-1 text-right">{item.total}</div>
            </div>
          ))}

          <div className="mt-6">
            <div className="text-sm text-gray-700 mb-2 font-semibold">Remittance instructions:</div>
            <div className="text-sm text-gray-900 mb-6">{commissionData.remittanceInstructions}</div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">SUBTOTAL</span>
                <span className="text-gray-900">{commissionData.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">V.A.T.</span>
                <span className="text-gray-900">{commissionData.vat}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">PAID</span>
                <span className="text-gray-900">{commissionData.paid}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#039994] mb-2">DCARBON AGENT STATEMENT – {quarterFilter}</h2>
              <div className="text-sm text-gray-600">DATE: {commissionData.invoiceDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <div className="font-semibold text-gray-700">BILL TO:</div>
              <div className="text-gray-900">{commissionData.billingTo?.company}</div>
              <div className="text-gray-900">{commissionData.billingTo?.address}</div>
              <div className="text-gray-900">{commissionData.billingTo?.email}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-2">SHIP TO:</div>
              <div className="text-gray-900">N/A</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
            <div>
              <div className="font-bold text-gray-700 text-xs">NEW MW DIR</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.newMwDir}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">ACTIVE MW DIR</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.activeMwDir}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">MWH DIR</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.mwhDir}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">REC SOLD</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.recSold}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">NEW MW PARTNER</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.newMwPartner}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">ACTIVE MW PARTNER</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.activeMwPartner}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">MWH PARTNER</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.mwhPartner}</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 text-xs">REC PRICE</div>
              <div className="text-gray-900 text-sm">{commissionData.metrics?.recPrice}</div>
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

          {commissionData.lineItems?.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 py-2 text-xs text-gray-900 border-b border-gray-200">
              <div className="col-span-1">{item.qty}</div>
              <div className="col-span-2">{item.itemCode}</div>
              <div className="col-span-6">{item.description}</div>
              <div className="col-span-2 text-right">{item.unitPrice}</div>
              <div className="col-span-1 text-right">{item.total}</div>
            </div>
          ))}

          <div className="mt-6">
            <div className="text-sm text-gray-700 mb-2 font-semibold">Remittance instructions:</div>
            <div className="text-sm text-gray-900 mb-6">{commissionData.remittanceInstructions}</div>
          </div>

          <div className="flex justify-between items-start">
            <div className="bg-[#039994] text-white px-6 py-3 rounded-lg">
              <div className="text-xs mb-1">Available Balance</div>
              <div className="text-xl font-bold">${walletBalance.toFixed(2)}</div>
            </div>

            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">SUBTOTAL</span>
                <span className="text-gray-900">{commissionData.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">V.A.T.</span>
                <span className="text-gray-900">{commissionData.vat}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">PAID</span>
                <span className="text-gray-900">{commissionData.paid}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2">
                <span className="font-bold text-gray-900">TOTAL (USD)</span>
                <span className="font-bold text-gray-900">{commissionData.totalDue}</span>
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
      </div>

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          commissionData={commissionData}
          quarterFilter={quarterFilter}
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

function ExportReportModal({ onClose, commissionData, quarterFilter, walletBalance }) {
  const [loading, setLoading] = useState(false);

  const generateCSV = () => {
    let csv = "DCARBON AGENT EARNINGS STATEMENT\n\n";
    
    csv += `Quarter:,${quarterFilter}\n`;
    csv += `Invoice Number:,${commissionData.invoiceNumber}\n`;
    csv += `Invoice Date:,${commissionData.invoiceDate}\n\n`;
    
    csv += "AGENT INFORMATION\n";
    csv += `Name:,${commissionData.userInfo?.name}\n`;
    csv += `Address:,${commissionData.userInfo?.address}\n`;
    csv += `Email:,${commissionData.userInfo?.email}\n`;
    csv += `Phone:,${commissionData.userInfo?.phone}\n\n`;
    
    csv += "BILLING TO\n";
    csv += `Company:,${commissionData.billingTo?.company}\n`;
    csv += `Address:,${commissionData.billingTo?.address}\n`;
    csv += `Email:,${commissionData.billingTo?.email}\n\n`;
    
    csv += "METRICS\n";
    csv += `NEW MW DIR:,${commissionData.metrics?.newMwDir}\n`;
    csv += `ACTIVE MW DIR:,${commissionData.metrics?.activeMwDir}\n`;
    csv += `MWH DIR:,${commissionData.metrics?.mwhDir}\n`;
    csv += `REC SOLD:,${commissionData.metrics?.recSold}\n`;
    csv += `NEW MW PARTNER:,${commissionData.metrics?.newMwPartner}\n`;
    csv += `ACTIVE MW PARTNER:,${commissionData.metrics?.activeMwPartner}\n`;
    csv += `MWH PARTNER:,${commissionData.metrics?.mwhPartner}\n`;
    csv += `REC PRICE:,${commissionData.metrics?.recPrice}\n\n`;
    
    csv += "LINE ITEMS\n";
    csv += "QTY,ITEM CODE,DESCRIPTION,UNIT PRICE,TOTAL\n";
    commissionData.lineItems?.forEach(item => {
      csv += `${item.qty},${item.itemCode},"${item.description}",${item.unitPrice},${item.total}\n`;
    });
    
    csv += "\n";
    csv += `Remittance Instructions:,"${commissionData.remittanceInstructions}"\n\n`;
    
    csv += "FINANCIAL SUMMARY\n";
    csv += `Available Balance:,${walletBalance.toFixed(2)}\n`;
    csv += `Subtotal:,${commissionData.subtotal}\n`;
    csv += `V.A.T.:,${commissionData.vat}\n`;
    csv += `Paid:,${commissionData.paid}\n`;
    csv += `Total Due (USD):,${commissionData.totalDue}\n\n`;
    
    csv += `Generated on:,${new Date().toLocaleString()}\n`;
    
    return csv;
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `earnings-statement-${quarterFilter.replace(' ', '-')}-${dateStr}.csv`;

      const csvContent = generateCSV();
      downloadFile(csvContent, fileName, "text/csv");
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}. Please try again.`);
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
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">CSV Export</h3>
                <p className="text-xs text-gray-600">Download complete earnings statement</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">Export Details:</p>
            <div className="text-xs text-blue-600">
              <span className="block">• Quarter: {quarterFilter}</span>
              <span className="block">• Invoice #: {commissionData.invoiceNumber}</span>
              <span className="block">• Date: {commissionData.invoiceDate}</span>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <p className="text-sm text-green-700">
              The exported CSV will include all invoice details, metrics, line items, and financial summary exactly as shown on the statement.
            </p>
          </div>
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
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}