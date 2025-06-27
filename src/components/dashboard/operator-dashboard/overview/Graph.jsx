import React, { useState, useEffect } from "react";

export default function Graph() {
  const [chartType, setChartType] = useState("Solar Production");
  const [selectedFacility, setSelectedFacility] = useState("All facilities");
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [recData, setRecData] = useState({ totalRecs: 0, loading: true, error: null });
  const [energyData, setEnergyData] = useState({ solarProduction: [], energyConsumed: [], recsCreated: [], recsSold: [], loading: true });
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse"));
    if (loginResponse?.data?.user?.agreements === null && loginResponse?.data?.user?.utilityAuth?.length === 0) {
      setIsDisabled(true);
    }
  }, []);

  const getUserId = () => {
    return localStorage.getItem("userId") || "14bbbf22-03c1-41a7-9bca-9429ec89a28b";
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        const userId = getUserId();
        
        const response = await fetch(`https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const facilitiesData = data.data?.facilities || [];
        setFacilities(facilitiesData);
        const totalRecs = facilitiesData.reduce((sum, facility) => sum + (facility.totalRecs || 0), 0);
        setRecData(prev => ({ ...prev, totalRecs: totalRecs, loading: false }));
      } catch (err) {
        setError(err.message);
        setRecData(prev => ({ ...prev, loading: false, totalRecs: 0 }));
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        setChartLoading(true);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const emptyMonthlyData = months.map(month => ({ month, solarProduction: 0, energyConsumed: 0, recsCreated: 0, recsSold: 0 }));
        setMonthlyData(emptyMonthlyData);
        setEnergyData({ solarProduction: emptyMonthlyData, energyConsumed: emptyMonthlyData, recsCreated: emptyMonthlyData, recsSold: emptyMonthlyData, loading: false });
      } catch (err) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const emptyData = months.map(month => ({ month, value: 0 }));
        setMonthlyData(emptyData);
      } finally {
        setChartLoading(false);
      }
    };

    if (facilities.length > 0) fetchEnergyData();
  }, [selectedYear, chartType, selectedFacility, facilities]);

  const getCurrentChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => ({ month, value: 0 }));
  };

  const getActualStats = () => {
    let totalRecs = 0;
    let verifiedFacilities = 0;
    let relevantFacilities = facilities;
    if (selectedFacility !== "All facilities") relevantFacilities = facilities.filter(f => f.id === selectedFacility);
    relevantFacilities.forEach(facility => { totalRecs += facility.totalRecs || 0; if (facility.status === "VERIFIED") verifiedFacilities++; });
    return { recGenerated: totalRecs, recSold: Math.floor(totalRecs * 0.85), revenueEarned: Math.floor(totalRecs * 0.85 * 45), salePricePerREC: totalRecs > 0 ? 45 : 0, energyProduced: Math.floor(totalRecs * 1.2), activeFacilities: relevantFacilities.length, verifiedFacilities };
  };

  const getFillColor = () => chartType === "Energy Consumed" ? "#000000" : chartType === "RECs Created" || chartType === "RECs Sold" ? "#039994" : "#FBBF24";
  const getChartUnits = () => (chartType === "RECs Created" || chartType === "RECs Sold") ? "RECs" : "MWh";
  const yAxisValues = [100, 75, 50, 25, 0];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-pulse text-gray-500">Loading facilities...</div></div>;
  if (error) return <div className="text-red-500 p-4">Error loading facilities: {error}</div>;

  const chartData = getCurrentChartData();
  const stats = getActualStats();

  return (
    <div className={`w-full bg-gray-50 min-h-screen p-6 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
      <h2 className="text-2xl font-bold text-[#039994] mb-6">Energy Performance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="text-[#039994] font-semibold bg-transparent focus:outline-none cursor-pointer text-lg">
                <option value="Solar Production">Solar Production</option>
                <option value="Energy Consumed">Energy Consumed</option>
                <option value="RECs Created">RECs Generated</option>
                <option value="RECs Sold">RECs Sold</option>
              </select>
              <span className="text-sm text-gray-500 font-medium">{getChartUnits()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <select value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[180px]">
                <option value="All facilities">All facilities</option>
                {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.facilityName}</option>)}
              </select>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>Yearly</option>
                <option>Monthly</option>
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
          </div>
          {chartLoading ? <div className="flex justify-center items-center h-80"><div className="animate-pulse text-gray-500">Loading chart data...</div></div> : (
            <div className="flex items-end">
              <div className="flex flex-col justify-between items-end mr-4 h-80 py-2">
                {yAxisValues.map((val, idx) => <span key={idx} className="text-gray-400 text-sm font-medium">{val}</span>)}
              </div>
              <div className="flex-1 flex items-end justify-between h-80 px-2">
                {chartData.map((data, idx) => {
                  const heightPercentage = Math.max(0, Math.min(100, (data.value / 100) * 100));
                  const isEmpty = data.value === 0;
                  return (
                    <div key={idx} className="flex flex-col items-center relative group">
                      <div className="relative w-8 h-72 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden shadow-inner">
                        {!isEmpty && <div style={{ backgroundColor: getFillColor(), height: `${heightPercentage}%` }} className="absolute bottom-0 left-0 right-0 rounded-full" />}
                        {isEmpty && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">0</div>}
                        <div className="absolute left-1 top-2 bottom-2 w-1 bg-white opacity-20 rounded-full" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">{data.value} {getChartUnits()}</div>
                      <p className="text-xs text-gray-600 mt-3 font-medium">{data.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {facilities.length > 0 && stats.recGenerated === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="ml-3 text-sm text-yellow-800">No energy data available yet. Data will appear once your facilities start generating RECs.</p>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-[#039994] rounded-full"></div><p className="text-gray-700 text-sm font-medium">RECs Generated</p></div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? <div className="animate-pulse h-6 bg-gray-200 rounded"></div> : <p className="text-[#056C69] text-xl font-bold">{stats.recGenerated.toFixed(2)}</p>}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-[#039994] rounded-full"></div><p className="text-gray-700 text-sm font-medium">Total RECs sold</p></div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? <div className="animate-pulse h-6 bg-gray-200 rounded"></div> : <p className="text-[#056C69] text-xl font-bold">{stats.recSold}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-black rounded-full"></div><p className="text-gray-700 text-sm font-medium">Total Rev. Earned</p></div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? <div className="animate-pulse h-6 bg-gray-200 rounded"></div> : <p className="text-[#056C69] text-xl font-bold">${stats.revenueEarned.toLocaleString()}</p>}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div><p className="text-gray-700 text-sm font-medium">Avg. price/REC</p></div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? <div className="animate-pulse h-6 bg-gray-200 rounded"></div> : <p className="text-[#056C69] text-xl font-bold">${stats.salePricePerREC}</p>}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div><p className="text-gray-700 text-sm font-medium">Energy Generated</p></div>
            <hr className="border-gray-200 mb-3" />
            {recData.loading ? <div className="animate-pulse h-6 bg-gray-200 rounded"></div> : <p className="text-[#056C69] text-xl font-bold">{stats.energyProduced} MWh</p>}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center space-x-2 mb-3"><div className="h-3 w-3 bg-green-500 rounded-full"></div><p className="text-gray-700 text-sm font-medium">Facility Status</p></div>
            <hr className="border-gray-200 mb-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Total Facilities:</span><span className="font-medium">{stats.activeFacilities}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Verified:</span><span className="font-medium text-green-600">{stats.verifiedFacilities}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Pending:</span><span className="font-medium text-yellow-600">{stats.activeFacilities - stats.verifiedFacilities}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}