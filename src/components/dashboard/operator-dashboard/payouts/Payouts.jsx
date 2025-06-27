import React, { useState } from 'react';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import PaymentModal from './PaymentModal'; // Import the modal component

const PayoutCard = () => {
  // Control modal visibility
  const [showModal, setShowModal] = useState(false);

  // Example table data (replace with your own or fetch dynamically)
  const tableData = [
    {
      sn: 1,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved', // Approved | Pending | Reject
    },
    {
      sn: 2,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Pending',
    },
    {
      sn: 3,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Reject',
    },
    {
      sn: 4,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved',
    },
    {
      sn: 5,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved',
    },
    {
      sn: 6,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Pending',
    },
    {
      sn: 7,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved',
    },
    {
      sn: 8,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved',
    },
    {
      sn: 9,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Reject',
    },
    {
      sn: 10,
      transactionId: 'Payment ID',
      amount: '$10.00',
      date: '16-03-2025',
      invoiceDoc: 'Invoice doc.',
      status: 'Approved',
    },
  ];

  // Example pagination states
  const currentPage = 1;
  const totalPages = 4;

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Payout Transaction</h2>
        <div className="mt-2 sm:mt-0">
          {/* Request Payout Button */}
          <button
            type="button"
            onClick={() => setShowModal(true)} // Open modal on click
            className="inline-flex items-center px-4 py-2 bg-[#039994] text-white font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
          >
            {/* Badge / Count */}
            <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs text-white bg-white/20 rounded-full">
              2
            </span>
            Request Payout
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">S/N</th>
              <th scope="col" className="px-4 py-3">Transaction ID</th>
              <th scope="col" className="px-4 py-3">Amount</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Invoice Doc.</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.map((item) => (
              <tr key={item.sn} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{item.sn}</td>
                <td className="px-4 py-3 text-gray-700">{item.transactionId}</td>
                <td className="px-4 py-3 text-gray-700">{item.amount}</td>
                <td className="px-4 py-3 text-gray-700">{item.date}</td>

                {/* Invoice Doc. with small icon */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <HiOutlineDocumentText className="mr-1 text-lg text-[#039994]" />
                    {item.invoiceDoc}
                  </button>
                </td>

                {/* Status with color-coded text */}
                <td className="px-4 py-3">
                  {item.status === 'Approved' && (
                    <span className="inline-block px-3 py-1 text-sm font-medium text-[#039994] bg-[#039994]/10 rounded-full">
                      Approved
                    </span>
                  )}
                  {item.status === 'Pending' && (
                    <span className="inline-block px-3 py-1 text-sm font-medium text-[#FFB200] bg-[#FFB200]/10 rounded-full">
                      Pending
                    </span>
                  )}
                  {item.status === 'Reject' && (
                    <span className="inline-block px-3 py-1 text-sm font-medium text-[#FF0000] bg-[#FF0000]/10 rounded-full">
                      Reject
                    </span>
                  )}
                </td>
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

      {/* Payment Modal (rendered conditionally) */}
      {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default PayoutCard;
