"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const styles = {
  container: 'w-full flex flex-col items-center justify-center py-8 px-4',
  title: 'mb-4 font-[600] text-[32px] leading-[100%] text-[#039994] font-sfpro text-center',
  progressBarContainer: 'w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden mb-4',
  progressBar: (width) => `bg-[#039994] h-2 rounded-full transition-all duration-300 w-[${width}%]`,
  buttonPrimary: 'w-full max-w-md rounded-md bg-[#039994] text-white font-semibold py-2 mt-4 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  buttonSkip: 'w-full max-w-md rounded-md border border-[#039994] text-[#039994] font-semibold py-2 mt-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  statusMessage: 'mt-4 text-center font-sfpro',
  successMessage: 'text-green-600',
  errorMessage: 'text-red-600',
};

export default function VerificationContent({ token: propToken }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token either from props (path param) or query param
  const token = propToken || searchParams.get('token');

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
    setVerificationStatus(null);
    setMessage('');
    
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
      const response = await fetch('https://services.dcarbon.solutions/api/auth/check-utility-auth', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
  
      // First check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Invalid response from server');
      }
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Utility authorization verification failed');
      }
  
      setVerificationStatus('success');
      setMessage(data.message || 'Utility authorization verified successfully');
      
      toast.success(data.message || 'Utility authorization verified', {
        style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
      });

      // Store verification data and proceed
      storeVerificationData(token, data.userId, true);
      navigateToAgreement();
  
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Verification failed. Please try again or contact support.');
      
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again or contact support.', {
        style: { fontFamily: 'SF Pro', background: '#FFEBEE', color: '#B71C1C' }
      });
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleSkip = () => {
    // Store basic auth data without verification
    storeVerificationData(token, null, false);
    toast('You can complete verification later. Proceeding to agreement...', {
      style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
    });
    navigateToAgreement();
  };

  const storeVerificationData = (token, userId, isVerified) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      if (userId) localStorage.setItem('userId', userId);
      localStorage.setItem('utilityVerified', String(isVerified));
    }
  };

  const navigateToAgreement = () => {
    setTimeout(() => {
      router.push('/register/commercial-operator-registration/agreement');
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verify Utility Authorization</h1>

      <p className="mb-6 text-center font-sfpro text-gray-600 max-w-md">
        Please authorize your utility account to continue registration or skip to proceed.
      </p>

      {/* Display verification status message */}
      {verificationStatus && (
        <div className={`${styles.statusMessage} ${
          verificationStatus === 'success' ? styles.successMessage : styles.errorMessage
        }`}>
          {message}
        </div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar(progress)} style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-md">
        <button 
          onClick={handleVerify} 
          className={styles.buttonPrimary} 
          disabled={loading}
        >
          {loading ? `Authorizing... ${progress}%` : 'Authorize Utility'}
        </button>

        <button 
          onClick={handleSkip} 
          className={styles.buttonSkip}
          disabled={loading}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}