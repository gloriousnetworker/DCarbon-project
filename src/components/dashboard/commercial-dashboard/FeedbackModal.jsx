import React, { useState } from "react";
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

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.userType) {
      toast.error('Please select your user type');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      const response = await fetch(`https://services.dcarbon.solutions/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId,
          userType: formData.userType,
          category: formData.category,
          title: formData.title,
          description: formData.description
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Feedback submitted successfully!');
        onClose();
        setFormData({
          userType: '',
          category: '',
          title: '',
          description: ''
        });
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while submitting feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className={styles.pageTitle}>Feature Suggestion</h2>

        <div className={styles.formWrapper}>
          <div>
            <label className={styles.labelClass}>
              User Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userType}
              onChange={(e) => handleInputChange('userType', e.target.value)}
              className={styles.selectClass}
            >
              <option value="">Select your user type</option>
              <option value="residential">Residential</option>
              <option value="commercial-owner">Commercial Owner</option>
              <option value="commercial-operator">Commercial Operator</option>
              <option value="partner-installer">Partner Installer</option>
              <option value="partner-finance">Partner Finance Company</option>
              <option value="partner-sales">Partner Sales Agent</option>
            </select>
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
              <option value="payments">Payments</option>
              <option value="analytics">Analytics</option>
              <option value="facility-management">Facility Management</option>
              <option value="generator-management">Generator Management</option>
              <option value="general">General</option>
            </select>
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
              placeholder="Enter feature title"
            />
          </div>

          <div>
            <label className={styles.labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.inputClass}
              placeholder="Describe your feature suggestion in detail"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={styles.buttonPrimary}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}