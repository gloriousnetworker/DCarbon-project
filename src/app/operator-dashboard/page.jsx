"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed z-10">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col relative z-0">
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
          onSectionChange={handleSectionChange}
        />

        {sidebarOpen && (
          <div className="fixed inset-0 z-[9000] flex md:hidden">
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