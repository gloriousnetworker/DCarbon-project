import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);

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
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
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