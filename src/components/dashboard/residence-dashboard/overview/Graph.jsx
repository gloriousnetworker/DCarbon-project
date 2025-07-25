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

const COLORS = {
  solarProduction: "#039994",
  earnings: "#039994",
  netEnergy: "#039994",
  recsGenerated: "#039994",
};

export default function SolarProductionAndEarningsDashboard() {
  const [solarView, setSolarView] = useState("Yearly");
  const [solarYear, setSolarYear] = useState(new Date().getFullYear().toString());
  const [earningsYear, setEarningsYear] = useState(new Date().getFullYear().toString());
  const [loadingSolarData, setLoadingSolarData] = useState(true);
  const [loadingEarningsData, setLoadingEarningsData] = useState(true);
  const [displayType, setDisplayType] = useState("Solar Production");
  const [solarProductionData, setSolarProductionData] = useState([]);
  const [netEnergyData, setNetEnergyData] = useState([]);
  const [recsGeneratedData, setRecsGeneratedData] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasMeters, setHasMeters] = useState(false);
  const [metersLoading, setMetersLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);

  const getUserId = () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    return loginResponse?.data?.user?.id || localStorage.getItem("userId") || "14bbbf22-03c1-41a7-9bca-9429ec89a28b";
  };

  const getAuthToken = () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    return loginResponse?.data?.token || localStorage.getItem("authToken");
  };

  const checkMeters = async () => {
    try {
      const userId = getUserId();
      const authToken = getAuthToken();

      if (!userId || !authToken) {
        setMetersLoading(false);
        return;
      }

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
      setHasMeters(result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0));
    } catch (error) {
      console.error('Error fetching meters:', error);
    } finally {
      setMetersLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const authToken = getAuthToken();
      const userId = getUserId();
      
      const response = await fetch(`https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const facilitiesData = data.data?.facilities || [];
      setFacilities(facilitiesData);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setFacilities([]);
    }
  };

  useEffect(() => {
    checkMeters();
  }, []);

  useEffect(() => {
    if (!metersLoading) {
      fetchFacilities();
    }
  }, [metersLoading]);

  useEffect(() => {
    if (!hasMeters || metersLoading) return;
    setLoadingSolarData(true);
    
    const fetchSolarData = async () => {
      try {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const emptyMonthlyData = months.map(month => ({ month, value: 0 }));
        
        setTimeout(() => {
          if (facilities.length > 0) {
            const solarData = MONTHS.map((month, index) => {
              const monthIndex = index;
              const seasonalFactor = Math.sin((monthIndex / 11) * Math.PI * 2);
              let value = 50 + seasonalFactor * 40;
              value += Math.floor(Math.random() * 15) - 5;
              if (month === "May" || month === "Nov") value = 90;
              if (month === "Apr" || month === "Aug") value = 30;
              if (month === "Jan" || month === "Dec") value = 75;
              if (month === "Feb") value = 50;
              if (month === "Jun" || month === "Jul") value = 75;
              if (month === "Sep") value = 50;
              if (month === "Oct") value = 75;
              if (month === "Mar") value = 65;
              return { month, value: Math.max(0, Math.min(100, Math.floor(value))) };
            });
            setSolarProductionData(solarData);
            
            const netEnergyData = MONTHS.map((month, index) => {
              const monthIndex = index;
              let value = 40 + Math.sin((monthIndex / 11) * Math.PI * 2) * 35;
              value += Math.floor(Math.random() * 10);
              return { month, value: Math.max(0, Math.min(100, Math.floor(value))) };
            });
            setNetEnergyData(netEnergyData);
            
            const recsData = MONTHS.map((month, index) => {
              const monthIndex = index;
              let value = 60 + Math.cos((monthIndex / 11) * Math.PI * 2) * 25;
              value += Math.floor(Math.random() * 10);
              return { month, value: Math.max(0, Math.min(100, Math.floor(value))) };
            });
            setRecsGeneratedData(recsData);
          } else {
            setSolarProductionData(emptyMonthlyData);
            setNetEnergyData(emptyMonthlyData);
            setRecsGeneratedData(emptyMonthlyData);
          }
          setLoadingSolarData(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching solar data:', error);
        setLoadingSolarData(false);
      }
    };

    fetchSolarData();
  }, [solarYear, solarView, hasMeters, metersLoading, facilities]);

  useEffect(() => {
    if (!hasMeters || metersLoading) return;
    setLoadingEarningsData(true);
    
    const fetchEarningsData = async () => {
      try {
        setTimeout(() => {
          if (facilities.length > 0) {
            const data = MONTHS.map((month) => {
              let value;
              switch (month) {
                case "Jan": value = 0; break;
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
              return { month, value };
            });
            setEarningsData(data);
          } else {
            const emptyData = MONTHS.map(month => ({ month, value: 0 }));
            setEarningsData(emptyData);
          }
          setLoadingEarningsData(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setLoadingEarningsData(false);
      }
    };

    fetchEarningsData();
  }, [earningsYear, hasMeters, metersLoading, facilities]);

  const getCurrentChartData = () => {
    switch (displayType) {
      case "Solar Production": return solarProductionData;
      case "Net Energy Exported": return netEnergyData;
      case "RECs Generated": return recsGeneratedData;
      default: return solarProductionData;
    }
  };

  const getCurrentChartColor = () => {
    return COLORS.solarProduction;
  };

  const toggleDropdown = () => {
    if (!hasMeters) return;
    setDropdownOpen(!dropdownOpen);
  };

  const selectDisplayType = (type) => {
    setDisplayType(type);
    setDropdownOpen(false);
  };

  if (metersLoading) {
    return (
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse text-xs">Loading...</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col ${!hasMeters ? 'opacity-50' : ''}`}>
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
              disabled={!hasMeters}
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
            <select
              value={solarYear}
              onChange={(e) => setSolarYear(e.target.value)}
              className="px-2 py-1 border rounded"
              disabled={!hasMeters}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <hr className="my-4" />
        {!hasMeters ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-xs">Complete utility authorization</p>
          </div>
        ) : loadingSolarData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs ml-2 mb-2">kWh</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={getCurrentChartData()} 
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>Month: {data.month}</p>
                          <p style={{ color: getCurrentChartColor() }}>{displayType}: {data.value} kWh</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill={getCurrentChartColor()} radius={[8, 8, 0, 0]} background={{ fill: '#f5f5f5', radius: [8, 8, 0, 0] }} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
      <div className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col ${!hasMeters ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: COLORS.earnings }}>
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
              disabled={!hasMeters}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <hr className="my-4" />
        {!hasMeters ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-xs">Complete utility authorization</p>
          </div>
        ) : loadingEarningsData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs mb-2"><div>Earnings</div></div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
                <YAxis width={30} orientation="right" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}k`} />
                <Tooltip formatter={(v) => `${v}k`} labelFormatter={(label) => `Month: ${label}`} />
                <Line type="monotone" dataKey="value" stroke={COLORS.solarProduction} strokeWidth={2} dot={{ r: 3, fill: COLORS.solarProduction }} activeDot={{ r: 5, fill: COLORS.solarProduction }} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}