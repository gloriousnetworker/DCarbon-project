import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });

const ProgressTracker = ({ currentStage, completedStages, onStageClick }) => {
  const stages = [
    { id: 1, name: "Registration", tooltip: "Commercial registration completed" },
    { id: 2, name: "Referral", tooltip: "Owner referral code verified" },
    { id: 3, name: "Agreement", tooltip: "Terms and conditions signed" },
    { id: 4, name: "Meters", tooltip: "Utility meters connected" }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentStage} of {stages.length}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="flex flex-col items-center group relative"
              onClick={() => completedStages.includes(stage.id) ? onStageClick(stage.id) : null}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer ${
                  completedStages.includes(stage.id)
                    ? "bg-[#039994] border-[#039994] text-white"
                    : stage.id === currentStage
                    ? "border-[#039994] text-[#039994]"
                    : "border-gray-300 text-gray-400"
                } ${completedStages.includes(stage.id) ? 'hover:bg-[#028882]' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  completedStages.includes(stage.id) || stage.id === currentStage
                    ? "text-[#039994] font-medium"
                    : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              {completedStages.includes(stage.id) && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {stage.tooltip}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
          {stages.slice(0, stages.length - 1).map((stage) => (
            <div
              key={stage.id}
              className={`h-1 flex-1 mx-2 ${
                completedStages.includes(stage.id + 1) ? "bg-[#039994]" : "bg-gray-200"
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
  const [completedStages, setCompletedStages] = useState([]);
  const [meterCheckInterval, setMeterCheckInterval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hideProgressTracker, setHideProgressTracker] = useState(false);

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

  const checkStage2Completion = () => {
    const referralResponse = localStorage.getItem('referralResponse');
    const ownerReferralCode = localStorage.getItem('ownerReferralCode');
    
    if (referralResponse && ownerReferralCode) {
      try {
        const parsedResponse = JSON.parse(referralResponse);
        return parsedResponse.status === 'success' && parsedResponse.data?.inviterId;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const checkStage3Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.termsAccepted;
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
    try {
      setIsLoading(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const newCompletedStages = [];
      let highestCompletedStage = 1;

      const stage1 = await checkStage1Completion(userId, authToken);
      if (stage1) {
        newCompletedStages.push(1);
        highestCompletedStage = 2;
      }

      const stage2 = checkStage2Completion();
      if (stage2) {
        newCompletedStages.push(2);
        highestCompletedStage = 3;
      }

      const stage3 = await checkStage3Completion(userId, authToken);
      if (stage3) {
        newCompletedStages.push(3);
        highestCompletedStage = 4;
      }

      const stage4 = await checkStage4Completion(userId, authToken);
      if (stage4) {
        newCompletedStages.push(4);
        setHideProgressTracker(true);
        if (meterCheckInterval) {
          clearInterval(meterCheckInterval);
          setMeterCheckInterval(null);
        }
      } else {
        setHideProgressTracker(false);
        if (stage3) {
          if (!meterCheckInterval) {
            const interval = setInterval(async () => {
              const hasMeters = await checkStage4Completion(userId, authToken);
              if (hasMeters) {
                setCompletedStages(prev => [...prev, 4]);
                setHideProgressTracker(true);
                clearInterval(interval);
                setMeterCheckInterval(null);
              }
            }, 5000);
            setMeterCheckInterval(interval);
          }
        }
      }

      const storageListener = () => {
        const newReferralCheck = checkStage2Completion();
        if (newReferralCheck && !newCompletedStages.includes(2)) {
          setHideProgressTracker(false);
          checkUserProgress();
        }
      };

      window.addEventListener('storage', storageListener);

      setCompletedStages(newCompletedStages);
      setCurrentStage(highestCompletedStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageClick = (stageId) => {
    if (stageId === 4) {
      setShowAddUtilityModal(true);
    }
  };

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
    setHideProgressTracker(false);
    checkUserProgress();
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
    checkUserProgress();
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

    const handleStorageChange = (e) => {
      if (e.key === 'referralResponse' || e.key === 'ownerReferralCode') {
        setHideProgressTracker(false);
        checkUserProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isCheckingCommercialStatus || isLoading) {
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

      {!hideProgressTracker && (
        <ProgressTracker 
          currentStage={currentStage} 
          completedStages={completedStages} 
          onStageClick={handleStageClick}
        />
      )}
      
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