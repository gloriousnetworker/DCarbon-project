import React from "react";
import {
  FiHome,
  FiTrendingUp,
  FiLayers,
  FiCreditCard,
  FiUser,
  FiBell,
  FiHelpCircle,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";

import Logo from "../../../../public/dashboard_images/logo.png";
import SmallLogo from "../../../../public/dashboard_images/profile_image.png";

/**
 * Shared font styling for sidebar text
 * (SF Pro Text, weight 400, line-height 100%, letter-spacing: -5%)
 */
const baseTextStyle = {
  fontFamily: "SF Pro Text",
  fontWeight: 400,
  lineHeight: "100%",
  letterSpacing: "-0.05em",
};

/**
 * Returns the style object for menu text, switching color when active.
 */
const getTextStyle = (isActive) => ({
  ...baseTextStyle,
  color: isActive ? "#FFFFFF" : "#1E1E1E",
});

/**
 * Returns the color for the icon (brand color when inactive, white when active).
 */
const getIconColor = (isActive) => (isActive ? "#FFFFFF" : "#039994");

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
}) => {
  // Helper to check if a section is active
  const isActive = (section) => section === selectedSection;

  // Base classes for each menu item
  const baseItemClasses = `
    flex items-center gap-2
    px-4 py-2
    rounded-md w-full text-left
    transition-colors
    text-base md:text-sm
  `;

  // Classes for active vs. inactive states
  const activeClasses = "bg-[#039994]";
  const inactiveClasses = "hover:bg-gray-100";

  return (
    <aside
      className="
        bg-white w-64 min-h-screen flex flex-col border-r border-gray-200
        overflow-y-auto hide-scrollbar
      "
    >
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
        <h3
          className="text-xs md:text-sm font-semibold text-gray-500 tracking-wider uppercase"
          style={baseTextStyle}
        >
          DASHBOARD
        </h3>
      </div>

      {/* Dashboard Menu Items */}
      <nav className="flex-1 flex flex-col space-y-2 px-2">
        <button
          onClick={() => onSectionChange("overview")}
          className={`${baseItemClasses} ${
            isActive("overview") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("overview"))}
        >
          <FiHome size={16} color={getIconColor(isActive("overview"))} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onSectionChange("transaction")}
          className={`${baseItemClasses} ${
            isActive("transaction") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("transaction"))}
        >
          <FiTrendingUp size={16} color={getIconColor(isActive("transaction"))} />
          <span>REC Sales &amp; Report</span>
        </button>
        <button
          onClick={() => onSectionChange("residentialManagement")}
          className={`${baseItemClasses} ${
            isActive("residentialManagement") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("residentialManagement"))}
        >
          <FiLayers size={16} color={getIconColor(isActive("residentialManagement"))} />
          <span>Facility Management</span>
        </button>
        <button
          onClick={() => onSectionChange("requestPayment")}
          className={`${baseItemClasses} ${
            isActive("requestPayment") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("requestPayment"))}
        >
          <FiCreditCard size={16} color={getIconColor(isActive("requestPayment"))} />
          <span>Request Payment</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200 mx-4" />

      {/* SETTINGS heading */}
      <div className="px-4 mb-2">
        <h3
          className="text-xs md:text-sm font-semibold text-gray-500 tracking-wider uppercase"
          style={baseTextStyle}
        >
          SETTINGS
        </h3>
      </div>

      {/* Settings Items */}
      <nav className="flex-1 flex flex-col space-y-2 px-2">
        <button
          onClick={() => onSectionChange("myAccount")}
          className={`${baseItemClasses} ${
            isActive("myAccount") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("myAccount"))}
        >
          <FiUser size={16} color={getIconColor(isActive("myAccount"))} />
          <span>My Account</span>
        </button>
        <button
          onClick={() => onSectionChange("notifications")}
          className={`${baseItemClasses} ${
            isActive("notifications") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("notifications"))}
        >
          <FiBell size={16} color={getIconColor(isActive("notifications"))} />
          <span>Notification</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200 mx-4" />

      {/* SUPPORT heading */}
      <div className="px-4 mb-2">
        <h3
          className="text-xs md:text-sm font-semibold text-gray-500 tracking-wider uppercase"
          style={baseTextStyle}
        >
          SUPPORT
        </h3>
      </div>

      {/* Support Items */}
      <nav className="flex-1 flex flex-col space-y-2 px-2">
        <button
          onClick={() => onSectionChange("helpCenter")}
          className={`${baseItemClasses} ${
            isActive("helpCenter") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("helpCenter"))}
        >
          <FiHelpCircle size={16} color={getIconColor(isActive("helpCenter"))} />
          <span>Help Centre (FAQs)</span>
        </button>
        <button
          onClick={() => onSectionChange("contactSupport")}
          className={`${baseItemClasses} ${
            isActive("contactSupport") ? activeClasses : inactiveClasses
          }`}
          style={getTextStyle(isActive("contactSupport"))}
        >
          <FiHeadphones size={16} color={getIconColor(isActive("contactSupport"))} />
          <span>Contact Support</span>
        </button>
      </nav>

      {/* Divider */}
      <hr className="my-4 border-gray-200 mx-4" />

      {/* Bottom User Info & Logout */}
      <div className="px-4 flex flex-col items-start mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={SmallLogo.src}
            alt="User or small logo"
            className="w-8 h-8 rounded-full"
          />
          <span style={{ ...baseTextStyle, color: "#1E1E1E" }}>Hi, User</span>
        </div>
        <button
          onClick={() => onSectionChange("logout")}
          className={`${baseItemClasses} ${inactiveClasses}`}
          style={{ ...baseTextStyle, color: "#1E1E1E" }}
        >
          <FiLogOut size={16} color="#039994" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
