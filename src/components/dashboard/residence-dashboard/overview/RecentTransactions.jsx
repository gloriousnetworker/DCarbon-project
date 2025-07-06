import React, { useState, useEffect } from "react";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      residenceId: "Residence ID",
      transactionType: "Points Earned",
      quantity: 1,
      date: "16-03-2025"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMeters, setHasMeters] = useState(false);

  const checkMeters = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      setHasMeters(result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0));
    } catch (error) {
      console.error('Error fetching meters:', error);
    }
  };

  useEffect(() => {
    checkMeters();
  }, []);

  useEffect(() => {
    if (!hasMeters) return;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [hasMeters]);

  return (
    <div className={`w-full bg-white rounded-lg shadow p-6 ${!hasMeters ? 'opacity-50' : ''}`}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "#039994" }}>
        Recent Transactions
      </h3>
      {!hasMeters ? (
        <div className="flex justify-center items-center h-16">
          <p className="text-gray-500">Complete utility authorization</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-16">
          <p className="animate-pulse text-gray-500">Loading transactions...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-semibold text-sm text-[#1E1E1E]">S/N</th>
                <th className="py-2 text-left font-semibold text-sm text-[#1E1E1E]">Residence ID</th>
                <th className="py-2 text-left font-semibold text-sm text-[#1E1E1E]">Trans. type</th>
                <th className="py-2 text-left font-semibold text-sm text-[#1E1E1E]">Quantity</th>
                <th className="py-2 text-left font-semibold text-sm text-[#1E1E1E]">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 text-sm text-gray-700">{transaction.id}</td>
                  <td className="py-4 text-sm text-gray-700">{transaction.residenceId}</td>
                  <td className="py-4 text-sm text-gray-700">{transaction.transactionType}</td>
                  <td className="py-4 text-sm text-gray-700">{transaction.quantity}</td>
                  <td className="py-4 text-sm text-gray-700">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}