'use client';

import { Toaster } from 'react-hot-toast';
import { ProfileProvider } from '../components/dashboard/contexts/ProfileContext';

export default function Providers({ children }) {
  return (
    <ProfileProvider>
      <Toaster position="top-center" />
      {children}
    </ProfileProvider>
  );
}
