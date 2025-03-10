import React from "react";
import {
  FaHome,
  FaChartLine,
  FaBuilding,
  FaMoneyBill,
  FaUser,
  FaBell,
  FaQuestionCircle,
  FaHeadset,
  FaSignOutAlt,
} from "react-icons/fa";

import Logo from "../../../../public/dashboard_images/logo.png";
import SmallLogo from "../../../../public/dashboard_images/profile_image.png";

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
}) => {
  // Helper function to check if a section is active
  const isActive = (section) => section === selectedSection;

  // Base styling for menu items
  const baseItemClasses =
    "flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors w-full text-left";
  const activeClasses = "bg-[#039994] text-white";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  return (
    <aside className="bg-white w-64 min-h-screen flex flex-col border-r border-gray-200">
      {/* Mobile Close Button */}
      {toggleSidebar && (
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 text-2xl"
          >
            &times;
          </button>
        </div>
      )}

      {/* Logo at the top */}
      <div className="flex items-center p-4">
        <img src={Logo.src} alt="Company Logo" className="h-8 w-auto" />
      </div>

      {/* DASHBOARD heading */}
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
          DASHBOARD
        </h3>
      </div>

      {/* Dashboard Menu Items */}
      <nav className="flex-1 flex flex-col space-y-1 px-2">
        {/* Overview */}
        <button
          onClick={() => onSectionChange("overview")}
          className={`${baseItemClasses} ${
            isActive("overview") ? activeClasses : inactiveClasses
          }`}
        >
          <FaHome
            size={16}
            className={`${
              isActive("overview") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>Overview</span>
        </button>

        {/* REC Sales & Report -> 'transaction' */}
        <button
          onClick={() => onSectionChange("transaction")}
          className={`${baseItemClasses} ${
            isActive("transaction") ? activeClasses : inactiveClasses
          }`}
        >
          <FaChartLine
            size={16}
            className={`${
              isActive("transaction") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>REC Sales &amp; Report</span>
        </button>

        {/* Facility Management -> 'residentialManagement' */}
        <button
          onClick={() => onSectionChange("residentialManagement")}
          className={`${baseItemClasses} ${
            isActive("residentialManagement") ? activeClasses : inactiveClasses
          }`}
        >
          <FaBuilding
            size={16}
            className={`${
              isActive("residentialManagement")
                ? "text-white"
                : "text-[#039994]"
            }`}
          />
          <span>Facility Management</span>
        </button>

        {/* Request Payment */}
        <button
          onClick={() => onSectionChange("requestPayment")}
          className={`${baseItemClasses} ${
            isActive("requestPayment") ? activeClasses : inactiveClasses
          }`}
        >
          <FaMoneyBill
            size={16}
            className={`${
              isActive("requestPayment") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>Request Payment</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* SETTINGS heading */}
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
          SETTINGS
        </h3>
      </div>

      {/* Settings Items */}
      <nav className="flex-1 flex flex-col space-y-1 px-2">
        {/* My Account */}
        <button
          onClick={() => onSectionChange("myAccount")}
          className={`${baseItemClasses} ${
            isActive("myAccount") ? activeClasses : inactiveClasses
          }`}
        >
          <FaUser
            size={16}
            className={`${
              isActive("myAccount") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>My Account</span>
        </button>

        {/* Notification */}
        <button
          onClick={() => onSectionChange("notifications")}
          className={`${baseItemClasses} ${
            isActive("notifications") ? activeClasses : inactiveClasses
          }`}
        >
          <FaBell
            size={16}
            className={`${
              isActive("notifications") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>Notification</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* SUPPORT heading */}
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
          SUPPORT
        </h3>
      </div>

      {/* Support Items */}
      <nav className="flex-1 flex flex-col space-y-1 px-2">
        {/* Help Centre (FAQs) */}
        <button
          onClick={() => onSectionChange("helpCenter")}
          className={`${baseItemClasses} ${
            isActive("helpCenter") ? activeClasses : inactiveClasses
          }`}
        >
          <FaQuestionCircle
            size={16}
            className={`${
              isActive("helpCenter") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>Help Centre (FAQs)</span>
        </button>

        {/* Contact Support */}
        <button
          onClick={() => onSectionChange("contactSupport")}
          className={`${baseItemClasses} ${
            isActive("contactSupport") ? activeClasses : inactiveClasses
          }`}
        >
          <FaHeadset
            size={16}
            className={`${
              isActive("contactSupport") ? "text-white" : "text-[#039994]"
            }`}
          />
          <span>Contact Support</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* Bottom User Info & Logout */}
      <div className="px-4 flex flex-col items-start mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={SmallLogo.src}
            alt="User or small logo"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-600 text-sm">Hi, User</span>
        </div>
        <button
          onClick={() => onSectionChange("logout")}
          className={`${baseItemClasses} mt-3 ${inactiveClasses}`}
        >
          <FaSignOutAlt className="text-[#039994]" size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
