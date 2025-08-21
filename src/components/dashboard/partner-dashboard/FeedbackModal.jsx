import React, { useState, useEffect } from "react";
import * as styles from './styles';
import { toast } from 'react-hot-toast';

export default function FeedbackModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    userType: '',
    category: '',
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        toast.error('User authentication required');
        return;
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-one-user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        setUserData(result.data);
        determineUserType(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while fetching user data');
    }
  };

  const determineUserType = (userData) => {
    let userType = '';
    
    if (userData.userType === 'PARTNER') {
      switch (userData.partnerType) {
        case 'FINANCE_COMPANY':
          userType = 'PARTNER_FINANCE_COMPANY';
          break;
        case 'INSTALLER':
          userType = 'PARTNER_INSTALLER';
          break;
        case 'SALES_AGENT':
          userType = 'PARTNER_SALES_AGENT';
          break;
        default:
          userType = '';
      }
    } else {
      switch (userData.userType) {
        case 'COMMERCIAL_OWNER':
          userType = 'COMMERCIAL_OWNER';
          break;
        case 'COMMERCIAL_OPERATOR':
          userType = 'COMMERCIAL_OPERATOR';
          break;
        case 'RESIDENTIAL':
          userType = 'RESIDENTIAL';
          break;
        default:
          userType = '';
      }
    }

    setFormData(prev => ({
      ...prev,
      userType: userType
    }));
  };

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (formData.title.trim().length < 5 || formData.title.trim().length > 100) {
      toast.error('Title must be between 5 and 100 characters');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (formData.description.trim().length < 20 || formData.description.trim().length > 1000) {
      toast.error('Description must be between 20 and 1000 characters');
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) {
        throw new Error('User authentication required');
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/feature-suggestion/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userType: formData.userType,
          category: formData.category,
          title: formData.title.trim(),
          description: formData.description.trim()
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Feature suggestion submitted successfully!');
        onClose();
        setFormData({
          userType: formData.userType,
          category: '',
          title: '',
          description: ''
        });
      } else {
        throw new Error(result.message || 'Failed to submit feature suggestion');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while submitting feature suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl p-6 max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex-shrink-0">
          <h2 className={styles.pageTitle}>New Feature Suggestion</h2>
          <p className={styles.noteText}>Use this form to send feedback to DCarbon to help us improve your experience.</p>
        </div>

        <div className="flex-grow overflow-y-auto mt-4">
          <div className={styles.formWrapper}>
            <div>
              <label className={styles.labelClass}>
                User Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userType}
                className={`${styles.inputClass} bg-gray-50`}
                disabled
              />
              <p className={styles.noteText}>Your user type is automatically detected and cannot be changed.</p>
            </div>

            <div>
              <label className={styles.labelClass}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={styles.selectClass}
              >
                <option value="">Select category</option>
                <option value="UI/UX">UI/UX</option>
                <option value="FUNCTIONALITY">FUNCTIONALITY</option>
                <option value="PERFORMANCE">PERFORMANCE</option>
                <option value="SECURITY">SECURITY</option>
                <option value="OTHER">OTHER</option>
              </select>
              <p className={styles.noteText}>Choose the category that best describes your feature suggestion.</p>
            </div>

            <div>
              <label className={styles.labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={styles.inputClass}
                placeholder="Enter feature title (5-100 characters)"
              />
              <p className={styles.noteText}>Provide a clear and concise title for your feature suggestion.</p>
            </div>

            <div>
              <label className={styles.labelClass}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.inputClass}
                placeholder="Describe your feature suggestion in detail (20-1000 characters)"
                rows={4}
              />
              <p className={styles.noteText}>Please provide detailed information about your feature suggestion, including how it would improve your experience.</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.buttonPrimary}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Feature Suggestion'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}