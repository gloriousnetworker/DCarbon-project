"use client";

import React, { useState } from 'react';
import DashboardSidebar from '../../components/dashboard/operator-dashboard/DashboardSidebar';
import DashboardNavbar from '../../components/dashboard/operator-dashboard/DashboardNavbar';
import DashboardOverview from '../../components/dashboard/operator-dashboard/overview/DashboardOverview';
import GeneratorManagement from '../../components/dashboard/operator-dashboard/facility-management/FacilityManagement';
import Report from '../../components/dashboard/operator-dashboard/rec-sales-and-report/GeneratorMonthlyReport';
import PendingActions from '../../components/dashboard/operator-dashboard/payouts/Payouts';
import DashboardContactSupport from '../../components/dashboard/operator-dashboard/ContactSupport';
import DashboardHelpCentre from '../../components/dashboard/operator-dashboard/HelpCentre';
import DashboardNotifications from '../../components/dashboard/operator-dashboard/Notifications';
import DashboardLogout from '../../components/dashboard/operator-dashboard/Logout';
import MyAccount from '../../components/dashboard/operator-dashboard/account/MyAccount';

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  };

  const handleNavigateToOverview = () => {
    setActiveSection('overview');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mapping from section keys to display text for the navbar
  const sectionDisplayMap = {
    overview: 'Overview',
    generatorManagement: 'Generator Management',
    report: 'Report',
    pendingActions: 'Pending Actions',
    myAccount: 'My Account',
    notifications: 'Notification',
    helpCenter: 'Help Centre (FAQs)',
    contactSupport: 'Contact Support',
    logout: 'Log Out',
  };

  let SectionComponent;
  switch (activeSection) {
    case 'overview':
      SectionComponent = DashboardOverview;
      break;
    case 'generatorManagement':
      SectionComponent = GeneratorManagement;
      break;
    case 'report':
      SectionComponent = Report;
      break;
    case 'pendingActions':
      SectionComponent = PendingActions;
      break;
    case 'myAccount':
      SectionComponent = MyAccount;
      break;
    case 'notifications':
      SectionComponent = DashboardNotifications;
      break;
    case 'helpCenter':
      SectionComponent = DashboardHelpCentre;
      break;
    case 'contactSupport':
      SectionComponent = DashboardContactSupport;
      break;
    case 'logout':
      SectionComponent = DashboardLogout;
      break;
    default:
      SectionComponent = DashboardOverview;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Desktop Sidebar - FIXED: Added z-index for proper layering */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed z-10">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      {/* Main Area */}
      <div className="md:ml-64 flex-1 flex flex-col relative z-0">
        {/* Top Navbar with dynamic title */}
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
          onSectionChange={handleSectionChange}
        />

        {/* Mobile Sidebar Overlay - FIXED: Lower z-index than profile modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[9000] flex md:hidden">
            {/* Overlay backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleSidebar}
            />
            {/* Sidebar itself */}
            <div className="relative bg-white w-64 h-full shadow-md">
              <DashboardSidebar
                selectedSection={activeSection}
                onSectionChange={handleSectionChange}
                toggleSidebar={toggleSidebar}
              />
            </div>
          </div>
        )}

        {/* Main Content - FIXED: Lower z-index than modals */}
        <main className="flex-1 relative z-0">
          <div className="max-w-7xl mx-auto p-6">
            {activeSection === 'logout' ? (
              <DashboardLogout 
                onNavigateToOverview={handleNavigateToOverview}
              />
            ) : (
              <SectionComponent />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}