"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaPrint } from "react-icons/fa"; 
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader"; 
import InviteOwnerModal from "../../../../../components/modals/InviteOwnerModal"; 
import EmailInvitationSentModal from "../../../../../components/modals/EmailInvitationSentModal"; 
import RegistrationSuccessfulModal from "../../../../../components/modals/RegistrationSuccessfulModal"; 
import Loader from "../../../../../components/loader/Loader"; 

export default function AgreementFormPage() {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(true); 
  const [inviteModalOpen, setInviteModalOpen] = useState(false); 
  const [sentModalOpen, setSentModalOpen] = useState(false); 
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false); 
  const [isRedirecting, setIsRedirecting] = useState(false); // Loader state for redirect
  const router = useRouter();

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
    setIsRedirecting(true); // Show the loader before redirect
    setTimeout(() => {
      router.push('/dashboard'); // Redirect after loader delay
    }, 2000); // Simulate loader delay
  };

  return (
    <>
      {/* Loader Overlay for loading during actions */}
      {loading && <CustomerIDLoader />}

      {/* Full-Screen Background */}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between py-8 px-4">
        
        {/* Heading */}
        <div className="flex justify-between items-center w-full max-w-3xl">
          <h1 className="text-[#039994] text-4xl font-semibold">
            Terms of Agreement
          </h1>
          <div className="flex space-x-4">
            <FaDownload className="cursor-pointer text-[#039994]" size={24} />
            <FaPrint className="cursor-pointer text-[#039994]" size={24} />
          </div>
        </div>

        {/* Terms of Agreement Text */}
        <div className="w-full max-w-3xl mt-8 text-sm text-gray-700 mb-12">
          <ol className="space-y-6">
            <li>
              <strong className="font-semibold">1. DCarbon Information Release Agreement:</strong>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </li>
            <li>
              <strong className="font-semibold">2. DCarbon Services Agreement:</strong>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </li>
            <li>
              <strong className="font-semibold">3. WREGIS Assignment Agreement:</strong>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </li>
          </ol>
        </div>

        {/* Accept / Decline Buttons */}
        <div className="flex w-full max-w-3xl justify-between mt-6 space-x-4 px-6 fixed bottom-8">
          <button
            onClick={() => {
              setAccepted(true);
              handleSubmit();
            }}
            className={`w-full py-2 text-center rounded-md ${accepted ? "bg-[#039994] text-white" : "bg-white text-[#039994]"}`}
          >
            Accept
          </button>
          <button
            onClick={() => setAccepted(false)}
            className={`w-full py-2 text-center rounded-md ${!accepted ? "bg-white text-[#039994] border-2 border-[#039994]" : "bg-[#039994] text-white"}`}
          >
            Decline
          </button>
        </div>
      </div>

      {/* Modals */}
      {inviteModalOpen && <InviteOwnerModal closeModal={handleCloseInviteModal} />}
      {sentModalOpen && <EmailInvitationSentModal closeModal={handleCloseSentModal} />}
      {registrationModalOpen && (
        <RegistrationSuccessfulModal 
          closeModal={handleCloseRegistrationModal}
          setIsRedirecting={setIsRedirecting} // Pass down setIsRedirecting
        />
      )}

      {/* Show Loader before redirecting to Dashboard */}
      {isRedirecting && <Loader />} {/* This is the loader modal you want to show */}
    </>
  );
}
