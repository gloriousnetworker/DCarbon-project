'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import toast from 'react-hot-toast';

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
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Glass-Effect Card Container */}
      <div className="w-full max-w-md rounded-xl shadow-lg p-6 font-sfpro"
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
        <h2 className="text-center mb-8 font-[600] text-[48px] leading-[100%] tracking-[-5%] text-white">
          Welcome back to DCarbon
        </h2>

        {/* Horizontal Line */}
        <hr className="border-t-2 border-white mb-4" />

        {/* Email Field */}
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-5%] font-[400] text-white">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="@ e.g name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white bg-[#F0F0F033] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-5%] text-white"
          />
        </div>

        {/* Password Field with Forgot Password Link */}
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-5%] font-[400] text-white">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white bg-[#F0F0F033] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-5%] text-white mb-2"
          />
          <div className="text-right">
            <a
              href="/forgot-password"
              className="font-sfpro font-[600] text-[12px] leading-[100%] tracking-[-5%] text-white no-underline"
            >
              Forgot password
            </a>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-md bg-[#039994] text-white font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-5%] py-2 cursor-pointer mb-5 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
        >
          Sign in
        </button>

        {/* Create Account Link */}
        <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-5%] text-white">
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-5%] text-white no-underline"
          >
            Create account
          </a>
        </p>

        {/* Horizontal Line */}
        <hr className="border-t-2 border-white my-4" />

        {/* Disclaimer */}
        <p className="font-sfpro font-[400] text-[10px] leading-[100%] tracking-[-5%] text-center text-white mb-0">
          By clicking on <strong>Sign in</strong>, you agree to our{' '}
          <a href="/terms" className="text-white underline font-[600]">
            Terms and Conditions
          </a>{' '}
          &amp;{' '}
          <a href="/privacy" className="text-white underline font-[600]">
            Privacy Policy
          </a>
        </p>
      </div>
    </>
  );
}