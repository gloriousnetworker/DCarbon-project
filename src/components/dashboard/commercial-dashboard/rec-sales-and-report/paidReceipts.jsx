import React, { useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';
import { 
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  labelClass,
  selectClass
} from './styles';

const AdminInvoices = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const invoices = [
    {
      id: 'INV-001',
      date: '2024-03-15',
      amount: '$2,250.00',
      status: 'Paid',
      description: 'Q1 2024 REC Payout'
    },
    {
      id: 'INV-002',
      date: '2023-12-20',
      amount: '$1,980.50',
      status: 'Paid',
      description: 'Q4 2023 REC Payout'
    },
    {
      id: 'INV-003',
      date: '2023-09-15',
      amount: '$1,750.25',
      status: 'Paid',
      description: 'Q3 2023 REC Payout'
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesYear = selectedYear === 'all' || invoice.date.startsWith(selectedYear);
    const matchesStatus = selectedStatus === 'all' || invoice.status.toLowerCase() === selectedStatus;
    return matchesYear && matchesStatus;
  });

  return (
    <div className={mainContainer}>
      <div className="w-full max-w-6xl">
        <div className={headingContainer}>
          <button onClick={onBack} className={backArrow}>
            <HiOutlineArrowLeft className="h-6 w-6" />
          </button>
          <h1 className={pageTitle}>Paid Receipts</h1>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="w-1/2">
            <label className={labelClass}>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className={labelClass}>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <HiOutlineEye className="h-5 w-5" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <HiOutlineDownload className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;