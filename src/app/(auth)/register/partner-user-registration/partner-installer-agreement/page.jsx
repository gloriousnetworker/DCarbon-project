"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader";
import RegistrationSuccessfulModal from "../../../../../components/modals/partner-modals/RegistrationSuccessfulModal";
import Loader from "../../../../../components/loader/Loader";
import Agreement from "../../../../../components/partner/agreements/InstallerAgreement";
import SignatureModal from "../../../../../components/modals/SignatureModal";
import toast from "react-hot-toast";

export default function AgreementFormPage() {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);

  // Condition states: checkboxes and signature
  const [allChecked, setAllChecked] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [accepted, setAccepted] = useState(true);

  const router = useRouter();

  // Effect for main loader delay
  useEffect(() => {
    let timer;
    if (loading) {
      setShowLoader(true);
    } else {
      // Minimum display time of 500ms for the loader
      timer = setTimeout(() => setShowLoader(false), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Effect for redirect loader delay
  useEffect(() => {
    let timer;
    if (isRedirecting) {
      setShowRedirectLoader(true);
    } else {
      timer = setTimeout(() => setShowRedirectLoader(false), 500);
    }
    return () => clearTimeout(timer);
  }, [isRedirecting]);

  // Function to call the accept user agreement endpoint
  const acceptUserAgreement = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        throw new Error("User authentication details not found");
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            signature: signatureData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept user agreement");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error accepting user agreement:", error);
      throw error;
    }
  };

  // When Accept is clicked (and conditions met), show registration success modal and then redirect
  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error("Please accept all agreements");
      return;
    }
    if (!signatureData) {
      toast.error("Please add your signature");
      return;
    }

    setLoading(true);
    try {
      await acceptUserAgreement();
      setLoading(false);
      setRegistrationModalOpen(true);
      toast.success("Agreement signed successfully!");
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Failed to accept agreement");
    }
  };

  const handleCloseRegistrationModal = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/partner-dashboard");
    }, 2000);
  };

  const handleSaveSignature = (data) => {
    setSignatureData(data);
    setShowSignatureModal(false);
    toast.success("Signature saved successfully");
  };

  return (
    <>
      {/* Full-screen Loader Overlay with delay */}
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <CustomerIDLoader />
        </div>
      )}

      {/* Full-Screen Background Container */}
      <div className={mainContainer}>
        {/* X (Close) Button */}
        <button
          onClick={() => router.back()}
          className={backArrow}
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>

        {/* Horizontal Rule */}
        <hr className="mb-4 border-gray-300 w-full max-w-3xl" />

        {/* Heading + Icons */}
        <div className={headingContainer}>
          <h1 className={pageTitle}>
            Terms of Agreement for Partner Installer
          </h1>
          <div className="flex space-x-4">
            <FaDownload className="cursor-pointer text-[#039994]" size={20} />
            <FaPrint className="cursor-pointer text-[#039994]" size={20} />
          </div>
        </div>

        {/* Horizontal Rule */}
        <hr className="mb-4 border-gray-300 w-full max-w-3xl" />

        {/* Scrollable Agreement Sections */}
        <Agreement
          onAllCheckedChange={setAllChecked}
          signatureData={signatureData}
          onOpenSignatureModal={() => setShowSignatureModal(true)}
        />

        {/* Accept / Decline Buttons */}
        <div className="flex w-full max-w-3xl justify-between mt-6 space-x-4 px-2 fixed bottom-8">
          <button
            onClick={() => {
              setAccepted(true);
              handleSubmit();
            }}
            disabled={!(allChecked && signatureData)}
            className={`
              ${buttonPrimary}
              ${!(allChecked && signatureData) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            Accept
          </button>

          <button
            onClick={() => router.back()}
            className="
              w-full py-2 text-center rounded-md 
              bg-transparent 
              border border-[#039994] 
              text-[#039994]
              font-sfpro
            "
          >
            Decline
          </button>
        </div>
      </div>

      {/* Registration Success Modal - Only modal we keep */}
      {registrationModalOpen && (
        <RegistrationSuccessfulModal
          closeModal={handleCloseRegistrationModal}
          setIsRedirecting={setIsRedirecting}
        />
      )}

      {/* Loader before redirect with delay */}
      {showRedirectLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Loader />
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={handleSaveSignature}
      />
    </>
  );
}

// Style constants
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';