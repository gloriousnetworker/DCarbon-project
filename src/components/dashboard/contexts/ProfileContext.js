// app/contexts/ProfileContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    picture: null,
    firstName: 'User'
  });

  const updateProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) return;

      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/get-one-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch user data');

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        const newProfile = {
          picture: data.data.profilePicture || null,
          firstName: data.data.firstName || 'User'
        };
        setProfile(newProfile);
        localStorage.setItem('userProfilePicture', newProfile.picture || '');
        localStorage.setItem('userFirstName', newProfile.firstName);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to localStorage
      const storedPic = localStorage.getItem('userProfilePicture');
      const storedName = localStorage.getItem('userFirstName');
      if (storedPic || storedName) {
        setProfile({
          picture: storedPic || null,
          firstName: storedName || 'User'
        });
      }
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    updateProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);