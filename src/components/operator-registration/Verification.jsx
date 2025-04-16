"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const styles = {
  container: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  title: 'mb-4 font-[600] text-[32px] leading-[100%] text-[#039994] font-sfpro text-center',
  progressBarContainer: 'w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden mb-4',
  progressBar: (width) => `bg-[#039994] h-2 rounded-full transition-all duration-300` + ` w-[${width}%]`,
  buttonPrimary: 'w-full max-w-md rounded-md bg-[#039994] text-white font-semibold py-2 mt-4 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  buttonSkip: 'w-full max-w-md rounded-md border border-[#039994] text-[#039994] font-semibold py-2 mt-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
};

export default function UtilityVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from the URL, fallback to localStorage if not available
  const urlToken = searchParams.get('token');
  const localToken = typeof window !== 'undefined' && localStorage.getItem('authToken');
  const token = urlToken || localToken;

  // Function to verify the utility authorization
  const handleVerify = async () => {
    if (!token) {
      toast.error('Authorization token not found.', {
        style: { fontFamily: 'SF Pro', background: '#FFEBEE', color: '#B71C1C' }
      });
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    // Start a simulated progress increase (for example over 5 seconds)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 250);

    try {
      const response = await fetch(`{{local}}/api/auth/check-utility-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (!response.ok || data.data?.isAuthorized !== true) {
        throw new Error(data.message || 'Utility authorization verification failed');
      }
      
      toast.success(data.message || 'Utility authorization verified', {
        style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
      });
      
      // Ensure progress is complete before redirecting
      setProgress(100);
      setTimeout(() => {
        router.push('/register/commercial-operator-registration/agreement');
      }, 500);

    } catch (error) {
      toast.error(error.message || 'An error occurred during utility verification', {
        style: { fontFamily: 'SF Pro', background: '#FFEBEE', color: '#B71C1C' }
      });
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  // Skip button simply notifies the user that they will be updated once authorized.
  const handleSkip = () => {
    toast('You will be notified once your utility authorization is complete.', {
      style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verify Utility Authorization</h1>

      {/* Progress Bar */}
      {loading && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar(progress)} style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <button 
        onClick={handleVerify} 
        className={styles.buttonPrimary} 
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify Authorization'}
      </button>

      <button 
        onClick={handleSkip} 
        className={styles.buttonSkip}
        disabled={loading}
      >
        Skip and I'll be notified
      </button>
    </div>
  );
}
