import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const firstName = localStorage.getItem("userFirstName") || "User";
      
      setUserData({
        userFirstName: firstName,
      });

      // Check if this is a first-time user
      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      if (!hasVisitedBefore) {
        setIsFirstTimeUser(true);
        // Show welcome modal after a short delay
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    };

    loadUserData();
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Mark that user has visited the dashboard
    localStorage.setItem("hasVisitedDashboard", "true");
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
  };

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Header Section */}
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

      {/* Welcome Modal - only show for first-time users */}
      {showWelcomeModal && isFirstTimeUser && (
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