"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader";
import InviteOwnerModal from "../../../../../components/modals/commercial-operator-modals/InviteOperatorModal";
import EmailInvitationSentModal from "../../../../../components/modals/commercial-operator-modals/EmailInvitationSentModal";
import RegistrationSuccessfulModal from "../../../../../components/modals/commercial-operator-modals/RegistrationSuccessfulModal";
import Loader from "../../../../../components/loader/Loader";
import Agreement from "../../../../../components/commercial/commercial-owner-registration/AgreementForm";
import SignatureModal from "../../../../../components/modals/OperatorSignatureModal";
import toast from "react-hot-toast";

export default function AgreementFormPage() {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sentModalOpen, setSentModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const router = useRouter();

  // Get auth data from localStorage
  const getAuthData = () => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    return { authToken, userId };
  };

  // Effect for main loader delay
  useEffect(() => {
    let timer;
    if (loading) {
      setShowLoader(true);
    } else {
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

  // Check authentication on initial load
  useEffect(() => {
    const { authToken, userId } = getAuthData();
    if (!authToken || !userId) {
      toast.error("Authentication required");
      router.push("/register/operator-registration-verification/utility-verification");
    }
  }, [router]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Function to call the accept user agreement endpoint
  const acceptUserAgreement = async () => {
    const { authToken, userId } = getAuthData();
    
    if (!authToken || !userId) {
      toast.error("Please log in to continue");
      setPendingAction(() => acceptUserAgreement);
      setShowLoginModal(true);
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/accept-user-agreement-terms/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            signature: signatureData,
            termsAccepted: true,
            agreementCompleted: true
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to accept user agreement");
      }

      return await response.json();
    } catch (error) {
      console.error("Error accepting user agreement:", error);
      if (error.message.includes('Unauthorized') || error.message.includes('expired')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setPendingAction(() => acceptUserAgreement);
        setShowLoginModal(true);
      }
      throw error;
    }
  };

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
      toast.success("Agreement signed successfully!");
      setInviteModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to accept agreement");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false);
    setSentModalOpen(true);
  };

  const handleCloseSentModal = () => {
    setSentModalOpen(false);
    setRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/commercial-dashboard");
    }, 2000);
  };

  const handleSaveSignature = (data) => {
    setSignatureData(data);
    setShowSignatureModal(false);
    toast.success("Signature saved successfully");
  };

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <CustomerIDLoader />
        </div>
      )}

      <div className={mainContainer}>
        <button
          onClick={() => router.back()}
          className={backArrow}
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>

        <hr className="mb-4 border-gray-300 w-full max-w-3xl" />

        <div className={headingContainer}>
          <h1 className={pageTitle}>Terms of Agreement</h1>
          <div className="flex space-x-4">
            <FaDownload className="cursor-pointer text-[#039994]" size={20} />
            <FaPrint className="cursor-pointer text-[#039994]" size={20} />
          </div>
        </div>

        <hr className="mb-4 border-gray-300 w-full max-w-3xl" />

        <Agreement
          onAllCheckedChange={setAllChecked}
          signatureData={signatureData}
          onOpenSignatureModal={() => setShowSignatureModal(true)}
        />

        <div className="flex w-full max-w-3xl justify-between mt-6 space-x-4 px-2 fixed bottom-8">
          <button
            onClick={handleSubmit}
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

      {inviteModalOpen && (
        <InviteOwnerModal
          closeModal={handleCloseInviteModal}
          onSkip={() => {
            setInviteModalOpen(false);
            setRegistrationModalOpen(true);
          }} />)}
      {sentModalOpen && (
        <EmailInvitationSentModal closeModal={handleCloseSentModal} />
      )}
      {registrationModalOpen && (
        <RegistrationSuccessfulModal
          closeModal={handleCloseRegistrationModal}
          setIsRedirecting={setIsRedirecting}
        />
      )}

      {showRedirectLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Loader />
        </div>
      )}

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={handleSaveSignature}
      />

      {/* Login Modal - You'll need to create or import this */}
      {/* <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      /> */}
    </>
  );
}

// Style constants
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';