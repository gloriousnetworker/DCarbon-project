import React, { useState, useEffect } from "react";
import { FiDownload, FiCalendar, FiFilter } from "react-icons/fi";

export default function CommercialDetailsGraph({ facilityId }) {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    recGenerated: 0,
    recSold: 0,
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

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchMeterData();
  }, [facilityId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [rawData, dateRange, selectedMonths, sortBy]);

  const fetchMeterData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://services.dcarbon.solutions/api/facility/get-meter-rec-data/1858864', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const readings = result.data.data.intervals[0].readings;
        setRawData(readings);
        
        const startDate = new Date(Math.min(...readings.map(r => new Date(r.start))));
        const endDate = new Date(Math.max(...readings.map(r => new Date(r.start))));
        
        setDateRange({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching meter data:', err);
    } finally {
      setLoading(false);
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
    processFilteredData(filtered);
  };

  const processFilteredData = (data) => {
    const monthlyData = {};
    let totalEnergyProduced = 0;
    
    data.forEach(reading => {
      const date = new Date(reading.start);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const energyValue = reading.kwh || 0;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += energyValue;
      totalEnergyProduced += energyValue;
    });

    const processedChartData = months.map(month => ({
      month,
      value: monthlyData[month] || 0,
      recs: Math.round((monthlyData[month] || 0) * 1.2)
    }));

    const maxValue = Math.max(...processedChartData.map(d => d.value));
    const normalizedData = processedChartData.map(data => ({
      ...data,
      normalizedValue: maxValue > 0 ? (data.value / maxValue) * 100 : 0
    }));

    setChartData(normalizedData);
    
    const totalRecs = Math.round(totalEnergyProduced * 1.2);
    const soldRecs = Math.round(totalRecs * 0.8);
    const revenue = soldRecs * 45;

    setStats({
      recGenerated: totalRecs,
      recSold: soldRecs,
      revenueEarned: revenue,
      energyProduced: Math.round(totalEnergyProduced * 100) / 100
    });
  };

  const downloadData = () => {
    try {
      const dataToExport = filteredData.length > 0 ? filteredData : rawData;
      
      const headers = [
        'Timestamp',
        'Start Time',
        'End Time',
        'Energy (kWh)',
        'Net Value',
        'Forward Value',
        'Reverse Value',
        'Month',
        'Day',
        'Year',
        'RECs Generated'
      ];
      
      const csvRows = [];
      csvRows.push(headers.join(','));

      if (dataToExport && dataToExport.length > 0) {
        dataToExport.forEach((reading, index) => {
          const startDate = new Date(reading.start);
          const endDate = new Date(reading.end);
          const month = startDate.toLocaleString('default', { month: 'short' });
          const day = startDate.getDate();
          const year = startDate.getFullYear();
          const recsGenerated = Math.round((reading.kwh || 0) * 1.2);
          
          const netDatapoint = reading.datapoints.find(dp => dp.type === 'net');
          const fwdDatapoint = reading.datapoints.find(dp => dp.type === 'fwd');
          const revDatapoint = reading.datapoints.find(dp => dp.type === 'rev');

          const row = [
            index + 1,
            startDate.toISOString(),
            endDate.toISOString(),
            reading.kwh || 0,
            netDatapoint ? netDatapoint.value : 0,
            fwdDatapoint ? fwdDatapoint.value : 0,
            revDatapoint ? revDatapoint.value : 0,
            month,
            day,
            year,
            recsGenerated
          ];
          
          csvRows.push(row.join(','));
        });
      }

      csvRows.push('');
      csvRows.push('Filter Applied');
      if (dateRange.startDate && dateRange.endDate) {
        csvRows.push(`Date Range,${dateRange.startDate} to ${dateRange.endDate}`);
      }
      if (selectedMonths.length > 0) {
        csvRows.push(`Selected Months,"${selectedMonths.join(', ')}"`);
      }
      csvRows.push(`Sort Order,${sortBy}`);
      csvRows.push(`Total Records,${dataToExport.length}`);
      
      csvRows.push('');
      csvRows.push('Summary Statistics');
      csvRows.push(`Total RECs Generated,${stats.recGenerated}`);
      csvRows.push(`RECs Sold,${stats.recSold}`);
      csvRows.push(`Revenue Earned,$${stats.revenueEarned}`);
      csvRows.push(`Total Energy Produced,${stats.energyProduced} MWh`);

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const filterSuffix = selectedMonths.length > 0 ? `_${selectedMonths.join('-')}` : 
                          (dateRange.startDate && dateRange.endDate) ? `_${dateRange.startDate}_to_${dateRange.endDate}` : '';
      
      link.setAttribute('download', `facility_${facilityId}_meter_1858864${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading data:', err);
      alert('Failed to download data. Please try again.');
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

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#039994]"></div>
          <span className="ml-2 text-gray-600">Loading energy data...</span>
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
            onClick={fetchMeterData}
            className="mt-4 bg-[#039994] text-white px-4 py-2 rounded text-sm hover:bg-[#027a75] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.normalizedValue));
  const activeFilters = getActiveFiltersCount();

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold text-[#039994]">Energy Performance</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors relative ${
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
            className="flex items-center space-x-1 bg-[#039994] text-white px-3 py-1 rounded text-sm hover:bg-[#027a75] transition-colors"
            disabled={!rawData || rawData.length === 0}
          >
            <FiDownload size={14} />
            <span>Download CSV</span>
          </button>
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
            Showing {filteredData.length} of {rawData.length} records
            {selectedMonths.length > 0 && (
              <span className="ml-2 text-[#039994]">
                • Months: {selectedMonths.join(', ')}
              </span>
            )}
            {dateRange.startDate && dateRange.endDate && (
              <span className="ml-2 text-[#039994]">
                • Date: {dateRange.startDate} to {dateRange.endDate}
              </span>
            )}
          </div>
        </div>
      )}

      {!showFilters && <div className="mb-16"></div>}

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
                <div>{data.recs} RECs</div>
                <div>{data.value.toFixed(2)} kWh</div>
              </div>
              <p className="text-xs text-gray-600 mt-3 font-medium">{data.month}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-16">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">RECs Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recGenerated.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#039994] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">RECs Sold</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.recSold.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-black rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Revenue Earned</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">${stats.revenueEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-[#FBBF24] rounded-full"></div>
            <p className="text-gray-700 text-xs font-medium">Energy Generated</p>
          </div>
          <p className="text-[#056C69] text-lg font-bold">{stats.energyProduced} MWh</p>
        </div>
      </div>
    </div>
  );
}