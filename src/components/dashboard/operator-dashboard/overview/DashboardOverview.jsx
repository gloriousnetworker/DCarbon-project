import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';
import axios from "axios";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
// const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });

export default function DashboardOverview() {
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const firstName = loginResponse?.data?.user?.firstName || "User";
      const userId = loginResponse?.data?.user?.id || "";
      
      setUserData({
        userFirstName: firstName,
        userId: userId
      });
    };

    loadUserData();
  }, []);

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
          <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Quick Action
          </h1>
        </div>
      </div>

      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      {/* <RecentRecSales /> */}
    </div>
  );
}