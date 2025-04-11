"use client";

import React, { useState } from 'react';
import DashboardSidebar from '../../components/dashboard/commercial-dashboard/DashboardSidebar';
import DashboardNavbar from '../../components/dashboard/commercial-dashboard/DashboardNavbar';
import DashboardOverview from '../../components/dashboard/commercial-dashboard/overview/DashboardOverview';
import GeneratorManagement from '../../components/dashboard/commercial-dashboard/facility-management/FacilityManagement';
import Report from '../../components/dashboard/commercial-dashboard/rec-sales-and-report/RECSalesAndReport';
import PendingActions from '../../components/dashboard/commercial-dashboard/payouts/Payouts';
import DashboardContactSupport from '../../components/dashboard/commercial-dashboard/ContactSupport';
import DashboardHelpCentre from '../../components/dashboard/commercial-dashboard/HelpCentre';
import DashboardNotifications from '../../components/dashboard/commercial-dashboard/Notifications';
import DashboardLogout from '../../components/dashboard/commercial-dashboard/Logout';
import MyAccount from '../../components/dashboard/commercial-dashboard/account/MyAccount';

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
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
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      {/* Main Area */}
      <div className="md:ml-64 flex-1 flex flex-col">
        {/* Top Navbar with dynamic title */}
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
        />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
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

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            <SectionComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
