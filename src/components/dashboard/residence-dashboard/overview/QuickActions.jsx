import React, { useState, useEffect } from "react";
import AddResidenceModal from "./modals/AddResidenceModal";
import UploadDocumentsModal from "./modals/UploadDocumentModal";
import RequestRedemptionModal from "./modals/RequestRedemptionModal";
import ReferOwnerModal from "./modals/ReferOwnerModal";
import { pageTitle, labelClass, noteText } from "./styles";

export default function QuickActions() {
  const [modal, setModal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasMeters, setHasMeters] = useState(false);

  const currentPoints = 20;
  const redemption = { done: 250, total: 3000 };
  const referral = { done: 150, total: 3000 };

  const redemptionPct = Math.round((redemption.done / redemption.total) * 100);
  const referralPct = Math.round((referral.done / referral.total) * 100);

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
      setHasMeters(result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0));
    } catch (error) {
      console.error('Error fetching meters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMeters();
  }, []);

  const openModal = (type) => {
    if (!hasMeters) return;
    setModal(type);
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

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-1 lg:col-span-3">
          <h2 className={pageTitle}>Quick Action</h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => !isActionDisabled() && openModal("addResidence")}
              className={`p-4 rounded-2xl flex flex-col h-full min-h-[120px] ${
                isActionDisabled() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background: "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
              }}
              title={getActionTooltip()}
            >
              <img src="/vectors/MapPinPlus.png" alt="Add New Solar Home" className="h-6 w-6 mb-2" />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">Add New Solar Home</p>
              {isActionDisabled() && (
                <div className="mt-1 text-white text-xs">{getActionStatusText()}</div>
              )}
            </div>

            <div
              onClick={() => openModal("uploadDocuments")}
              className={`p-4 rounded-2xl flex flex-col h-full min-h-[120px] ${
                !hasMeters ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background: "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6,155,150,0.3) 0%, #FFFFFF 100%)",
              }}
              title={getActionTooltip()}
            >
              <img src="/vectors/Files.png" alt="Upload Documents" className="h-6 w-6 mb-2" />
              <hr className="border-[#CCC] mb-2" />
              <p className="text-[#1E1E1E] text-sm font-bold line-clamp-2">Upload Documents</p>
              {isActionDisabled() && <div className="mt-1 text-[#1E1E1E] text-xs">{getActionStatusText()}</div>}
            </div>

            <div
              onClick={() => openModal("requestRedemption")}
              className={`p-4 rounded-2xl flex flex-col h-full min-h-[120px] ${
                !hasMeters ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background: "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #58595B 100%)",
              }}
              title={getActionTooltip()}
            >
              <img src="/vectors/HandCoins.png" alt="Redeem Points" className="h-6 w-6 mb-2" />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">Redeem Points</p>
              {isActionDisabled() && <div className="mt-1 text-white text-xs">{getActionStatusText()}</div>}
            </div>

            <div
              onClick={() => openModal("referOwner")}
              className={`p-4 rounded-2xl flex flex-col h-full min-h-[120px] ${
                !hasMeters ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background: "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
              }}
              title={getActionTooltip()}
            >
              <img src="/vectors/Share.png" alt="Earn Bonus Points" className="h-6 w-6 mb-2" />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">Earn Bonus Points</p>
              {isActionDisabled() && <div className="mt-1 text-white text-xs">{getActionStatusText()}</div>}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h2 className={pageTitle}>Rewards</h2>
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow min-h-[260px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                <span className={labelClass}>Current Points Balance</span>
              </div>
              <span className="text-[#1E1E1E] font-bold">{currentPoints}pts</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span className={labelClass}>Redemption progress</span>
                </div>
                <span className="text-[#039994] font-semibold">{redemption.done}/{redemption.total}pts</span>
              </div>
              <div className="w-full h-2 bg-[#EEEEEE] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ backgroundColor: "#039994", width: `${redemptionPct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span className={labelClass}>Referral bonus progress</span>
                </div>
                <span className="text-[#1E1E1E] font-semibold">{referral.done}/{referral.total}pts</span>
              </div>
              <div className="w-full h-2 bg-[#D4D4D4] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ backgroundColor: "#1E1E1E", width: `${referralPct}%` }} />
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#D4D4D4] rounded-full" />
                  <span className={noteText}>Bronze Tier</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#A37C50] rounded-full" />
                  <span className={noteText}>Silver Tier</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#FFD700] rounded-full" />
                  <span className={noteText}>Gold Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddResidenceModal isOpen={modal === "addResidence"} onClose={closeModal} />
      <UploadDocumentsModal isOpen={modal === "uploadDocuments"} onClose={closeModal} />
      <RequestRedemptionModal isOpen={modal === "requestRedemption"} onClose={closeModal} />
      <ReferOwnerModal isOpen={modal === "referOwner"} onClose={closeModal} />
    </div>
  );
}