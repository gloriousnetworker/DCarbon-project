'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [file, setFile] = useState(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleSubmit = async () => {
    if (!financeType || !financeCompany) {
      toast.error('Please fill in all required fields: Finance type and Finance company');
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (!userId || !token) {
        throw new Error('User ID or token not found in local storage');
      }

      const payload = {
        financialType: financeType,
        financeCompany: financeCompany,
      };

      const url = `https://dcarbon-server.onrender.com/api/user/financial-info/${userId}`;

      const response = await axios.put(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      toast.success('Financial information updated successfully');
      router.push('/register/commercial-both-registration/step-two');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Financial info update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (!userId || !token) {
        throw new Error('User ID or token not found in local storage');
      }

      const formData = new FormData();
      formData.append('financialAgreement', file);

      const url = `https://dcarbon-server.onrender.com/api/user/update-financial-agreement/${userId}`;

      const response = await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      toast.success('Financial agreement uploaded successfully');
      setUploadSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        <div className="relative w-full mb-10">
          <div
            className="back-arrow absolute left-12 top-0 text-[#039994] cursor-pointer z-60"
            onClick={() => router.back()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mr-40 mb-6">
          Finance information
        </h1>

        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-2/3 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">02/03</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Finance Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Finance type
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9a3.77 3.77 0 017.544 0c0 1.668-1.172 2.5-2.178 3.057-.97.53-1.533 1.023-1.533 1.943M12 17h.01"
                />
              </svg>
            </label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Finance company
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9a3.77 3.77 0 017.544 0c0 1.668-1.172 2.5-2.178 3.057-.97.53-1.533 1.023-1.533 1.943M12 17h.01"
                />
              </svg>
            </label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose company</option>
              <option value="company1">Company 1</option>
              <option value="company2">Company 2</option>
              <option value="company3">Company 3</option>
              <option value="others">Others</option>
              <option value="n/a">N/A</option>
            </select>
          </div>

          {/* Upload Finance Agreement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Upload Finance Agreement (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer">
                {file ? file.name : 'Choose file...'}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.5 12.5l7-7a2.121 2.121 0 013 3L10 17a4 4 0 01-5.657-5.657l7-7"
                    />
                  </svg>
                </span>
              </label>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                {uploading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : uploadSuccess ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Note: You will need to upload Finance Agreement to approve any transactions.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 leading-tight">
          By clicking on ‘Next’, you agree to our{' '}
          <a href="/terms" className="text-[#039994] hover:underline font-medium">
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}
