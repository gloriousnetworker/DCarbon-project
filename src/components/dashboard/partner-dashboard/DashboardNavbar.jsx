'use client';
import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [partnerType, setPartnerType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get userId and authToken from localStorage
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        
        if (!userId || !authToken) {
          // Fallback to partnerType in localStorage if userId or authToken is missing
          const storedPartnerType = localStorage.getItem('partnerType');
          if (storedPartnerType) {
            setPartnerType(storedPartnerType);
          }
          setIsLoading(false);
          return;
        }
        
        // Fetch user data from API
        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const responseData = await response.json();
        
        if (responseData.status === 'success' && responseData.data) {
          setPartnerType(responseData.data.partnerType);
          
          // Update localStorage with the latest partnerType
          localStorage.setItem('partnerType', responseData.data.partnerType);
        } else {
          // Fallback to localStorage if API doesn't return valid data
          const storedPartnerType = localStorage.getItem('partnerType');
          if (storedPartnerType) {
            setPartnerType(storedPartnerType);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Fallback to localStorage on error
        const storedPartnerType = localStorage.getItem('partnerType');
        if (storedPartnerType) {
          setPartnerType(storedPartnerType);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
 
  const getDisplayPartnerType = (type) => {
    switch(type) {
      case 'sales_agent': return 'Sales Agent';
      case 'finance_company': return 'Finance Company';
      case 'installer': return 'Installer';
      default: return 'Partner';
    }
  };
 
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger + Title + Partner Type */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-gray-700" size={20} />
          </button>
          <h1 className="font-[550] text-[16px] leading-[50%] tracking-[-0.05em] text-[#1E1E1E] font-sfpro text-center">
            {sectionDisplayMap[selectedSection]}
          </h1>
          {isLoading ? (
            <div className="bg-gray-200 text-gray-500 px-2 py-1.5 rounded-full text-[10px] font-medium font-sfpro">
              Loading...
            </div>
          ) : partnerType ? (
            <button className="bg-[#1E1E1E] text-white px-2 py-1.5 rounded-full text-[10px] font-medium font-sfpro">
              {getDisplayPartnerType(partnerType)}
            </button>
          ) : null}
        </div>
        {/* Center: Search Bar */}
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
        {/* Right: Notifications & Support */}
        <div className="flex items-center space-x-6">
          {/* Bell → routes to notifications section */}
          <button
            onClick={() => onSectionChange("notifications")}
            className="relative focus:outline-none"
          >
            <FaBell
              className={
                selectedSection === "notifications"
                  ? "text-[#039994]"
                  : "text-[#039994] hover:text-gray-600"
              }
              size={20}
            />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </button>
          {/* Support icon stays unchanged */}
          <FaHeadset className="text-[#039994]" size={20} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;