"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader";
import InviteOwnerModal from "../../../../../components/modals/commercial-owner-modals/InviteOwnerModal";
import EmailInvitationSentModal from "../../../../../components/modals/commercial-owner-modals/EmailInvitationSentModal";
import RegistrationSuccessfulModal from "../../../../../components/modals/commercial-owner-modals/RegistrationSuccessfulModal";
import Loader from "../../../../../components/loader/Loader";
import Agreement from "../../../../../components/commercial/commercial-owner-registration/AgreementForm";
import SignatureModal from "../../../../../components/modals/SignatureModal";
import toast from "react-hot-toast";

export default function AgreementFormPage() {
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sentModalOpen, setSentModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Condition states: checkboxes and signature
  const [allChecked, setAllChecked] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [accepted, setAccepted] = useState(true);

  const router = useRouter();

  // Function to call the accept user agreement endpoint
  const acceptUserAgreement = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        throw new Error("User authentication details not found");
      }

      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/accept-user-agreement-terms/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            signature: signatureData, // Assuming signatureData contains the signature URL or data
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

  // When Accept is clicked (and conditions met), start the flow by showing the invite modal.
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
      // First call the API to accept the agreement
      await acceptUserAgreement();
      
      // Then proceed with the UI flow
      setLoading(false);
      setInviteModalOpen(true);
      toast.success("Agreement signed successfully!");
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Failed to accept agreement");
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

  // Called by the SignatureModal when the user clicks "Sign Agreement"
  const handleSaveSignature = (data) => {
    setSignatureData(data);
    setShowSignatureModal(false);
    toast.success("Signature saved successfully");
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && <CustomerIDLoader />}

      {/* Full-Screen Background Container */}
      <div className={mainContainer}>
        {/* X (Close) Button in red */}
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
            Terms of Agreement
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
          {/* Accept Button: enabled only if all checkboxes are checked AND signature provided */}
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

          {/* Decline Button: transparent */}
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

      {/* Modals */}
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

      {/* Loader before redirect */}
      {isRedirecting && <Loader />}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={handleSaveSignature}
      />
    </>
  );
}

// Apply styles from styles.js
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';