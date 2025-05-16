import React, { useState, useEffect } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset, FaCircle } from "react-icons/fa";

const DashboardNavbar = ({ 
  toggleSidebar, 
  selectedSection, 
  sectionDisplayMap,
  onSectionChange
}) => {
  const [authStatus, setAuthStatus] = useState(null);
  
  useEffect(() => {
    // Function to load utility provider request from localStorage
    const loadAuthStatus = () => {
      try {
        const storedData = localStorage.getItem('utilityProviderRequest');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAuthStatus(parsedData.status);
        }
      } catch (error) {
        console.error('Error loading utility provider request:', error);
      }
    };
    
    // Load initially
    loadAuthStatus();
    
    // Set up interval to check for status changes
    const intervalId = setInterval(loadAuthStatus, 5000); // Check every 5 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-500';
      case 'APPROVED':
        return 'text-green-500';
      case 'REJECTED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Determine status text
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        {/* Left side: Hamburger (mobile) + current section title */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-gray-700" size={20} />
          </button>
          <h1 className="font-[550] text-[16px] leading-[50%] tracking-[-0.05em] text-[#1E1E1E] font-sfpro text-center">
            {sectionDisplayMap[selectedSection]}
          </h1>
        </div>
        
        {/* Middle: Search bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <div className="bg-[#039994] h-full px-3 flex items-center justify-center rounded-l-md">
                <FaSearch className="text-white" size={14} />
              </div>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
        </div>
        
        {/* Right side: Auth Status, Notification & Support icons */}
        <div className="flex items-center space-x-6">
          {authStatus && (
            <div className="flex items-center space-x-2">
              <FaCircle className={getStatusColor(authStatus)} size={10} />
              <span className="text-sm font-medium">
                Utility Auth: {getStatusText(authStatus)}
              </span>
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => onSectionChange("notifications")}
              className="focus:outline-none"
            >
              <FaBell className="text-[#039994]" size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
          
          <button 
            onClick={() => onSectionChange("contactSupport")}
            className="focus:outline-none"
          >
            <FaHeadset className="text-[#039994]" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;