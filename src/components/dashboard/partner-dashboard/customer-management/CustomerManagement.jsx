import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import FilterModal from './FilterModal';
import SendReminderModal from './SendReminderModal';
import InviteIndividualModal from './InviteIndividualModal';
import InviteBulkModal from './InviteBulkModal';
import CustomerDetails from './CustomerDetails';

const mainContainer = "bg-white";
const headingContainer = "flex justify-between items-center mb-6";
const pageTitle = "font-sfpro font-semibold";

const STATUS_COLORS = {
  INVITED: "#039994",
  REGISTERED: "#1E1E1E",
  PENDING: "#FFB200",
  EXPIRED: "#FF0000",
};

const DOCUMENT_STATUS_COLORS = {
  APPROVED: "#10B981",
  PENDING: "#FFB200",
  SUBMITTED: "#3B82F6",
  REJECTED: "#EF4444",
  DEFAULT: "#6B7280"
};

export default function PartnerCustomerReport() {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalInvited: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalExpired: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    customerType: '',
    dateRange: ''
  });
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSendReminderOpen, setSendReminderOpen] = useState(false);
  const [isInviteDropdownOpen, setInviteDropdownOpen] = useState(false);
  const [isInviteIndividualOpen, setInviteIndividualOpen] = useState(false);
  const [isInviteBulkOpen, setInviteBulkOpen] = useState(false);
  const [customerDetailsCache, setCustomerDetailsCache] = useState({});
  const [commercialRolesCache, setCommercialRolesCache] = useState({});

  useEffect(() => {
    fetchTableData(1);
    fetchStatistics();
  }, [filters]);

  const fetchTableData = async (pageNumber = 1) => {
    try {
      setLoadingTable(true);
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        console.error('User credentials not found in localStorage');
        setLoadingTable(false);
        return;
      }

      const params = {
        page: pageNumber,
        limit: 10,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.customerType) params.customerType = filters.customerType;
      if (filters.dateRange) {
        const dateRange = getDateRange(filters.dateRange);
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
      }

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-users-referrals/${userId}`,
        {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.data?.status === 'success') {
        const { referrals } = response.data.data;
        const metadata = response.data.data.metadata;

        setTableData(referrals || []);
        setCurrentPage(metadata.page || 1);
        setTotalPages(metadata.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoadingTable(false);
    }
  };

  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 86400000).toISOString()
        };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          startDate: startOfWeek.toISOString(),
          endDate: new Date(startOfWeek.getTime() + 7 * 86400000).toISOString()
        };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
        };
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          startDate: startOfYear.toISOString(),
          endDate: new Date(today.getFullYear() + 1, 0, 0).toISOString()
        };
      default:
        return {};
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true);
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        console.error('User credentials not found in localStorage');
        setLoadingStats(false);
        return;
      }

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/referral-statistics/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.data?.status === 'success') {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCustomerDetails = async (email) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/partner/details/${email}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchCommercialUserDetails = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        return result.data.commercialUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    closeFilterModal();
  };

  const getTotalCount = () => {
    return (
      statistics.totalInvited +
      statistics.totalPending +
      statistics.totalAccepted +
      statistics.totalExpired
    );
  };

  const calculatePercentage = (count) => {
    const total = getTotalCount();
    return total > 0 ? (count / total) * 100 : 0;
  };

  const openFilterModal = () => setFilterOpen(true);
  const closeFilterModal = () => setFilterOpen(false);
  const openSendReminderModal = () => setSendReminderOpen(true);
  const closeSendReminderModal = () => setSendReminderOpen(false);
  const openInviteIndividualModal = () => setInviteIndividualOpen(true);
  const closeInviteIndividualModal = () => setInviteIndividualOpen(false);
  const openInviteBulkModal = () => setInviteBulkOpen(true);
  const closeInviteBulkModal = () => setInviteBulkOpen(false);

  const handlePrevious = () => {
    if (currentPage > 1) {
      fetchTableData(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      fetchTableData(currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    const upperStatus = status?.toUpperCase();
    return STATUS_COLORS[upperStatus] || "#000000";
  };

  const getDocumentStatusStyle = (status) => {
    const upperStatus = status?.toUpperCase();
    return DOCUMENT_STATUS_COLORS[upperStatus] || DOCUMENT_STATUS_COLORS.DEFAULT;
  };

  const renderDocStatus = (status) => {
    const statusText = status?.toUpperCase();
    let displayText = 'NOT SUBMITTED';
    
    if (statusText === 'APPROVED') displayText = 'APPROVED';
    else if (statusText === 'PENDING') displayText = 'PENDING';
    else if (statusText === 'SUBMITTED') displayText = 'SUBMITTED';
    else if (statusText === 'REJECTED') displayText = 'REJECTED';

    return (
      <span
        className="text-white px-2 py-1 rounded-full text-xs"
        style={{ backgroundColor: getDocumentStatusStyle(status) }}
      >
        {displayText}
      </span>
    );
  };

  const handleRowClick = async (customer) => {
    const email = customer.inviteeEmail;
    if (!email) {
      setSelectedCustomer(customer);
      return;
    }

    if (customerDetailsCache[email]) {
      setSelectedCustomer({ ...customer, details: customerDetailsCache[email] });
      return;
    }

    const details = await fetchCustomerDetails(email);
    if (details) {
      const updatedCache = { ...customerDetailsCache, [email]: details };
      setCustomerDetailsCache(updatedCache);
      setSelectedCustomer({ ...customer, details });

      if (details.userType === 'COMMERCIAL' && !commercialRolesCache[details.id]) {
        const commercialDetails = await fetchCommercialUserDetails(details.id);
        if (commercialDetails) {
          setCommercialRolesCache(prev => ({
            ...prev,
            [details.id]: commercialDetails.commercialRole
          }));
        }
      }
    } else {
      setSelectedCustomer(customer);
    }
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const renderRows = () => {
    if (loadingTable) {
      return (
        <tr>
          <td colSpan="8" className="py-4 text-center">
            Loading...
          </td>
        </tr>
      );
    }

    if (tableData.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="py-4 text-center">
            No records found
          </td>
        </tr>
      );
    }

    return tableData.map((item, index) => {
      const sn = index + 1 + (currentPage - 1) * 10;
      const nameToShow = item.name || 'N/A';
      const email = item.inviteeEmail || 'N/A';
      const cachedDetails = customerDetailsCache[email];
      
      const customerType = cachedDetails?.userType ? cachedDetails.userType.toUpperCase() : item.customerType?.toUpperCase() || 'N/A';
      const role = cachedDetails ? 
        (cachedDetails.userType === 'RESIDENTIAL' ? 'OWNER' : 
         commercialRolesCache[cachedDetails.id]?.toUpperCase() || cachedDetails.role?.toUpperCase() || 'N/A') : 
        (item.customerType === 'RESIDENTIAL' ? 'OWNER' : item.role?.toUpperCase() || 'N/A');
      
      const dateCreated = formatDate(item.createdAt);
      const status = item.status || 'N/A';

      return (
        <tr 
          key={item.id || index} 
          className="border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => handleRowClick(item)}
        >
          <td className="py-3 px-2 text-sm">{sn}</td>
          <td className="py-3 px-2 text-sm">{nameToShow}</td>
          <td className="py-3 px-2 text-sm">{email}</td>
          <td className="py-3 px-2 text-sm font-medium">{role}</td>
          <td className="py-3 px-2 text-sm font-medium">{customerType}</td>
          <td className="py-3 px-2 text-sm">{dateCreated}</td>
          <td className="py-3 px-2 text-sm">
            <span
              className="text-white px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: getStatusStyle(status) }}
            >
              {status}
            </span>
          </td>
          <td className="py-3 px-2 text-sm">{renderDocStatus(item.documentStatus)}</td>
        </tr>
      );
    });
  };

  if (selectedCustomer) {
    return <CustomerDetails customer={selectedCustomer} onBack={handleBackToList} />;
  }

  return (
    <div className={`rounded-md shadow-md p-6 w-full ${mainContainer}`}>
      <h2 className={`${pageTitle} text-left mb-6 text-2xl text-[#039994]`}>Customer Management</h2>
      
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <button
          onClick={openFilterModal}
          className="flex items-center border border-black text-black bg-transparent px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black text-sm"
        >
          <span className="mr-1">Filter By</span>
          {(filters.status || filters.customerType || filters.dateRange) && (
            <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs ml-1">
              {[filters.status, filters.customerType, filters.dateRange].filter(Boolean).join(', ')}
            </span>
          )}
        </button>

        <div className="mt-2 md:mt-0 flex items-center space-x-2">
          <button
            onClick={openSendReminderModal}
            className="flex items-center bg-[#1E1E1E] text-white px-3 py-1 rounded hover:opacity-90 text-sm"
          >
            <img
              src="/vectors/Timer.png"
              alt="vector"
              className="w-3 h-3 mr-1"
            />
            <span>Send Reminder</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setInviteDropdownOpen(!isInviteDropdownOpen)}
              className="flex items-center bg-[#039994] text-white px-3 py-1 rounded hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] text-sm"
            >
              <img
                src="/vectors/Share.png"
                alt="invite"
                className="w-3 h-3 mr-1"
              />
              <span>Invite New Customer</span>
            </button>

            {isInviteDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-40">
                <button
                  onClick={() => {
                    setInviteDropdownOpen(false);
                    openInviteIndividualModal();
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                >
                  Individual Customer
                </button>
                <button
                  onClick={() => {
                    setInviteDropdownOpen(false);
                    openInviteBulkModal();
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                >
                  Bulk Customer CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded mb-4 relative overflow-hidden">
        {!loadingStats && (
          <>
            <div 
              className="absolute h-full" 
              style={{ 
                width: `${calculatePercentage(statistics.totalExpired)}%`,
                backgroundColor: STATUS_COLORS.EXPIRED
              }}
            />
            <div 
              className="absolute h-full" 
              style={{ 
                width: `${calculatePercentage(statistics.totalInvited)}%`,
                left: `${calculatePercentage(statistics.totalExpired)}%`,
                backgroundColor: STATUS_COLORS.INVITED
              }}
            />
            <div 
              className="absolute h-full" 
              style={{ 
                width: `${calculatePercentage(statistics.totalPending)}%`,
                left: `${calculatePercentage(statistics.totalExpired + statistics.totalInvited)}%`,
                backgroundColor: STATUS_COLORS.PENDING
              }}
            />
            <div 
              className="absolute h-full" 
              style={{ 
                width: `${calculatePercentage(statistics.totalAccepted)}%`,
                left: `${calculatePercentage(statistics.totalExpired + statistics.totalInvited + statistics.totalPending)}%`,
                backgroundColor: STATUS_COLORS.REGISTERED
              }}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS.EXPIRED }}
          />
          <span className="text-xs">Expired ({statistics.totalExpired})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS.INVITED }}
          />
          <span className="text-xs">Invited ({statistics.totalInvited})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS.PENDING }}
          />
          <span className="text-xs">Pending ({statistics.totalPending})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS.REGISTERED }}
          />
          <span className="text-xs">Registered ({statistics.totalAccepted})</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto mb-4">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-1 text-left">S/N</th>
              <th className="py-2 px-1 text-left">Name</th>
              <th className="py-2 px-1 text-left">Email</th>
              <th className="py-2 px-1 text-left">Role</th>
              <th className="py-2 px-1 text-left">Customer Type</th>
              <th className="py-2 px-1 text-left">Created At</th>
              <th className="py-2 px-1 text-left">Status</th>
              <th className="py-2 px-1 text-left">Document Status</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {tableData.length > 0 ? (
            <span>Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, tableData.length + (currentPage - 1) * 10)} of {tableData.length}</span>
          ) : (
            <span>No records found</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="flex items-center text-[#00B4AE] disabled:opacity-50"
          >
            <HiOutlineChevronLeft />
            <span>Previous</span>
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex items-center text-[#00B4AE] disabled:opacity-50"
          >
            <span>Next</span>
            <HiOutlineChevronRight />
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <FilterModal 
          isOpen={isFilterOpen} 
          onClose={closeFilterModal} 
          onApply={handleFilterApply}
          initialFilters={filters}
        />
      )}
      {isSendReminderOpen && (
        <SendReminderModal isOpen={isSendReminderOpen} onClose={closeSendReminderModal} />
      )}
      {isInviteIndividualOpen && (
        <InviteIndividualModal
          isOpen={isInviteIndividualOpen}
          onClose={closeInviteIndividualModal}
        />
      )}
      {isInviteBulkOpen && (
        <InviteBulkModal isOpen={isInviteBulkOpen} onClose={closeInviteBulkModal} />
      )}
    </div>
  );
}