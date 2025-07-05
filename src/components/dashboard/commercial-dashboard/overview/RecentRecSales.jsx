import React, { useState, useEffect } from "react";

export default function UserSalesStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const checkMeters = async () => {
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        setIsDisabled(true);
        return;
      }

      try {
        const response = await fetch(
          `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const result = await response.json();
        const metersExist = result.status === 'success' && 
                           result.data?.length > 0 && 
                           result.data.some(item => item.meters?.meters?.length > 0);
        setIsDisabled(!metersExist);
      } catch (error) {
        console.error('Error checking meters:', error);
        setIsDisabled(true);
      }
    };

    checkMeters();
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    setUserId(storedUserId);
    if (storedUserId && authToken) fetchUserSalesStatement(storedUserId);
    else { setError("Missing userId or authToken in localStorage"); setLoading(false); }
  }, []);

  const fetchUserSalesStatement = async (userId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("No authentication token found");
      const response = await fetch(`https://services.dcarbon.solutions/api/rec/sale-statement/${userId}`, {
        method: 'GET', headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data.status === "success" && data.data) setStatementData(data.data);
      else throw new Error(data.message || "Invalid response format");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
  const formatNumber = (number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  const getRevenueTier = (amount) => amount >= 5000 ? "Tier 1" : amount >= 3000 ? "Tier 2" : amount >= 1000 ? "Tier 3" : "Base";

  if (loading) return <div className="bg-white rounded-md shadow p-4"><div className="flex justify-center items-center h-32"><div className="animate-pulse text-gray-500">Loading statement...</div></div></div>;
  if (error) return <div className="bg-white rounded-md shadow p-4"><div className="text-red-500">Error: {error}</div></div>;

  return (
    <div className={`bg-white rounded-md shadow p-4 w-full ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="mb-4"><h3 className="text-2xl font-bold text-[#039994] text-left">Recent Statements</h3></div>
      {statementData?.userInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Company Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><span className="font-medium text-gray-600">Company:</span><p className="text-gray-800">{statementData.userInfo.companyName}</p></div>
            <div><span className="font-medium text-gray-600">Owner:</span><p className="text-gray-800">{statementData.userInfo.ownerFullName}</p></div>
            <div><span className="font-medium text-gray-600">Entity Type:</span><p className="text-gray-800">{statementData.userInfo.entityType}</p></div>
          </div>
        </div>
      )}
      {statementData?.overview && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><h5 className="text-sm font-medium text-blue-600">Active Facilities</h5><p className="text-xl font-bold text-blue-800">{statementData.overview.activeFacilities}</p></div>
          <div className="bg-green-50 p-4 rounded-lg"><h5 className="text-sm font-medium text-green-600">Total RECs Generated</h5><p className="text-xl font-bold text-green-800">{formatNumber(statementData.overview.totalRecsGenerated)}</p></div>
          <div className="bg-purple-50 p-4 rounded-lg"><h5 className="text-sm font-medium text-purple-600">Total RECs Sold</h5><p className="text-xl font-bold text-purple-800">{formatNumber(statementData.overview.totalRecsSold)}</p></div>
          <div className="bg-orange-50 p-4 rounded-lg"><h5 className="text-sm font-medium text-orange-600">Current REC Balance</h5><p className="text-xl font-bold text-orange-800">{formatNumber(statementData.overview.currentRecBalance)}</p></div>
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
            {statementData?.sales && statementData.sales.length > 0 ? statementData.sales.map((sale) => (
              <tr key={sale.saleId}>
                <td className="py-3 px-3">{statementData.overview?.activeFacilities || "0"}</td>
                <td className="py-3 px-3">{formatNumber(statementData.overview?.totalRecsGenerated || 0)}</td>
                <td className="py-3 px-3">{formatNumber(sale.recsDeducted)}</td>
                <td className="py-3 px-3">{formatNumber(statementData.overview?.currentRecBalance || 0)}</td>
                <td className="py-3 px-3">{formatCurrency(sale.salePrice)}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getRevenueTier(sale.totalAmount) === "Tier 1" ? "bg-green-100 text-green-800" : getRevenueTier(sale.totalAmount) === "Tier 2" ? "bg-blue-100 text-blue-800" : getRevenueTier(sale.totalAmount) === "Tier 3" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>{getRevenueTier(sale.totalAmount)}</span>
                </td>
                <td className="py-3 px-3"><span className={`${sale.status === "COMPLETED" ? "text-green-600 font-medium" : "text-red-500 line-through"}`}>{formatCurrency(sale.totalAmount)}</span></td>
                <td className="py-3 px-3">{formatDate(sale.date)}</td>
              </tr>
            )) : <tr><td colSpan="8" className="py-4 text-center text-gray-500">No sales statements found for this user</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-100 rounded"></span><span className="text-gray-600">Completed Sales</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-100 rounded"></span><span className="text-gray-600">Cancelled Sales (Strikethrough)</span></div>
      </div>
    </div>
  );
}