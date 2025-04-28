import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Icons
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

// Modals
import FilterModal from './FilterModal';
import SendReminderModal from './SendReminderModal';
import InviteIndividualModal from './InviteIndividualModal';
import InviteBulkModal from './InviteBulkModal';
import CustomerDetails from './CustomerDetails';

// Styles
import {
  mainContainer,
  headingContainer,
  pageTitle,
} from './styles';

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
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSendReminderOpen, setSendReminderOpen] = useState(false);
  const [isInviteDropdownOpen, setInviteDropdownOpen] = useState(false);
  const [isInviteIndividualOpen, setInviteIndividualOpen] = useState(false);
  const [isInviteBulkOpen, setInviteBulkOpen] = useState(false);

  useEffect(() => {
    fetchTableData(1);
    fetchStatistics();
  }, [statusFilter]);

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
      
      // Add status filter if selected
      if (statusFilter) {
        params.status = statusFilter;
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

  // Apply filters
  const handleFilterApply = (filters) => {
    setStatusFilter(filters.status || '');
    closeFilterModal();
  };

  // Calculate total count for progress bar
  const getTotalCount = () => {
    return (
      statistics.totalInvited +
      statistics.totalPending +
      statistics.totalAccepted +
      statistics.totalExpired
    );
  };

  // Calculate percentage for each status
  const calculatePercentage = (count) => {
    const total = getTotalCount();
    return total > 0 ? (count / total) * 100 : 0;
  };

  // Modal handlers
  const openFilterModal = () => setFilterOpen(true);
  const closeFilterModal = () => setFilterOpen(false);
  const openSendReminderModal = () => setSendReminderOpen(true);
  const closeSendReminderModal = () => setSendReminderOpen(false);
  const openInviteIndividualModal = () => setInviteIndividualOpen(true);
  const closeInviteIndividualModal = () => setInviteIndividualOpen(false);
  const openInviteBulkModal = () => setInviteBulkOpen(true);
  const closeInviteBulkModal = () => setInviteBulkOpen(false);

  // Pagination
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'EXPIRED':
      case 'TERMINATED':
        return '#FF0000';
      case 'INVITED':
        return '#FFB200';
      case 'ACTIVE':
      case 'PENDING':
        return '#00B4AE';
      case 'REGISTERED':
      case 'ACCEPTED':
        return '#000000';
      default:
        return '#000000';
    }
  };

  const getDocumentStatus = (status) => {
    // This is a placeholder logic - adjust based on actual business rules
    // Typically you would have a separate field for document status
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
        return { status: 'Verified', icon: 'check' };
      case 'PENDING':
        return { status: 'Pending', icon: 'warning' };
      default:
        return { status: 'Not Submitted', icon: 'none' };
    }
  };

  const renderDocStatus = (status) => {
    const docStatus = getDocumentStatus(status);
    
    if (docStatus.icon === 'check') {
      return (
        <div className="flex items-center">
          <span
            className="inline-block w-3 h-3 rounded-full mr-1"
            style={{ backgroundColor: '#039994' }}
          />
          <span className="text-xs">Verified</span>
        </div>
      );
    } else if (docStatus.icon === 'warning') {
      return (
        <div className="flex items-center">
          <svg
            className="inline-block w-3 h-3 mr-1"
            viewBox="0 0 100 100"
            fill="#FFB200"
          >
            <polygon points="50,15 90,85 10,85" />
          </svg>
          <span className="text-xs">Pending</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <svg
            className="inline-block w-3 h-3 mr-1"
            viewBox="0 0 100 100"
            fill="#FF0000"
          >
            <polygon points="50,15 90,85 10,85" />
          </svg>
          <span className="text-xs">Not Submitted</span>
        </div>
      );
    }
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const renderRows = () => {
    if (loadingTable) {
      return (
        <tr>
          <td colSpan="7" className="py-4 text-center">
            Loading...
          </td>
        </tr>
      );
    }

    if (tableData.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="py-4 text-center">
            No records found
          </td>
        </tr>
      );
    }

    return tableData.map((item, index) => {
      const sn = index + 1 + (currentPage - 1) * 10;
      const nameToShow = item.name || 'N/A';
      const email = item.inviteeEmail || 'N/A';
      const role = item.role || 'N/A';
      const customerType = item.customerType || 'N/A';
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
          <td className="py-3 px-2 text-sm">{role}</td>
          <td className="py-3 px-2 text-sm">{customerType}</td>
          <td className="py-3 px-2 text-sm">{dateCreated}</td>
          <td className="py-3 px-2 text-sm">
            <span
              className="text-white px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: getStatusStyle(status) }}
            >
              {status}
            </span>
          </td>
          <td className="py-3 px-2 text-sm">{renderDocStatus(status)}</td>
        </tr>
      );
    });
  };

  if (selectedCustomer) {
    return <CustomerDetails customer={selectedCustomer} onBack={handleBackToList} />;
  }

  return (
    <div className={`rounded-md shadow-md p-6 w-full ${mainContainer}`}>
      <h2 className={`${pageTitle} text-left mb-6 text-2xl`}>Customer Management</h2>
      
      {/* Header row */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <button
          onClick={openFilterModal}
          className="flex items-center border border-black text-black bg-transparent px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black text-sm"
        >
          <span className="mr-1">Filter By</span>
          {statusFilter && (
            <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs ml-1">
              Status: {statusFilter}
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

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded mb-4 relative overflow-hidden">
        {!loadingStats && (
          <>
            <div 
              className="absolute h-full bg-[#FF0000]" 
              style={{ width: `${calculatePercentage(statistics.totalExpired)}%` }}
            />
            <div 
              className="absolute h-full bg-[#FFB200]" 
              style={{ 
                width: `${calculatePercentage(statistics.totalInvited)}%`,
                left: `${calculatePercentage(statistics.totalExpired)}%`
              }}
            />
            <div 
              className="absolute h-full bg-[#00B4AE]" 
              style={{ 
                width: `${calculatePercentage(statistics.totalPending)}%`,
                left: `${calculatePercentage(statistics.totalExpired + statistics.totalInvited)}%`
              }}
            />
            <div 
              className="absolute h-full bg-[#000000]" 
              style={{ 
                width: `${calculatePercentage(statistics.totalAccepted)}%`,
                left: `${calculatePercentage(statistics.totalExpired + statistics.totalInvited + statistics.totalPending)}%`
              }}
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#FF0000' }}
          />
          <span className="text-xs">Terminated ({statistics.totalExpired})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#FFB200' }}
          />
          <span className="text-xs">Invited ({statistics.totalInvited})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#00B4AE' }}
          />
          <span className="text-xs">Active ({statistics.totalPending})</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#000000' }}
          />
          <span className="text-xs">Registered ({statistics.totalAccepted})</span>
        </div>
      </div>

      {/* Table */}
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

      {/* Pagination */}
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

      {/* Modals */}
      {isFilterOpen && (
        <FilterModal 
          isOpen={isFilterOpen} 
          onClose={closeFilterModal} 
          onApply={handleFilterApply}
          initialFilters={{ status: statusFilter }}
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