import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Cell,
} from "recharts";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const COLORS = {
  invited: "#039994",
  registered: "#1E1E1E",
  pending: "#FFB200",
  expired: "#FF0000",
};

export default function ReferredAndCommissionDashboard() {
  const [refView, setRefView] = useState("Monthly");
  const [refYear, setRefYear] = useState(new Date().getFullYear().toString());
  const [refMonth, setRefMonth] = useState((new Date().getMonth() + 1).toString());
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [errorRefData, setErrorRefData] = useState(null);

  const [referralStats, setReferralStats] = useState({
    totalInvited: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [activeMonth, setActiveMonth] = useState(null);

  const [commissionYear, setCommissionYear] = useState(new Date().getFullYear().toString());
  const [commissionData, setCommissionData] = useState([]);
  const [loadingCommission, setLoadingCommission] = useState(false);

  // Fetch referral stats
  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
        const res = await axios.get(
          `https://dcarbon-server.onrender.com/api/user/referral-statistics/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReferralStats(res.data.data || {});
      } catch (e) {
        console.error(e);
        setErrorRefData("Failed to load referral statistics");
      }
    };
    fetchReferralStats();
  }, []);

  // Generate chart data based on view type
  useEffect(() => {
    const generateChartData = () => {
      setLoadingRefData(true);
      try {
        if (refView === "Yearly") {
          // For yearly view, show data only for April (or any month with data)
          const data = MONTHS.map((month, index) => {
            const monthIndex = index + 1;
            const hasData = monthIndex === 4; // April has data
            
            return {
              month,
              invited: hasData ? referralStats.totalInvited : 0,
              registered: hasData ? referralStats.totalAccepted : 0,
              pending: hasData ? referralStats.totalPending : 0,
              expired: hasData ? referralStats.totalExpired : 0,
              active: hasData,
            };
          });
          setChartData(data);
        } else {
          // For monthly view, show data only for selected month
          const selectedMonthIndex = parseInt(refMonth) - 1;
          const data = MONTHS.map((month, index) => {
            if (index === selectedMonthIndex) {
              return {
                month,
                invited: referralStats.totalInvited,
                registered: referralStats.totalAccepted,
                pending: referralStats.totalPending,
                expired: referralStats.totalExpired,
                active: true,
              };
            }
            return { 
              month, 
              invited: 0, 
              registered: 0, 
              pending: 0, 
              expired: 0,
              active: false 
            };
          });
          setChartData(data);
        }
      } catch (err) {
        setErrorRefData(err.message);
      } finally {
        setLoadingRefData(false);
      }
    };

    generateChartData();
  }, [refView, refYear, refMonth, referralStats]);

  // Generate commission data
  useEffect(() => {
    setLoadingCommission(true);
    setTimeout(() => {
      setCommissionData(
        MONTHS.map((m, i) => ({
          month: m,
          value: Math.floor(30 + Math.random() * 70),
        }))
      );
      setLoadingCommission(false);
    }, 400);
  }, [commissionYear]);

  const CustomBar = (props) => {
    const { fill, x, y, width, height, data } = props;
    const monthData = chartData[props.index];
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={props.index === activeMonth ? 0 : 6}
          ry={props.index === activeMonth ? 0 : 6}
        />
        
        {monthData.registered > 0 && (
          <rect
            x={x}
            y={y + height - (height * monthData.registered / monthData.invited)}
            width={width}
            height={height * monthData.registered / monthData.invited}
            fill={COLORS.registered}
          />
        )}
        
        {monthData.expired > 0 && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height * monthData.expired / monthData.invited}
            fill={COLORS.expired}
          />
        )}
      </g>
    );
  };

  const handleBarMouseEnter = (data, index) => {
    setActiveMonth(index);
  };

  const handleBarMouseLeave = () => {
    setActiveMonth(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Referred Customers */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <img
              src="/vectors/UserSound.png"
              alt=""
              className="h-5 w-5 mr-2"
            />
            Referred Customers
          </h3>
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={refView}
              onChange={(e) => setRefView(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
            {refView === "Monthly" && (
              <select
                value={refMonth}
                onChange={(e) => setRefMonth(e.target.value)}
                className="px-2 py-1 border rounded"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            <select
              value={refYear}
              onChange={(e) => setRefYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-black my-2" />

        {loadingRefData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : errorRefData ? (
          <p className="text-red-500 text-xs">Error: {errorRefData}</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={chartData} 
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                onMouseLeave={handleBarMouseLeave}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 'dataMax']}
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
                          <p style={{ color: COLORS.invited }}>Invited: {data.invited}</p>
                          <p style={{ color: COLORS.registered }}>Registered: {data.registered}</p>
                          <p style={{ color: COLORS.pending }}>Pending: {data.pending}</p>
                          <p style={{ color: COLORS.expired }}>Expired: {data.expired}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="invited"
                  shape={<CustomBar />}
                  onMouseEnter={handleBarMouseEnter}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.active ? COLORS.invited : "#EEEEEE"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <hr className="border-black my-2" />

            <div className="flex justify-center space-x-4 text-xs">
              {[
                ["Invited", COLORS.invited],
                ["Registered", COLORS.registered],
                ["Pending", COLORS.pending],
                ["Expired", COLORS.expired],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center space-x-1">
                  <span
                    className="w-3 h-3 rounded-full block"
                    style={{ backgroundColor: color }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Commission */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <img
              src="/vectors/UserSound.png"
              alt=""
              className="h-5 w-5 mr-2"
            />
            Commission
          </h3>
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={commissionYear}
              onChange={(e) => setCommissionYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => alert("View Report clicked!")}
              className="px-3 py-1 bg-[#00B4AE] text-white rounded text-xs"
            >
              View Report
            </button>
          </div>
        </div>

        <hr className="border-black my-2" />

        {loadingCommission ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={commissionData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  ticks={[0, 25, 50, 75, 100]}
                  domain={[0, (max) => Math.ceil(max / 10) * 10]}
                  tickFormatter={(v) => `${v}k`}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => `${v}k`}
                  wrapperStyle={{ fontSize: 12 }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#039994"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <hr className="border-black my-2" />
          </>
        )}
      </div>
    </div>
  );
}