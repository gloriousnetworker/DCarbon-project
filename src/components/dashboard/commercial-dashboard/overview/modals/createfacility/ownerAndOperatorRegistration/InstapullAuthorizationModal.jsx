import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const styles = {
  modalContainer: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4',
  modal: 'relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col',
  modalHeader: 'p-6 pb-4 border-b border-gray-200',
  modalTitle: 'font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2',
  modalSubtitle: 'text-sm text-gray-600 mb-4',
  modalBody: 'flex-1 overflow-y-auto p-6',
  modalFooter: 'p-6 pt-4 border-t border-gray-200',
  closeButton: 'absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer',
  buttonSecondary: 'flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro',
  buttonPrimary: 'flex-1 rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  instapullButton: 'w-full rounded-md bg-blue-600 text-white font-semibold py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sfpro mb-4',
  messageContainer: 'mt-4 p-4 bg-green-50 border border-green-200 rounded-lg',
  messageText: 'text-green-700 text-sm',
  spinner: 'inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'
};

export default function InstapullAuthorizationModal({ isOpen, onClose, utilityProvider, instapullOpened, openInstapullTab }) {
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    userType: "COMMERCIAL",
    utilityType: "",
    authorizationEmail: ""
  });

  useEffect(() => {
    if (isOpen) {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail || '';
      setFormData(prev => ({
        ...prev,
        email: userEmail,
        utilityType: utilityProvider
      }));
    }
  }, [isOpen, utilityProvider]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!formData.utilityType.trim()) {
      toast.error('Utility type is required');
      return;
    }

    setSubmitting(true);
    setResponse(null);
    
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const token = loginResponse?.data?.token;

      const payload = {
        email: formData.email.trim(),
        userType: formData.userType,
        utilityType: formData.utilityType,
        authorizationEmail: formData.authorizationEmail.trim() || undefined
      };

      const response = await axios.post(
        'https://services.dcarbon.solutions/api/utility-auth/green-button',
        payload,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      setResponse(response.data);
      toast.success(response.data.message || 'Authorization submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit authorization');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modal}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Complete Utility Authorization</h2>
          <p className={styles.modalSubtitle}>
            {instapullOpened 
              ? 'Instapull is open in a new tab. Complete your authorization there, then return here to submit your details.'
              : 'Instapull was not opened. Please click the button below to open it in a new tab.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className="space-y-4">
            <button
              type="button"
              onClick={openInstapullTab}
              className={styles.instapullButton}
            >
              {instapullOpened ? '✓ Instapull Opened - Click to Reopen' : 'Open Instapull in New Tab'}
            </button>

            <div>
              <label className={styles.labelClass}>
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.inputClass}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className={styles.labelClass}>
                User Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userType"
                value={formData.userType}
                className={`${styles.inputClass} bg-gray-100`}
                disabled
              />
              <p className={styles.noteText}>User type is automatically set to COMMERCIAL</p>
            </div>

            <div>
              <label className={styles.labelClass}>
                Utility Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="utilityType"
                value={formData.utilityType}
                onChange={handleInputChange}
                className={styles.inputClass}
                placeholder="Utility provider name"
                required
              />
            </div>

            <div>
              <label className={styles.labelClass}>
                Authorization Email (Optional)
              </label>
              <input
                type="email"
                name="authorizationEmail"
                value={formData.authorizationEmail}
                onChange={handleInputChange}
                className={styles.inputClass}
                placeholder="Enter authorization email if required"
              />
              <p className={styles.noteText}>Required for Green Button authorization. Can also be provided for traditional method.</p>
            </div>
          </div>

          {response && (
            <div className={styles.messageContainer}>
              <p className={styles.messageText}>
                <strong>Response from server:</strong> {response.message}
              </p>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`${styles.buttonPrimary} flex items-center justify-center gap-2`}
            >
              {submitting ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Confirm Authorization'
              )}
            </button>
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.buttonSecondary}
            disabled={submitting}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}