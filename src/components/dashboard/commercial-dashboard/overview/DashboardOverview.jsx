import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';
import CommercialRegistrationModal from "./modals/createfacility/CommercialRegistrationModal";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });

const ProgressTracker = ({ currentStage, nextStage, onStageClick, hasFacility }) => {
  const stages = [
    { id: 1, name: "App Registration", tooltip: "Account creation completed" },
    { id: 2, name: "Solar Install Details", tooltip: "Owner details and address completed" },
    { id: 3, name: "DCarbon Service Agreements", tooltip: "Terms and conditions signed" },
    { id: 4, name: "Utility Authorization", tooltip: "Financial information submitted" },
    { id: 5, name: "Utility Meter Selection", tooltip: "Utility meters connected" }
  ];

  const currentDisplayStage = currentStage > 5 ? 5 : currentStage;

  const handleClick = (stageId) => {
    if ((stageId <= currentStage || stageId === nextStage) && (!hasFacility || stageId === 5)) {
      onStageClick(stageId);
    }
  };

  const isClickable = (stageId) => {
    return (stageId <= currentStage || stageId === nextStage) && (!hasFacility || stageId === 5);
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
                  stage.id < currentDisplayStage ? "bg-[#039994] text-white" : 
                  stage.id === currentDisplayStage ? "bg-[#039994] text-white" : 
                  stage.id === nextStage ? "border-2 border-[#039994] bg-white text-gray-600" : "bg-gray-200 text-gray-600"
                } ${isClickable(stage.id) ? 'hover:bg-[#028a85]' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  stage.id <= currentDisplayStage ? "text-[#039994] font-medium" : "text-gray-500"
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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);
  const [clickedStage, setClickedStage] = useState(1);
  const [showProgressTracker, setShowProgressTracker] = useState(true);
  const [hasFacility, setHasFacility] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Owner');
  const [commercialData, setCommercialData] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [showRoleChangeSection, setShowRoleChangeSection] = useState(false);

  const checkUserFacilities = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.facilities?.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkStage2Completion = async (userId, authToken) => {
    try {
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
      return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
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

  const checkStage5Completion = async (userId, authToken) => {
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

  const fetchCommercialData = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      if (userId && authToken) {
        const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCommercialData(data.data);
          
          if (data.data?.commercialUser?.commercialRole === 'owner') {
            setSelectedRole('Owner');
          } else if (data.data?.commercialUser?.commercialRole === 'both') {
            setSelectedRole('Owner & Operator');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching commercial data:', error);
    }
  };

  const checkUserProgress = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const facilityCheck = await checkUserFacilities(userId, authToken);
      setHasFacility(facilityCheck);

      const stageChecks = [
        { stage: 2, check: () => checkStage2Completion(userId, authToken) },
        { stage: 3, check: () => checkStage3Completion(userId, authToken) },
        { stage: 4, check: () => checkStage4Completion(userId, authToken) },
        { stage: 5, check: () => checkStage5Completion(userId, authToken) }
      ];

      let highestCompletedStage = 1;

      for (const { stage, check } of stageChecks) {
        const isCompleted = await check();
        if (isCompleted) {
          highestCompletedStage = stage;
        }
      }

      const newStage = highestCompletedStage === 5 ? 5 : highestCompletedStage;
      const newNextStage = highestCompletedStage === 5 ? 5 : highestCompletedStage + 1;
      
      setCurrentStage(newStage);
      setNextStage(newNextStage);
      setShowProgressTracker(highestCompletedStage < 5);
      setShowRoleChangeSection(highestCompletedStage >= 4);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

  const updateCommercialRole = async () => {
    try {
      setUpdatingRole(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const commercialUserResponse = await fetch(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const commercialUserData = await commercialUserResponse.json();
      const entityType = commercialUserData.data?.commercialUser?.entityType || 'individual';

      const payload = {
        entityType,
        commercialRole: selectedRole === 'Owner' ? 'owner' : 'both'
      };

      const updateResponse = await fetch(
        `https://services.dcarbon.solutions/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await updateResponse.json();
      if (result.status === 'success') {
        toast.success('Commercial role updated successfully!');
        setShowRoleDropdown(false);
        await fetchCommercialData();
        await checkUserProgress();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating commercial role:', error);
      toast.error('Failed to update commercial role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleStageClick = (stageId) => {
    setClickedStage(stageId);
    setShowRegistrationModal(true);
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
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
        setIsFirstTimeUser(true);
      }

      await checkCommercialUserStatus(userId);
      await fetchCommercialData();
      await checkUserProgress();
    };

    loadUserData();
  }, []);

  const checkCommercialUserStatus = async (userId) => {
    if (!userId) return;
    
    setIsCheckingCommercialStatus(true);
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const authToken = loginResponse?.data?.token;

      if (!authToken) {
        throw new Error('Authentication data not found');
      }

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
    } catch (error) {
      console.error('Error checking commercial status:', error);
      setShowWelcomeModal(true);
    } finally {
      setIsCheckingCommercialStatus(false);
    }
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

  const getCurrentRoleDisplay = () => {
    if (!commercialData?.commercialUser?.commercialRole) return '';
    const role = commercialData.commercialUser.commercialRole;
    if (role === 'both') return 'Owner & Operator';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleSaveRoleChange = () => {
    const currentRole = commercialData?.commercialUser?.commercialRole;
    const newRole = selectedRole === 'Owner' ? 'owner' : 'both';
    
    if (currentRole === newRole) {
      toast.info('No changes made to commercial role');
      setShowRoleDropdown(false);
      return;
    }
    
    updateCommercialRole();
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
    <div className="w-full min-h-screen space-y-8 p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Quick Action
          </h1>
        </div>
        
        {showRoleChangeSection && (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#039994] rounded-md text-[#039994] hover:bg-gray-50 font-sfpro text-[14px] font-[600]"
            >
              <span>Change Commercial Role</span>
              <svg
                className={`w-4 h-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-sfpro font-[600] text-[14px] text-gray-800">
                      Current Role
                    </h3>
                    <button
                      onClick={() => setShowRoleDropdown(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="font-sfpro text-[12px] text-gray-600">
                    {getCurrentRoleDisplay()}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 pr-3">
                      <div className="font-sfpro font-[600] text-[14px] text-[#1E1E1E] mb-1">
                        Owner
                      </div>
                      <div className="font-sfpro text-[12px] text-[#626060]">
                        Register as a facility owner only
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="roleChange"
                      value="Owner"
                      checked={selectedRole === 'Owner'}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 pr-3">
                      <div className="font-sfpro font-[600] text-[14px] text-[#1E1E1E] mb-1">
                        Owner & Operator
                      </div>
                      <div className="font-sfpro text-[12px] text-[#626060]">
                        Register as both owner and operator
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="roleChange"
                      value="Owner & Operator"
                      checked={selectedRole === 'Owner & Operator'}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSaveRoleChange}
                  disabled={updatingRole}
                  className={`w-full rounded-md text-white font-semibold py-2 font-sfpro text-[14px] ${
                    updatingRole
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#039994] hover:bg-[#02857f]'
                  }`}
                >
                  {updatingRole ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showProgressTracker && (
        <ProgressTracker 
          currentStage={currentStage} 
          nextStage={nextStage} 
          onStageClick={handleStageClick}
          hasFacility={hasFacility}
        />
      )}
      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      <RecentRecSales />

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100]">
          <WelcomeModal 
            isOpen 
            onClose={handleCloseWelcomeModal}
            userData={userData}
          />
        </div>
      )}

      {showAddUtilityModal && (
        <div className="fixed inset-0 z-[100]">
          <AddUtilityProvider 
            isOpen={showAddUtilityModal}
            onClose={handleCloseAddUtilityModal}
          />
        </div>
      )}

      {showRegistrationModal && (
        <div className="fixed inset-0 z-[100]">
          <CommercialRegistrationModal
            isOpen={showRegistrationModal}
            onClose={handleCloseRegistrationModal}
            currentStep={clickedStage}
          />
        </div>
      )}
    </div>
  );
}