import React, { useState, useEffect } from "react";
import { backArrow, pageTitle } from "../styles";

export default function CurrentStatementModal({ isOpen, onClose }) {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("10");
  const [selectedYear, setSelectedYear] = useState("2025");

  const getAuthData = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
    return {
      userId: loginResponse?.data?.user?.id,
      authToken: loginResponse?.data?.token
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentStatement();
    }
  }, [isOpen, selectedMonth, selectedYear]);

  const fetchCurrentStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const { userId, authToken } = getAuthData();
      
      if (!userId || !authToken) {
        throw new Error("Missing authentication data");
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/rec/sale-statement?month=${selectedMonth}&year=${selectedYear}&userId=${userId}`,
        {
          method: 'GET',
          headers: { 
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch statement");
      }

      if (data.status === "success" && data.data) {
        setStatementData(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.message);
      setStatementData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 2 
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(number || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className={backArrow} onClick={onClose}>
          &#8592; Back
        </div>
        <h2 className={pageTitle}>Current Statement</h2>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>Month {month}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchCurrentStatement}
            className="bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#02857f] transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading statement...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h4 className="text-lg font-semibold text-red-800 mb-2">Error Loading Statement</h4>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchCurrentStatement}
              className="bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#02857f] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : statementData ? (
          <div>
            {statementData.period && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Statement Period: {statementData.period.year} - Month {statementData.period.month}
                </h3>
              </div>
            )}

            {statementData.userInfo && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-medium">{statementData.userInfo.companyName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium">{statementData.userInfo.ownerFullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entity Type</p>
                    <p className="font-medium">{statementData.userInfo.entityType}</p>
                  </div>
                </div>
              </div>
            )}

            {statementData.overview && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Active Facilities</p>
                    <p className="text-2xl font-bold text-[#039994]">{statementData.overview.activeFacilities}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">RECs Generated</p>
                    <p className="text-2xl font-bold text-[#039994]">
                      {formatNumber(statementData.overview.totalRecsGenerated)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">RECs Sold</p>
                    <p className="text-2xl font-bold text-[#039994]">
                      {formatNumber(statementData.overview.totalRecsSold)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-[#039994]">
                      {formatNumber(statementData.overview.currentRecBalance)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statementData.facilities && statementData.facilities.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Facilities ({statementData.facilities.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Facility Name</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">REC Balance</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statementData.facilities.map((facility, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4">{facility.facilityName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              facility.status === "APPROVED" ? "bg-green-100 text-green-800" : 
                              facility.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"
                            }`}>
                              {facility.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatNumber(facility.currentRecBalance)}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {facility.address || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {statementData.sales && statementData.sales.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Sales Transactions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Sale ID</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">RECs Sold</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Price per REC</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Total Amount</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statementData.sales.map((sale, index) => (
                        <tr key={sale.saleId || index}>
                          <td className="py-3 px-4 font-mono text-sm">{sale.saleId || `SALE-${index + 1}`}</td>
                          <td className="py-3 px-4">{formatNumber(sale.recsDeducted)}</td>
                          <td className="py-3 px-4">{formatCurrency(sale.salePrice)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              sale.status === "COMPLETED" ? "text-green-600" : "text-red-500"
                            }`}>
                              {formatCurrency(sale.totalAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sale.status === "COMPLETED" ? "bg-green-100 text-green-800" : 
                              "bg-red-100 text-red-800"
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(sale.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">No sales transactions found for this period</p>
              </div>
            )}

            {statementData.metadata && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Page {statementData.metadata.page} of {statementData.metadata.totalPages} • 
                  Total Records: {statementData.metadata.total}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No statement data available</p>
          </div>
        )}
      </div>
    </div>
  );
}