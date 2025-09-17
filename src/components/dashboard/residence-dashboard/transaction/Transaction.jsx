import React, { useState } from "react";
import RequestRedemption from "./RequestRedemption";
import RedeemPoints from "./RedeemPoints";
import * as styles from "./styles";

export default function RedemptionTransactions() {
  const [showRequestRedemptionModal, setShowRequestRedemptionModal] = useState(false);
  const [showRedeemPointsModal, setShowRedeemPointsModal] = useState(false);
  const [userPoints, setUserPoints] = useState(5000);
  const [pendingRedemption, setPendingRedemption] = useState(null);

  const transactions = [
    { id: 1, residentId: "RES001", paymentId: "PAY001", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Successful" },
    { id: 2, residentId: "RES002", paymentId: "PAY002", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Pending" },
    { id: 3, residentId: "RES003", paymentId: "PAY003", pointRedeemed: 3000, pricePerPoint: 0.02, totalAmount: 10, date: "16-03-2025", status: "Failed" },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: 4 + i,
      residentId: `RES${String(4 + i).padStart(3, '0')}`,
      paymentId: `PAY${String(4 + i).padStart(3, '0')}`,
      pointRedeemed: 3000,
      pricePerPoint: 0.02,
      totalAmount: 10,
      date: "16-03-2025",
      status: "Successful",
    })),
  ];

  const handleOpenRequestRedemption = () => setShowRequestRedemptionModal(true);
  const handleCloseRequestRedemption = () => setShowRequestRedemptionModal(false);
  const handleOpenRedeemPoints = () => setShowRedeemPointsModal(true);
  const handleCloseRedeemPoints = () => setShowRedeemPointsModal(false);

  const handleRequestSubmit = ({ points, total }) => {
    const redemptionRequest = {
      points: parseInt(points),
      total: parseFloat(total),
      status: "approved"
    };
    
    setPendingRedemption(redemptionRequest);
    setUserPoints(prevPoints => prevPoints - parseInt(points));
    setShowRequestRedemptionModal(false);
    
    setTimeout(() => {
      setShowRedeemPointsModal(true);
    }, 500);
  };

  const handleRedeemComplete = (redemptionData) => {
    const newTransaction = {
      id: transactions.length + 1,
      residentId: "RES_USER",
      paymentId: `PAY${Date.now()}`,
      pointRedeemed: redemptionData.points,
      pricePerPoint: 0.02,
      totalAmount: redemptionData.total,
      date: new Date().toLocaleDateString('en-GB'),
      status: "Successful"
    };
    
    transactions.unshift(newTransaction);
    
    setPendingRedemption(null);
    setShowRedeemPointsModal(false);
  };

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

  const availableMoney = (userPoints / 100).toFixed(2);

  return (
    <div className={`${styles.mainContainer} px-6 py-8`}>
      <div className={`${styles.headingContainer} w-full max-w-5xl flex items-center justify-between`}>
        <h1 className={styles.pageTitle}>Points Transactions</h1>

        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 rounded font-sfpro text-[#039994] border border-[#039994] text-sm"
            type="button"
          >
            Points Balance: {userPoints}pts
          </button>
          <button
            className="px-4 py-2 rounded font-sfpro text-white bg-[#039994] text-sm hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
            type="button"
            onClick={handleOpenRequestRedemption}
            disabled={userPoints < 3000}
          >
            Request Redemption
          </button>
          {pendingRedemption && (
            <button
              className="px-4 py-2 rounded font-sfpro text-white bg-[#FF6B35] text-sm hover:bg-[#e55a2b] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              type="button"
              onClick={handleOpenRedeemPoints}
            >
              Redeem Points
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-300 my-6 w-full max-w-5xl" />

      <div className="w-full max-w-5xl mb-6">
        <div className="bg-[#069B9621] p-4 rounded-md">
          <span className="font-sfpro text-[16px] text-[#1E1E1E] mr-2">
            Available Money:
          </span>
          <span className="font-sfpro font-semibold text-[20px] text-[#039994]">
            ${availableMoney}
          </span>
        </div>
      </div>

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-[#1E1E1E]">
              <th className="pb-2 font-sfpro font-semibold">S/N</th>
              <th className="pb-2 font-sfpro font-semibold">Resident ID</th>
              <th className="pb-2 font-sfpro font-semibold">Payment ID</th>
              <th className="pb-2 font-sfpro font-semibold">Points Value</th>
              <th className="pb-2 font-sfpro font-semibold">Price/Point</th>
              <th className="pb-2 font-sfpro font-semibold">Total Amount</th>
              <th className="pb-2 font-sfpro font-semibold">Date</th>
              <th className="pb-2 font-sfpro font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-3 font-sfpro">{t.id}</td>
                <td className="py-3 font-sfpro">{t.residentId}</td>
                <td className="py-3 font-sfpro">{t.paymentId}</td>
                <td className="py-3 font-sfpro">{t.pointRedeemed}</td>
                <td className="py-3 font-sfpro">${t.pricePerPoint.toFixed(2)}</td>
                <td className="py-3 font-sfpro">${t.totalAmount.toFixed(2)}</td>
                <td className="py-3 font-sfpro">{t.date}</td>
                <td className={`py-3 font-semibold font-sfpro ${statusColor(t.status)}`}>
                  {t.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRequestRedemptionModal && (
        <RequestRedemption 
          onClose={handleCloseRequestRedemption} 
          onSubmit={handleRequestSubmit}
          availablePoints={userPoints}
        />
      )}

      {showRedeemPointsModal && pendingRedemption && (
        <RedeemPoints 
          onClose={handleCloseRedeemPoints}
          onComplete={handleRedeemComplete}
          redemptionData={pendingRedemption}
        />
      )}
    </div>
  );
}