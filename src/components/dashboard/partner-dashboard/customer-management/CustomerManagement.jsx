import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Icons (replace with your own if needed)
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

// Modals (placeholders; create/modify these as needed in ./)
import FilterModal from './FilterModal';
import SendReminderModal from './SendReminderModal';
import InviteIndividualModal from './InviteIndividualModal';
import InviteBulkModal from './InviteBulkModal';

// Styles from your styles.js
import {
  mainContainer,
  headingContainer,
  pageTitle,
  // you can import other style classes as needed
} from './styles';

export default function PartnerCustomerReport() {
  // Table data from API
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Track whether each modal is open
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSendReminderOpen, setSendReminderOpen] = useState(false);
  const [isInviteDropdownOpen, setInviteDropdownOpen] = useState(false);
  const [isInviteIndividualOpen, setInviteIndividualOpen] = useState(false);
  const [isInviteBulkOpen, setInviteBulkOpen] = useState(false);

  // On mount, fetch the partner customer report
  useEffect(() => {
    fetchTableData(1);
    // eslint-disable-next-line
  }, []);

  const fetchTableData = async (pageNumber = 1) => {
    try {
      // Example of retrieving userId/authToken from localStorage:
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      const response = await axios.get(
        `https://dcarbon-server.onrender.com/api/user/get-users-referrals/${userId}`,
        {
          params: {
            status: 'ACCEPTED', // Example param
            page: pageNumber,
            limit: 10,
            // add other params if needed: customerType, startDate, endDate, etc.
          },
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
      // You can handle error states here
    }
  };

  // Open/close modals
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

  // Handle Cus.Status tag color
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'terminated':
        return '#FF0000'; // red
      case 'invited':
        return '#FFB200'; // orange
      case 'active':
        return '#00B4AE'; // teal
      case 'registered':
      case 'accepted': // if your API returns "ACCEPTED", you might map it to 'registered'
        return '#000000'; // black
      default:
        return '#000000'; // fallback to black
    }
  };

  // Handle Doc. Status: show red triangle or green circle
  // For demonstration, let's assume: if 'accepted' => green circle, else => red triangle
  const renderDocStatus = (status) => {
    // If you have actual doc verification data, use that. This is just an example:
    if (status?.toLowerCase() === 'accepted' || status?.toLowerCase() === 'active') {
      // Green circle with #039994
      return (
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: '#039994' }}
        />
      );
    }
    // Red triangle with #FF0000
    return (
      <svg
        className="inline-block w-3 h-3"
        viewBox="0 0 100 100"
        fill="#FF0000"
      >
        <polygon points="50,15 90,85 10,85" />
      </svg>
    );
  };

  // Construct table rows from API data
  // The user wants columns: S/N, Name, Cus.Type, Utility, Finance Company, Address, Date Reg., Cus. Status, Doc. Status
  // The example API response data has: name, customerType, createdAt, status
  const renderRows = () => {
    return tableData.map((item, index) => {
      // S/N = index + 1
      const sn = index + 1 + (currentPage - 1) * 10;
      const nameToShow = item.name || item.inviteeEmail || 'Name';
      const customerType = item.customerType || 'Residential';
      const dateReg = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : '16-03-2025';

      // For illustration, we’re using placeholders for Utility, Finance Company, Address
      return (
        <tr key={item.id || index} className="border-b hover:bg-gray-50">
          <td className="py-3 px-2">{sn}</td>
          <td className="py-3 px-2">{nameToShow}</td>
          <td className="py-3 px-2">{customerType}</td>
          <td className="py-3 px-2">Utility</td>
          <td className="py-3 px-2">Finance Comp.</td>
          <td className="py-3 px-2">Address</td>
          <td className="py-3 px-2">{dateReg}</td>
          {/* Cus. Status tag with round corners */}
          <td className="py-3 px-2">
            <span
              className="text-white px-2 py-1 rounded-full text-sm"
              style={{ backgroundColor: getStatusStyle(item.status) }}
            >
              {item.status?.toLowerCase() === 'accepted'
                ? 'Registered'
                : item.status || 'Registered'}
            </span>
          </td>
          {/* Doc. Status */}
          <td className="py-3 px-2">{renderDocStatus(item.status)}</td>
        </tr>
      );
    });
  };

  return (
    <div className={`rounded-md shadow-md p-6 w-full ${mainContainer}`}>
      {/* Header row with Filter By (left), Send Reminder (right, #1E1E1E), and Invite New Customer (#039994) */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        {/* Left side: Filter By button */}
        <button
          onClick={openFilterModal}
          className="flex items-center border border-black text-black bg-transparent px-4 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <span className="mr-2">Filter By</span>
          {/* If you have an icon, place it here or omit */}
        </button>

        {/* Right side: two buttons (Send Reminder & Invite New Customer) */}
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          {/* Send Reminder */}
          <button
            onClick={openSendReminderModal}
            className="flex items-center bg-[#1E1E1E] text-white px-4 py-2 rounded hover:opacity-90"
          >
            {/* vector.png icon (replace src with your correct file path) */}
            <img
              src="/vectors/Timer.png"
              alt="vector"
              className="w-4 h-4 mr-2"
            />
            <span>Send Reminder</span>
          </button>

          {/* Invite New Customer with a dropdown */}
          <div className="relative">
            <button
              onClick={() => setInviteDropdownOpen(!isInviteDropdownOpen)}
              className="flex items-center bg-[#039994] text-white px-4 py-2 rounded hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <img
                src="/vectors/Share.png"
                alt="invite"
                className="w-4 h-4 mr-2"
              />
              <span>Invite New Customer</span>
            </button>

            {/* Dropdown options */}
            {isInviteDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    setInviteDropdownOpen(false);
                    openInviteIndividualModal();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Individual Customer
                </button>
                <button
                  onClick={() => {
                    setInviteDropdownOpen(false);
                    openInviteBulkModal();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Bulk Customer CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Long progress bar and labeled indicators at bottom-right */}
      <div className="w-full h-2 bg-gray-200 rounded mb-6 relative">
        {/* It's just a “bar” for demonstration. You can style differently if you want a gradient or sections. */}
        {/* You can omit any fill if you only want a gray bar. */}
      </div>
      {/* Legend aligned bottom-right */}
      <div className="flex items-center justify-end space-x-6 mb-4">
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#FF0000' }}
          />
          <span className="text-sm">Terminated</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#FFB200' }}
          />
          <span className="text-sm">Invited</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#00B4AE' }}
          />
          <span className="text-sm">Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: '#000000' }}
          />
          <span className="text-sm">Registered</span>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto mb-6">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-2 text-left">S/N</th>
              <th className="py-3 px-2 text-left">Name</th>
              <th className="py-3 px-2 text-left">Cus. Type</th>
              <th className="py-3 px-2 text-left">Utility</th>
              <th className="py-3 px-2 text-left">Finance Company</th>
              <th className="py-3 px-2 text-left">Address</th>
              <th className="py-3 px-2 text-left">Date Reg.</th>
              <th className="py-3 px-2 text-left">Cus. Status</th>
              <th className="py-3 px-2 text-left">Doc. Status</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {/* Pagination at the center */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="text-[#00B4AE] disabled:opacity-50"
        >
          &lt; Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="text-[#00B4AE] disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>

      {/* Modals */}
      {isFilterOpen && <FilterModal isOpen={isFilterOpen} onClose={closeFilterModal} />}
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
