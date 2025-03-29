import React from "react";

export default function RecentRecSales() {
  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-[#039994] text-lg font-semibold mb-4">
        Recent REC Sales
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-2 px-4 font-semibold">S/N</th>
              <th className="py-2 px-4 font-semibold">REC ID</th>
              <th className="py-2 px-4 font-semibold">Facility ID</th>
              <th className="py-2 px-4 font-semibold">Quantity</th>
              <th className="py-2 px-4 font-semibold">Price</th>
              <th className="py-2 px-4 font-semibold">Date</th>
              <th className="py-2 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Example rows */}
            <tr>
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">REC123</td>
              <td className="py-2 px-4">Facility-01</td>
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">$10.00</td>
              <td className="py-2 px-4">16-03-2025</td>
              <td className="py-2 px-4 text-green-600 font-semibold">
                Successful
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4">2</td>
              <td className="py-2 px-4">REC124</td>
              <td className="py-2 px-4">Facility-01</td>
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">$10.00</td>
              <td className="py-2 px-4">16-03-2025</td>
              <td className="py-2 px-4 text-yellow-500 font-semibold">
                Pending
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4">3</td>
              <td className="py-2 px-4">REC125</td>
              <td className="py-2 px-4">Facility-01</td>
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">$10.00</td>
              <td className="py-2 px-4">16-03-2025</td>
              <td className="py-2 px-4 text-red-500 font-semibold">
                Failed
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
