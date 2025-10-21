"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaArrowLeft } from "react-icons/fa";
import CustomerIDLoader from "../../../../../components/loader/CustomerIDLoader";
import RegistrationSuccessfulModal from "../../../../../components/modals/partner-modals/RegistrationSuccessfulModal";
import Loader from "../../../../../components/loader/Loader";
import SignatureModal from "./SignatureModal";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

export default function PartnerInstallerAgreement() {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (loading) {
      setShowLoader(true);
    } else {
      timer = setTimeout(() => setShowLoader(false), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    let timer;
    if (isRedirecting) {
      setShowRedirectLoader(true);
    } else {
      timer = setTimeout(() => setShowRedirectLoader(false), 500);
    }
    return () => clearTimeout(timer);
  }, [isRedirecting]);

  const fetchUserAgreement = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) {
        return null;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
      return null;
    }
  };

  const getPartnerDetails = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId || !authToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch partner details');
      }
    } catch (error) {
      console.error('Error fetching partner details:', error);
      throw error;
    }
  };

  const deletePartner = async (partnerId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/partner/${partnerId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  };

  const acceptUserAgreement = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error('Authentication required. Please log in again.');
        return false;
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Agreement accepted successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to accept agreement');
        return false;
      }
    } catch (error) {
      console.error('Error accepting agreement:', error);
      toast.error('An error occurred while accepting agreement. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureClick = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureModal(false);
    setHasSigned(true);
    const agreementData = await fetchUserAgreement();
    if (agreementData && agreementData.signature) {
      setSignatureUrl(agreementData.signature);
    }
  };

  const handleSignatureCancel = () => {
    setShowSignatureModal(false);
  };

  const handleSubmit = async () => {
    if (!isChecked) {
      toast.error("Please accept the agreement first");
      return;
    }

    if (!hasSigned) {
      toast.error("Please add your signature first");
      return;
    }

    const success = await acceptUserAgreement();
    if (success) {
      setRegistrationModalOpen(true);
    }
  };

  const handleCloseRegistrationModal = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/partner-dashboard");
    }, 2000);
  };

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = async () => {
    try {
      setIsDeleting(true);
      const partnerDetails = await getPartnerDetails();
      if (partnerDetails && partnerDetails.id) {
        await deletePartner(partnerDetails.id);
        toast.success('Partner registration cancelled successfully');
      }
      setShowDeclineModal(false);
      router.back();
    } catch (error) {
      console.error('Error during decline process:', error);
      toast.error('Failed to cancel registration. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDecline = () => {
    setShowDeclineModal(false);
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownload = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('DCARBON SOLUTIONS PROGRAM PARTNER AGREEMENT', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const agreementText = [
      "This DCarbon Solutions Program Partner Agreement ('Agreement') is made between DCarbon Solutions ('Company')",
      "and the undersigned Partner ('Partner').",
      "",
      "1. Partner Responsibilities: Partner agrees to install, maintain, and service renewable energy",
      "systems in accordance with Company standards and specifications.",
      "",
      "2. Compensation: Company shall pay Partner according to the agreed-upon rate schedule for",
      "completed installations that meet quality standards.",
      "",
      "3. Quality Standards: Partner agrees to maintain all installations to Company's quality",
      "standards and specifications.",
      "",
      "4. Training: Partner agrees to participate in Company-provided training programs as required.",
      "",
      "5. Insurance: Partner agrees to maintain adequate liability insurance coverage for all",
      "installation activities.",
      "",
      "6. Term: This Agreement shall commence on the date of execution and continue for 12 months,",
      "automatically renewing for successive 12-month terms unless terminated.",
      "",
      "7. Termination: Either party may terminate this Agreement with 30 days written notice.",
      "",
      "8. Governing Law: This Agreement shall be governed by the laws of the state of Texas."
    ];
    
    let yPosition = 30;
    agreementText.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition, { maxWidth: 170 });
      yPosition += 7;
    });

    doc.addPage();
    yPosition = 30;
    doc.setFontSize(12);
    doc.setTextColor(3, 153, 148);
    doc.text('ACKNOWLEDGEMENT AND SIGNATURE', 105, yPosition, { align: 'center' });
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('By signing below, I acknowledge that I have read and agree to the DCarbon Solutions Program Partner', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('Agreement presented in this document.', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    if (signatureUrl) {
      try {
        const img = await loadImage(signatureUrl);
        const imgWidth = 40;
        const imgHeight = 20;
        doc.addImage(img, 'PNG', 40, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 5;
      } catch (error) {
        console.error('Error loading signature image:', error);
        doc.line(40, yPosition, 80, yPosition);
        doc.text('Partner Signature', 60, yPosition + 5, { align: 'center' });
        yPosition += 10;
      }
    } else {
      doc.line(40, yPosition, 80, yPosition);
      doc.text('Partner Signature', 60, yPosition + 5, { align: 'center' });
      yPosition += 10;
    }
    
    doc.line(130, yPosition - 10, 170, yPosition - 10);
    doc.text('Date', 150, yPosition - 5, { align: 'center' });
    doc.text('Printed Name: ___________________________', 40, yPosition + 10);
    doc.text('Company Name: _________________________', 40, yPosition + 20);
    doc.text('Partner ID: _______', 40, yPosition + 30);
    
    doc.save("DCarbon_Solutions_Program_Partner_Agreement.pdf");
  };

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <CustomerIDLoader />
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center py-8 px-4 bg-white">
        <div className="w-full max-w-3xl">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-[#039994] mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>

          <div className="flex justify-between items-center mb-6">
            <h1 className="font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
              DCarbon Solutions Program Partner Agreement
            </h1>
            <button onClick={handleDownload} className="text-[#15104D] hover:opacity-80">
              <FaDownload size={20} />
            </button>
          </div>

          <div className="flex items-start mb-6">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
            />
            <label className="ml-3 font-sfpro font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
              I have read the DCarbon Solutions Program Partner Agreement and Understand the terms <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="h-[400px] overflow-y-auto mb-6 font-sfpro text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-[#039994] mb-4">DCARBON SOLUTIONS PROGRAM PARTNER AGREEMENT</h3>
            <p className="mb-4">
              This DCarbon Solutions Program Partner Agreement ("Agreement") is made between DCarbon Solutions ("Company") and the undersigned Partner ("Partner").
            </p>
            <p className="mb-3"><strong>1. Partner Responsibilities:</strong> Partner agrees to install, maintain, and service renewable energy systems in accordance with Company standards and specifications.</p>
            <p className="mb-3"><strong>2. Compensation:</strong> Company shall pay Partner according to the agreed-upon rate schedule for completed installations that meet quality standards.</p>
            <p className="mb-3"><strong>3. Quality Standards:</strong> Partner agrees to maintain all installations to Company's quality standards and specifications.</p>
            <p className="mb-3"><strong>4. Training:</strong> Partner agrees to participate in Company-provided training programs as required.</p>
            <p className="mb-3"><strong>5. Insurance:</strong> Partner agrees to maintain adequate liability insurance coverage for all installation activities.</p>
            <p className="mb-3"><strong>6. Term:</strong> This Agreement shall commence on the date of execution and continue for 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
            <p className="mb-3"><strong>7. Termination:</strong> Either party may terminate this Agreement with 30 days written notice.</p>
            <p className="mb-4"><strong>8. Governing Law:</strong> This Agreement shall be governed by the laws of the state of Texas.</p>
          </div>

          <div className="mb-8">
            <h3 className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Signature <span className="text-red-500">*</span>
            </h3>
            <div 
              onClick={handleSignatureClick}
              className={`border ${signatureUrl ? 'border-gray-300' : 'border-dashed border-gray-300'} rounded p-4 mb-4 ${signatureUrl ? 'text-gray-700 cursor-default' : 'text-gray-500 italic cursor-pointer hover:border-[#039994] hover:bg-gray-50'} font-sfpro transition-colors`}
            >
              {signatureUrl ? (
                <img src={signatureUrl} alt="Partner signature" className="max-w-full h-auto" />
              ) : (
                "Click to add your signature"
              )}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleSubmit}
              disabled={!isChecked || !hasSigned || loading}
              className={`flex-1 rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors ${
                isChecked && hasSigned && !loading
                  ? "bg-[#039994] hover:bg-[#02857f]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Accept Agreement"}
            </button>
            <button
              onClick={handleDeclineClick}
              disabled={loading}
              className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>
        </div>
      </div>

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
        onClose={handleSignatureCancel}
        onComplete={handleSignatureComplete}
      />

      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#039994] mb-4">
              Confirm Decline
            </h3>
            <p className="text-gray-700 mb-6">
              In order for you to proceed to the next step, you must Accept Agreement. 
              Are you sure you want to Decline? This will cancel your partner registration.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDecline}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#039994] text-[#039994] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] disabled:opacity-50"
              >
                No
              </button>
              <button
                onClick={handleConfirmDecline}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}