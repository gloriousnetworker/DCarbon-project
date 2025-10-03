import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import * as styles from "./styles";

export default function CommercialBonus({ onClose }) {
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState("");
  const [years, setYears] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    setYears(yearOptions);
    setYear(currentYear);
  }, []);

  const generateDummyData = () => {
    const dummyData = [];
    const statuses = ['pending', 'paid', 'not_requested'];
    const quarters = ['1', '2', '3', '4'];
    
    quarters.forEach(q => {
      statuses.forEach((status, index) => {
        dummyData.push({
          id: `commercial-bonus-${q}-${index}`,
          quarter: q,
          year: year,
          amount: (1500 + (Math.random() * 3500)).toFixed(2),
          paymentStatus: status,
          mwGenerated: (50 + (Math.random() * 200)).toFixed(1)
        });
      });
    });
    
    return dummyData;
  };

  const handleSearch = async () => {
    if (!quarter || !year) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredData = generateDummyData().filter(bonus => 
        bonus.quarter === quarter && bonus.year.toString() === year.toString()
      );
      
      setBonusData(filteredData);
    } catch (error) {
      console.error("Error fetching bonus data:", error);
      setBonusData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (bonusId) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBonusData(prevData => 
        prevData.map(bonus => 
          bonus.id === bonusId 
            ? { ...bonus, paymentStatus: 'requested' }
            : bonus
        )
      );
    } catch (error) {
      console.error("Error requesting payout:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-[#039994]';
      case 'pending':
        return 'text-[#FFB200]';
      case 'requested':
        return 'text-[#0366d6]';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'requested':
        return 'Requested';
      default:
        return 'Not Requested';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-5xl rounded-md shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        <h2 className={`${styles.pageTitle} text-left mb-6`}>Commercial MW Bonus</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className={styles.labelClass}>Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className={`${styles.selectClass} bg-[#F0F0F0] w-full`}
            >
              <option value="">Select Quarter</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
          
          <div>
            <label className={styles.labelClass}>Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={`${styles.selectClass} bg-[#F0F0F0] w-full`}
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={handleSearch}
            disabled={!quarter || !year || loading}
            className={`${styles.buttonPrimary} ${(!quarter || !year || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Searching...
              </div>
            ) : (
              'Search Commercial Bonus'
            )}
          </button>
        </div>

        {bonusData.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-[#1E1E1E] bg-gray-100">
                  <th className="py-3 px-4 font-sfpro font-semibold border-b border-gray-200">Bonus Period</th>
                  <th className="py-3 px-4 font-sfpro font-semibold border-b border-gray-200">MW Generated</th>
                  <th className="py-3 px-4 font-sfpro font-semibold border-b border-gray-200">Bonus Amount</th>
                  <th className="py-3 px-4 font-sfpro font-semibold border-b border-gray-200">Payment Status</th>
                  <th className="py-3 px-4 font-sfpro font-semibold border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {bonusData.map((bonus, index) => (
                  <tr key={bonus.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                    <td className="py-3 px-4 font-sfpro border-b border-gray-200">
                      Q{bonus.quarter} {bonus.year}
                    </td>
                    <td className="py-3 px-4 font-sfpro border-b border-gray-200">
                      {bonus.mwGenerated} MW
                    </td>
                    <td className="py-3 px-4 font-sfpro border-b border-gray-200">
                      {formatCurrency(parseFloat(bonus.amount))}
                    </td>
                    <td className="py-3 px-4 font-sfpro border-b border-gray-200">
                      <span className={`font-semibold ${getStatusColor(bonus.paymentStatus)}`}>
                        {getStatusText(bonus.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sfpro border-b border-gray-200">
                      {bonus.paymentStatus === 'requested' ? (
                        <span className="text-gray-500 font-medium">Requested</span>
                      ) : bonus.paymentStatus === 'paid' ? (
                        <span className="text-[#039994] font-medium">Paid</span>
                      ) : (
                        <button
                          onClick={() => handleRequestPayout(bonus.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-[#039994] text-white rounded text-sm hover:bg-[#02857f] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bonusData.length === 0 && !loading && quarter && year && (
          <div className="text-center py-8">
            <p className="font-sfpro text-gray-500">No commercial bonus data found for Q{quarter} {year}</p>
          </div>
        )}

        {!quarter || !year ? (
          <div className="text-center py-8">
            <p className="font-sfpro text-gray-500">Please select a quarter and year to search for commercial bonuses</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}