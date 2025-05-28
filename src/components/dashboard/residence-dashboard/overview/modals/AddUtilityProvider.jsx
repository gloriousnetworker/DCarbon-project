import React, { useState } from "react";
import { toast } from "react-hot-toast";
import * as styles from "../styles";

export default function AddUtilityProvider({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Get userId and authToken from localStorage
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "{}");
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.authToken || localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/update-utility-auth-email/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            utilityAuthEmail: email.trim()
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("Utility authorization email added successfully!");
        
        // Update localStorage with new user data
        const updatedLoginResponse = {
          ...loginResponse,
          data: {
            ...loginResponse.data,
            user: {
              ...loginResponse.data.user,
              utilityAuthEmail: data.data.utilityAuthEmail
            }
          }
        };
        localStorage.setItem("loginResponse", JSON.stringify(updatedLoginResponse));

        // Close modal
        onClose();
        
        // Open utility authorization window
        setTimeout(() => {
          window.open("https://utilityapi.com/authorize/DCarbon_Solutions", "_blank");
        }, 1000);
        
      } else {
        // Handle different error scenarios
        if (response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to perform this action.");
        } else {
          toast.error(data.message || "Failed to add utility authorization email");
        }
      }
    } catch (error) {
      console.error("Error adding utility auth email:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h2 className={styles.pageTitle}>
              Add Utility Provider
            </h2>
            <p className="text-sm text-gray-600 font-sfpro">
              Enter the email address associated with your utility account to authorize access.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.formWrapper}>
            <div>
              <label htmlFor="utilityEmail" className={styles.labelClass}>
                Utility Account Email Address
              </label>
              <input
                type="email"
                id="utilityEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputClass}
                placeholder="Enter your utility account email"
                disabled={isLoading}
                required
              />
              <p className={styles.noteText}>
                This should be the email address you use to access your utility provider's online portal.
              </p>
            </div>

            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Utility Provider"}
            </button>
          </form>

          {/* Information Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-sfpro">
                  After adding your email, you'll be redirected to authorize DCarbon Solutions to access your utility data securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}