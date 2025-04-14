import React, { useState, useEffect } from "react";
import { pageTitle, selectClass } from "./styles";

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

  // Fetch facilities data
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await fetch(
          "https://dcarbon-server.onrender.com/api/facility/get-all-facilities",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFacilities(data.data.facilities);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching facilities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Fetch chart data whenever filters change
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        // Simulate API call - replace with actual API call
        // const authToken = localStorage.getItem("authToken");
        // const response = await fetch(
        //   `https://dcarbon-server.onrender.com/api/energy-data?year=${selectedYear}&type=${chartType}&facility=${selectedFacility}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${authToken}`,
        //     },
        //   }
        // );
        // const data = await response.json();
        
        // For now, using mock data
        const mockData = generateMockData(selectedYear, chartType, selectedFacility);
        setMonthlyData(mockData);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear, chartType, selectedFacility]);

  // Generate mock data - replace with actual API data
  const generateMockData = (year, type, facility) => {
    const baseValues = {
      "Solar Production": [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
      "Energy Consumed": [45, 55, 60, 65, 70, 75, 80, 78, 72, 65, 60, 50],
      "RECs Created": [30, 35, 40, 45, 50, 55, 60, 65, 60, 55, 50, 45],
    };

    // Adjust values based on year to show some variation
    const yearFactor = {
      "2025": 1,
      "2024": 0.9,
      "2023": 0.8,
    };

    const factor = yearFactor[year] || 1;

    return [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ].map((month, index) => ({
      month,
      value: Math.round(baseValues[type][index] * factor),
    }));
  };

  // Decide bar color based on chartType
  const getFillColor = () => {
    switch (chartType) {
      case "Energy Consumed":
        return "#000000"; // black
      case "RECs Created":
        return "#039994"; // teal
      default:
        return "#FBBF24"; // yellow (Solar Production)
    }
  };

  // Axis labels: 100, 75, 50, 25, 0 (in MWh)
  const yAxisValues = [100, 75, 50, 25, 0];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading facilities...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading facilities: {error}</div>;
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <h2 className={`${pageTitle} text-[#039994] mb-4`}>Energy Performance</h2>

      {/* Main Grid: Chart (left) + Stats (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART: 2 columns on large screens */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-md shadow p-4">
          {/* Top Row: Chart Type + Units + Selects */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            {/* Left Controls: Chart Type & MWh */}
            <div className="flex items-center space-x-2">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-[#039994] font-semibold bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Solar Production">Solar Production</option>
                <option value="Energy Consumed">Energy Consumed</option>
                <option value="RECs Created">RECs Created</option>
              </select>
              <span className="text-sm text-gray-400">MWh</span>
            </div>

            {/* Right Controls: Facility, Period, Year */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className={`${selectClass} w-auto`}
              >
                <option value="All facilities">All facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.facilityName}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`${selectClass} w-auto`}
              >
                <option>Yearly</option>
                <option>Monthly</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`${selectClass} w-auto`}
              >
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>

          {/* Chart Area */}
          {chartLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <div className="flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between items-end mr-4 h-64">
                {yAxisValues.map((val, idx) => (
                  <span key={idx} className="text-gray-500 text-sm">
                    {val}
                  </span>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 flex items-end justify-between h-64">
                {monthlyData.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center w-8">
                    {/* Outer tube with full rounding */}
                    <div className="bg-gray-200 w-4 h-full rounded-full overflow-hidden flex flex-col justify-end relative">
                      {/* Inner fill */}
                      <div
                        style={{
                          backgroundColor: getFillColor(),
                          height: `${(data.value / 100) * 100}%`,
                          transition: "height 0.5s ease",
                        }}
                        className="w-full rounded-full"
                      />
                      
                      {/* Value label at the top of the bar */}
                      <div 
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                                   text-xs font-medium text-gray-700"
                      >
                        {data.value}
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <p className="text-xs text-gray-500 mt-2">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STATS: 1 column on large screens */}
        <div className="col-span-1 space-y-4">
          {/* Row 1: RECs Generated & Total RECs sold */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card: RECs Generated */}
            <div className="bg-white rounded-md shadow p-4 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-[#039994] rounded-full"></div>
                <p className="text-black text-sm font-sfpro">RECs Generated</p>
              </div>
              <hr className="w-full my-2 border-gray-200" />
              <p className="text-[#056C69] text-xl font-bold">
                {selectedFacility === "All facilities" 
                  ? facilities.reduce((sum, facility) => sum + facility.recGenerated, 0)
                  : facilities.find(f => f.id === selectedFacility)?.recGenerated || 0}
              </p>
            </div>

            {/* Card: Total RECs sold */}
            <div className="bg-white rounded-md shadow p-4 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-[#039994] rounded-full"></div>
                <p className="text-black text-sm font-sfpro">Total RECs sold</p>
              </div>
              <hr className="w-full my-2 border-gray-200" />
              <p className="text-[#056C69] text-xl font-bold">
                {selectedFacility === "All facilities" 
                  ? facilities.reduce((sum, facility) => sum + facility.recSold, 0)
                  : facilities.find(f => f.id === selectedFacility)?.recSold || 0}
              </p>
            </div>
          </div>

          {/* Row 2: Total Rev. Earned & Avg. price/REC */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card: Total Rev. Earned */}
            <div className="bg-white rounded-md shadow p-4 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-black rounded-full"></div>
                <p className="text-black text-sm font-sfpro">Total Rev. Earned</p>
              </div>
              <hr className="w-full my-2 border-gray-200" />
              <p className="text-[#056C69] text-xl font-bold">
                ${selectedFacility === "All facilities" 
                  ? facilities.reduce((sum, facility) => sum + facility.revenueEarned, 0)
                  : facilities.find(f => f.id === selectedFacility)?.revenueEarned || 0}
              </p>
            </div>

            {/* Card: Avg. price/REC */}
            <div className="bg-white rounded-md shadow p-4 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-[#FBBF24] rounded-full"></div>
                <p className="text-black text-sm font-sfpro">Avg. price/REC</p>
              </div>
              <hr className="w-full my-2 border-gray-200" />
              <p className="text-[#056C69] text-xl font-bold">
                ${selectedFacility === "All facilities" 
                  ? (facilities.reduce((sum, facility) => sum + (facility.salePricePerREC || 0), 0) / 
                    (facilities.filter(f => f.salePricePerREC).length || 1)).toFixed(2)
                  : facilities.find(f => f.id === selectedFacility)?.salePricePerREC?.toFixed(2) || "0"}
              </p>
            </div>
          </div>

          {/* Row 3: Energy Generated (full width) */}
          <div className="bg-white rounded-md shadow p-4 flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-[#FBBF24] rounded-full"></div>
              <p className="text-black text-sm font-sfpro">Energy Generated</p>
            </div>
            <hr className="w-full my-2 border-gray-200" />
            <p className="text-[#056C69] text-xl font-bold">
              {selectedFacility === "All facilities" 
                ? `${facilities.reduce((sum, facility) => sum + facility.energyProduced, 0)}MWh`
                : `${facilities.find(f => f.id === selectedFacility)?.energyProduced || 0}MWh`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}