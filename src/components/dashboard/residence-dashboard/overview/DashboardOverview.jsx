import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const CustomerCard = dynamic(() => import("./RecentTransactions"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const FinanceAndInstallerModal = dynamic(() => import("./modals/createfacility/FinanceAndInstallerModal"), { ssr: false });
const ResidenceTermsAndAgreementModal = dynamic(() => import("./modals/createfacility/ResidenceTermsAndAgreementModal"), { ssr: false });
const UtilityAuthorizationModal = dynamic(() => import("./modals/createfacility/UtilityAuthorizationModal"), { ssr: false });

const ProgressTracker = ({ currentStage, completedStages, onStageClick }) => {
  const stages = [
    { id: 1, name: "Dashboard Access", tooltip: "Welcome to your dashboard" },
    { id: 2, name: "Financial Info", tooltip: "Complete financial information" },
    { id: 3, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 4, name: "Utility Auth", tooltip: "Authorize utility access" }
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
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo !== null;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/check-agreements/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.agreementsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
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
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const newCompletedStages = [1];
      let currentStage = 2;

      const stage2Completed = await checkStage2Completion(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        currentStage = 3;
      }

      const stage3Completed = await checkStage3Completion(userId, authToken);
      if (stage3Completed && newCompletedStages.includes(2)) {
        newCompletedStages.push(3);
        currentStage = 4;
      }

      const stage4Completed = await checkStage4Completion(userId, authToken);
      if (stage4Completed && newCompletedStages.includes(3)) {
        newCompletedStages.push(4);
        currentStage = 4;
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(currentStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

  const handleStageClick = (stageId) => {
    if (stageId === 2) {
      setShowFinanceModal(true);
    } else if (stageId === 3) {
      setShowTermsModal(true);
    } else if (stageId === 4) {
      setShowUtilityModal(true);
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("hasVisitedDashboard", "true");
    checkUserProgress();
  };

  const handleCloseFinanceModal = () => {
    setShowFinanceModal(false);
    checkUserProgress();
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
    checkUserProgress();
  };

  const handleCloseUtilityModal = () => {
    setShowUtilityModal(false);
    checkUserProgress();
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window === 'undefined') return;
      
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const firstName = loginResponse?.data?.user?.firstName || "User";
      const userId = loginResponse?.data?.user?.id || "";
      
      setUserData({
        userFirstName: firstName,
        userId: userId
      });

      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      if (!hasVisitedBefore) {
        setShowWelcomeModal(true);
      }

      await checkUserProgress();
    };

    loadUserData();
  }, []);

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Dashboard Overview
          </h1>
        </div>
      </div>

      <ProgressTracker 
        currentStage={currentStage} 
        completedStages={completedStages} 
        onStageClick={handleStageClick}
      />
      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      <CustomerCard />

      {showWelcomeModal && (
        <WelcomeModal 
          isOpen 
          onClose={handleCloseWelcomeModal}
          userData={userData}
          currentStage={currentStage}
          completedStages={completedStages}
        />
      )}

      {showFinanceModal && (
        <FinanceAndInstallerModal
          isOpen={showFinanceModal}
          onClose={handleCloseFinanceModal}
        />
      )}

      {showTermsModal && (
        <ResidenceTermsAndAgreementModal
          isOpen={showTermsModal}
          onClose={handleCloseTermsModal}
        />
      )}

      {showUtilityModal && (
        <UtilityAuthorizationModal
          isOpen={showUtilityModal}
          onClose={handleCloseUtilityModal}
        />
      )}
    </div>
  );
}