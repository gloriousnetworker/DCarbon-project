'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginCard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://dcarbon-server.onrender.com/api/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Store the full response for debugging
      localStorage.setItem('loginResponse', JSON.stringify(response.data));

      // Destructure the response data
      const { user, token } = response.data.data;

      // Store user details in local storage for persistence
      localStorage.setItem('userFirstName', user.firstName);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);

      toast.success('Login successful');

      // Check if financial details are incomplete: if either is null
      const financeDetailsIncomplete =
        user.financialInfo === null || user.agreements === null;

      // Route based on user type and finance details
      if (user.userType === 'COMMERCIAL') {
        if (financeDetailsIncomplete) {
          window.location.href = '/register/commercial-user-registration';
        } else {
          window.location.href = '/commercial-dashboard';
        }
      } else if (user.userType === 'RESIDENTIAL') {
        if (financeDetailsIncomplete) {
          window.location.href = '/register/residence-user-registration/step-one';
        } else {
          window.location.href = '/residence-dashboard';
        }
      } else if (user.userType === 'PARTNER') {
        if (financeDetailsIncomplete) {
          window.location.href = '/register/partner-user-registration/step-one';
        } else {
          window.location.href = '/partner-dashboard';
        }
      } else {
        // Fallback route if user type doesn't match any above
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Glass-Effect Card Using OTP Component Styling */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <h2
          className="text-center mb-8"
          style={{
            fontFamily: 'SF Pro Text',
            fontWeight: 600,
            fontSize: '48px',
            lineHeight: '100%',
            letterSpacing: '-5%',
            color: '#FFFFFF',
          }}
        >
          Welcome back to DCarbon
        </h2>

        {/* Horizontal Line */}
        <hr className="border-t-2 border-white mb-4" />

        {/* Email Field */}
        <div className="mb-6">
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'SF Pro Text',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '-5%',
              color: '#FFFFFF',
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="@ e.g name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #FFFFFF',
              background: '#F0F0F033',
              padding: '8px 12px',
              fontFamily: 'SF Pro Text',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '-5%',
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        {/* Password Field with Forgot Password Link */}
        <div className="mb-6">
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'SF Pro Text',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '-5%',
              color: '#FFFFFF',
            }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #FFFFFF',
              background: '#F0F0F033',
              padding: '8px 12px',
              fontFamily: 'SF Pro Text',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '-5%',
              color: '#FFFFFF',
              outline: 'none',
              marginBottom: '8px',
            }}
          />

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right' }}>
            <a
              href="/forgot-password"
              style={{
                fontFamily: 'SF Pro Text',
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '100%',
                letterSpacing: '-5%',
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              Forgot password
            </a>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          onClick={handleLogin}
          style={{
            width: '100%',
            borderRadius: '8px',
            background: '#039994',
            color: '#FFFFFF',
            fontFamily: 'SF Pro Text',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '-5%',
            padding: '12px 0',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          Sign in
        </button>

        {/* Create Account */}
        <p className="mt-6 text-center" style={{ fontFamily: 'SF Pro Text', fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', color: '#FFFFFF' }}>
          Don’t have an account?{' '}
          <a
            href="/register"
            style={{
              fontFamily: 'SF Pro Text',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '-5%',
              color: '#FFFFFF',
              textDecoration: 'none',
            }}
          >
            Create account
          </a>
        </p>

        {/* Horizontal Line */}
        <hr className="border-t-2 border-white my-4" />

        {/* Disclaimer */}
        <p
          style={{
            fontFamily: 'SF Pro Text',
            fontWeight: 400,
            fontSize: '10px',
            lineHeight: '100%',
            letterSpacing: '-5%',
            textAlign: 'center',
            color: '#FFFFFF',
            marginBottom: 0,
          }}
        >
          By clicking on <strong>Sign in</strong>, you agree to our{' '}
          <a
            href="/terms"
            style={{
              color: '#FFFFFF',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            Terms and Conditions
          </a>{' '}
          &amp;{' '}
          <a
            href="/privacy"
            style={{
              color: '#FFFFFF',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </a>
        </p>
      </div>

    </>
  );
}
