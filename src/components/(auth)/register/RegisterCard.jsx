'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import EmailModal from '../../../components/modals/EmailModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterCard() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Initially no category is selected
  const [userCategory, setUserCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mapping UI labels to API expected values
  const userTypeMapping = {
    Resident: 'RESIDENTIAL',
    Commercial: 'COMMERCIAL',
    Partner: 'PARTNER',
  };

  // Validate the form before submission
  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill out all fields.');
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!userCategory) {
      setError('Please select a user category.');
      return false;
    }
    setError('');
    return true;
  };

  // Call the API endpoint to register a user using Axios
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    const payload = {
      email,
      firstName,
      lastName,
      userType: userTypeMapping[userCategory],
      password,
    };

    try {
      const response = await axios.post(
        'https://dcarbon-server.onrender.com/api/user/register',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      // Store the user's email in local storage for verification
      localStorage.setItem('userEmail', response.data.data.email);
      toast.success('Registration successful');
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleUserCategory = (category) => {
    setUserCategory(category);
  };

  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#039994', fontFamily: 'SF Pro Text, sans-serif' }}
        >
          Start your Solar journey with DCarbon
        </h1>
        <hr className="w-full border border-gray-200 mt-4 mb-8" />
        <div className="w-full max-w-md">
          <form
            className="flex flex-col space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
              <div className="w-full">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="👤 First name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="👤 Last name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="@ e.g name@domain.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Category
              </label>
              <div className="flex items-center space-x-4">
                {['Resident', 'Commercial', 'Partner'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleUserCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition duration-300 ease-in-out ${
                      userCategory === category
                        ? 'bg-[#039994] text-white'
                        : 'bg-transparent text-[#039994] border border-[#039994]'
                    } hover:bg-[#02857f] hover:text-white`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  placeholder="|** Create Password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {passwordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.03 3.97a.75.75 0 011.06 0l10 10a.75.75 0 11-1.06 1.06l-1.042-1.042A8.74 8.74 0 0110 15c-3.272 0-6.06-1.906-7.76-4.701a.945.945 0 010-1.006 10.45 10.45 0 013.12-3.263L4.03 5.03a.75.75 0 010-1.06zm12.24 7.79c.291-.424.546-.874.76-1.339a.945.945 0 000-1.006C16.06 6.905 13.272 5 10 5c-.638 0-1.26.07-1.856.202l7.127 7.127z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              Create Account
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-[#039994] hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
          <hr className="w-full border border-gray-200 mt-4" />
          <p className="mt-4 text-xs text-center text-gray-500 leading-tight">
            By clicking on ‘Create Account’, you agree to our{' '}
            <a
              href="/terms"
              className="text-[#039994] hover:underline font-medium"
            >
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a
              href="/privacy"
              className="text-[#039994] hover:underline font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      {showModal && <EmailModal closeModal={() => setShowModal(false)} />}
    </>
  );
}
