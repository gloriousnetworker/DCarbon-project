import React, { useState } from "react";
import CustomerReport from "./CustomerReport";
import GenerationReport from "./GenerationReport";
import CommissionStatement from "./CommissionStatement";

export default function ReportContainer() {
  const [currentReport, setCurrentReport] = useState("customer");

  const handleNavigation = (reportType) => {
    setCurrentReport(reportType);
  };

  const renderCurrentReport = () => {
    switch (currentReport) {
      case "customer":
        return <CustomerReport onNavigate={handleNavigation} />;
      case "generation":
        return <GenerationReport onNavigate={handleNavigation} />;
      case "commission":
        return <CommissionStatement onNavigate={handleNavigation} />;
      default:
        return <CustomerReport onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentReport()}
    </div>
  );
}