import React, { useState } from 'react';
import {
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { MdNotificationsActive } from 'react-icons/md';

const sampleCustomers = [
  {
    sn: 1,
    name: 'John Doe',
    customerType: 'Residential',
    utility: 'Utility Co.',
    amount: '$750.00',
    address: 'Finance Comp.',
    date: '16-03-2025',
    customerStatus: 'Registered', // "Invited", "Registered", "Active", "Terminated"
    docStatus: 'Warning', // "Warning" or "Ok"
  },
  {
    sn: 2,
    name: 'Jane Smith',
    customerType: 'Commercial',
    utility: 'Utility Co.',
    amount: '$750.00',
    address: 'Finance Comp.',
    date: '16-03-2025',
    customerStatus: 'Active',
    docStatus: 'Ok',
  },
  {
    sn: 3,
    name: 'Alice Johnson',
    customerType: 'Resi. Group',
    utility: 'Utility Co.',
    amount: '$750.00',
    address: 'Finance Comp.',
    date: '16-03-2025',
    customerStatus: 'Active',
    docStatus: 'Ok',
  },
  {
    sn: 4,
    name: 'Bob Williams',
    customerType: 'Residential',
    utility: 'Utility Co.',
    amount: '$750.00',
    address: 'Finance Comp.',
    date: '16-03-2025',
    customerStatus: 'Terminated',
    docStatus: 'Warning',
  },
  {
    sn: 5,
    name: 'Carol Taylor',
    customerType: 'Residential',
    utility: 'Utility Co.',
    amount: '$750.00',
    address: 'Finance Comp.',
    date: '16-03-2025',
    customerStatus: 'Invited',
    docStatus: 'Warning',
  },
  // ... add more customers as needed
];

const CustomerManagement = ({ onSelectCustomer }) => {
  // Demo pagination values
  const currentPage = 1;
  const totalPages = 4;

  const handleRowClick = (customer) => {
    if (typeof onSelectCustomer === 'function') {
      onSelectCustomer(customer);
    }
  };

  // Render customer status with specified colors:
  // Invited: #FFB200, Registered: #000000, Active: #00B4AE, Terminated: #FF0000
  const renderCustomerStatus = (status) => {
    let bgColor = '';
    switch (status) {
      case 'Invited':
        bgColor = '#FFB200';
        break;
      case 'Registered':
        bgColor = '#000000';
        break;
      case 'Active':
        bgColor = '#00B4AE';
        break;
      case 'Terminated':
        bgColor = '#FF0000';
        break;
      default:
        bgColor = '#000000';
    }
    return (
      <span
        className="px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: bgColor, color: '#fff' }}
      >
        {status}
      </span>
    );
  };

  // Render document status (warning icon if needed)
  const renderDocStatus = (status) => {
    if (status === 'Warning') {
      return (
        <div className="flex items-center space-x-1">
          <HiOutlineExclamationCircle className="text-[#FFB200] w-5 h-5" />
          <span className="text-[#FFB200] text-sm">Check Docs</span>
        </div>
      );
    }
    return <div className="text-gray-600 text-sm">Ok</div>;
  };

  // Dropdown state for Invite New Customer
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const handleInviteOption = (option) => {
    console.log('Invite option selected:', option);
    setDropdownOpen(false);
    // Add further logic here for each invite option (e.g., routing or modal opening)
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Header with Filter, Send Reminder, and Invite New Customer */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#039994]">Customer Management</h2>
        <div className="flex items-center space-x-2 mt-3 md:mt-0">
          {/* Filter Button */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-md"
          >
            <HiOutlineFilter className="mr-2" />
            Filter by
            <HiOutlineChevronDown className="ml-2" />
          </button>
          {/* Send Reminder Button */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white"
          >
            <MdNotificationsActive className="mr-2" />
            Send Reminder
          </button>
          {/* Invite New Customer Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleDropdown}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#039994] text-white"
            >
              Invite New Customer
              <HiOutlineChevronDown className="ml-2" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  onClick={() => handleInviteOption('Individual')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Individual Customer
                </button>
                <button
                  onClick={() => handleInviteOption('Bulk')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Bulk Customers (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="border-b border-gray-200 text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3">S/N</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Cus. Type</th>
              <th className="px-4 py-3">Utility</th>
              <th className="px-4 py-3">$750.00</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Date Reg.</th>
              <th className="px-4 py-3">Cus. Status</th>
              <th className="px-4 py-3">Doc. Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sampleCustomers.map((customer) => (
              <tr
                key={customer.sn}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(customer)}
              >
                <td className="px-4 py-3">{customer.sn}</td>
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.customerType}</td>
                <td className="px-4 py-3">{customer.utility}</td>
                <td className="px-4 py-3">{customer.amount}</td>
                <td className="px-4 py-3">{customer.address}</td>
                <td className="px-4 py-3">{customer.date}</td>
                <td className="px-4 py-3">{renderCustomerStatus(customer.customerStatus)}</td>
                <td className="px-4 py-3">{renderDocStatus(customer.docStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <HiOutlineChevronLeft className="mr-1" />
            Previous
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
            <HiOutlineChevronRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
