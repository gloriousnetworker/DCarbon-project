import React, { useState, useEffect } from 'react';
import { HiOutlineDownload, HiOutlineX } from 'react-icons/hi';
import SubmitInvoice from './SubmitInvoice';
import AdminInvoices from './paidReceipts';

const QuarterlyStatement = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSubmitInvoice, setShowSubmitInvoice] = useState(false);
  const [showAdminInvoices, setShowAdminInvoices] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const staticData = {
    customerName: 'John Smith',
    address: '123 Solar Street, Austin, TX 78701',
    email: 'john.smith@example.com',
    phoneNumber: '(512) 555-0123',
    name: 'Solar Energy Corp',
    facilities: [
      {
        facilityName: 'Austin Solar Farm',
        address: '123 Solar Street, Austin, TX 78701',
        status: 'VERIFIED',
        currentRecBalance: 45.5
      },
      {
        facilityName: 'Texas Wind Facility',
        address: '456 Wind Avenue, Houston, TX 77001',
        status: 'ACTIVE',
        currentRecBalance: 20.0
      }
    ]
  };

  const fetchQuarterlyStatement = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        alert('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/quarterly-statements?quarter=${selectedQuarter}&year=${selectedYear}&userId=${userId}&userType=${userType || 'COMMERCIAL'}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setData(result.data);
      } else {
        alert(result.message || 'Failed to fetch quarterly statement');
      }
    } catch (error) {
      console.error('Error fetching quarterly statement:', error);
      alert('An error occurred while fetching the quarterly statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarterlyStatement();
  }, [selectedQuarter, selectedYear]);

  const exportData = (format) => {
    const dataToExport = {
      period: `Q${selectedQuarter} ${selectedYear}`,
      customerInfo: {
        name: staticData.customerName,
        address: staticData.address,
        email: staticData.email,
        phone: staticData.phoneNumber
      },
      billingInfo: {
        name: staticData.name,
        address: staticData.address,
        email: staticData.email
      },
      recSummary: {
        totalRecsGenerated: data?.totalRecsGenerated || 0,
        totalRecsSold: data?.totalRecsSold || 0,
        totalRecsBalance: data?.totalRecsBalance || 0,
        averageRecPrice: data?.averageRecPrice || 0,
        revenueTier: '60%',
        totalPayout: data?.totalRecPayout || 0
      },
      facilities: staticData.facilities
    };

    if (format === 'csv') {
      const csvContent = convertToCSV(dataToExport);
      downloadFile(csvContent, 'quarterly-statement.csv', 'text/csv');
    } else {
      console.log('PDF Export Data:', dataToExport);
      alert('PDF export functionality would be implemented here with a library like jsPDF');
    }
    
    setShowExportModal(false);
  };

  const convertToCSV = (data) => {
    let csv = 'Quarterly Statement Report\n\n';
    csv += `Period: ${data.period}\n\n`;
    
    csv += 'Customer Information\n';
    csv += `Name,${data.customerInfo.name}\n`;
    csv += `Address,${data.customerInfo.address}\n`;
    csv += `Email,${data.customerInfo.email}\n`;
    csv += `Phone,${data.customerInfo.phone}\n\n`;
    
    csv += 'REC Summary\n';
    csv += `Total RECs Generated,${data.recSummary.totalRecsGenerated}\n`;
    csv += `Total RECs Sold,${data.recSummary.totalRecsSold}\n`;
    csv += `Total RECs Balance,${data.recSummary.totalRecsBalance}\n`;
    csv += `Average REC Price,${data.recSummary.averageRecPrice}\n`;
    csv += `Revenue Tier,${data.recSummary.revenueTier}\n`;
    csv += `Total Payout,${data.recSummary.totalPayout}\n\n`;
    
    csv += 'Facilities\n';
    csv += 'Facility Name,Address,Status,Current REC Balance\n';
    data.facilities.forEach(facility => {
      csv += `${facility.facilityName},${facility.address},${facility.status},${facility.currentRecBalance}\n`;
    });
    
    return csv;
  };

  const downloadFile = (content, fileName, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  if (showSubmitInvoice) {
    return <SubmitInvoice onBack={() => setShowSubmitInvoice(false)} />;
  }

  if (showAdminInvoices) {
    return <AdminInvoices onBack={() => setShowAdminInvoices(false)} />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-[#039994] font-[600] text-[24px] leading-[100%] tracking-[-0.05em] font-sfpro">
          Quarterly Statement
        </h1>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              disabled={loading}
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              disabled={loading}
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#039994] text-white hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            disabled={loading}
          >
            <HiOutlineDownload className="mr-2 h-4 w-4" />
            Export Report
          </button>

          <button 
            onClick={() => setShowSubmitInvoice(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 font-sfpro"
          >
            Submit Invoice
          </button>

          <button 
            onClick={() => setShowAdminInvoices(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-green-900 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro"
          >
            View Paid Receipts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-[#039994] font-sfpro">Loading quarterly statement...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-[#039994] rounded-lg p-4" style={{ backgroundColor: '#069B960D' }}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Name</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{staticData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Address</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E] text-right max-w-[200px]">{staticData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Email Address</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{staticData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Phone number</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{staticData.phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: '#EFEFEF80' }}>
              <h3 className="font-sfpro text-[16px] font-[600] text-[#039994] mb-3">Billing to</h3>
              <div className="space-y-2">
                <div className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{staticData.name}</div>
                <div className="font-sfpro text-[12px] font-[400] text-[#1E1E1E]">{staticData.address}</div>
                <div className="font-sfpro text-[12px] font-[400] text-[#1E1E1E]">{staticData.email}</div>
              </div>
            </div>
          </div>

          <hr className="border-gray-300" />

          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs generated</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{data?.totalRecsGenerated?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs sold</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{data?.totalRecsSold?.toFixed(0) || '0'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs balance</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{data?.totalRecsBalance?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Average REC price</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${data?.averageRecPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Revenue Tier</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">60%</span>
            </div>
          </div>

          <div className="bg-[#039994] rounded-lg p-4 flex justify-between items-center">
            <span className="font-sfpro text-[16px] font-[600] text-white">Total REC Payout</span>
            <span className="font-sfpro text-[20px] font-[700] text-white">${data?.totalRecPayout?.toFixed(2) || '0.00'}</span>
          </div>

          <div className="mt-6">
            <h3 className="font-sfpro text-[16px] font-[600] text-[#039994] mb-3">Facilities</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-sfpro">Facility Name</th>
                    <th className="px-4 py-3 font-sfpro">Address</th>
                    <th className="px-4 py-3 font-sfpro">Status</th>
                    <th className="px-4 py-3 font-sfpro">Current REC Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staticData.facilities.map((facility, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-sfpro">{facility.facilityName}</td>
                      <td className="px-4 py-3 font-sfpro">{facility.address}</td>
                      <td className="px-4 py-3 font-sfpro">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          facility.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          facility.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {facility.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sfpro">{facility.currentRecBalance.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <QuarterlyStatementExportReport 
          onClose={() => setShowExportModal(false)}
          onExport={exportData}
        />
      )}
    </div>
  );
};

const QuarterlyStatementExportReport = ({ onClose, onExport }) => {
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = () => {
    onExport(exportFormat);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 font-sfpro">Export Quarterly Statement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sfpro mb-1">Export Format</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                />
                <span className="ml-2 font-sfpro">PDF</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#039994] focus:ring-[#039994]"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                />
                <span className="ml-2 font-sfpro">CSV</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994] font-sfpro"
            >
              Export Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyStatement;