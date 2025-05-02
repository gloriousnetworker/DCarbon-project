import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Color constants
const COLORS = {
  solarProduction: "#039994",
  earnings: "#1E1E1E",
  netEnergy: "#4CAF50",
  recsGenerated: "#FF9800",
};

export default function SolarProductionAndEarningsDashboard() {
  // State for view controls
  const [solarView, setSolarView] = useState("Yearly");
  const [solarYear, setSolarYear] = useState(new Date().getFullYear().toString());
  const [earningsYear, setEarningsYear] = useState(new Date().getFullYear().toString());
  
  // State for data loading
  const [loadingSolarData, setLoadingSolarData] = useState(true);
  const [loadingEarningsData, setLoadingEarningsData] = useState(true);
  
  // State for display type
  const [displayType, setDisplayType] = useState("Solar Production");
  
  // State for chart data
  const [solarProductionData, setSolarProductionData] = useState([]);
  const [netEnergyData, setNetEnergyData] = useState([]);
  const [recsGeneratedData, setRecsGeneratedData] = useState([]);
  const [earningsData, setEarningsData] = useState([]);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate solar production data
  useEffect(() => {
    setLoadingSolarData(true);
    
    // Generate realistic data for solar production
    setTimeout(() => {
      const solarData = MONTHS.map((month, index) => {
        // Base value with seasonal variation (more in summer months)
        const monthIndex = index;
        const seasonalFactor = Math.sin((monthIndex / 11) * Math.PI * 2);
        
        // Higher in summer (May-Aug), lower in winter
        let value = 50 + seasonalFactor * 40;
        
        // Add some random variation
        value += Math.floor(Math.random() * 15) - 5;
        
        // Adjust for specific months to match the image
        if (month === "May" || month === "Nov") value = 90;
        if (month === "Apr" || month === "Aug") value = 30;
        if (month === "Jan" || month === "Dec") value = 75;
        if (month === "Feb") value = 50;
        if (month === "Jun" || month === "Jul") value = 75;
        if (month === "Sep") value = 50;
        if (month === "Oct") value = 75;
        if (month === "Mar") value = 65;
        
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      
      setSolarProductionData(solarData);
      
      // Generate data for Net Energy Exported (different pattern)
      const netEnergyData = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 40 + Math.sin((monthIndex / 11) * Math.PI * 2) * 35;
        value += Math.floor(Math.random() * 10);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      
      setNetEnergyData(netEnergyData);
      
      // Generate data for RECs Generated (different pattern)
      const recsData = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 60 + Math.cos((monthIndex / 11) * Math.PI * 2) * 25;
        value += Math.floor(Math.random() * 10);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      
      setRecsGeneratedData(recsData);
      setLoadingSolarData(false);
    }, 600);
  }, [solarYear, solarView]);

  // Generate earnings data
  useEffect(() => {
    setLoadingEarningsData(true);
    
    // Generate realistic earnings data that follows the pattern in the image
    setTimeout(() => {
      const data = MONTHS.map((month, index) => {
        // Pattern from image: starts low, peaks in Nov, drops in Dec
        let value;
        
        switch (month) {
          case "Jan": value = 0; break;  // Start at 0
          case "Feb": value = 10; break;
          case "Mar": value = 20; break;
          case "Apr": value = 5; break;
          case "May": value = 30; break;
          case "Jun": value = 30; break;
          case "Jul": value = 55; break;
          case "Aug": value = 20; break;
          case "Sep": value = 80; break;
          case "Oct": value = 80; break;
          case "Nov": value = 95; break;
          case "Dec": value = 65; break;
          default: value = 50;
        }
        
        return {
          month,
          value
        };
      });
      
      setEarningsData(data);
      setLoadingEarningsData(false);
    }, 600);
  }, [earningsYear]);

  // Get current chart data based on selected display type
  const getCurrentChartData = () => {
    switch (displayType) {
      case "Solar Production":
        return solarProductionData;
      case "Net Energy Exported":
        return netEnergyData;
      case "RECs Generated":
        return recsGeneratedData;
      default:
        return solarProductionData;
    }
  };

  // Get current chart color based on selected display type
  const getCurrentChartColor = () => {
    switch (displayType) {
      case "Solar Production":
        return COLORS.solarProduction;
      case "Net Energy Exported":
        return COLORS.netEnergy;
      case "RECs Generated":
        return COLORS.recsGenerated;
      default:
        return COLORS.solarProduction;
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Select display type
  const selectDisplayType = (type) => {
    setDisplayType(type);
    setDropdownOpen(false);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Solar Production Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <div className="relative">
            <h3 
              className="text-lg font-semibold flex items-center cursor-pointer"
              style={{ color: COLORS.solarProduction }}
              onClick={toggleDropdown}
            >
              {displayType}
              <ChevronDown className="h-5 w-5 ml-1" />
            </h3>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                <div className="py-1">
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("Solar Production")}
                  >
                    Solar Production
                  </div>
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("Net Energy Exported")}
                  >
                    Net Energy Exported
                  </div>
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("RECs Generated")}
                  >
                    RECs Generated
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={solarView}
              onChange={(e) => setSolarView(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
            
            <select
              value={solarYear}
              onChange={(e) => setSolarYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />

        {loadingSolarData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs ml-2 mb-2">MWh</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={getCurrentChartData()} 
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>Month: {data.month}</p>
                          <p style={{ color: getCurrentChartColor() }}>{displayType}: {data.value} MWh</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={getCurrentChartColor()}
                  radius={[8, 8, 0, 0]}
                  background={{ fill: '#f5f5f5', radius: [8, 8, 0, 0] }}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Earnings Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 
            className="text-lg font-semibold flex items-center"
            style={{ color: COLORS.earnings }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-6" />
            </svg>
            Earnings
          </h3>
          
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={earningsYear}
              onChange={(e) => setEarningsYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />

        {loadingEarningsData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs mb-2">
              <div>Earnings</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={earningsData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                />
                <YAxis 
                  width={30}
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `${v}k`}
                />
                <Tooltip
                  formatter={(v) => `${v}k`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.solarProduction}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.solarProduction }}
                  activeDot={{ r: 5, fill: COLORS.solarProduction }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}