'use client';

import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiTrendingUp,
  FiUser,
  FiBell,
  FiHelpCircle,
  FiHeadphones,
  FiLogOut,
  FiUpload,
} from "react-icons/fi";
import { FiZap } from "react-icons/fi";
import Image from "next/image";
import { useProfile } from "../contexts/ProfileContext";
import { toast } from 'react-hot-toast';
import * as styles from './styles';

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
  hasPendingActions = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [notificationCheckInterval, setNotificationCheckInterval] = useState(null);
  const [userData, setUserData] = useState({ firstName: "", lastName: "", profilePicture: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const { profile, updateProfile } = useProfile();

  const fetchNotifications = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/notifications/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const unreadNotifications = result.data.filter(notification => !notification.isRead);
          const unreadCount = unreadNotifications.length;
          setUnreadCount(unreadCount);
          setShowNotificationDot(unreadCount > 0);
          
          localStorage.setItem('notifications', JSON.stringify(result.data));
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getUserDataFromLocalStorage = () => {
    // FIXED: Don't update form data if user is currently editing
    if (editMode) return;
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const user = loginResponse?.data?.user;
      
      if (user) {
        setUserData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          profilePicture: user.profilePicture || null
        });
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || ""
        });
      }
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
    }
  };

  const handleProfilePictureClick = () => {
    setShowProfileModal(true);
    setEditMode(false);
    setModalPosition({ x: 0, y: 0 });
  };

  const handleNameClick = () => {
    setShowProfileModal(true);
    setEditMode(false);
    setModalPosition({ x: 0, y: 0 });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('Authentication data not found');
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/upload-profile-picture/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        const updatedLoginResponse = {
          ...loginResponse,
          data: {
            ...loginResponse.data,
            user: {
              ...loginResponse.data.user,
              profilePicture: result.data.profilePicture
            }
          }
        };
        
        localStorage.setItem('loginResponse', JSON.stringify(updatedLoginResponse));
        
        setUserData(prev => ({
          ...prev,
          profilePicture: result.data.profilePicture
        }));
        
        await updateProfile();
        
        toast.success('Profile picture updated successfully');
      } else {
        throw new Error(result.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setUpdating(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        const updatedLoginResponse = {
          ...loginResponse,
          data: {
            ...loginResponse.data,
            user: {
              ...loginResponse.data.user,
              firstName: result.data.firstName,
              lastName: result.data.lastName
            }
          }
        };
        
        localStorage.setItem('loginResponse', JSON.stringify(updatedLoginResponse));
        
        setUserData(prev => ({
          ...prev,
          firstName: result.data.firstName,
          lastName: result.data.lastName
        }));
        
        await updateProfile();
        
        setEditMode(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setModalPosition(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFirstNameChange = (e) => {
    setFormData(prev => ({ ...prev, firstName: e.target.value }));
  };

  const handleLastNameChange = (e) => {
    setFormData(prev => ({ ...prev, lastName: e.target.value }));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const flashNotificationDot = () => {
    let flashCount = 0;
    const maxFlashes = 3;
    const interval = setInterval(() => {
      setShowNotificationDot((prev) => !prev);
      flashCount++;
      if (flashCount >= maxFlashes * 2) {
        clearInterval(interval);
        setShowNotificationDot(true);
      }
    }, 300);
  };

  useEffect(() => {
    setIsClient(true);
    
    getUserDataFromLocalStorage();
    fetchNotifications();
    
    const notificationInterval = setInterval(fetchNotifications, 30000);
    setNotificationCheckInterval(notificationInterval);

    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        const notifications = JSON.parse(e.newValue || '[]');
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setShowNotificationDot(unread > 0);
        if (unread > unreadCount) flashNotificationDot();
      }
      if (e.key === "loginResponse") {
        getUserDataFromLocalStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // FIXED: Only check for updates when modal is not open or user is not editing
    const checkLoginResponseInterval = setInterval(() => {
      if (!showProfileModal || !editMode) {
        getUserDataFromLocalStorage();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
      }
      clearInterval(checkLoginResponseInterval);
    };
  }, [showProfileModal, editMode]);

  const isActive = (section) => section === selectedSection;

  const sidebarContainer = 'bg-white w-64 min-h-screen flex flex-col border-r border-gray-200 overflow-y-auto hide-scrollbar';
  const sidebarSection = 'px-4 py-2';
  const sidebarDivider = 'my-2 border-gray-200 mx-4';
  const sectionHeading = 'text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase';
  
  const menuItemBase = 'flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro';
  const menuItemActive = 'bg-[#039994] text-white';
  const menuItemInactive = 'text-[#1E1E1E] hover:bg-gray-100';
  const iconBase = 'w-4 h-4';
  
  const userInfoContainer = 'px-4 py-3 flex flex-col items-start';
  const userProfile = 'flex items-center space-x-3 mb-3';
  const greetingText = 'text-[#1E1E1E] font-sfpro text-sm';
  const userName = 'text-[#1E1E1E] font-sfpro text-sm font-semibold cursor-pointer hover:text-[#039994] transition-colors';
  const activeDot = 'w-2 h-2 rounded-full bg-[#039994] ml-2';

  if (!isClient) {
    return (
      <aside className={sidebarContainer}>
        <div className="flex justify-center p-4">
          <div className="h-8 w-[120px] bg-gray-200 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className={sidebarContainer}>
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

        <div className="flex justify-center p-4">
          <Image 
            src="/dashboard_images/logo.png"
            alt="Company Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        <div className={sidebarSection}>
          <h3 className={sectionHeading}>DASHBOARD</h3>
        </div>

        <nav className="flex-1 flex flex-col space-y-1 px-2">
          <button
            onClick={() => onSectionChange("overview")}
            className={`${menuItemBase} ${
              isActive("overview") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiHome className={iconBase} color={isActive("overview") ? "#FFFFFF" : "#039994"} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => onSectionChange("generatorManagement")}
            className={`${menuItemBase} ${
              isActive("generatorManagement") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiZap className={iconBase} color={isActive("generatorManagement") ? "#FFFFFF" : "#039994"} />
            <span>Generator Management</span>
          </button>
          <button
            onClick={() => onSectionChange("report")}
            className={`${menuItemBase} ${
              isActive("report") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiTrendingUp className={iconBase} color={isActive("report") ? "#FFFFFF" : "#039994"} />
            <span>Report</span>
          </button>
        </nav>

        <hr className={sidebarDivider} />

        <div className={sidebarSection}>
          <h3 className={sectionHeading}>SETTINGS</h3>
        </div>

        <nav className="flex-1 flex flex-col space-y-1 px-2">
          <button
            onClick={() => onSectionChange("myAccount")}
            className={`${menuItemBase} ${
              isActive("myAccount") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiUser className={iconBase} color={isActive("myAccount") ? "#FFFFFF" : "#039994"} />
            <span>Account</span>
          </button>
          <button
            onClick={() => onSectionChange("notifications")}
            className={`${menuItemBase} ${
              isActive("notifications") ? menuItemActive : menuItemInactive
            } relative`}
          >
            <FiBell className={iconBase} color={isActive("notifications") ? "#FFFFFF" : "#039994"} />
            <span>Notification</span>
            {showNotificationDot && unreadCount > 0 && (
              <>
                <span className="absolute top-2 left-6 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute top-2 left-6 h-2 w-2 rounded-full bg-red-500" />
                <span className="absolute top-1 left-5 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              </>
            )}
          </button>
        </nav>

        <hr className={sidebarDivider} />

        <div className={sidebarSection}>
          <h3 className={sectionHeading}>SUPPORT</h3>
        </div>

        <nav className="flex-1 flex flex-col space-y-1 px-2">
          <button
            onClick={() => onSectionChange("helpCenter")}
            className={`${menuItemBase} ${
              isActive("helpCenter") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiHelpCircle className={iconBase} color={isActive("helpCenter") ? "#FFFFFF" : "#039994"} />
            <span>Help & Tutorials</span>
          </button>
          <button
            onClick={() => onSectionChange("contactSupport")}
            className={`${menuItemBase} ${
              isActive("contactSupport") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiHeadphones className={iconBase} color={isActive("contactSupport") ? "#FFFFFF" : "#039994"} />
            <span>Contact Support</span>
          </button>
        </nav>

        <hr className={sidebarDivider} />

        <div className={userInfoContainer}>
          <div className={userProfile}>
            <div 
              className="w-8 h-8 rounded-full overflow-hidden relative cursor-pointer"
              onClick={handleProfilePictureClick}
            >
              {userData.profilePicture ? (
                <Image
                  src={userData.profilePicture}
                  alt="User profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/dashboard_images/profile_image.png';
                  }}
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <span className={greetingText}>Hi, </span>
              <span 
                className={userName}
                onClick={handleNameClick}
              >
                {userData.firstName || "User"}
              </span>
              <span className={activeDot}></span>
            </div>
          </div>
          <button
            onClick={() => onSectionChange("logout")}
            className={`${menuItemBase} ${
              isActive("logout") ? menuItemActive : menuItemInactive
            }`}
          >
            <FiLogOut className={iconBase} color={isActive("logout") ? "#FFFFFF" : "#039994"} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* FIXED: Increased z-index to 9999 to appear above all components */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div 
            className="bg-white rounded-2xl p-8 w-96 shadow-xl relative"
            style={{
              transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
              cursor: isDragging ? 'grabbing' : 'auto'
            }}
          >
            <div 
              className="flex justify-between items-center mb-6 cursor-move"
              onMouseDown={handleMouseDown}
            >
              <h3 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
                Profile Settings
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-[#039994]">
                    {userData.profilePicture ? (
                      <Image
                        src={userData.profilePicture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/dashboard_images/profile_image.png';
                        }}
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="text-gray-500 text-2xl" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-[#039994] text-white p-2 rounded-full cursor-pointer hover:bg-[#02857f] transition-colors">
                    <FiUpload className="w-4 h-4" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploading && (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-5 h-5 border-2 border-[#039994] border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className={styles.labelClass}>Personal Information</h4>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-[#039994] hover:text-[#02857f] text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          firstName: userData.firstName,
                          lastName: userData.lastName
                        });
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className={styles.rowWrapper}>
                  <div className={styles.halfWidth}>
                    <label className={styles.labelClass}>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={handleFirstNameChange}
                      className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                      readOnly={!editMode}
                      style={{ backgroundColor: editMode ? '#F0F0F0' : '#FFFFFF', cursor: editMode ? 'text' : 'not-allowed' }}
                    />
                  </div>
                  <div className={styles.halfWidth}>
                    <label className={styles.labelClass}>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={handleLastNameChange}
                      className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                      readOnly={!editMode}
                      style={{ backgroundColor: editMode ? '#F0F0F0' : '#FFFFFF', cursor: editMode ? 'text' : 'not-allowed' }}
                    />
                  </div>
                </div>

                {editMode && (
                  <button
                    onClick={handleNameUpdate}
                    disabled={updating || !formData.firstName.trim() || !formData.lastName.trim()}
                    className={`${styles.buttonPrimary} ${(updating || !formData.firstName.trim() || !formData.lastName.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updating ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;