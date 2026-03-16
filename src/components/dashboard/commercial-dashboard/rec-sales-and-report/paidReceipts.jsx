import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { axiosInstance } from "../../../../../lib/config";
import ResponsiveTable from '../../shared/ResponsiveTable';

const mainContainer = 'min-h-screen w-full py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-6';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      {message}
    </div>
  );
};

const AdminInvoices = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchPayoutHistory();
  }, []);

  const fetchPayoutHistory = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        showToast('Authentication required. Please log in.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/api/payout-request?userId=${userId}&userType=COMMERCIAL`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (response.status === 200 && result.status === 'success') {
        setInvoices(result.data || []);
      } else {
        showToast(result.message || 'Failed to fetch payout history', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('An error occurred while fetching payout history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueYears = () => {
    const years = invoices.map(invoice => {
      const year = new Date(invoice.createdAt).getFullYear();
      return year;
    });
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const invoiceYear = new Date(invoice.createdAt).getFullYear().toString();
    const matchesYear = selectedYear === 'all' || invoiceYear === selectedYear;
    const matchesStatus = selectedStatus === 'all' || invoice.status?.toUpperCase() === selectedStatus.toUpperCase();
    return matchesYear && matchesStatus;
  });

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {isLoading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      <div className={mainContainer}>
        <div className="w-full max-w-7xl mx-auto">
          <div className={headingContainer}>
            {onBack && (
              <button onClick={onBack} className={backArrow}>
                <ArrowLeft size={24} />
              </button>
            )}
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
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ResponsiveTable
              loading={isLoading}
              data={filteredInvoices}
              emptyTitle="No invoices found"
              columns={[
                { key: 'id', label: 'Payout ID', render: (v) => v ? `${v.substring(0, 8)}...` : 'N/A' },
                { key: 'invoice', label: 'Invoice Number', render: (v) => v || 'N/A' },
                { key: 'amountRequested', label: 'Amount', render: (v) => `$${v?.toFixed(2) || '0.00'}` },
                {
                  key: 'status', label: 'Status',
                  render: (v) => (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(v)}`}>
                      {v || 'N/A'}
                    </span>
                  ),
                },
                { key: 'userType', label: 'User Type', render: (v) => v || 'N/A' },
                { key: 'adminNote', label: 'Admin Note', render: (v) => v || 'N/A' },
                { key: 'createdAt', label: 'Created Date', render: (v) => formatDate(v) },
                { key: 'approvedAt', label: 'Approved At', render: (v) => formatDateTime(v) },
              ]}
            />
          </div>

          {filteredInvoices.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AdminInvoices;