"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const styles = {
  container: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  title: 'mb-4 font-[600] text-[32px] leading-[100%] text-[#039994] font-sfpro text-center',
  progressBarContainer: 'w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden mb-4',
  progressBar: (width) => `bg-[#039994] h-2 rounded-full transition-all duration-300` + ` w-[${width}%]`,
  buttonPrimary: 'w-full max-w-md rounded-md bg-[#039994] text-white font-semibold py-2 mt-4 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  buttonSkip: 'w-full max-w-md rounded-md border border-[#039994] text-[#039994] font-semibold py-2 mt-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  statusMessage: 'mt-4 text-center font-sfpro',
  successMessage: 'text-green-600',
  errorMessage: 'text-red-600',
};

function VerificationContent() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract token from URL
  const token = searchParams.get('token');

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && !loading && verificationStatus === null) {
      handleVerify();
    }
  }, [token]);

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
    
    // Start a simulated progress increase
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
      const response = await fetch(`/api/auth/verify-utility-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Utility authorization verification failed');
      }

      setVerificationStatus('success');
      setMessage(data.message || 'Utility authorization verified successfully');
      
      toast.success(data.message || 'Utility authorization verified', {
        style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
      });

      // Store the verified token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('utilityVerified', 'true');
      }

      // Redirect after delay
      setTimeout(() => {
        router.push('/register/commercial-operator-registration/agreement');
      }, 1500);

    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.message);
      
      toast.error(error.message || 'An error occurred during utility verification', {
        style: { fontFamily: 'SF Pro', background: '#FFEBEE', color: '#B71C1C' }
      });
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleSkip = () => {
    toast('You will be notified once your utility authorization is complete.', {
      style: { fontFamily: 'SF Pro', background: '#E8F5E9', color: '#1B5E20' }
    });
    router.push('/register/commercial-operator-registration/agreement');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verify Utility Authorization</h1>

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

      {/* Only show buttons if not auto-verifying */}
      {!loading && verificationStatus === null && (
        <>
          <button 
            onClick={handleVerify} 
            className={styles.buttonPrimary} 
            disabled={loading}
          >
            {loading ? `Verifying... ${progress}%` : 'Verify Authorization'}
          </button>

          <button 
            onClick={handleSkip} 
            className={styles.buttonSkip}
            disabled={loading}
          >
            Skip and I'll be notified
          </button>
        </>
      )}

      {/* Show loading message during auto-verification */}
      {loading && token && (
        <p className="mt-4 text-center font-sfpro text-gray-600">
          Verifying your utility authorization...
        </p>
      )}
    </div>
  );
}

export default function UtilityVerificationCard() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading verification...</div>}>
      <VerificationContent />
    </Suspense>
  );
}