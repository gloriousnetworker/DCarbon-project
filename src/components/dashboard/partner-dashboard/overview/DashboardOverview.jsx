import React from "react";
import TopStats from "./TopStats";
import ReferredCustomersChart from "./ReferredCustomersChart";
import CommissionChart from "./CommissionChart";
import CustomerRangeCard from "./CustomerRangeCard";
import PendingCustomerRegCard from "./PendingCustomerRegCard";
import WorkProgressCard from "./WorkProgressCard";

export default function DashboardOverview() {
  return (
    <div className="w-full min-h-screen bg-[#D9D9D9] p-4 space-y-8">
      {/* Top row of cards */}
      <TopStats />

      {/* Two graphs side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReferredCustomersChart />
        <CommissionChart />
      </div>

      {/* Bottom row of info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CustomerRangeCard />
        <PendingCustomerRegCard />
        <WorkProgressCard />
      </div>
    </div>
  );
}
