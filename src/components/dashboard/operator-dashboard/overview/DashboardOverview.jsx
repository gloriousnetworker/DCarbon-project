import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });

const ProgressTracker = ({ currentStage }) => {
  const stages = [
    { id: 1, name: "Registration", tooltip: "Commercial registration completed" },
    { id: 2, name: "Referral", tooltip: "Owner referral code verified" },
    { id: 3, name: "Agreement", tooltip: "Terms and conditions signed" },
    { id: 4, name: "Meters", tooltip: "Utility meters connected" }
  ];

  const currentDisplayStage = currentStage > 4 ? 4 : currentStage;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentDisplayStage} of {stages.length}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center group relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stage.id === currentDisplayStage ? "bg-[#039994] text-white" : stage.id < currentDisplayStage ? "bg-[#039994] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  stage.id === currentDisplayStage ? "text-[#039994] font-medium" : stage.id < currentDisplayStage ? "text-[#039994] font-medium" : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                {stage.tooltip}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
          {stages.slice(0, stages.length - 1).map((stage) => (
            <div
              key={stage.id}
              className={`h-1 flex-1 mx-2 ${
                stage.id < currentDisplayStage ? "bg-[#039994]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [meterCheckInterval, setMeterCheckInterval] = useState(null);

  const checkStage1Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.commercialUser?.ownerFullName;
  };

  const checkStage2Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/referral/by-user-id/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.referral?.inviterId;
  };

  const checkStage3Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success';
  };

  const checkStage4Completion = async (userId, authToken) => {
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
    return result.status === 'success' && 
           result.data?.length > 0 && 
           result.data.some(item => item.meters?.meters?.length > 0);
  };

  const checkUserProgress = async () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userId = loginResponse?.data?.user?.id;
    const authToken = loginResponse?.data?.token;

    if (!userId || !authToken) return;

    const stage1 = await checkStage1Completion(userId, authToken);
    if (!stage1) {
      setCurrentStage(1);
      return;
    }

    const stage2 = await checkStage2Completion(userId, authToken);
    if (!stage2) {
      setCurrentStage(2);
      return;
    }

    const stage3 = await checkStage3Completion(userId, authToken);
    if (!stage3) {
      setCurrentStage(3);
      return;
    }

    const stage4 = await checkStage4Completion(userId, authToken);
    if (stage4) {
      setCurrentStage(4);
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
        setMeterCheckInterval(null);
      }
    } else {
      setCurrentStage(3);
      if (!meterCheckInterval) {
        const interval = setInterval(async () => {
          const hasMeters = await checkStage4Completion(userId, authToken);
          if (hasMeters) {
            setCurrentStage(4);
            clearInterval(interval);
            setMeterCheckInterval(null);
          }
        }, 5000);
        setMeterCheckInterval(interval);
      }
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const firstName = loginResponse?.data?.user?.firstName || "User";
      const userId = loginResponse?.data?.user?.id || "";
      
      setUserData({
        userFirstName: firstName,
        userId: userId
      });

      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      if (!hasVisitedBefore) {
        setIsFirstTimeUser(true);
      }

      await checkCommercialUserStatus(userId);
      await checkUserProgress();
    };

    loadUserData();

    return () => {
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
      }
    };
  }, []);

  const checkCommercialUserStatus = async (userId) => {
    if (!userId) return;
    
    setIsCheckingCommercialStatus(true);
    
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const authToken = loginResponse?.data?.token;

    if (!authToken) return;

    const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();

    if (result.statusCode === 422 && result.status === 'fail') {
      setShowWelcomeModal(true);
    } else if (result.statusCode !== 200 || result.status !== 'success') {
      setShowWelcomeModal(true);
    }
    
    setIsCheckingCommercialStatus(false);
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("hasVisitedDashboard", "true");
    checkUserProgress();
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
    checkUserProgress();
  };

  if (isCheckingCommercialStatus) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Quick Action
          </h1>
        </div>
      </div>

      <ProgressTracker currentStage={currentStage} />
      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      <RecentRecSales />

      {showWelcomeModal && (
        <WelcomeModal 
          isOpen 
          onClose={handleCloseWelcomeModal}
          userData={userData}
        />
      )}

      {showAddUtilityModal && (
        <AddUtilityProvider 
          isOpen={showAddUtilityModal}
          onClose={handleCloseAddUtilityModal}
        />
      )}
    </div>
  );
}