"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint, FaTimes } from "react-icons/fa"; 
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader"; 
import RegistrationSuccessfulModal from "../../../../../components/modals/partner-modals/RegistrationSuccessfulModal"; 
import Loader from "../../../../../components/loader/Loader"; 
import Agreement from "../../../../../components/partner/AgreementForm";
import SignatureModal from "../../../../../components/modals/SignatureModal";

export default function AgreementFormPage() {
  const [loading, setLoading] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false); 
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Tracks whether all checkboxes in Agreement are selected
  const [allChecked, setAllChecked] = useState(false);

  // For signature logic
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const router = useRouter();

  const handleSubmit = () => {
    // Show a loading indicator, then "Registration Successful" modal
    setLoading(true); 
    setTimeout(() => {
      setLoading(false); 
      setRegistrationModalOpen(true); 
    }, 1500);
  };

  const handleCloseRegistrationModal = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  // Called by the SignatureModal when user clicks "Sign Agreement"
  const handleSaveSignature = (data) => {
    setSignatureData(data);
    setShowSignatureModal(false);
  };

  return (
    <>
      {/* Loader Overlay for loading during actions */}
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

        {/* Accept/Decline Buttons */}
        <div className="flex w-full max-w-3xl justify-between mt-6 space-x-4 px-2">
          {/* Accept Button is now disabled unless all checkboxes are checked AND a signature is added */}
          <button
            onClick={handleSubmit}
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

          {/* Decline Button - transparent */}
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

      {/* Registration Modal */}
      {registrationModalOpen && (
        <RegistrationSuccessfulModal 
          closeModal={handleCloseRegistrationModal}
          setIsRedirecting={setIsRedirecting}
        />
      )}

      {/* Loader before redirecting */}
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
