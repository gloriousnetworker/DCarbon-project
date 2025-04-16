// src/components/ReferredAndCommissionDashboard.jsx

import React, { useState, useEffect } from "react";

export default function ReferredAndCommissionDashboard() {
  // -----------------------------
  // State for Referred Customers
  // -----------------------------
  const [refView, setRefView] = useState("Yearly"); // "Yearly" or "Monthly"
  const [refYear, setRefYear] = useState("2025");
  const [refMonth, setRefMonth] = useState("3"); // default month for monthly mode; using 3 as in your example
  const [loadingRefData, setLoadingRefData] = useState(false);
  const [errorRefData, setErrorRefData] = useState(null);

  // Stacked chart arrays for 12 months (for five categories)
  const [invitedData, setInvitedData] = useState(Array(12).fill(0));
  const [registeredData, setRegisteredData] = useState(Array(12).fill(0));
  const [activeData, setActiveData] = useState(Array(12).fill(0));
  const [activeResiData, setActiveResiData] = useState(Array(12).fill(0));
  const [terminatedData, setTerminatedData] = useState(Array(12).fill(0));

  // -----------------------------
  // State for Commission
  // -----------------------------
  const [commissionYear, setCommissionYear] = useState("2025");
  const [commissionData, setCommissionData] = useState([]);
  const [loadingCommission, setLoadingCommission] = useState(false);

  // --------------------------------------------------------
  // 1) Fetch Referred Customer Data from the provided endpoint
  // --------------------------------------------------------
  useEffect(() => {
    const fetchReferredUsers = async () => {
      setLoadingRefData(true);
      setErrorRefData(null);

      const authToken = localStorage.getItem("authToken");
      // Using provided userId as fallback if not in localStorage.
      const userId = localStorage.getItem("userId") || "6b74d3a7-d8bc-4b3e-b1a5-48f4815002b0";
      const baseUrl = "https://dcarbon-server.onrender.com";

      // Prepare arrays to collect data per month
      const monthlyInvited = [];
      const monthlyRegistered = [];
      const monthlyActive = [];
      const monthlyActiveResi = [];
      const monthlyTerminated = [];

      // Helper: Process the response data (which is an array of objects like { day, count }).
      // Since the endpoint doesn’t actually differentiate between categories,
      // we demo by using the returned count as the “invited” count only.
      const processResponseData = (dataArray) => {
        // In a real scenario, you might have separate fields for each category
        // For demonstration, we assume all counts go to "invited"
        let totalInvited = 0;
        let totalRegistered = 0;
        let totalActive = 0;
        let totalActiveResi = 0;
        let totalTerminated = 0;
        dataArray.forEach((item) => {
          totalInvited += item.count;
          // You can add logic to fill the other categories if the data supports it.
        });
        return { totalInvited, totalRegistered, totalActive, totalActiveResi, totalTerminated };
      };

      try {
        if (refView === "Yearly") {
          // Loop through all 12 months
          for (let m = 1; m <= 12; m++) {
            const url = `${baseUrl}/api/user/referred-users/${userId}?year=${refYear}&month=${m}`;
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            });
            // If a given month’s data is not found, assume 0 count instead of throwing an error.
            if (!response.ok) {
              if (response.status === 404) {
                monthlyInvited.push(0);
                monthlyRegistered.push(0);
                monthlyActive.push(0);
                monthlyActiveResi.push(0);
                monthlyTerminated.push(0);
                continue; // Skip to next month
              } else {
                throw new Error(`Referred users: HTTP error! Status: ${response.status}`);
              }
            }
            const result = await response.json();
            const {
              totalInvited,
              totalRegistered,
              totalActive,
              totalActiveResi,
              totalTerminated,
            } = processResponseData(result.data);
            monthlyInvited.push(totalInvited);
            monthlyRegistered.push(totalRegistered);
            monthlyActive.push(totalActive);
            monthlyActiveResi.push(totalActiveResi);
            monthlyTerminated.push(totalTerminated);
          }
        } else {
          // "Monthly" view - fetch only for the selected month.
          const url = `${baseUrl}/api/user/referred-users/${userId}?year=${refYear}&month=${refMonth}`;
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            if (response.status === 404) {
              // If not found, treat this month as 0.
              const emptyArray = Array(12).fill(0);
              monthlyInvited.push(...emptyArray);
              monthlyRegistered.push(...emptyArray);
              monthlyActive.push(...emptyArray);
              monthlyActiveResi.push(...emptyArray);
              monthlyTerminated.push(...emptyArray);
            } else {
              throw new Error(`Referred users: HTTP error! Status: ${response.status}`);
            }
          } else {
            const result = await response.json();
            const {
              totalInvited,
              totalRegistered,
              totalActive,
              totalActiveResi,
              totalTerminated,
            } = processResponseData(result.data);
            // Fill an array of 12 where only the selected month is updated.
            const monthIndex = parseInt(refMonth, 10) - 1;
            const empty = Array(12).fill(0);
            empty[monthIndex] = totalInvited;
            monthlyInvited.push(...empty);

            const emptyReg = Array(12).fill(0);
            emptyReg[monthIndex] = totalRegistered;
            monthlyRegistered.push(...emptyReg);

            const emptyActive = Array(12).fill(0);
            emptyActive[monthIndex] = totalActive;
            monthlyActive.push(...emptyActive);

            const emptyActiveResi = Array(12).fill(0);
            emptyActiveResi[monthIndex] = totalActiveResi;
            monthlyActiveResi.push(...emptyActiveResi);

            const emptyTerminated = Array(12).fill(0);
            emptyTerminated[monthIndex] = totalTerminated;
            monthlyTerminated.push(...emptyTerminated);
          }
        }

        // Update the states with collected data
        setInvitedData(monthlyInvited);
        setRegisteredData(monthlyRegistered);
        setActiveData(monthlyActive);
        setActiveResiData(monthlyActiveResi);
        setTerminatedData(monthlyTerminated);
      } catch (err) {
        setErrorRefData(err.message);
        console.error("Error fetching referred customers:", err);
      } finally {
        setLoadingRefData(false);
      }
    };

    fetchReferredUsers();
  }, [refView, refYear, refMonth]);

  // --------------------------------------------------------
  // 2) Fetch or Mock Commission data (line chart)
  // --------------------------------------------------------
  useEffect(() => {
    setLoadingCommission(true);

    // For demonstration, using static mock commission data.
    const mockLineData = [
      { month: "Jan", value: 40 },
      { month: "Feb", value: 60 },
      { month: "Mar", value: 30 },
      { month: "Apr", value: 80 },
      { month: "May", value: 70 },
      { month: "Jun", value: 90 },
      { month: "Jul", value: 100 },
      { month: "Aug", value: 75 },
      { month: "Sep", value: 50 },
      { month: "Oct", value: 65 },
      { month: "Nov", value: 95 },
      { month: "Dec", value: 45 },
    ];

    // Simulate async delay (replace with real API call as needed)
    setTimeout(() => {
      setCommissionData(mockLineData);
      setLoadingCommission(false);
    }, 500);
  }, [commissionYear]);

  // Helper function for Commission line chart – get maximum value
  const getMaxCommissionValue = () =>
    commissionData.reduce((max, point) => (point.value > max ? point.value : max), 0);

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT CARD: REFERRED CUSTOMERS */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          {/* Left side: Icon + Title */}
          <div className="flex items-center space-x-2">
            <img src="/vectors/UserSound.png" alt="tiny vector" className="h-4 w-4 object-contain" />
            <h3 className="text-sm font-semibold text-black">Referred Customers</h3>
          </div>
          {/* Right side: Dropdowns for period & year */}
          <div className="flex items-center space-x-2">
            <select
              value={refView}
              onChange={(e) => setRefView(e.target.value)}
              className="text-gray-700 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
            >
              <option value="Yearly">Yearly</option>
              <option value="Monthly">Monthly</option>
            </select>
            {refView === "Monthly" && (
              <select
                value={refMonth}
                onChange={(e) => setRefMonth(e.target.value)}
                className="text-gray-700 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {`Month ${m}`}
                  </option>
                ))}
              </select>
            )}
            <select
              value={refYear}
              onChange={(e) => setRefYear(e.target.value)}
              className="text-gray-700 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {/* Horizontal black line */}
        <hr className="my-3 border-black" />

        {/* Chart area */}
        <div className="mt-2 flex flex-col">
          {loadingRefData ? (
            <div className="h-64 flex justify-center items-center">
              <p className="animate-pulse text-gray-600">Loading Referred Customers...</p>
            </div>
          ) : errorRefData ? (
            <div className="text-red-500 text-sm">
              Error loading referred customers: {errorRefData}
            </div>
          ) : (
            <div className="relative flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between items-end mr-2 h-64">
                {[100, 75, 50, 25, 0].map((val) => (
                  <span key={val} className="text-xs text-gray-400">
                    {val}
                  </span>
                ))}
              </div>
              {/* STACKED BARS for each month (Jan - Dec) */}
              <div className="flex-1 flex items-end justify-between h-64">
                {Array.from({ length: 12 }, (_, i) => i).map((index) => {
                  const iValue = invitedData[index] || 0;
                  const rValue = registeredData[index] || 0;
                  const aValue = activeData[index] || 0;
                  const arValue = activeResiData[index] || 0;
                  const tValue = terminatedData[index] || 0;
                  // Total (can be displayed at the top of each bar)
                  const total = iValue + rValue + aValue + arValue + tValue;
                  // Calculate each category’s height (assuming 100 is max)
                  const invitedHeight = (iValue / 100) * 100;
                  const registeredHeight = (rValue / 100) * 100;
                  const activeHeight = (aValue / 100) * 100;
                  const activeResiHeight = (arValue / 100) * 100;
                  const terminatedHeight = (tValue / 100) * 100;
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return (
                    <div key={index} className="flex flex-col items-center w-6">
                      <div className="bg-gray-200 w-4 h-full rounded-md overflow-hidden flex flex-col justify-end relative">
                        {/* Stacked layers (from bottom to top) */}
                        <div
                          style={{ backgroundColor: "#FF0000", height: `${terminatedHeight}%` }}
                          className="w-full"
                        />
                        <div
                          style={{ backgroundColor: "#056C69", height: `${activeResiHeight}%` }}
                          className="w-full"
                        />
                        <div
                          style={{ backgroundColor: "#00B4AE", height: `${activeHeight}%` }}
                          className="w-full"
                        />
                        <div
                          style={{ backgroundColor: "#1E1E1E", height: `${registeredHeight}%` }}
                          className="w-full"
                        />
                        <div
                          style={{ backgroundColor: "#FFB200", height: `${invitedHeight}%` }}
                          className="w-full"
                        />
                        {total > 0 && (
                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-700">
                            {total}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{months[index]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Horizontal line under the bars */}
          <hr className="mt-3 mb-3 border-black" />
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4">
            <LegendItem color="#FFB200" label="Invited Customers" />
            <LegendItem color="#1E1E1E" label="Registered Customers" />
            <LegendItem color="#00B4AE" label="Active Customers" />
            <LegendItem color="#056C69" label="Active Resi. Groups" />
            <LegendItem color="#FF0000" label="Terminated Customers" />
          </div>
        </div>
      </div>

      {/* RIGHT CARD: COMMISSION */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        {/* Title row */}
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <img src="/vectors/UserSound.png" alt="tiny vector" className="h-4 w-4 object-contain" />
            <h3 className="text-sm font-semibold text-black">Commission</h3>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={commissionYear}
              onChange={(e) => setCommissionYear(e.target.value)}
              className="text-gray-700 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <button
              className="text-sm px-3 py-1 bg-[#00B4AE] text-white font-semibold rounded focus:outline-none"
              onClick={() => alert("View Report clicked!")}
            >
              View Report
            </button>
          </div>
        </div>
        {/* Line chart area */}
        <div className="mt-4 flex flex-col grow">
          {loadingCommission ? (
            <div className="h-64 flex justify-center items-center">
              <p className="animate-pulse text-gray-600">Loading Commission Data...</p>
            </div>
          ) : (
            <div className="relative flex">
              <div className="flex flex-col justify-between items-end mr-2 h-64">
                {[100, 75, 50, 25, 0].map((val) => (
                  <span key={val} className="text-xs text-gray-400">
                    {val}k
                  </span>
                ))}
              </div>
              <div className="flex-1 relative h-64">
                {/* Horizontal grid lines */}
                {[100, 75, 50, 25, 0].map((val) => (
                  <div
                    key={val}
                    className="absolute left-0 right-0 border-t border-gray-200"
                    style={{ bottom: `${(val / 100) * 100}%` }}
                  />
                ))}
                {/* Commission line chart using an SVG polyline */}
                <svg className="absolute w-full h-full left-0 top-0">
                  {commissionData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#039994"
                      strokeWidth="2"
                      points={commissionData
                        .map((item, idx) => {
                          const x = (idx / (commissionData.length - 1)) * 100;
                          const maxVal = getMaxCommissionValue();
                          const yPercent = maxVal === 0 ? 0 : (item.value / maxVal) * 100;
                          const y = 100 - yPercent;
                          return `${x}%,${y}%`;
                        })
                        .join(" ")}
                    />
                  )}
                  {commissionData.map((item, idx) => {
                    const x = (idx / (commissionData.length - 1)) * 100;
                    const maxVal = getMaxCommissionValue();
                    const yPercent = maxVal === 0 ? 0 : (item.value / maxVal) * 100;
                    const y = 100 - yPercent;
                    return <circle key={item.month} cx={`${x}%`} cy={`${y}%`} r="4" fill="#039994" />;
                  })}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                  {commissionData.map((item, idx) => (
                    <span key={idx} style={{ width: "1px" }}>
                      {item.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Legend item component
function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
