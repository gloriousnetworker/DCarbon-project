import React, { useState, useEffect } from "react";

export default function Graph() {
  const [chartType, setChartType] = useState("Solar Production");
  const [selectedFacility, setSelectedFacility] = useState("All facilities");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [recData, setRecData] = useState({ 
    totalRecs: 0, 
    loading: true, 
    error: null 
  });
  const [energyData, setEnergyData] = useState({ 
    solarProduction: [], 
    energyConsumed: [], 
    recsCreated: [], 
    recsSold: [], 
    loading: true 
  });
  const [hasMeters, setHasMeters] = useState(false);
  const [metersLoading, setMetersLoading] = useState(true);
  const [recStatistics, setRecStatistics] = useState([]);
  const [recOverview, setRecOverview] = useState(null);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [quarterlyChartData, setQuarterlyChartData] = useState([]);
  const [userRecReport, setUserRecReport] = useState(null);
  const [facilityRecData, setFacilityRecData] = useState({});
  const [facilityMonthlyData, setFacilityMonthlyData] = useState({});
  const [currentFacilityStats, setCurrentFacilityStats] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
        setMetersLoading(false);
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
        setHasMeters(metersExist);
      } catch (error) {
        console.error('Error checking meters:', error);
      } finally {
        setMetersLoading(false);
      }
    };
    checkMeters();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      if (metersLoading) return;
      try {
        setLoading(true);
        const { userId, authToken } = getAuthData();
        if (!userId || !authToken) {
          throw new Error("Missing authentication data");
        }
        await fetchFacilities(userId, authToken);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [metersLoading]);

  useEffect(() => {
    if (facilities.length > 0) {
      const fetchData = async () => {
        const { userId, authToken } = getAuthData();
        if (!userId || !authToken) return;
        
        try {
          setChartLoading(true);
          if (selectedFacility === "All facilities") {
            await fetchUserLevelData(userId, authToken);
          } else {
            await fetchFacilityLevelData(userId, authToken);
          }
        } catch (err) {
          console.error('Error fetching chart data:', err);
        } finally {
          setChartLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedFacility, selectedYear, selectedMonth, facilities]);

  const fetchFacilities = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const facilitiesData = data.data?.facilities || [];
      setFacilities(facilitiesData);
      const totalRecs = facilitiesData.reduce((sum, facility) => sum + (facility.totalRecs || 0), 0);
      setRecData(prev => ({ ...prev, totalRecs, loading: false }));
    } catch (err) {
      setError(err.message);
      setRecData(prev => ({ ...prev, loading: false, totalRecs: 0 }));
    }
  };

  const fetchUserLevelData = async (userId, authToken) => {
    try {
      await Promise.all([
        fetchRecStatistics(userId, authToken, null),
        fetchRecOverview(userId, authToken, null),
        fetchMonthlyChartData(authToken, null),
        fetchQuarterlyChartData(authToken, null)
      ]);
    } catch (err) {
      console.error('Error fetching user level data:', err);
    }
  };

  const fetchFacilityLevelData = async (userId, authToken) => {
    try {
      const facilityId = selectedFacility;
      await Promise.all([
        fetchRecStatistics(userId, authToken, facilityId),
        fetchMonthlyChartData(authToken, facilityId),
        fetchFacilityOverview(authToken, facilityId)
      ]);
    } catch (err) {
      console.error('Error fetching facility level data:', err);
    }
  };

  const fetchRecStatistics = async (userId, authToken, facilityId) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      const monthNumber = selectedMonth ? monthNames.indexOf(selectedMonth) + 1 : new Date().getMonth() + 1;
      const params = {
        month: monthNumber,
        year: selectedYear,
        userId: facilityId ? undefined : userId,
        facilityId: facilityId || undefined
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setRecStatistics(data.data || []);
        
        if (facilityId) {
          const facilityDataKey = `${facilityId}_${selectedYear}_${monthNumber}`;
          setFacilityRecData(prev => ({
            ...prev,
            [facilityDataKey]: data.data || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching REC statistics:', err);
    }
  };

  const fetchRecOverview = async (userId, authToken, facilityId) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/overview/stats`);
      const params = {
        userId: facilityId ? undefined : userId,
        facilityId: facilityId || undefined
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        if (facilityId) {
          setCurrentFacilityStats(data.data);
        } else {
          setRecOverview(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching REC overview:', err);
    }
  };

  const fetchFacilityOverview = async (authToken, facilityId) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/${facilityId}`,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setCurrentFacilityStats(prev => ({
          ...prev,
          facilityDetails: data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching facility overview:', err);
    }
  };

  const fetchMonthlyChartData = async (authToken, facilityId) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/chart/monthly`);
      const params = {
        type: 'commercial',
        year: selectedYear,
        facilityId: facilityId || undefined
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        if (facilityId) {
          const facilityDataKey = `${facilityId}_${selectedYear}`;
          setFacilityMonthlyData(prev => ({
            ...prev,
            [facilityDataKey]: data.data || []
          }));
          processChartData(data.data, true);
        } else {
          setMonthlyChartData(data.data || []);
          processChartData(data.data, false);
        }
      }
    } catch (err) {
      console.error('Error fetching monthly chart data:', err);
    }
  };

  const fetchQuarterlyChartData = async (authToken, facilityId) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/chart/quarterly`);
      const params = {
        type: 'commercial',
        year: selectedYear,
        facilityId: facilityId || undefined
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setQuarterlyChartData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching quarterly chart data:', err);
    }
  };

  const processChartData = (monthlyData, isFacility = false) => {
    if (!monthlyData || !Array.isArray(monthlyData)) {
      const emptyMonthlyData = monthShortNames.map(month => ({ 
        month, 
        solarProduction: 0, 
        energyConsumed: 0, 
        recsCreated: 0, 
        recsSold: 0 
      }));
      setMonthlyData(emptyMonthlyData);
      setEnergyData({ 
        solarProduction: emptyMonthlyData, 
        energyConsumed: emptyMonthlyData, 
        recsCreated: emptyMonthlyData, 
        recsSold: emptyMonthlyData, 
        loading: false 
      });
      return;
    }
    
    const processedData = monthlyData.map(item => ({
      month: item.label,
      solarProduction: item.sumNetKWh || 0,
      energyConsumed: 0,
      recsCreated: (item.sumNetKWh || 0) * 1.2,
      recsSold: (item.sumNetKWh || 0) * 0.6,
      value: item.sumNetKWh || 0
    }));
    
    const selectedData = getCurrentChartData(processedData);
    setMonthlyData(selectedData);
    setEnergyData({
      solarProduction: processedData,
      energyConsumed: processedData.map(d => ({...d, value: d.value * 0.8})),
      recsCreated: processedData.map(d => ({...d, value: d.recsCreated})),
      recsSold: processedData.map(d => ({...d, value: d.recsSold})),
      loading: false
    });
    setChartLoading(false);
  };

  const getCurrentChartData = (processedData = null) => {
    const data = processedData || monthlyData;
    
    switch(chartType) {
      case "Solar Production": 
        return data.map(item => ({ ...item, value: item.solarProduction }));
      case "Energy Consumed": 
        return data.map(item => ({ ...item, value: item.energyConsumed }));
      case "RECs Created": 
        return data.map(item => ({ ...item, value: item.recsCreated }));
      case "RECs Sold": 
        return data.map(item => ({ ...item, value: item.recsSold }));
      default: 
        return data.map(item => ({ ...item, value: item.solarProduction }));
    }
  };

  const getActualStats = () => {
    if (selectedFacility !== "All facilities" && currentFacilityStats) {
      const facility = facilities.find(f => f.id === selectedFacility);
      return {
        recGenerated: currentFacilityStats.totalRecsGenerated || facility?.totalRecs || 0,
        recSold: currentFacilityStats.totalRecsSold || 0,
        revenueEarned: (currentFacilityStats.totalRecsSold || 0) * (currentFacilityStats.currentRecPrice || 45),
        salePricePerREC: currentFacilityStats.currentRecPrice || 0,
        energyProduced: Math.floor((currentFacilityStats.totalRecsGenerated || 0) * 1.2),
        activeFacilities: 1,
        verifiedFacilities: facility?.status === "VERIFIED" ? 1 : 0,
        facilityName: facility?.facilityName || "Selected Facility"
      };
    }
    
    if (recOverview) {
      return {
        recGenerated: recOverview.totalRecsGenerated || 0,
        recSold: recOverview.totalRecsSold || 0,
        revenueEarned: (recOverview.totalRecsSold || 0) * (recOverview.currentRecPrice || 45),
        salePricePerREC: recOverview.currentRecPrice || 0,
        energyProduced: Math.floor((recOverview.totalRecsGenerated || 0) * 1.2),
        activeFacilities: facilities.length,
        verifiedFacilities: facilities.filter(f => f.status === "VERIFIED").length
      };
    }
    
    let totalRecs = 0;
    let verifiedFacilities = 0;
    let relevantFacilities = facilities;
    if (selectedFacility !== "All facilities") {
      relevantFacilities = facilities.filter(f => f.id === selectedFacility);
    }
    relevantFacilities.forEach(facility => { 
      totalRecs += facility.totalRecs || 0; 
      if (facility.status === "VERIFIED") verifiedFacilities++; 
    });
    
    return { 
      recGenerated: totalRecs, 
      recSold: Math.floor(totalRecs * 0.85), 
      revenueEarned: Math.floor(totalRecs * 0.85 * 45), 
      salePricePerREC: totalRecs > 0 ? 45 : 0, 
      energyProduced: Math.floor(totalRecs * 1.2), 
      activeFacilities: relevantFacilities.length, 
      verifiedFacilities 
    };
  };

  const getFillColor = () => {
    switch(chartType) {
      case "Energy Consumed": return "#000000";
      case "RECs Created": 
      case "RECs Sold": return "#039994";
      default: return "#FBBF24";
    }
  };

  const getChartUnits = () => {
    return (chartType === "RECs Created" || chartType === "RECs Sold") ? "RECs" : "MWh";
  };

  const yAxisValues = [100, 75, 50, 25, 0];
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  if (metersLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">Error loading data: {error}</div>
    );
  }

  const chartData = getCurrentChartData();
  const stats = getActualStats();

  return (
    <div className={`w-full bg-gray-50 min-h-screen p-6 ${!hasMeters ? "opacity-50 pointer-events-none" : ""}`}>
      <h2 className="text-2xl font-bold text-[#039994] mb-6">
        {selectedFacility === "All facilities" ? "Energy Performance" : `Facility: ${stats.facilityName || "Selected Facility"}`}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)} 
                className="text-[#039994] font-semibold bg-transparent focus:outline-none cursor-pointer text-lg"
              >
                <option value="Solar Production">Solar Production</option>
                <option value="Energy Consumed">Energy Consumed</option>
                <option value="RECs Created">RECs Generated</option>
                <option value="RECs Sold">RECs Sold</option>
              </select>
              <span className="text-sm text-gray-500 font-medium">{getChartUnits()}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={selectedFacility} 
                onChange={(e) => setSelectedFacility(e.target.value)} 
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[180px]"
              >
                <option value="All facilities">All facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.facilityName}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[120px]"
              >
                <option value="">All Months</option>
                {monthNames.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {chartLoading ? (
            <div className="flex justify-center items-center h-80">
              <div className="animate-pulse text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="flex flex-col justify-between items-end mr-4 h-80 py-2">
                {yAxisValues.map((val, idx) => (
                  <span key={idx} className="text-gray-400 text-sm font-medium">
                    {val}
                  </span>
                ))}
              </div>
              
              <div className="flex-1 flex items-end justify-between h-80 px-2">
                {chartData.map((data, idx) => {
                  const maxValue = Math.max(...chartData.map(d => d.value), 1);
                  const heightPercentage = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                  const isEmpty = data.value === 0;
                  return (
                    <div key={idx} className="flex flex-col items-center relative group">
                      <div className="relative w-8 h-72 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden shadow-inner">
                        {!isEmpty && (
                          <div 
                            style={{ 
                              backgroundColor: getFillColor(), 
                              height: `${heightPercentage}%` 
                            }} 
                            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
                          />
                        )}
                        {isEmpty && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">
                            0
                          </div>
                        )}
                        <div className="absolute left-1 top-2 bottom-2 w-1 bg-white opacity-20 rounded-full" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {data.value.toFixed(2)} {getChartUnits()}
                      </div>
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
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-yellow-800">
                  No energy data available yet. Data will appear once your {selectedFacility === "All facilities" ? "facilities" : "facility"} start generating RECs.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">Total RECs Generated</p>
              </div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-[#056C69] text-xl font-bold">
                  {stats.recGenerated.toFixed(2)}
                </p>
              )}
              {recStatistics.length > 0 && selectedMonth && (
                <p className="text-gray-500 text-xs mt-1">
                  {selectedMonth}: {recStatistics[0]?.recsGenerated?.toFixed(2) || 0}
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">Total RECs Sold</p>
              </div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-[#056C69] text-xl font-bold">
                  {stats.recSold.toFixed(2)}
                </p>
              )}
              {recStatistics.length > 0 && selectedMonth && (
                <p className="text-gray-500 text-xs mt-1">
                  {selectedMonth}: {recStatistics[0]?.recsSold?.toFixed(2) || 0}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-black rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">Total Revenue Earned</p>
              </div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-[#056C69] text-xl font-bold">
                  ${stats.revenueEarned.toFixed(2)}
                </p>
              )}
              {recStatistics.length > 0 && selectedMonth && (
                <p className="text-gray-500 text-xs mt-1">
                  {selectedMonth}: ${recStatistics[0]?.salesAmount?.toFixed(2) || 0}
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">Avg. Price/REC</p>
              </div>
              <hr className="border-gray-200 mb-3" />
              {recData.loading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-[#056C69] text-xl font-bold">
                  ${stats.salePricePerREC.toFixed(2)}
                </p>
              )}
              {recStatistics.length > 0 && selectedMonth && (
                <p className="text-gray-500 text-xs mt-1">
                  {selectedMonth}: ${recStatistics[0]?.avgRecPrice?.toFixed(2) || 0}
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
              <p className="text-gray-700 text-sm font-medium">Energy Generated</p>
            </div>
            <hr className="border-gray-200 mb-3" />
            {recData.loading ? (
              <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
            ) : (
              <p className="text-[#056C69] text-xl font-bold">
                {stats.energyProduced.toFixed(2)} MWh
              </p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <p className="text-gray-700 text-sm font-medium">Facility Status</p>
            </div>
            <hr className="border-gray-200 mb-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {selectedFacility === "All facilities" ? "Total Facilities:" : "Status:"}
                </span>
                <span className="font-medium">
                  {selectedFacility === "All facilities" ? stats.activeFacilities : 
                   stats.verifiedFacilities > 0 ? "Verified" : "Pending"}
                </span>
              </div>
              {selectedFacility === "All facilities" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium text-green-600">{stats.verifiedFacilities}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">
                      {stats.activeFacilities - stats.verifiedFacilities}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {recStatistics.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">
                  {selectedMonth ? `${selectedMonth} ${selectedYear} Stats` : "Current Month Stats"}
                </p>
              </div>
              <hr className="border-gray-200 mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RECs Generated:</span>
                  <span className="font-medium">
                    {recStatistics[0]?.recsGenerated?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RECs Sold:</span>
                  <span className="font-medium">
                    {recStatistics[0]?.recsSold?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">
                    ${recStatistics[0]?.salesAmount?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining RECs:</span>
                  <span className="font-medium">
                    {recStatistics[0]?.remainingRecs?.toFixed(2) || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedFacility !== "All facilities" && currentFacilityStats?.facilityDetails && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium">Facility Details</p>
              </div>
              <hr className="border-gray-200 mb-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">System Size:</span>
                  <span className="font-medium">12 kW/AC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utility:</span>
                  <span className="font-medium">{currentFacilityStats.facilityDetails.utilityProvider || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment:</span>
                  <span className="font-medium">
                    {currentFacilityStats.facilityDetails.createdAt ? 
                     new Date(currentFacilityStats.facilityDetails.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}