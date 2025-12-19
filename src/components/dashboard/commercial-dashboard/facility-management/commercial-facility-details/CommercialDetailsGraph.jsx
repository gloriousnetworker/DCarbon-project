import React, { useState, useEffect } from "react";
import { FiDownload, FiCalendar, FiFilter } from "react-icons/fi";

export default function CommercialDetailsGraph({ facilityId, meterId }) {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalRecsGenerated: 0,
    totalRecsSold: 0,
    totalRecsAvailable: 0,
    currentRecPrice: 0,
    revenueEarned: 0,
    energyProduced: 0
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
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [recOverview, setRecOverview] = useState(null);
  const [detailStatistics, setDetailStatistics] = useState([]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNumberMap = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const quarterOptions = [
    { value: "1", label: "Q1 (Jan-Mar)" },
    { value: "2", label: "Q2 (Apr-Jun)" },
    { value: "3", label: "Q3 (Jul-Sep)" },
    { value: "4", label: "Q4 (Oct-Dec)" }
  ];

  const getAuthToken = () => {
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
    return loginResponse?.data?.token;
  };

  const handleMonthFilterChange = (month) => {
    setSelectedMonth(month);
    setSelectedQuarter("");
    setSelectedMonths([]);
  };

  const handleQuarterFilterChange = (quarter) => {
    setSelectedQuarter(quarter);
    setSelectedMonth("");
    setSelectedMonths([]);
  };

  useEffect(() => {
    if (facilityId) {
      fetchAllData();
    }
  }, [facilityId, selectedYear, selectedMonth, selectedQuarter]);

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
        fetchMonthlyChartData(authToken),
        fetchRecOverview(authToken),
        fetchDetailStatistics(authToken)
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
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      const params = {
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
        processMonthlyChartData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching REC statistics:', err);
      setRecStatistics([]);
    }
  };

  const fetchRecOverview = async (authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/overview/stats`);
      
      const params = {
        facilityId: facilityId
      };
      
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
        setRecOverview(data.data);
        
        if (data.data) {
          setStats(prev => ({
            ...prev,
            totalRecsGenerated: data.data.totalRecsGenerated || 0,
            totalRecsSold: data.data.totalRecsSold || 0,
            totalRecsAvailable: data.data.totalRecsAvailable || 0,
            currentRecPrice: data.data.currentRecPrice || 0,
            revenueEarned: data.data.totalRecsSold * data.data.currentRecPrice || 0
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching REC overview:', err);
    }
  };

  const fetchDetailStatistics = async (authToken) => {
    try {
      const url = new URL(`https://services.dcarbon.solutions/api/rec/statistics`);
      
      const params = {
        facilityId: facilityId
      };
      
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
      }
    } catch (err) {
      console.error('Error fetching monthly chart data:', err);
      setMonthlyChartData([]);
    }
  };

  const processMonthlyChartData = (statisticsData) => {
    if (!statisticsData || !Array.isArray(statisticsData)) {
      const emptyChartData = months.map(month => ({
        month,
        value: 0,
        recs: 0
      }));
      setChartData(emptyChartData);
      return;
    }
    
    const yearData = statisticsData.filter(item => item.year === parseInt(selectedYear));
    
    const monthlyMap = {};
    yearData.forEach(item => {
      monthlyMap[item.month] = item.recsGenerated || 0;
    });
    
    const processedChartData = months.map((monthName, index) => {
      const monthNumber = index + 1;
      return {
        month: monthName,
        value: monthlyMap[monthNumber] || 0,
        recs: monthlyMap[monthNumber] || 0
      };
    });
    
    setChartData(processedChartData);
    
    const totalEnergyProduced = processedChartData.reduce((sum, data) => sum + data.value, 0);
    
    setStats(prev => ({
      ...prev,
      energyProduced: totalEnergyProduced
    }));
  };

  const getYAxisValues = () => {
    const maxValue = Math.max(...chartData.map(d => d.value), 0.1);
    
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

      const headers = ['Month', 'RECs Generated (kWh)', 'RECs Generated (RECs)'];
      
      const csvRows = [];
      csvRows.push(headers.join(','));

      chartData.forEach((data) => {
        const row = [
          data.month,
          data.value.toFixed(2),
          data.recs.toFixed(2)
        ];
        csvRows.push(row.join(','));
      });

      csvRows.push('');
      csvRows.push('Summary');
      csvRows.push(`Total RECs Generated,${stats.totalRecsGenerated.toFixed(2)}`);
      csvRows.push(`Total RECs Sold,${stats.totalRecsSold.toFixed(2)}`);
      csvRows.push(`Total RECs Available,${stats.totalRecsAvailable.toFixed(2)}`);
      csvRows.push(`Current REC Price,$${stats.currentRecPrice.toFixed(2)}`);
      csvRows.push(`Total Revenue,$${stats.revenueEarned.toFixed(2)}`);
      csvRows.push(`Selected Year,${selectedYear}`);
      if (selectedMonth) {
        csvRows.push(`Selected Month,${selectedMonth}`);
      }
      if (selectedQuarter) {
        const quarterLabel = quarterOptions.find(q => q.value === selectedQuarter)?.label || `Q${selectedQuarter}`;
        csvRows.push(`Selected Quarter,${quarterLabel}`);
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `facility_${facilityId}_rec_data_${selectedYear}${selectedMonth ? `_${selectedMonth}` : ''}${selectedQuarter ? `_Q${selectedQuarter}` : ''}_${new Date().toISOString().split('T')[0]}.csv`;
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
    setSelectedMonth("");
    setSelectedQuarter("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedMonths.length > 0) count++;
    if (dateRange.startDate && dateRange.endDate) count++;
    if (sortBy !== 'date-asc') count++;
    if (selectedMonth) count++;
    if (selectedQuarter) count++;
    return count;
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedMonth("");
    setSelectedQuarter("");
    setSelectedMonths([]);
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

  const yAxisValues = getYAxisValues();
  const maxYValue = Math.max(...yAxisValues);
  const activeFilters = getActiveFiltersCount();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 5}, (_, i) => currentYear - i);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h3 className="text-lg font-semibold text-[#039994]">Facility REC Statistics</h3>
        
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
              onChange={(e) => handleMonthFilterChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[120px] focus:outline-none focus:border-[#039994]"
            >
              <option value="">All Months</option>
              {monthNames.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <select 
              value={selectedQuarter}
              onChange={(e) => handleQuarterFilterChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[120px] focus:outline-none focus:border-[#039994]"
            >
              <option value="">Quarter</option>
              {quarterOptions.map(quarter => (
                <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
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
            {yAxisValues.map((val, idx) => (
              <span key={idx} className="text-gray-400 text-xs font-medium">
                {val}
              </span>
            ))}
          </div>
          <div className="flex-1 flex items-end justify-between h-64 px-2">
            {chartData.map((data, idx) => {
              const heightPercentage = maxYValue > 0 ? (data.value / maxYValue) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center relative group">
                  <div className="relative w-6 h-64 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden shadow-inner">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#039994] to-[#04b5a8] rounded-full transition-all duration-500"
                      style={{ height: `${heightPercentage}%` }}
                    />
                    <div className="absolute left-1 top-2 bottom-2 w-1 bg-white opacity-20 rounded-full" />
                  </div>
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    <div>{data.recs.toFixed(2)} RECs</div>
                    <div>{data.value.toFixed(2)} kWh</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 font-medium">{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500">
          Monthly REC Generation ({selectedYear})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total RECs Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.totalRecsGenerated.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {getFilterDescription()}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total RECs Sold</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.totalRecsSold.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {getFilterDescription()}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">RECs Available</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.totalRecsAvailable.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {getFilterDescription()}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-black rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Total Revenue Earned</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.revenueEarned.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {getFilterDescription()}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Current REC Price</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.currentRecPrice.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            Current market price
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Energy Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.energyProduced.toFixed(2)} MWh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-700">REC Overview</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getFilterDescription()}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-[#039994] rounded-full"></div>
                  <p className="text-gray-700 text-xs font-medium">RECs Generated</p>
                </div>
                <p className="text-[#056C69] text-base font-bold">
                  {stats.totalRecsGenerated.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-[#039994] rounded-full"></div>
                  <p className="text-gray-700 text-xs font-medium">RECs Sold</p>
                </div>
                <p className="text-[#056C69] text-base font-bold">
                  {stats.totalRecsSold.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-[#039994] rounded-full"></div>
                  <p className="text-gray-700 text-xs font-medium">RECs Available</p>
                </div>
                <p className="text-[#056C69] text-base font-bold">
                  {stats.totalRecsAvailable.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-[#FBBF24] rounded-full"></div>
                  <p className="text-gray-700 text-xs font-medium">REC Price</p>
                </div>
                <p className="text-[#056C69] text-base font-bold">
                  ${stats.currentRecPrice.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 bg-black rounded-full"></div>
                <p className="text-gray-700 text-xs font-medium">Revenue Earned</p>
              </div>
              <p className="text-[#056C69] text-base font-bold">
                ${stats.revenueEarned.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-700">REC Statistics</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {detailStatistics.length} {detailStatistics.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          
          {detailStatistics.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium border-b pb-2">
                <div>Month</div>
                <div>Generated</div>
                <div>Sold</div>
                <div>Revenue</div>
              </div>
              
              <div className="max-h-60 overflow-y-auto pr-2">
                {detailStatistics.map((stat, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-xs">
                    <div className="font-medium text-gray-700">
                      {getMonthName(stat.month)} {stat.year}
                    </div>
                    <div className="text-[#056C69] font-medium">
                      {stat.recsGenerated?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-[#056C69] font-medium">
                      {stat.recsSold?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-[#056C69] font-medium">
                      ${stat.salesAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-3 border-t text-xs font-medium">
                <div className="text-gray-700">Total</div>
                <div className="text-[#056C69]">
                  {detailStatistics.reduce((sum, item) => sum + (item.recsGenerated || 0), 0).toFixed(2)}
                </div>
                <div className="text-[#056C69]">
                  {detailStatistics.reduce((sum, item) => sum + (item.recsSold || 0), 0).toFixed(2)}
                </div>
                <div className="text-[#056C69]">
                  ${detailStatistics.reduce((sum, item) => sum + (item.salesAmount || 0), 0).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No detailed statistics available for the selected filters.
            </div>
          )}
        </div>
      </div>

      {recStatistics.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Annual REC Statistics ({selectedYear})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recStatistics.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-600">
                  {getMonthName(stat.month)} {stat.year}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">RECs Generated:</span>
                    <span className="font-medium text-[#039994]">{stat.recsGenerated?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">RECs Sold:</span>
                    <span className="font-medium text-[#039994]">{stat.recsSold?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium text-green-600">${stat.salesAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium text-blue-600">{stat.remainingRecs?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}