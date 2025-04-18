// src/components/ReferredAndCommissionDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
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
} from "recharts";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const COLORS = {
  invited:    "#FFB200",
  registered: "#1E1E1E",
  active:     "#00B4AE",
  terminated: "#FF0000",
};

export default function ReferredAndCommissionDashboard() {
  // — state & data‑fetch (unchanged) —
  const [refView, setRefView]               = useState("Yearly");
  const [refYear, setRefYear]               = useState("2025");
  const [refMonth, setRefMonth]             = useState("4");
  const [loadingRefData, setLoadingRefData] = useState(false);
  const [errorRefData, setErrorRefData]     = useState(null);

  const [referralStats, setReferralStats] = useState({
    totalInvited: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0,
  });

  const [invitedData, setInvitedData]       = useState(Array(12).fill(0));
  const [registeredData, setRegisteredData] = useState(Array(12).fill(0));
  const [activeData, setActiveData]         = useState(Array(12).fill(0));
  const [terminatedData, setTerminatedData] = useState(Array(12).fill(0));

  const [commissionYear, setCommissionYear]     = useState("2025");
  const [commissionData, setCommissionData]     = useState([]);
  const [loadingCommission, setLoadingCommission] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId =
          localStorage.getItem("userId") ||
          "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
        const res = await axios.get(
          `https://dcarbon-server.onrender.com/api/user/referral-statistics/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReferralStats(res.data.data || {});
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingRefData(true);
      setErrorRefData(null);
      const token = localStorage.getItem("authToken");
      const userId =
        localStorage.getItem("userId") ||
        "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
      const base = "https://dcarbon-server.onrender.com";

      try {
        if (refView === "Yearly") {
          const monthly = Array(12).fill(0);
          for (let m = 1; m <= 12; m++) {
            try {
              const resp = await axios.get(
                `${base}/api/user/referred-users/${userId}?year=${refYear}&month=${m}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              monthly[m - 1] = resp.data.data.reduce((s, i) => s + i.count, 0);
            } catch (err) {
              if (err.response?.status !== 404) console.error(err);
            }
          }
          setRegisteredData(monthly);

          const distribute = (total) => {
            const out = Array(12).fill(0);
            const filled = monthly.filter((c) => c > 0).length || 1;
            const per = Math.floor(total / filled);
            monthly.forEach((c, i) => {
              if (c > 0) out[i] = per;
            });
            const rem = total - per * filled;
            if (rem > 0) {
              const last = 11 - [...monthly].reverse().findIndex((c) => c > 0);
              out[last] += rem;
            }
            return out;
          };

          setInvitedData(distribute(referralStats.totalInvited));
          setActiveData(distribute(referralStats.totalPending));
          setTerminatedData(distribute(referralStats.totalExpired));
        } else {
          const resp = await axios.get(
            `${base}/api/user/referred-users/${userId}?year=${refYear}&month=${refMonth}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const count = resp.data.data.reduce((s, i) => s + i.count, 0);
          const idx = +refMonth - 1;
          const zeros = Array(12).fill(0);
          setRegisteredData(zeros.map((_, i) => (i === idx ? count : 0)));
          setInvitedData(
            zeros.map((_, i) =>
              i === idx ? referralStats.totalInvited : 0
            )
          );
          setActiveData(
            zeros.map((_, i) =>
              i === idx ? referralStats.totalPending : 0
            )
          );
          setTerminatedData(
            zeros.map((_, i) =>
              i === idx ? referralStats.totalExpired : 0
            )
          );
        }
      } catch (err) {
        console.error(err);
        setErrorRefData(err.message);
      } finally {
        setLoadingRefData(false);
      }
    })();
  }, [refView, refYear, refMonth, referralStats]);

  useEffect(() => {
    setLoadingCommission(true);
    setTimeout(() => {
      setCommissionData(
        MONTHS.map((m) => ({
          month: m,
          value: Math.floor(30 + Math.random() * 70),
        }))
      );
      setLoadingCommission(false);
    }, 400);
  }, [commissionYear]);

  const referralChartData = useMemo(
    () =>
      MONTHS.map((m, i) => ({
        month: m,
        invited: invitedData[i],
        registered: registeredData[i],
        active: activeData[i],
        terminated: terminatedData[i],
      })),
    [invitedData, registeredData, activeData, terminatedData]
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* — Referred Customers — */}
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
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        {/* first black line break */}
        <hr className="border-black my-2" />

        {loadingRefData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : errorRefData ? (
          <p className="text-red-500 text-xs">Error: {errorRefData}</p>
        ) : (
          <>
            {/* the stacked “test‑tube” chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={referralChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  ticks={[0, 25, 50, 75, 100]}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  wrapperStyle={{ fontSize: 12 }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="terminated"
                  stackId="a"
                  fill={COLORS.terminated}
                  radius={[0, 0, 12, 12]}
                />
                <Bar
                  dataKey="active"
                  stackId="a"
                  fill={COLORS.active}
                />
                <Bar
                  dataKey="registered"
                  stackId="a"
                  fill={COLORS.registered}
                />
                <Bar
                  dataKey="invited"
                  stackId="a"
                  fill={COLORS.invited}
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* second black line break */}
            <hr className="border-black my-2" />

            {/* legend in circles, text-xs */}
            <div className="flex justify-center space-x-4 text-xs">
              {[
                ["Invited", COLORS.invited],
                ["Registered", COLORS.registered],
                ["Active", COLORS.active],
                ["Terminated", COLORS.terminated],
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

      {/* — Commission — */}
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
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
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
