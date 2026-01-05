import React, { useState, useEffect } from "react";
import AddResidenceModal from "./modals/AddResidenceModal";
import ReferOwnerModal from "./modals/ReferOwnerModal";
import CreateNewFacilityModal from "./AddNewResidentialFacility.jsx";
import ContinueResidentialFacilityModal from "./ContinueResidentialFacilityCreation.jsx";
import { pageTitle, labelClass, noteText } from "./styles";

export default function QuickActions({ onSectionChange }) {
  const [modal, setModal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasMeters, setHasMeters] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(true);
  const [userMeters, setUserMeters] = useState([]);

  const fetchWalletData = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        setWalletLoading(false);
        return;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/revenue/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setWalletData(result.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchReferralData = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        setReferralLoading(false);
        return;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/referred-progress/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setReferralData(result.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setReferralLoading(false);
    }
  };

  const currentPoints = walletData ? walletData.availableBalance * 1000 : 0;
  const redemptionThreshold = 3000;
  const redemptionPct = Math.min(Math.round((currentPoints / redemptionThreshold) * 100), 100);
  
  const referralCount = referralData ? referralData.referralCount : 0;
  const referralThreshold = 10;
  const referralPct = Math.min(Math.round((referralCount / referralThreshold) * 100), 100);

  const checkMeters = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        setIsLoading(false);
        return;
      }

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
      
      setUserMeters(result.data || []);
      
      const metersExist = result.status === 'success' && 
                         Array.isArray(result.data) &&
                         result.data.length > 0 &&
                         result.data.some(item => 
                           Array.isArray(item.meters) &&
                           item.meters.length > 0
                         );
      
      setHasMeters(metersExist);
    } catch (error) {
      console.error('Error fetching meters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMeters();
    fetchWalletData();
    fetchReferralData();
  }, []);

  const openModal = (type) => {
    if (type === "addResidence") {
      if (hasMeters) {
        setModal("addResidence");
      } else {
        setModal("addNewResidential");
      }
    } else if (type === "continueFacility") {
      setModal("continueFacility");
    } else {
      setModal(type);
    }
  };

  const closeModal = () => {
    setModal("");
  };

  const isActionDisabled = () => {
    return isLoading || !hasMeters;
  };

  const getActionTooltip = () => {
    if (isLoading) return "Loading...";
    if (!hasMeters) return "Complete utility authorization to enable features";
    return "";
  };

  const getActionStatusText = () => {
    if (isLoading) return "Loading...";
    if (!hasMeters) return "Complete utility auth";
    return "";
  };

  const handleUploadDocuments = () => {
    if (isActionDisabled()) return;
    if (onSectionChange) {
      onSectionChange("residentialManagement");
    }
  };

  const handleRedeemPoints = () => {
    if (isActionDisabled()) return;
    if (onSectionChange) {
      onSectionChange("transaction");
    }
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-1 lg:col-span-3">
          <h2 className={pageTitle}>Quick Action</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div
                onClick={() => openModal("addResidence")}
                className="p-4 rounded-2xl flex flex-col h-full min-h-[140px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
                }}
              >
                <img src="/vectors/MapPinPlus.png" alt="Add New Solar Home" className="h-7 w-7 mb-3" />
                <hr className="border-white/30 mb-3" />
                <p className="text-white text-sm font-bold line-clamp-2">Add New Solar Home</p>
              </div>

              <div
                onClick={() => openModal("continueFacility")}
                className="p-4 rounded-2xl flex flex-col h-full min-h-[140px] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #365c57 0%, #365c57 100%)",
                }}
              >
                <img src="/vectors/MapPinPlus.png" alt="Continue Existing Facility Authorization" className="h-7 w-7 mb-3" />
                <hr className="border-white/30 mb-3" />
                <p className="text-white text-sm font-bold line-clamp-2">Continue Existing Facility Authorization</p>
              </div>

              <div
                onClick={handleUploadDocuments}
                className={`p-4 rounded-2xl flex flex-col h-full min-h-[140px] transition-all duration-300 ${
                  isActionDisabled() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:shadow-xl"
                }`}
                style={{
                  background: "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6,155,150,0.35) 0%, #FFFFFF 100%)",
                  border: "1px solid rgba(3, 153, 148, 0.2)",
                }}
                title={getActionTooltip()}
              >
                <img src="/vectors/Files.png" alt="Upload Documents for a Facility" className="h-7 w-7 mb-3" />
                <hr className="border-[#CCC] mb-3" />
                <p className="text-[#1E1E1E] text-sm font-bold line-clamp-2">Upload Documents for a Facility</p>
                {isActionDisabled() && <div className="mt-2 text-[#1E1E1E] text-xs font-medium">{getActionStatusText()}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={handleRedeemPoints}
                className={`p-4 rounded-2xl flex flex-col h-full min-h-[140px] transition-all duration-300 ${
                  isActionDisabled() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:shadow-xl"
                }`}
                style={{
                  background: "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #374151 0%, #111827 100%)",
                }}
                title={getActionTooltip()}
              >
                <img src="/vectors/HandCoins.png" alt="Redeem Points" className="h-7 w-7 mb-3" />
                <hr className="border-white/30 mb-3" />
                <p className="text-white text-sm font-bold line-clamp-2">Redeem Points</p>
                {isActionDisabled() && <div className="mt-2 text-white text-xs font-medium">{getActionStatusText()}</div>}
              </div>

              <div
                onClick={() => !isActionDisabled() && openModal("referOwner")}
                className={`p-4 rounded-2xl flex flex-col h-full min-h-[140px] transition-all duration-300 ${
                  isActionDisabled() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:shadow-xl"
                }`}
                style={{
                  background: "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
                }}
                title={getActionTooltip()}
              >
                <img src="/vectors/Share.png" alt="Earn Bonus Points" className="h-7 w-7 mb-3" />
                <hr className="border-white/30 mb-3" />
                <p className="text-white text-sm font-bold line-clamp-2">Earn Bonus Points</p>
                {isActionDisabled() && <div className="mt-2 text-white text-xs font-medium">{getActionStatusText()}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h2 className={pageTitle}>Rewards</h2>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-xl" style={{ minHeight: '324px' }}>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider">Current Points Balance</span>
                  <span className="text-3xl font-bold text-[#039994]">
                    {walletLoading ? "..." : `${currentPoints.toLocaleString()}`}
                  </span>
                </div>
                <span className="text-[10px] text-[#9CA3AF] mt-1.5 block">Total accumulated points</span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-semibold text-[#1E1E1E]">Redemption Progress</span>
                    <span className="text-xl font-bold text-[#039994]">{redemptionPct}%</span>
                  </div>
                  <div className="relative w-full h-3.5 bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        background: "linear-gradient(90deg, #039994 0%, #06C9C3 100%)",
                        width: `${redemptionPct}%`,
                        boxShadow: "0 2px 6px rgba(3, 153, 148, 0.4)"
                      }} 
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF] font-medium">0 pts</span>
                    <span className="text-[10px] text-[#9CA3AF] font-medium">{redemptionThreshold.toLocaleString()} pts</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-semibold text-[#1E1E1E]">Referral Bonus Count</span>
                    <span className="text-xl font-bold text-[#1E1E1E]">
                      {referralLoading ? "..." : `${referralCount}/${referralThreshold}`}
                    </span>
                  </div>
                  <div className="relative w-full h-3.5 bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        background: "linear-gradient(90deg, #1E1E1E 0%, #4B5563 100%)",
                        width: `${referralPct}%`,
                        boxShadow: "0 2px 6px rgba(30, 30, 30, 0.4)"
                      }} 
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF] font-medium">0 referrals</span>
                    <span className="text-[10px] text-[#9CA3AF] font-medium">{referralThreshold} referrals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddResidenceModal isOpen={modal === "addResidence"} onClose={closeModal} />
      <ReferOwnerModal isOpen={modal === "referOwner"} onClose={closeModal} />
      <CreateNewFacilityModal isOpen={modal === "addNewResidential"} onClose={closeModal} />
      <ContinueResidentialFacilityModal isOpen={modal === "continueFacility"} onClose={closeModal} />
    </div>
  );
}