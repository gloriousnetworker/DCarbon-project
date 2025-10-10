import React, { useState, useEffect } from "react";
import RequestRedemption from "./RequestRedemption";
import RedeemPoints from "./RedeemPoints";
import ResidentialBonusTable from "./ResidentialBonusTable";
import * as styles from "./styles";

export default function RedemptionTransactions() {
  const [showRequestRedemptionModal, setShowRequestRedemptionModal] = useState(false);
  const [showRedeemPointsModal, setShowRedeemPointsModal] = useState(false);
  const [showResidentialBonusModal, setShowResidentialBonusModal] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("authToken");
    setUserId(storedUserId || "");
    setAuthToken(storedToken || "");
  }, []);

  useEffect(() => {
    if (userId && authToken) {
      fetchWalletData();
      fetchPayoutHistory();
    }
  }, [userId, authToken]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/revenue/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      
      if (result.status === "success") {
        setWalletData(result.data);
        const points = result.data.availableBalance * 1000;
        setUserPoints(points);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request?userId=${userId}&userType=RESIDENTIAL`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      
      if (result.status === "success") {
        const formattedTransactions = result.data.map((item, index) => ({
          id: item.id,
          serialNumber: index + 1,
          userType: item.userType,
          amountRequested: item.amountRequested,
          status: item.status,
          approvedAt: item.approvedAt ? new Date(item.approvedAt).toLocaleDateString('en-GB') : "-",
          rejectedAt: item.rejectedAt ? new Date(item.rejectedAt).toLocaleDateString('en-GB') : "-",
          createdAt: new Date(item.createdAt).toLocaleDateString('en-GB')
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching payout history:", error);
    }
  };

  const handleOpenRequestRedemption = () => setShowRequestRedemptionModal(true);
  const handleCloseRequestRedemption = () => setShowRequestRedemptionModal(false);
  const handleOpenRedeemPoints = () => setShowRedeemPointsModal(true);
  const handleCloseRedeemPoints = () => setShowRedeemPointsModal(false);
  const handleOpenResidentialBonus = () => setShowResidentialBonusModal(true);
  const handleCloseResidentialBonus = () => setShowResidentialBonusModal(false);

  const handleRequestSubmit = async (requestData) => {
    try {
      setUserPoints(prevPoints => prevPoints - requestData.points);
      setShowRequestRedemptionModal(false);
      setShowToast(true);
      fetchPayoutHistory();
      fetchWalletData();
    } catch (error) {
      console.error("Error handling redemption request:", error);
    }
  };

  const handleRedeemComplete = (redemptionData) => {
    setShowRedeemPointsModal(false);
    fetchPayoutHistory();
    fetchWalletData();
  };

  const statusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-[#039994] text-white";
      case "PENDING":
        return "bg-[#FFB200] text-white";
      case "REJECTED":
        return "bg-[#FF0000] text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const formatId = (id) => {
    return `${id.substring(0, 8)}...`;
  };

  const availableMoney = walletData ? (walletData.availableBalance).toFixed(2) : "0.00";

  if (loading) {
    return (
      <div className={`${styles.mainContainer} px-6 py-8 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#039994] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContainer} px-6 py-8`}>
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
          Payout request submitted successfully!
        </div>
      )}

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
            Request Payout
          </button>
        </div>
      </div>

      <hr className="border-gray-300 my-6 w-full max-w-5xl" />

      {walletData && (
        <div className="w-full max-w-5xl mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#069B9621] p-4 rounded-md">
            <span className="font-sfpro text-[14px] text-[#1E1E1E] block">
              Available Money
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              ${availableMoney}
            </span>
          </div>
          <div className="bg-[#069B9621] p-4 rounded-md">
            <span className="font-sfpro text-[14px] text-[#1E1E1E] block">
              Total Commission
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              ${walletData.totalCommission.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#069B9621] p-4 rounded-md">
            <span className="font-sfpro text-[14px] text-[#1E1E1E] block">
              Total Bonus
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              ${walletData.totalBonus.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#069B9621] p-4 rounded-md">
            <span className="font-sfpro text-[14px] text-[#1E1E1E] block">
              Pending Payout
            </span>
            <span className="font-sfpro font-semibold text-[18px] text-[#039994]">
              ${walletData.pendingPayout.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-[#1E1E1E]">
              <th className="pb-2 font-sfpro font-semibold">S/N</th>
              <th className="pb-2 font-sfpro font-semibold">Payout ID</th>
              <th className="pb-2 font-sfpro font-semibold">User Type</th>
              <th className="pb-2 font-sfpro font-semibold">Amount Requested</th>
              <th className="pb-2 font-sfpro font-semibold">Status</th>
              <th className="pb-2 font-sfpro font-semibold">Approved At</th>
              <th className="pb-2 font-sfpro font-semibold">Rejected At</th>
              <th className="pb-2 font-sfpro font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-3 font-sfpro">{t.serialNumber}</td>
                <td className="py-3 font-sfpro cursor-pointer hover:text-[#039994]" title={t.id}>
                  {formatId(t.id)}
                </td>
                <td className="py-3 font-sfpro">{t.userType}</td>
                <td className="py-3 font-sfpro">${t.amountRequested.toFixed(2)}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-sfpro font-semibold ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 font-sfpro">{t.approvedAt}</td>
                <td className="py-3 font-sfpro">{t.rejectedAt}</td>
                <td className="py-3 font-sfpro">{t.createdAt}</td>
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
          userId={userId}
          authToken={authToken}
        />
      )}

      {showRedeemPointsModal && (
        <RedeemPoints 
          onClose={handleCloseRedeemPoints}
          onComplete={handleRedeemComplete}
          userId={userId}
          authToken={authToken}
        />
      )}

      {showResidentialBonusModal && (
        <ResidentialBonusTable 
          onClose={handleCloseResidentialBonus}
          userId={userId}
          authToken={authToken}
        />
      )}
    </div>
  );
}