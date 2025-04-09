import React from "react";

const RecentTransactions = () => {
  return (
    <div className="w-full bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#039994] mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 text-gray-600">S/N</th>
              <th className="px-4 py-2 text-gray-600">Residence ID</th>
              <th className="px-4 py-2 text-gray-600">Trans. type</th>
              <th className="px-4 py-2 text-gray-600">Quantity</th>
              <th className="px-4 py-2 text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="border-t border-gray-200 px-4 py-2">1</td>
              <td className="border-t border-gray-200 px-4 py-2">Residence ID</td>
              <td className="border-t border-gray-200 px-4 py-2">Points Earned</td>
              <td className="border-t border-gray-200 px-4 py-2">1</td>
              <td className="border-t border-gray-200 px-4 py-2">16-03-2025</td>
            </tr>
            {/* Add more transaction rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
