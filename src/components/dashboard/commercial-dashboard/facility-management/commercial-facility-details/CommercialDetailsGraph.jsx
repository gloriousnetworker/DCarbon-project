import React, { useState, useEffect } from "react";
import { FiDownload, FiCalendar, FiFilter } from "react-icons/fi";

export default function CommercialDetailsGraph({ facilityId, meterId }) {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    recGenerated: 0,
    recSold: 0,
    revenueEarned: 0,
    energyProduced: 0,
    salePricePerREC: 0,
    currentRecBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [sortBy, setSortBy] = useState('date-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [recStatistics, setRecStatistics] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("");

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNumberMap = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const getAuthToken = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
    return loginResponse?.data?.token;
  };

  useEffect(() => {
    if (facilityId) {
      fetchAllData();
    }
  }, [facilityId, selectedYear, selectedMonth]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [rawData, dateRange, selectedMonths, sortBy]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = getAuthToken();
      
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      if (!facilityId) {
        throw new Error("Facility ID is required");
      }

      await Promise.all([
        fetchMeterData(authToken),
        fetchRecStatistics(authToken),
        fetchMonthlyChartData(authToken)
      ]);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeterData = async (authToken) => {
    try {
      if (!meterId) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-meter-rec-data/${meterId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data && result.data.data.intervals.length > 0) {
        const readings = result.data.data.intervals[0].readings;
        setRawData(readings);
        
        if (readings.length > 0) {
          const startDate = new Date(Math.min(...readings.map(r => new Date(r.start))));
          const endDate = new Date(Math.max(...readings.map(r => new Date(r.start))));
          
          setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          });
        }
      } else {
        setRawData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error('Error fetching meter data:', err);
      setRawData([]);
    }
  };

  const fetchRecStatistics = async (authToken) => {
    try {
      const monthParam = selectedMonth || new Date().getMonth() + 1;
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      const params = {
        month: monthParam,
        year: selectedYear,
        facilityId: facilityId
      };
      
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
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
        
        if (data.data && data.data.length > 0) {
          const statsData = data.data[0];
          updateStatsFromRecStatistics(statsData);
        }
      }
    } catch (err) {
      console.error('Error fetching REC statistics:', err);
      setRecStatistics([]);
    }
  };

  const fetchMonthlyChartData = async (authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/chart/monthly`);
      const params = {
        type: 'commercial',
        year: selectedYear,
        facilityId: facilityId
      };
      
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const response = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${authToken}`, 
          "Content-Type": "application/json" 
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setMonthlyChartData(data.data || []);
        processMonthlyChartData(data.data);
      }
    } catch (err) {
      console.error('Error fetching monthly chart data:', err);
      setMonthlyChartData([]);
    }
  };

  const updateStatsFromRecStatistics = (recStats) => {
    setStats(prev => ({
      ...prev,
      recGenerated: recStats.recsGenerated || 0,
      recSold: recStats.recsSold || 0,
      revenueEarned: recStats.salesAmount || 0,
      salePricePerREC: recStats.avgRecPrice || 0,
      currentRecBalance: recStats.remainingRecs || 0
    }));
  };

  const processMonthlyChartData = (monthlyData) => {
    if (!monthlyData || !Array.isArray(monthlyData)) {
      const emptyChartData = months.map(month => ({
        month,
        value: 0,
        recs: 0,
        normalizedValue: 0
      }));
      setChartData(emptyChartData);
      return;
    }

    const monthlyMap = {};
    monthlyData.forEach(item => {
      if (item.label && months.includes(item.label)) {
        monthlyMap[item.label] = {
          sumNetKWh: item.sumNetKWh || 0,
          recs: (item.sumNetKWh || 0) * 1.2
        };
      }
    });

    const processedChartData = months.map(month => {
      const data = monthlyMap[month] || { sumNetKWh: 0, recs: 0 };
      return {
        month,
        value: data.sumNetKWh,
        recs: data.recs
      };
    });

    const maxValue = Math.max(...processedChartData.map(d => d.value), 1);
    const normalizedData = processedChartData.map(data => ({
      ...data,
      normalizedValue: maxValue > 0 ? (data.value / maxValue) * 100 : 0
    }));

    setChartData(normalizedData);
    
    const totalEnergyProduced = processedChartData.reduce((sum, data) => sum + data.value, 0);
    
    setStats(prev => ({
      ...prev,
      energyProduced: totalEnergyProduced
    }));
  };

  const applyFiltersAndSort = () => {
    if (!rawData || rawData.length === 0) return;

    let filtered = [...rawData];

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(reading => {
        const readingDate = new Date(reading.start);
        return readingDate >= start && readingDate <= end;
      });
    }

    if (selectedMonths.length > 0) {
      filtered = filtered.filter(reading => {
        const readingMonth = new Date(reading.start).toLocaleString('default', { month: 'short' });
        return selectedMonths.includes(readingMonth);
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.start);
      const dateB = new Date(b.start);
      
      switch (sortBy) {
        case 'date-desc':
          return dateB - dateA;
        case 'energy-asc':
          return (a.kwh || 0) - (b.kwh || 0);
        case 'energy-desc':
          return (b.kwh || 0) - (a.kwh || 0);
        default:
          return dateA - dateB;
      }
    });

    setFilteredData(filtered);
  };

  const downloadData = () => {
    try {
      if (chartData.length === 0) {
        alert('No chart data available to download.');
        return;
      }

      const headers = ['Month', 'Energy (kWh)', 'RECs Generated', 'Percentage of Max (%)'];
      
      const csvRows = [];
      csvRows.push(headers.join(','));

      chartData.forEach((data) => {
        const row = [
          data.month,
          data.value.toFixed(2),
          data.recs.toFixed(2),
          data.normalizedValue.toFixed(2)
        ];
        csvRows.push(row.join(','));
      });

      csvRows.push('');
      csvRows.push('Summary');
      csvRows.push(`Total Energy Produced,${stats.energyProduced.toFixed(2)} MWh`);
      csvRows.push(`Total RECs Generated,${stats.recGenerated.toFixed(2)}`);
      csvRows.push(`Selected Year,${selectedYear}`);
      if (selectedMonth) {
        csvRows.push(`Selected Month,${months[parseInt(selectedMonth) - 1] || selectedMonth}`);
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `facility_${facilityId}_chart_data_${selectedYear}${selectedMonth ? `_${months[parseInt(selectedMonth) - 1]}` : ''}_${new Date().toISOString().split('T')[0]}.csv`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading chart data:', err);
      alert('Failed to download chart data. Please try again.');
    }
  };

  const handleMonthToggle = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const clearAllFilters = () => {
    setSelectedMonths([]);
    setDateRange({ startDate: '', endDate: '' });
    setSortBy('date-asc');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedMonths.length > 0) count++;
    if (dateRange.startDate && dateRange.endDate) count++;
    if (sortBy !== 'date-asc') count++;
    return count;
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedMonth("");
    setSelectedMonths([]);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setSelectedMonths([]);
  };

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#039994]"></div>
          <span className="ml-2 text-gray-600">Loading facility REC data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-red-500 mb-2">⚠️ Error loading data</div>
          <p className="text-gray-600 text-sm text-center">{error}</p>
          <button 
            onClick={fetchAllData}
            className="mt-4 bg-[#039994] text-white px-4 py-2 rounded text-sm hover:bg-[#027a75] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const activeFilters = getActiveFiltersCount();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 5}, (_, i) => currentYear - i);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h3 className="text-lg font-semibold text-[#039994]">Facility Energy Performance</h3>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex space-x-2">
            <select 
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[100px] focus:outline-none focus:border-[#039994]"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[120px] focus:outline-none focus:border-[#039994]"
            >
              <option value="">All Months</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors relative ${
                showFilters ? 'bg-[#039994] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiFilter size={14} />
              <span>Filters</span>
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
            
            <button 
              onClick={downloadData}
              className="flex items-center space-x-1 bg-[#039994] text-white px-3 py-1.5 rounded text-sm hover:bg-[#027a75] transition-colors"
              disabled={chartData.length === 0}
            >
              <FiDownload size={14} />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#039994]"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#039994]"
                  placeholder="End Date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Months</label>
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => handleMonthToggle(month)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      selectedMonths.includes(month)
                        ? 'bg-[#039994] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#039994]"
              >
                <option value="date-asc">Date (Oldest First)</option>
                <option value="date-desc">Date (Newest First)</option>
                <option value="energy-asc">Energy (Low to High)</option>
                <option value="energy-desc">Energy (High to Low)</option>
              </select>
              
              {activeFilters > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex flex-wrap gap-2">
              <span>Showing {filteredData.length} of {rawData.length} meter readings</span>
              {selectedMonths.length > 0 && (
                <span className="text-[#039994]">
                  • Months: {selectedMonths.join(', ')}
                </span>
              )}
              {dateRange.startDate && dateRange.endDate && (
                <span className="text-[#039994]">
                  • Date: {dateRange.startDate} to {dateRange.endDate}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!showFilters && <div className="mb-16"></div>}

      <div className="mb-8">
        <div className="flex items-end">
          <div className="flex flex-col justify-between items-end mr-4 h-64 py-2">
            {[100, 75, 50, 25, 0].map((val, idx) => (
              <span key={idx} className="text-gray-400 text-xs font-medium">
                {maxValue > 0 ? Math.round((val / 100) * maxValue * 10) / 10 : val}
              </span>
            ))}
          </div>
          <div className="flex-1 flex items-end justify-between h-64 px-2">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center relative group">
                <div className="relative w-6 h-64 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden shadow-inner">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#039994] to-[#04b5a8] rounded-full transition-all duration-500"
                    style={{ height: `${data.normalizedValue}%` }}
                  />
                  <div className="absolute left-1 top-2 bottom-2 w-1 bg-white opacity-20 rounded-full" />
                </div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  <div>{data.recs.toFixed(2)} RECs</div>
                  <div>{data.value.toFixed(2)} kWh</div>
                </div>
                <p className="text-xs text-gray-600 mt-3 font-medium">{data.month}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500">
          Monthly Energy Production and REC Generation ({selectedYear})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total RECs Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recGenerated.toFixed(2)}</p>
          {recStatistics.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Current: {recStatistics[0]?.recsGenerated?.toFixed(2) || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total RECs Sold</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recSold.toFixed(2)}</p>
          {recStatistics.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Current: {recStatistics[0]?.recsSold?.toFixed(2) || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-black rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total Revenue Earned</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.revenueEarned.toFixed(2)}</p>
          {recStatistics.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Current: ${recStatistics[0]?.salesAmount?.toFixed(2) || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Energy Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.energyProduced.toFixed(2)} MWh</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Avg. REC Price</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.salePricePerREC.toFixed(2)}</p>
          {recStatistics.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Current: ${recStatistics[0]?.avgRecPrice?.toFixed(2) || 0}
            </p>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">REC Balance</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.currentRecBalance.toFixed(2)}</p>
          {recStatistics.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              Current: {recStatistics[0]?.remainingRecs?.toFixed(2) || 0}
            </p>
          )}
        </div>
      </div>

      {recStatistics.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly REC Statistics ({selectedYear})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recStatistics.map((stat, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs font-medium text-gray-600">
                  {months[stat.month - 1] || `Month ${stat.month}`}, {stat.year}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">RECs Generated:</span>
                    <span className="font-medium text-[#039994]">{stat.recsGenerated?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">RECs Sold:</span>
                    <span className="font-medium text-[#039994]">{stat.recsSold?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium text-green-600">${stat.salesAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium text-blue-600">{stat.remainingRecs?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthlyChartData.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Energy Data ({selectedYear})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left font-medium text-gray-700">Month</th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700">Energy (kWh)</th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700">RECs Generated</th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyChartData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-3">
                      {item.label || `Month ${item.month}`}
                    </td>
                    <td className="py-2 px-3 font-medium">
                      {item.sumNetKWh?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-2 px-3 text-[#039994] font-medium">
                      {((item.sumNetKWh || 0) * 1.2).toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (item.sumNetKWh || 0) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(item.sumNetKWh || 0) > 0 ? 'Active' : 'No Data'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}