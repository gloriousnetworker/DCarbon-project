import React from "react";
import {
  FaUserPlus,
  FaMoneyCheckAlt,
  FaFileUpload,
  FaIndustry,
  FaTags,
  FaChartLine,
  FaMoneyBillWave,
} from "react-icons/fa";

const DashboardOverview = () => {
  return (
    <div className="w-full space-y-8">

      {/* Quick Action Title */}
      <h2 className="text-xl font-semibold text-[#039994]">Quick Action</h2>

      {/* Four Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Refer a Business Partner */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
        >
          <FaUserPlus size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Refer a Business Partner</p>
        </div>

        {/* Card 2: Request Payment */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #58595B 100%)",
          }}
        >
          <FaMoneyCheckAlt size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Request Payment</p>
        </div>

        {/* Card 3: Upload/Manage Documents */}
        <div
          className="p-4 rounded-md flex flex-col items-center"
          style={{
            background:
              "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
        >
          <FaFileUpload size={24} className="mb-2 text-[#039994]" />
          <hr className="border-gray-300 w-full mb-2" />
          <p className="text-center text-gray-700 text-sm">
            Upload/Manage Documents
          </p>
        </div>

        {/* Card 4: Add Commercial Facility */}
        <div
          className="p-4 rounded-md text-white flex flex-col items-center"
          style={{
            background:
              "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
        >
          <FaIndustry size={24} className="mb-2" />
          <hr className="border-white w-full mb-2" />
          <p className="text-center text-sm">Add Commercial Facility</p>
        </div>
      </div>

      {/* Thin line separator */}
      <hr className="border-gray-300" />

      {/* Three White Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total RECs sold */}
        <div className="bg-white rounded-md shadow p-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaTags className="text-[#039994]" />
            <p className="font-semibold">Total RECs sold</p>
          </div>
          <hr className="my-2" />
          <p className="text-2xl font-bold text-[#039994]">20</p>
        </div>

        {/* Card 2: Sale price/REC */}
        <div className="bg-white rounded-md shadow p-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaChartLine className="text-[#039994]" />
            <p className="font-semibold">Sale price/REC</p>
          </div>
          <hr className="my-2" />
          <p className="text-2xl font-bold text-[#039994]">$24.00</p>
        </div>

        {/* Card 3: Total Revenue Earned */}
        <div className="bg-white rounded-md shadow p-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <FaMoneyBillWave className="text-[#039994]" />
            <p className="font-semibold">Total Revenue Earned</p>
          </div>
          <hr className="my-2" />
          <p className="text-2xl font-bold text-[#039994]">$10,000.00</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="text-[#039994] text-lg font-semibold mb-4">
          Recent Transactions
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
              {/* Row 1 */}
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
              {/* Row 2 */}
              <tr>
                <td className="py-2 px-4">2</td>
                <td className="py-2 px-4">REC123</td>
                <td className="py-2 px-4">Facility-01</td>
                <td className="py-2 px-4">1</td>
                <td className="py-2 px-4">$10.00</td>
                <td className="py-2 px-4">16-03-2025</td>
                <td className="py-2 px-4 text-yellow-500 font-semibold">
                  Pending
                </td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="py-2 px-4">3</td>
                <td className="py-2 px-4">REC123</td>
                <td className="py-2 px-4">Facility-01</td>
                <td className="py-2 px-4">1</td>
                <td className="py-2 px-4">$10.00</td>
                <td className="py-2 px-4">16-03-2025</td>
                <td className="py-2 px-4 text-red-500 font-semibold">Failed</td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="py-2 px-4">4</td>
                <td className="py-2 px-4">REC123</td>
                <td className="py-2 px-4">Facility-01</td>
                <td className="py-2 px-4">1</td>
                <td className="py-2 px-4">$10.00</td>
                <td className="py-2 px-4">16-03-2025</td>
                <td className="py-2 px-4 text-green-600 font-semibold">
                  Successful
                </td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="py-2 px-4">5</td>
                <td className="py-2 px-4">REC123</td>
                <td className="py-2 px-4">Facility-01</td>
                <td className="py-2 px-4">1</td>
                <td className="py-2 px-4">$10.00</td>
                <td className="py-2 px-4">16-03-2025</td>
                <td className="py-2 px-4 text-yellow-500 font-semibold">
                  Pending
                </td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td className="py-2 px-4">6</td>
                <td className="py-2 px-4">REC123</td>
                <td className="py-2 px-4">Facility-01</td>
                <td className="py-2 px-4">1</td>
                <td className="py-2 px-4">$10.00</td>
                <td className="py-2 px-4">16-03-2025</td>
                <td className="py-2 px-4 text-red-500 font-semibold">Failed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
