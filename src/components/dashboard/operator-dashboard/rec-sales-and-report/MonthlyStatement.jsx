import React, { useState, useEffect } from 'react';
import { HiOutlineDownload, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import MonthlyStatementExportReport from './MonthlyStatementExportReport';

const MonthlyStatement = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [periodType, setPeriodType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  });

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userId = localStorage.getItem('userId') || '5d37cbae-d7c0-4731-95e6-94000ddf9b4e';
      const authToken = localStorage.getItem('authToken') || '';
      return { userId, authToken };
    } catch (error) {
      return { userId: '5d37cbae-d7c0-4731-95e6-94000ddf9b4e', authToken: '' };
    }
  };

  // Fetch Monthly Statement Data
  const fetchMonthlyStatement = async () => {
    setLoading(true);
    try {
      const { userId, authToken } = getUserData();
      let url = `https://services.dcarbon.solutions/api/rec/user-rec-report/${userId}`;
      
      // Add period filters if not "All"
      if (periodType === 'monthly' && selectedPeriod.month !== 'All') {
        url += `?month=${selectedPeriod.month}`;
      }
      if (selectedPeriod.year !== 'All') {
        url += `${periodType === 'monthly' && selectedPeriod.month !== 'All' ? '&' : '?'}year=${selectedPeriod.year}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMonthlyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly statement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Data for REC Payout
  const fetchSalesData = async () => {
    try {
      const { userId, authToken } = getUserData();
      const response = await fetch(`https://services.dcarbon.solutions/api/rec/sale-statement/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchMonthlyStatement();
    fetchSalesData();
  }, [periodType, selectedPeriod]);

  const calculateTotalPayout = () => {
    if (!salesData?.sales) return 0;
    return salesData.sales
      .filter(sale => sale.status === 'COMPLETED')
      .reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const handlePeriodTypeChange = (type) => {
    setPeriodType(type);
    // Reset period selection when type changes
    setSelectedPeriod({
      month: type === 'monthly' ? new Date().toLocaleString('default', { month: 'long' }) : 'All',
      year: new Date().getFullYear().toString()
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-[#039994] font-[600] text-[24px] leading-[100%] tracking-[-0.05em] font-sfpro">
          Monthly Statement
        </h1>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={periodType}
              onChange={(e) => handlePeriodTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {periodType === 'monthly' ? (
              <select
                value={selectedPeriod.month}
                onChange={(e) => setSelectedPeriod({...selectedPeriod, month: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              >
                <option value="All">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            ) : (
              <select
                value={selectedPeriod.year}
                onChange={(e) => setSelectedPeriod({...selectedPeriod, year: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              >
                <option value="All">All Years</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            )}
          </div>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#039994] text-white hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
          >
            <HiOutlineDownload className="mr-2 h-4 w-4" />
            Export Report
          </button>

          {/* <button className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 font-sfpro">
            Submit Invoice
          </button> */}
        </div>
      </div>

      {monthlyData && (
        <div className="space-y-6">
          {/* User Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - User Info */}
            <div className="border border-[#039994] rounded-lg p-4" style={{ backgroundColor: '#069B960D' }}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Name</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{monthlyData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Address</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E] text-right max-w-[200px]">{monthlyData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Email Address</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{monthlyData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Phone number</span>
                  <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">{monthlyData.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Right Card - Billing Info */}
            <div className="rounded-lg p-4" style={{ backgroundColor: '#EFEFEF80' }}>
              <h3 className="font-sfpro text-[16px] font-[600] text-[#039994] mb-3">Billing to</h3>
              <div className="space-y-2">
                <div className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{monthlyData.name}</div>
                <div className="font-sfpro text-[12px] font-[400] text-[#1E1E1E]">{monthlyData.address}</div>
                <div className="font-sfpro text-[12px] font-[400] text-[#1E1E1E]">{monthlyData.email}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300" />

          {/* REC Details */}
          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs generated</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{monthlyData.totalRecsGenerated.toFixed(1)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs sold</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{monthlyData.totalRecsSold.toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Total RECs balance</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{monthlyData.totalRecsBalance.toFixed(1)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Average REC price</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${monthlyData.averageRecPrice}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-sfpro text-[14px] font-[400] text-[#1E1E1E]">Revenue Tier</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">60%</span>
            </div>
          </div>

          {/* Total REC Payout */}
          <div className="bg-[#039994] rounded-lg p-4 flex justify-between items-center">
            <span className="font-sfpro text-[16px] font-[600] text-white">Total REC Payout</span>
            <span className="font-sfpro text-[20px] font-[700] text-white">${calculateTotalPayout().toFixed(2)}</span>
          </div>

          {/* Facilities Table */}
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
                  {monthlyData.facilities?.map((facility, idx) => (
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

      {/* Export Modal */}
      {showExportModal && (
        <MonthlyStatementExportReport 
          onClose={() => setShowExportModal(false)}
          data={{ monthlyData, salesData }}
          periodType={periodType}
          selectedPeriod={selectedPeriod}
        />
      )}
    </div>
  );
};

export default MonthlyStatement;