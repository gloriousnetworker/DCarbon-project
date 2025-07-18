// RedemptionTransactions.jsx
import React, { useState } from "react";
import RequestRedemption from "./RequestRedemption";
import * as styles from "./styles";

export default function RedemptionTransactions() {
  const [showRequestRedemptionModal, setShowRequestRedemptionModal] =
    useState(false);

  // Sample transaction data
  const transactions = [
    { id: 1, residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Successful" },
    { id: 2, residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Pending" },
    { id: 3, residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Failed" },
    // rest all Successful
    ...Array.from({ length: 8 }, (_, i) => ({
      id: 4 + i,
      residentId: "Resident ID",
      paymentId: "Payment ID",
      pointRedeemed: 3000,
      pricePerPoint: 0.02,
      totalAmount: 10,
      date: "16-03-2025",
      status: "Successful",
    })),
  ];

  const handleOpenRequest = () => setShowRequestRedemptionModal(true);
  const handleCloseRequest = () => setShowRequestRedemptionModal(false);

  const statusColor = (status) => {
    switch (status) {
      case "Successful":
        return "text-[#039994]";
      case "Pending":
        return "text-[#FFB200]";
      case "Failed":
        return "text-[#FF0000]";
      default:
        return "";
    }
  };

  return (
    <div className={`${styles.mainContainer} px-6 py-8`}>
      {/* Heading + buttons */}
      <div className={`${styles.headingContainer} w-full max-w-5xl flex items-center justify-between`}>
        <h1 className={styles.pageTitle}>Points Transactions</h1>

        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 rounded font-sfpro text-[#039994] border border-[#039994] text-sm"
            type="button"
          >
            Points Balance: 2000pts
          </button>
          <button
            className="px-4 py-2 rounded font-sfpro text-white bg-[#039994] text-sm hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
            type="button"
            onClick={handleOpenRequest}
          >
            Request Redemption
          </button>
        </div>
      </div>

      <hr className="border-gray-300 my-6 w-full max-w-5xl" />

      {/* Transactions table */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-[#1E1E1E]">
              <th className="pb-2">S/N</th>
              <th className="pb-2">Resident ID</th>
              <th className="pb-2">Payment ID</th>
              <th className="pb-2">Points Value</th>
              <th className="pb-2">Price/Point</th>
              <th className="pb-2">Total Amount</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-3">{t.id}</td>
                <td className="py-3">{t.residentId}</td>
                <td className="py-3">{t.paymentId}</td>
                <td className="py-3">{t.pointRedeemed}</td>
                <td className="py-3">${t.pricePerPoint.toFixed(2)}</td>
                <td className="py-3">${t.totalAmount.toFixed(2)}</td>
                <td className="py-3">{t.date}</td>
                <td className={`py-3 font-semibold ${statusColor(t.status)}`}>
                  {t.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Redemption Modal */}
      {showRequestRedemptionModal && (
        <RequestRedemption onClose={handleCloseRequest} />
      )}
    </div>
  );
}
