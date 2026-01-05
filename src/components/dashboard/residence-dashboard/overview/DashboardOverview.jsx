import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const CustomerCard = dynamic(() => import("./RecentTransactions"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const FinanceAndInstallerModal = dynamic(() => import("./modals/createfacility/FinanceAndInstallerModal"), { ssr: false });
const ResidenceTermsAndAgreementModal = dynamic(() => import("./modals/createfacility/ResidenceTermsAndAgreementModal"), { ssr: false });
const ContinueResidentialFacilityCreation = dynamic(() => import("./modals/ContinueResidentialFacilityCreation"), { ssr: false });

const ProgressTracker = ({ currentStage, onStageClick }) => {
  const stages = [
    { id: 1, name: "Dashboard Access", tooltip: "Welcome to your dashboard" },
    { id: 2, name: "Create Solar Facility", tooltip: "Complete creation of Solar Facility" },
    { id: 3, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 4, name: "Utility Auth", tooltip: "Authorize utility access" }
  ];

  const currentDisplayStage = currentStage > 4 ? 4 : currentStage;

  const handleClick = (stageId) => {
    if (stageId < currentDisplayStage) return;
    onStageClick(stageId);
  };

  const isClickable = (stageId) => {
    return stageId >= currentDisplayStage;
  };

  const isCompleted = (stageId) => {
    return stageId < currentDisplayStage;
  };

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
            <div 
              key={stage.id} 
              className={`flex flex-col items-center group relative ${isClickable(stage.id) ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleClick(stage.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted(stage.id) ? "bg-[#039994] text-white" : 
                  stage.id === currentDisplayStage ? "border-2 border-[#039994] bg-white text-gray-600" : 
                  "bg-gray-200 text-gray-600"
                } ${isClickable(stage.id) ? 'hover:bg-[#028a85] hover:text-white' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  isCompleted(stage.id) ? "text-[#039994] font-medium" : 
                  "text-gray-500"
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
                isCompleted(stage.id) ? "bg-[#039994]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DashboardOverview({ onSectionChange }) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(true);
  const [completedStages, setCompletedStages] = useState([1]);
  const [meterStatus, setMeterStatus] = useState({
    loading: false,
    hasMeter: null,
    lastChecked: null
  });
  const [hasFacility, setHasFacility] = useState(false);

  const checkFacilityStatus = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data && result.data.facilities && result.data.facilities.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkMeterStatus = async () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userId = loginResponse?.data?.user?.id;
    const authToken = loginResponse?.data?.token;

    if (!userId || !authToken) return;

    setMeterStatus(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/utility-auth/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();

      if (result.status === 'success' && result.data.length > 0) {
        const authData = result.data[0];
        setMeterStatus({
          loading: false,
          hasMeter: authData.hasMeter,
          lastChecked: new Date()
        });
      } else {
        setMeterStatus({
          loading: false,
          hasMeter: false,
          lastChecked: new Date()
        });
      }
    } catch (err) {
      setMeterStatus({
        loading: false,
        hasMeter: null,
        lastChecked: new Date()
      });
    }
  };

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
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
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
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        const userMeterData = result.data[0];
        return userMeterData.meters !== null && 
               userMeterData.meters?.meters && 
               userMeterData.meters.meters.length > 0;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      setIsLoading(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const facilityStatus = await checkFacilityStatus(userId, authToken);
      setHasFacility(facilityStatus);

      if (facilityStatus) {
        setShowProgressTracker(false);
        setIsLoading(false);
        return;
      }

      const newCompletedStages = [1];
      let highestCompletedStage = 1;

      const stage2Completed = await checkStage2Completion(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        highestCompletedStage = 2;
      } else {
        setCurrentStage(2);
        setCompletedStages(newCompletedStages);
        setShowProgressTracker(true);
        setIsLoading(false);
        return;
      }

      const stage3Completed = await checkStage3Completion(userId, authToken);
      if (stage3Completed) {
        newCompletedStages.push(3);
        highestCompletedStage = 3;
      } else {
        setCurrentStage(3);
        setCompletedStages(newCompletedStages);
        setShowProgressTracker(true);
        setIsLoading(false);
        return;
      }

      const stage4Completed = await checkStage4Completion(userId, authToken);
      if (stage4Completed) {
        newCompletedStages.push(4);
        highestCompletedStage = 4;
      } else {
        setCurrentStage(4);
        setCompletedStages(newCompletedStages);
        setShowProgressTracker(true);
        setIsLoading(false);
        return;
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(5);
      setShowProgressTracker(false);

      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      const hasCompletedStage2 = newCompletedStages.includes(2);
      if (!hasVisitedBefore && !hasCompletedStage2) {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageClick = (stageId) => {
    if (stageId === 2) {
      setShowFinanceModal(true);
    } else if (stageId === 3) {
      setShowTermsModal(true);
    } else if (stageId === 4) {
      setShowContinueModal(true);
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("hasVisitedDashboard", "true");
  };

  const handleCloseFinanceModal = () => {
    setShowFinanceModal(false);
    checkUserProgress();
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
    checkUserProgress();
  };

  const handleCloseContinueModal = () => {
    setShowContinueModal(false);
    checkUserProgress();
  };

  const getMeterStatusText = () => {
    if (meterStatus.loading) return "Checking meter status...";
    if (meterStatus.hasMeter === true) return "✓ Meters Fetched";
    if (meterStatus.hasMeter === false) return "⏳ Fetching Meters";
    return "Check Meter Status";
  };

  const getMeterStatusButtonClass = () => {
    if (meterStatus.loading) return "px-3 py-1 rounded-md border text-xs font-semibold font-sfpro transition-colors duration-200 border-gray-300 bg-gray-50 text-gray-700";
    if (meterStatus.hasMeter === true) return "px-3 py-1 rounded-md border text-xs font-semibold font-sfpro transition-colors duration-200 border-green-300 bg-green-50 text-green-700";
    if (meterStatus.hasMeter === false) return "px-3 py-1 rounded-md border text-xs font-semibold font-sfpro transition-colors duration-200 border-red-300 bg-red-50 text-red-700";
    return "px-3 py-1 rounded-md border text-xs font-semibold font-sfpro transition-colors duration-200 border-gray-300 bg-gray-50 text-gray-700";
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

      await checkUserProgress();
      await checkMeterStatus();
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (userData.userId) {
      const interval = setInterval(() => {
        checkMeterStatus();
      }, 300000);
      
      return () => clearInterval(interval);
    }
  }, [userData.userId]);

  if (isLoading) {
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
          <h1 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Dashboard Overview
          </h1>
        </div>
        
        {hasFacility && (
          <div className="flex items-center gap-2">
            {meterStatus.hasMeter === false && (
              <span className="text-xs text-gray-500">
                Meters usually fetch in 3-5 mins
              </span>
            )}
            <button
              onClick={checkMeterStatus}
              disabled={meterStatus.loading}
              className={getMeterStatusButtonClass()}
            >
              {getMeterStatusText()}
            </button>
          </div>
        )}
      </div>

      {showProgressTracker && !hasFacility && (
        <ProgressTracker 
          currentStage={currentStage} 
          onStageClick={handleStageClick}
        />
      )}
      <QuickActions onSectionChange={onSectionChange} />

      <hr className="border-gray-300" />

      <Graph />

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

      {showContinueModal && (
        <ContinueResidentialFacilityCreation
          isOpen={showContinueModal}
          onClose={handleCloseContinueModal}
        />
      )}
    </div>
  );
}