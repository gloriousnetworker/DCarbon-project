import React, { useState, useEffect } from "react";

export default function Graph() {
  const [selectedFacility, setSelectedFacility] = useState("All facilities");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recData, setRecData] = useState({ 
    totalRecs: 0, 
    loading: true, 
    error: null 
  });
  const [hasMeters, setHasMeters] = useState(false);
  const [metersLoading, setMetersLoading] = useState(true);
  const [recStatistics, setRecStatistics] = useState([]);
  const [recOverview, setRecOverview] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [currentFacilityStats, setCurrentFacilityStats] = useState(null);
  const [detailStatistics, setDetailStatistics] = useState([]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const quarterOptions = [
    { value: "1", label: "Q1 (Jan-Mar)" },
    { value: "2", label: "Q2 (Apr-Jun)" },
    { value: "3", label: "Q3 (Jul-Sep)" },
    { value: "4", label: "Q4 (Oct-Dec)" }
  ];

  const getAuthData = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
    return {
      userId: loginResponse?.data?.user?.id,
      authToken: loginResponse?.data?.token
    };
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setSelectedQuarter("");
  };

  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
    setSelectedMonth("");
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
          await fetchRecStatistics(userId, authToken);
          await fetchRecOverview(userId, authToken);
          await fetchDetailStatistics(userId, authToken);
        } catch (err) {
          console.error('Error fetching chart data:', err);
        }
      };
      fetchData();
    }
  }, [selectedFacility, selectedYear, selectedMonth, selectedQuarter, facilities]);

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

  const fetchRecStatistics = async (userId, authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      
      const params = {
        year: selectedYear
      };
      
      if (selectedFacility === "All facilities") {
        params.userId = userId;
      } else {
        params.facilityId = selectedFacility;
      }
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
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
        processGraphData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching REC statistics:', err);
      setGraphData([]);
    }
  };

  const fetchDetailStatistics = async (userId, authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      
      const params = {};
      
      if (selectedMonth) {
        const monthNumber = monthNames.indexOf(selectedMonth) + 1;
        params.month = monthNumber;
      }
      
      if (selectedQuarter) {
        params.quarter = selectedQuarter;
      }
      
      if (selectedYear) {
        params.year = selectedYear;
      }
      
      if (selectedFacility === "All facilities") {
        params.userId = userId;
      } else {
        params.facilityId = selectedFacility;
      }
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
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
        setDetailStatistics(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching detail statistics:', err);
      setDetailStatistics([]);
    }
  };

  const fetchRecOverview = async (userId, authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/overview/stats`);
      
      const params = {};
      
      if (selectedMonth) {
        const monthNumber = monthNames.indexOf(selectedMonth) + 1;
        params.month = monthNumber;
      }
      
      if (selectedQuarter) {
        params.quarter = selectedQuarter;
      }
      
      if (selectedYear) {
        params.year = selectedYear;
      }
      
      if (selectedFacility === "All facilities") {
        params.userId = userId;
      } else {
        params.facilityId = selectedFacility;
      }
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
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
        if (selectedFacility !== "All facilities") {
          setCurrentFacilityStats(data.data);
        } else {
          setRecOverview(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching REC overview:', err);
    }
  };

  const processGraphData = (statisticsData) => {
    if (!statisticsData || !Array.isArray(statisticsData)) {
      const emptyGraphData = monthShortNames.map(month => ({ 
        month, 
        value: 0
      }));
      setGraphData(emptyGraphData);
      return;
    }
    
    const yearData = statisticsData.filter(item => item.year === parseInt(selectedYear));
    
    const monthlyMap = {};
    yearData.forEach(item => {
      monthlyMap[item.month] = item.recsGenerated || 0;
    });
    
    const processedData = monthShortNames.map((monthName, index) => {
      const monthNumber = index + 1;
      return {
        month: monthName,
        value: monthlyMap[monthNumber] || 0
      };
    });
    
    setGraphData(processedData);
  };

  const getYAxisValues = () => {
    const maxValue = Math.max(...graphData.map(d => d.value), 0.1);
    
    if (maxValue <= 1) {
      const step = 0.2;
      const values = [];
      for (let i = 1; i >= 0; i -= step) {
        values.push(parseFloat(i.toFixed(1)));
      }
      return values;
    } else if (maxValue <= 5) {
      const step = 1;
      const values = [];
      for (let i = 5; i >= 0; i -= step) {
        values.push(i);
      }
      return values;
    } else if (maxValue <= 10) {
      const step = 2;
      const values = [];
      for (let i = 10; i >= 0; i -= step) {
        values.push(i);
      }
      return values;
    } else if (maxValue <= 50) {
      const step = 10;
      const values = [];
      for (let i = 50; i >= 0; i -= step) {
        values.push(i);
      }
      return values;
    } else {
      const step = 20;
      const values = [];
      for (let i = 100; i >= 0; i -= step) {
        values.push(i);
      }
      return values;
    }
  };

  const getActualStats = () => {
    if (selectedFacility !== "All facilities" && currentFacilityStats) {
      return {
        totalRecsGenerated: currentFacilityStats.totalRecsGenerated || 0,
        totalRecsSold: currentFacilityStats.totalRecsSold || 0,
        totalRecsAvailable: currentFacilityStats.totalRecsAvailable || 0,
        currentRecPrice: currentFacilityStats.currentRecPrice || 0,
        revenueEarned: (currentFacilityStats.totalRecsSold || 0) * (currentFacilityStats.currentRecPrice || 0),
        activeFacilities: 1,
        verifiedFacilities: facilities.find(f => f.id === selectedFacility)?.status === "VERIFIED" ? 1 : 0,
        facilityName: facilities.find(f => f.id === selectedFacility)?.facilityName || "Selected Facility"
      };
    }
    
    if (recOverview) {
      return {
        totalRecsGenerated: recOverview.totalRecsGenerated || 0,
        totalRecsSold: recOverview.totalRecsSold || 0,
        totalRecsAvailable: recOverview.totalRecsAvailable || 0,
        currentRecPrice: recOverview.currentRecPrice || 0,
        revenueEarned: (recOverview.totalRecsSold || 0) * (recOverview.currentRecPrice || 0),
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
      totalRecsGenerated: totalRecs, 
      totalRecsSold: Math.floor(totalRecs * 0.85), 
      totalRecsAvailable: totalRecs - Math.floor(totalRecs * 0.85),
      currentRecPrice: totalRecs > 0 ? 45 : 0, 
      revenueEarned: Math.floor(totalRecs * 0.85 * 45), 
      activeFacilities: relevantFacilities.length, 
      verifiedFacilities 
    };
  };

  const getDisplayName = (facility) => {
    if (facility.nickname && facility.nickname.trim() !== "") {
      return facility.nickname;
    }
    if (facility.address && facility.address.trim() !== "") {
      return facility.address;
    }
    return facility.facilityName;
  };

  const getFilterDescription = () => {
    if (selectedMonth && selectedYear) {
      return `${selectedMonth} ${selectedYear}`;
    } else if (selectedQuarter && selectedYear) {
      const quarterLabel = quarterOptions.find(q => q.value === selectedQuarter)?.label || `Q${selectedQuarter}`;
      return `${quarterLabel} ${selectedYear}`;
    } else if (selectedYear) {
      return `Year ${selectedYear}`;
    }
    return "All time";
  };

  const getMonthName = (monthNumber) => {
    return monthNames[monthNumber - 1] || `Month ${monthNumber}`;
  };

  const getTotalFromDetailStats = (field) => {
    return detailStatistics.reduce((sum, item) => sum + (item[field] || 0), 0);
  };

  if (metersLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500 font-sfpro">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 font-sfpro">Error loading data: {error}</div>
    );
  }

  const yAxisValues = getYAxisValues();
  const maxYValue = Math.max(...yAxisValues);
  const stats = getActualStats();
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  return (
    <div className={`w-full bg-white min-h-screen p-6 ${!hasMeters ? "opacity-50 pointer-events-none" : ""}`}>
      <h2 className="mb-6 font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
        {selectedFacility === "All facilities" ? "REC Statistics" : `REC Statistics: ${getDisplayName(facilities.find(f => f.id === selectedFacility) || {})}`}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-[#039994] font-sfpro font-[600] text-[18px] leading-[100%] tracking-[-0.05em]">REC Generated (kWh)</span>
              </div>
              
              <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                <select 
                  value={selectedFacility} 
                  onChange={(e) => setSelectedFacility(e.target.value)} 
                  className="border border-gray-300 rounded px-3 py-2 text-sm min-w-[180px] font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994]"
                >
                  <option value="All facilities">All facilities</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {getDisplayName(facility)}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)} 
                  className="border border-gray-300 rounded px-3 py-2 text-sm font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994]"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="flex flex-col justify-between items-end mr-4 h-64 py-1">
                {yAxisValues.map((val, idx) => (
                  <span key={idx} className="text-gray-400 text-xs font-medium font-sfpro">
                    {val}
                  </span>
                ))}
              </div>
              
              <div className="flex-1 flex items-end justify-between h-64 px-2">
                {graphData.map((data, idx) => {
                  const heightPercentage = maxYValue > 0 ? (data.value / maxYValue) * 100 : 0;
                  const isEmpty = data.value === 0;
                  return (
                    <div key={idx} className="flex flex-col items-center relative group">
                      <div className="relative w-7 h-56 bg-gray-100 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                        {!isEmpty && (
                          <div 
                            style={{ 
                              backgroundColor: "#039994", 
                              height: `${heightPercentage}%` 
                            }} 
                            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700 ease-out animate-fill"
                          />
                        )}
                        {isEmpty && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs font-sfpro">
                            0
                          </div>
                        )}
                        <div className="absolute left-0.5 top-2 bottom-2 w-0.5 bg-white opacity-30 rounded-full" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 font-sfpro">
                        {data.value.toFixed(2)} kWh
                      </div>
                      <p className="text-xs text-gray-600 mt-2 font-medium font-sfpro">{data.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {facilities.length > 0 && stats.totalRecsGenerated === 0 && graphData.every(d => d.value === 0) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-yellow-800 font-sfpro">
                    No REC data available yet. Data will appear once your {selectedFacility === "All facilities" ? "facilities" : "facility"} start generating RECs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sfpro font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994]">REC Overview</h3>
                <div className="flex space-x-2">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => handleMonthChange(e.target.value)} 
                    className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[90px] font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="">Month</option>
                    {monthNames.map(month => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedQuarter} 
                    onChange={(e) => handleQuarterChange(e.target.value)} 
                    className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[90px] font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="">Quarter</option>
                    {quarterOptions.map(quarter => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded p-2 flex flex-col">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-1.5 w-1.5 bg-[#039994] rounded-full"></div>
                    <p className="text-gray-700 text-xs font-medium font-sfpro">RECs Generated</p>
                  </div>
                  <p className="text-[#056C69] text-sm font-bold font-sfpro">
                    {stats.totalRecsGenerated.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded p-2 flex flex-col">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-1.5 w-1.5 bg-[#039994] rounded-full"></div>
                    <p className="text-gray-700 text-xs font-medium font-sfpro">RECs Sold</p>
                  </div>
                  <p className="text-[#056C69] text-sm font-bold font-sfpro">
                    {stats.totalRecsSold.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded p-2 flex flex-col">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-1.5 w-1.5 bg-[#039994] rounded-full"></div>
                    <p className="text-gray-700 text-xs font-medium font-sfpro">RECs Available</p>
                  </div>
                  <p className="text-[#056C69] text-sm font-bold font-sfpro">
                    {stats.totalRecsAvailable.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded p-2 flex flex-col">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="h-1.5 w-1.5 bg-[#FBBF24] rounded-full"></div>
                    <p className="text-gray-700 text-xs font-medium font-sfpro">REC Price</p>
                  </div>
                  <p className="text-[#056C69] text-sm font-bold font-sfpro">
                    ${stats.currentRecPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="h-1.5 w-1.5 bg-black rounded-full"></div>
                  <p className="text-gray-700 text-xs font-medium font-sfpro">Revenue Earned</p>
                </div>
                <p className="text-[#056C69] text-sm font-bold font-sfpro">
                  ${stats.revenueEarned.toFixed(2)}
                </p>
                <p className="text-gray-500 text-xs mt-1 font-sfpro">
                  {getFilterDescription()}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sfpro font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994]">REC Statistics</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-sfpro">
                  {detailStatistics.length} {detailStatistics.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              
              {detailStatistics.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium border-b pb-2 font-sfpro">
                    <div>Month</div>
                    <div>Generated</div>
                    <div>Sold</div>
                    <div>Revenue</div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto pr-1">
                    {detailStatistics.map((stat, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-xs">
                        <div className="font-medium text-gray-700 font-sfpro">
                          {getMonthName(stat.month)} {stat.year}
                        </div>
                        <div className="text-[#056C69] font-medium font-sfpro">
                          {stat.recsGenerated?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-[#056C69] font-medium font-sfpro">
                          {stat.recsSold?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-[#056C69] font-medium font-sfpro">
                          ${stat.salesAmount?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t text-xs font-medium font-sfpro">
                    <div className="text-gray-700">Total</div>
                    <div className="text-[#056C69]">
                      {getTotalFromDetailStats('recsGenerated').toFixed(2)}
                    </div>
                    <div className="text-[#056C69]">
                      {getTotalFromDetailStats('recsSold').toFixed(2)}
                    </div>
                    <div className="text-[#056C69]">
                      ${getTotalFromDetailStats('salesAmount').toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm font-sfpro">
                  No detailed statistics available for the selected filters.
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700 text-sm font-medium font-sfpro">Facility Status</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-sfpro">
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
                    <div className="flex justify-between text-sm font-sfpro">
                      <span className="text-gray-600">Verified:</span>
                      <span className="font-medium text-green-600">{stats.verifiedFacilities}</span>
                    </div>
                    <div className="flex justify-between text-sm font-sfpro">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {stats.activeFacilities - stats.verifiedFacilities}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {selectedFacility !== "All facilities" && currentFacilityStats?.facilityDetails && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <p className="text-gray-700 text-sm font-medium font-sfpro">Facility Details</p>
                </div>
                <div className="space-y-1.5 text-sm font-sfpro">
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
      
      <style jsx>{`
        @keyframes fill {
          from {
            height: 0%;
          }
        }
        .animate-fill {
          animation: fill 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}