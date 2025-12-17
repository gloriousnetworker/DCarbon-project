import React, { useState, useEffect } from "react";

export default function UserSalesStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState("10");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isDisabled, setIsDisabled] = useState(false);

  const getAuthData = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
    return {
      userId: loginResponse?.data?.user?.id,
      authToken: loginResponse?.data?.token
    };
  };

  useEffect(() => {
    const checkMeters = async () => {
      const { userId, authToken } = getAuthData();
      if (!userId || !authToken) {
        setIsDisabled(true);
        return;
      }
      try {
        const response = await fetch(
          `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
          {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
          }
        );
        const result = await response.json();
        const metersExist = result.status === 'success' && 
                           Array.isArray(result.data) &&
                           result.data.some(item => 
                             Array.isArray(item.meters) &&
                             item.meters.some(meter => 
                               Array.isArray(meter.meterNumbers) && 
                               meter.meterNumbers.length > 0
                             )
                           );
        setIsDisabled(!metersExist);
      } catch (error) {
        console.error('Error checking meters:', error);
        setIsDisabled(true);
      }
    };
    checkMeters();
  }, []);

  useEffect(() => {
    fetchUserSalesStatement();
  }, [selectedQuarter, selectedMonth, selectedYear]);

  const fetchUserSalesStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const { userId, authToken } = getAuthData();
      if (!userId || !authToken) {
        throw new Error("Missing user authentication data");
      }
      
      const baseUrl = "https://services.dcarbon.solutions/api/rec/sale-statement";
      const queryParams = new URLSearchParams({
        quarter: selectedQuarter,
        month: selectedMonth,
        year: selectedYear,
        userId: userId
      });
      
      const response = await fetch(`${baseUrl}?${queryParams}`, {
        method: 'GET', 
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.status === "fail") {
          throw new Error(data.message || "Failed to fetch statement");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (data.status === "success" && data.data) {
        setStatementData(data.data);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      setError(err.message);
      setStatementData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
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

  const getRevenueTier = (amount) => {
    const amt = amount || 0;
    return amt >= 5000 ? "Tier 1" : 
           amt >= 3000 ? "Tier 2" : 
           amt >= 1000 ? "Tier 3" : "Base";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-gray-500">Loading statement...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-[#039994] text-left">Recent Statements</h3>
          <div className="flex space-x-2">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>Month {month}</option>
              ))}
            </select>
            <select 
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h4 className="text-lg font-semibold text-red-800 mb-2">No Data Available</h4>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchUserSalesStatement}
            className="mt-4 bg-[#039994] text-white px-4 py-2 rounded-md hover:bg-[#02857f] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-md shadow p-4 w-full ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-[#039994] text-left">Recent Statements</h3>
        <div className="flex space-x-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>Month {month}</option>
            ))}
          </select>
          <select 
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </div>
      </div>
      
      {statementData?.period && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm font-medium text-gray-700">
            Period: {statementData.period.year} - {statementData.period.month}
          </p>
        </div>
      )}

      {statementData?.userInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Company Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Company:</span>
              <p className="text-gray-800">{statementData.userInfo.companyName || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Owner:</span>
              <p className="text-gray-800">{statementData.userInfo.ownerFullName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Entity Type:</span>
              <p className="text-gray-800">{statementData.userInfo.entityType}</p>
            </div>
          </div>
        </div>
      )}

      {statementData?.overview && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-blue-600">Active Facilities</h5>
            <p className="text-xl font-bold text-blue-800">{statementData.overview.activeFacilities}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-green-600">Total RECs Generated</h5>
            <p className="text-xl font-bold text-green-800">
              {formatNumber(statementData.overview.totalRecsGenerated)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-purple-600">Total RECs Sold</h5>
            <p className="text-xl font-bold text-purple-800">
              {formatNumber(statementData.overview.totalRecsSold)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-orange-600">Current REC Balance</h5>
            <p className="text-xl font-bold text-orange-800">
              {formatNumber(statementData.overview.currentRecBalance)}
            </p>
          </div>
        </div>
      )}

      {statementData?.facilities && statementData.facilities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-black">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">Facility Name</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">REC Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statementData.facilities.map((facility, index) => (
                  <tr key={index}>
                    <td className="py-3 px-3">{facility.facilityName}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        facility.status === "APPROVED" ? "bg-green-100 text-green-800" : 
                        facility.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {facility.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">{formatNumber(facility.currentRecBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-black">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-3 px-3 font-semibold">Total Active Gen.</th>
              <th className="py-3 px-3 font-semibold">Total RECs Gen.</th>
              <th className="py-3 px-3 font-semibold">Total RECs Sold</th>
              <th className="py-3 px-3 font-semibold">Total REC Bal.</th>
              <th className="py-3 px-3 font-semibold">Avg. REC Price</th>
              <th className="py-3 px-3 font-semibold">Revenue Tier</th>
              <th className="py-3 px-3 font-semibold">Earnings</th>
              <th className="py-3 px-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {statementData?.sales && statementData.sales.length > 0 ? (
              statementData.sales.map((sale, index) => (
                <tr key={sale.saleId || index}>
                  <td className="py-3 px-3">{statementData.overview?.activeFacilities || "0"}</td>
                  <td className="py-3 px-3">
                    {formatNumber(statementData.overview?.totalRecsGenerated || 0)}
                  </td>
                  <td className="py-3 px-3">{formatNumber(sale.recsDeducted || 0)}</td>
                  <td className="py-3 px-3">
                    {formatNumber(statementData.overview?.currentRecBalance || 0)}
                  </td>
                  <td className="py-3 px-3">{formatCurrency(sale.salePrice)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      getRevenueTier(sale.totalAmount) === "Tier 1" ? "bg-green-100 text-green-800" : 
                      getRevenueTier(sale.totalAmount) === "Tier 2" ? "bg-blue-100 text-blue-800" : 
                      getRevenueTier(sale.totalAmount) === "Tier 3" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {getRevenueTier(sale.totalAmount)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`${sale.status === "COMPLETED" ? "text-green-600 font-medium" : "text-red-500 line-through"}`}>
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </td>
                  <td className="py-3 px-3">{formatDate(sale.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No sales statements found for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-100 rounded"></span>
          <span className="text-gray-600">Completed Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-100 rounded"></span>
          <span className="text-gray-600">Cancelled Sales (Strikethrough)</span>
        </div>
      </div>
    </div>
  );
}