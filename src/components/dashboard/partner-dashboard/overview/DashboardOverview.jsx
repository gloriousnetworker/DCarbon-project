import React from "react";
import QuickActions from "./QuickActions";
import Graph from "./Graph";
import RecentRecSales from "./CustomerCards";

export default function DashboardOverview({ onSectionChange }) {
  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      <QuickActions />
      <hr className="border-gray-300" />
      <Graph />
      <hr className="border-gray-300" />
      <RecentRecSales onSectionChange={onSectionChange} />
    </div>
  );
}