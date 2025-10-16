"use client";

import React, { useState } from 'react';
import DashboardSidebar from '../../components/dashboard/partner-dashboard/DashboardSidebar';
import DashboardNavbar from '../../components/dashboard/partner-dashboard/DashboardNavbar';
import DashboardOverview from '../../components/dashboard/partner-dashboard/overview/DashboardOverview';
import Reporting from '../../components/dashboard/partner-dashboard/reporting/Reporting';
import CustomerManagement from '../../components/dashboard/partner-dashboard/customer-management/CustomerManagement';
import DashboardContactSupport from '../../components/dashboard/partner-dashboard/ContactSupport';
import DashboardHelpCentre from '../../components/dashboard/partner-dashboard/HelpCentre';
import DashboardNotifications from '../../components/dashboard/partner-dashboard/Notifications';
import DashboardLogout from '../../components/dashboard/partner-dashboard/Logout';
import MyAccount from '../../components/dashboard/partner-dashboard/account/MyAccount';

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleNavigateToOverview = () => {
    setActiveSection('overview');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sectionDisplayMap = {
    overview: 'Overview',
    reporting: 'Reporting',
    customerManagement: 'Partner Management',
    myAccount: 'My Account',
    notifications: 'Notification',
    helpCenter: 'Help & Tutorials',
    contactSupport: 'Contact Support',
    logout: 'Log Out',
  };

  let SectionComponent;
  switch (activeSection) {
    case 'overview':
      SectionComponent = DashboardOverview;
      break;
    case 'reporting':
      SectionComponent = Reporting;
      break;
    case 'customerManagement':
      SectionComponent = CustomerManagement;
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col">
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
          onSectionChange={handleSectionChange}
        />

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleSidebar}
            />
            <div className="relative bg-white w-64 h-full shadow-md">
              <DashboardSidebar
                selectedSection={activeSection}
                onSectionChange={handleSectionChange}
                toggleSidebar={toggleSidebar}
              />
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            {activeSection === 'logout' ? (
              <DashboardLogout 
                onNavigateToOverview={handleNavigateToOverview}
              />
            ) : (
              <SectionComponent onSectionChange={handleSectionChange} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}