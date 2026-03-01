// app/contexts/ProfileContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from "../../../../lib/config";

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

      const response = await axiosInstance({
        method: 'GET',
        url: `/api/user/get-one-user/${userId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) throw new Error('Failed to fetch user data');

      const data = response.data;
      
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