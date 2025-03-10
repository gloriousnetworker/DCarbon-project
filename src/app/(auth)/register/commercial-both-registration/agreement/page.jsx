"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa";
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader";
import InviteOwnerModal from "../../../../../components/modals/commercial-owner-modals/InviteOwnerModal";
import EmailInvitationSentModal from "../../../../../components/modals/commercial-owner-modals/EmailInvitationSentModal";
import RegistrationSuccessfulModal from "../../../../../components/modals/commercial-owner-modals/RegistrationSuccessfulModal";
import Loader from "../../../../../components/loader/Loader";
import Agreement from "../../../../../components/commercial/commercial-both-registration/AgreementForm";
import SignatureModal from "../../../../../components/modals/SignatureModal";

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

  // When Accept is clicked (and conditions met), start the flow by showing the invite modal.
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setInviteModalOpen(true);
    }, 1500);
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
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && <CustomerIDLoader />}

      {/* Full-Screen Background Container */}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4 relative">
        {/* X (Close) Button in red */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>

        {/* Horizontal Rule */}
        <hr className="mb-4 border-gray-300 w-full max-w-3xl" />

        {/* Heading + Icons */}
        <div className="flex w-full max-w-3xl justify-between items-center mb-4 px-2">
          <h1 className="text-2xl font-semibold text-[#039994]">
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
              w-full py-2 text-center rounded-md border border-[#039994]
              text-white 
              ${(allChecked && signatureData)
                ? "bg-[#039994]"
                : "bg-[#039994] opacity-50 cursor-not-allowed"}
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
            "
          >
            Decline
          </button>
        </div>
      </div>

      {/* Modals */}
      {inviteModalOpen && (
        <InviteOwnerModal closeModal={handleCloseInviteModal} />
      )}
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
