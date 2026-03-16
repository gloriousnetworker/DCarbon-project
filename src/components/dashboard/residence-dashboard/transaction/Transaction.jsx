import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../lib/config";
import RequestRedemption from "./RequestRedemption";
import RedeemPoints from "./RedeemPoints";
import ResidentialBonusTable from "./ResidentialBonusTable";
import * as styles from "./styles";
import ResponsiveTable from "../../shared/ResponsiveTable";

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
      const response = await axiosInstance.get(`/api/revenue/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = response.data;
      
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
      const response = await axiosInstance.get(`/api/payout-request?userId=${userId}&userType=RESIDENTIAL`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = response.data;
      
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
      )}

      <div className="w-full max-w-5xl">
        <ResponsiveTable
          loading={loading}
          data={transactions}
          emptyTitle="No transactions found"
          emptyDescription="Your payout request history will appear here."
          columns={[
            { key: 'serialNumber', label: 'S/N' },
            { key: 'id', label: 'Payout ID' },
            { key: 'userType', label: 'User Type' },
            { key: 'amountRequested', label: 'Amount Requested', render: (v) => `$${v?.toFixed(2) || '0.00'}` },
            {
              key: 'status', label: 'Status',
              render: (v) => (
                <span className={`px-3 py-1 rounded-full text-xs font-sfpro font-semibold ${statusColor(v)}`}>
                  {v}
                </span>
              ),
            },
            { key: 'approvedAt', label: 'Approved At' },
            { key: 'rejectedAt', label: 'Rejected At' },
            { key: 'createdAt', label: 'Created At' },
          ]}
        />
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