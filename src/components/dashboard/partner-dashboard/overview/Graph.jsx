import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../lib/config";
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
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const COLORS = {
  registered: "#1E1E1E",
  pending: "#FFB200",
  expired: "#FF0000",
};

export default function ReferredAndCommissionDashboard() {
  const [refYear, setRefYear] = useState(new Date().getFullYear().toString());
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [errorRefData, setErrorRefData] = useState(null);
  const [referralStats, setReferralStats] = useState({
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [activeMonth, setActiveMonth] = useState(null);

  const [commissionYear, setCommissionYear] = useState(new Date().getFullYear().toString());
  const [commissionData, setCommissionData] = useState([]);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        setLoadingRefData(true);
        setErrorRefData(null);

        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!userId || !token) throw new Error("User authentication data not found");

        const res = await axiosInstance.get(`/api/user/referral-statistics/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "success") {
          const { totalPending, totalAccepted, totalExpired } = res.data.data;
          setReferralStats({ totalPending, totalAccepted, totalExpired });

          const currentMonth = new Date().getMonth();
          const data = MONTHS.map((month, index) => ({
            month,
            pending: index === currentMonth ? totalPending : 0,
            registered: index === currentMonth ? totalAccepted : 0,
            expired: index === currentMonth ? totalExpired : 0,
            active: index === currentMonth,
          }));
          setChartData(data);
        } else {
          throw new Error("Failed to retrieve referral statistics");
        }
      } catch (e) {
        console.error(e);
        setErrorRefData(e.message);
        const currentMonth = new Date().getMonth();
        setChartData(
          MONTHS.map((month, index) => ({
            month,
            pending: 0,
            registered: 0,
            expired: 0,
            active: index === currentMonth,
          }))
        );
      } finally {
        setLoadingRefData(false);
      }
    };

    fetchReferralStats();
  }, [refYear]);

  useEffect(() => {
    const fetchCommissionByYear = async () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) return;

      try {
        setLoadingCommission(true);

        const quarterRequests = [1, 2, 3, 4].map((quarter) =>
          axiosInstance
            .get(`/api/payout/commission-total/${userId}`, {
              params: { quarter, year: commissionYear },
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => (res.data.status === "success" ? res.data.data : null))
            .catch(() => null)
        );

        const results = await Promise.all(quarterRequests);

        const monthlyTotals = Array(12).fill(0);

        results.forEach((quarterData) => {
          if (!quarterData) return;
          const { months, total } = quarterData;
          if (!months || months.length === 0) return;
          const perMonth = total / months.length;
          months.forEach((m) => {
            monthlyTotals[m - 1] += perMonth;
          });
        });

        const data = MONTHS.map((month, index) => ({
          month,
          value: Math.round(monthlyTotals[index]),
          formattedValue: formatCurrency(Math.round(monthlyTotals[index])),
        }));

        setCommissionData(data);
      } catch (error) {
        console.error("Error fetching commission data:", error);
        setCommissionData(MONTHS.map((month) => ({ month, value: 0, formattedValue: "$0" })));
      } finally {
        setLoadingCommission(false);
      }
    };

    fetchCommissionByYear();
  }, [commissionYear]);

  const handleBarMouseEnter = (data, index) => setActiveMonth(index);
  const handleBarMouseLeave = () => setActiveMonth(null);

  const downloadCommissionReport = async () => {
    try {
      setDownloadingReport(true);

      const csvHeader = "Month,Commission\n";
      const csvContent = commissionData
        .map((item) => `${item.month},${item.value}`)
        .join("\n");

      const blob = new Blob([csvHeader + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `commission_report_${commissionYear}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-xs">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CommissionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-xs">
          <p className="font-semibold mb-1">{label}</p>
          <p style={{ color: "#039994" }}>
            Commission: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <img src="/vectors/UserSound.png" alt="" className="h-5 w-5 mr-2" />
            Referred Customers
          </h3>
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={refYear}
              onChange={(e) => setRefYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {yearOptions.map((year) => (
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
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, "dataMax"]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="registered"
                  stackId="a"
                  fill={COLORS.registered}
                  onMouseEnter={handleBarMouseEnter}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill={COLORS.pending}
                  onMouseEnter={handleBarMouseEnter}
                />
                <Bar
                  dataKey="expired"
                  stackId="a"
                  fill={COLORS.expired}
                  onMouseEnter={handleBarMouseEnter}
                />
              </BarChart>
            </ResponsiveContainer>

            <hr className="border-black my-2" />

            <div className="flex justify-center flex-wrap gap-4 text-xs">
              {[
                ["Registered", COLORS.registered],
                ["Pending", COLORS.pending],
                ["Expired", COLORS.expired],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <img src="/vectors/UserSound.png" alt="" className="h-5 w-5 mr-2" />
            Commission
          </h3>
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={commissionYear}
              onChange={(e) => setCommissionYear(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={downloadCommissionReport}
              disabled={loadingCommission || downloadingReport}
              className="px-3 py-1 bg-[#039994] text-white rounded text-xs flex items-center disabled:opacity-50"
            >
              {downloadingReport ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </>
              )}
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
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, "auto"]}
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CommissionTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#039994"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <hr className="border-black my-2" />

            <div className="flex justify-center items-center text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 block" style={{ backgroundColor: "#039994" }} />
                <span>Commission</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}