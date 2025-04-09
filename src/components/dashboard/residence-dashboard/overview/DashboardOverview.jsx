import React from "react";
import QuickAction from "./QuickAction";
import Graphs from "./Graphs";
import RecentTransactions from "./RecentTransactions";

const DashboardOverviewResidence = () => {
  return (
    <div className="w-full space-y-8">
      <QuickAction />
      <hr className="border-gray-300" />
      
      {/* Graphs will now span full width */}
      <Graphs />
      
      <hr className="border-gray-300" />
      
      {/* Recent Transactions will now span full width */}
      <RecentTransactions />
    </div>
  );
};

export default DashboardOverviewResidence;
