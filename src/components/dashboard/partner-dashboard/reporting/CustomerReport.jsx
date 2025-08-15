import React, { useState, useEffect } from "react";
import axios from "axios";

const MONTHS = [
  { label: "Month", value: "" },
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const YEARS = ["2023", "2024", "2025"];

const REPORT_OPTIONS = [
  { label: "Customer Report", value: "customer" },
  { label: "Generation Report", value: "generation" },
  { label: "Commission Statement", value: "commission" }
];

export default function CustomerReport({ onNavigate }) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
    time: "Oldest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptedUsersCache, setAcceptedUsersCache] = useState({});
  const [commissionsData, setCommissionsData] = useState({});

  const LIMIT = 10;
  const baseUrl = "https://services.dcarbon.solutions";

  const fetchAcceptedUserDetails = async (email) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${baseUrl}/api/user/${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setAcceptedUsersCache(prev => ({
          ...prev,
          [email]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching accepted user details:', error);
    }
  };

  const fetchCommissionsData = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${baseUrl}/api/commissions/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setCommissionsData(prev => ({
          ...prev,
          [userId]: response.data.data.totalCommissions
        }));
      }
    } catch (error) {
      console.error('Error fetching commissions data:', error);
    }
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.customerType) params.append("customerType", filters.customerType);
        if (yearFilter && monthFilter) {
          const y = yearFilter;
          const m = monthFilter.padStart(2, "0");
          const lastDay = new Date(y, Number(monthFilter), 0).getDate();
          params.append("startDate", `${y}-${m}-01`);
          params.append("endDate", `${y}-${m}-${lastDay}`);
        } else if (yearFilter) {
          params.append("startDate", `${yearFilter}-01-01`);
          params.append("endDate", `${yearFilter}-12-31`);
        }
        params.append("page", currentPage);
        params.append("limit", LIMIT);
        const res = await axios.get(
          `${baseUrl}/api/user/get-users-referrals/${userId}?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let { referrals, metadata } = res.data.data;
        referrals.sort((a, b) => {
          const da = new Date(a.createdAt),
            db = new Date(b.createdAt);
          return filters.time === "Newest" ? db - da : da - db;
        });
        setTableData(referrals);
        setTotalPages(metadata.totalPages);
        const acceptedUsers = referrals.filter(user => user.status === 'ACCEPTED');
        for (const user of acceptedUsers) {
          if (user.inviteeEmail && !acceptedUsersCache[user.inviteeEmail]) {
            fetchAcceptedUserDetails(user.inviteeEmail);
          }
          if (user.id && !commissionsData[user.id]) {
            fetchCommissionsData(user.id);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [currentPage, filters, yearFilter, monthFilter]);

  const handleOpenFilterModal = () => setShowFilterModal(true);
  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilterModal(false);
  };
  const handlePrevious = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const handleReportNavigation = (reportType) => {
    setShowReportDropdown(false);
    onNavigate && onNavigate(reportType);
  };
  const handleClearFilters = () => {
    setYearFilter("");
    setMonthFilter("");
    setFilters({ status: "", customerType: "", time: "Oldest" });
    setCurrentPage(1);
  };

  const renderStatusTag = (status) => {
    const bg = status === "PENDING" ? "#FFB200" : 
               status === "ACCEPTED" ? "#000000" : 
               status === "TERMINATED" ? "#FF0000" : "#00B4AE";
    return (
      <span className="inline-block px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: bg }}>
        {status}
      </span>
    );
  };

  const renderTableRows = () => {
    return tableData.map((ref, idx) => {
      const acceptedUserDetails = acceptedUsersCache[ref.inviteeEmail];
      const commissions = commissionsData[ref.id] || 0;
      
      let name = ref.name || "Name";
      let customerType = ref.customerType || "RESIDENTIAL";
      let role = ref.role || "CUSTOMER";
      
      if (ref.status === 'ACCEPTED' && acceptedUserDetails) {
        name = `${acceptedUserDetails.firstName || ''} ${acceptedUserDetails.lastName || ''}`.trim() || name;
        customerType = acceptedUserDetails.userType || customerType;
        role = acceptedUserDetails.role || role;
      }

      return (
        <tr key={ref.id} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="py-3 px-4 text-sm">{(currentPage - 1) * LIMIT + idx + 1}</td>
          <td className="py-3 px-4 text-sm">{name}</td>
          <td className="py-3 px-4 text-sm">{ref.inviteeEmail}</td>
          <td className="py-3 px-4 text-sm">{customerType}</td>
          <td className="py-3 px-4 text-sm">{role}</td>
          <td className="py-3 px-4 text-sm">${commissions.toFixed(2)}</td>
          <td className="py-3 px-4 text-sm">
            {new Date(ref.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })}
          </td>
          <td className="py-3 px-4 text-sm">{renderStatusTag(ref.status)}</td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-start justify-between w-full mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="">Year</option>
              {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <select
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {(yearFilter || monthFilter || filters.status || filters.customerType) && (
              <button onClick={handleClearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-2">
                Clear All
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenFilterModal}
              className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100 text-sm bg-white"
            >
              Filter by
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1 rounded bg-[#039994] text-sm text-white hover:bg-[#028c87]"
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="flex items-center justify-start w-full mb-6">
          <div className="relative">
            <button
              onClick={() => setShowReportDropdown(!showReportDropdown)}
              className="flex items-center text-2xl font-semibold text-[#039994]"
            >
              Customer Report
              <svg className={`ml-2 w-5 h-5 transition-transform ${showReportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showReportDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                {REPORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleReportNavigation(option.value)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.value === 'customer' ? 'bg-gray-50 font-medium' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(filters.status || filters.customerType) && (
            <div className="text-sm text-gray-600 ml-6">
              {filters.status && <span>Status: {filters.status} </span>}
              {filters.customerType && <span>Type: {filters.customerType} </span>}
              {filters.time && <span>Sort: {filters.time} first </span>}
            </div>
          )}
        </div>

        <div className="w-full overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading…</p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : tableData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No records found with these filters</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">S/N</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Customer Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Commissions</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date Reg.</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
          >
            &lt; Previous
          </button>
          <span className="text-sm text-gray-600">{currentPage} of {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="text-[#00B4AE] disabled:opacity-50 text-sm hover:underline"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          initialFilters={filters}
        />
      )}
      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={() => {}}
          initialFilters={filters}
          yearFilter={yearFilter}
          monthFilter={monthFilter}
          tableData={tableData}
        />
      )}
    </div>
  );
}