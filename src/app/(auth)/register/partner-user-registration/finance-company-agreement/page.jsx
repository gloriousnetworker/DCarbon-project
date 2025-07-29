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

export default function FinanceCompanyAgreement() {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
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
        toast.success('Terms and conditions accepted successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to accept terms and conditions');
        return false;
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error('An error occurred while accepting terms. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignFirst = () => {
    if (!isChecked) {
      toast.error("Please accept the agreement first");
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureModal(false);
    setHasSigned(true);
    const agreementData = await fetchUserAgreement();
    if (agreementData && agreementData.signature) {
      setSignatureUrl(agreementData.signature);
    }
    const success = await acceptUserAgreement();
    if (success) {
      setRegistrationModalOpen(true);
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
      toast.error("Please add your signature");
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
    doc.text('FINANCE COMPANY AGREEMENT', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const agreementText = [
      "This Finance Company Agreement ('Agreement') is made between DCarbon Solutions ('Company')",
      "and the undersigned Finance Partner ('Partner').",
      "",
      "1. Partner Responsibilities: Partner agrees to provide financing options for renewable energy",
      "systems in accordance with Company standards and specifications.",
      "",
      "2. Compensation: Company shall pay Partner according to the agreed-upon fee structure for",
      "completed financings that meet program requirements.",
      "",
      "3. Compliance: Partner agrees to maintain all financing activities in compliance with applicable",
      "laws and regulations.",
      "",
      "4. Reporting: Partner agrees to provide regular reports on financing activities as required by Company.",
      "",
      "5. Insurance: Partner agrees to maintain adequate liability insurance coverage for all financing activities.",
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
    doc.text('By signing below, I acknowledge that I have read and agree to the Finance Company', 105, yPosition, { align: 'center' });
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
    
    doc.save("DCarbon_Finance_Agreement.pdf");
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
              Program Partner Agreement
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
              I agree to the Finance Company Agreement <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="h-[400px] overflow-y-auto mb-6 font-sfpro text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-[#039994] mb-4">PROGRAM PARTNER AGREEMENT</h3>
            <p className="mb-4">
              This Finance Company Agreement ("Agreement") is made between DCarbon Solutions ("Company") and the undersigned Finance Partner ("Partner").
            </p>
            <p className="mb-3"><strong>1. Partner Responsibilities:</strong> Partner agrees to provide financing options for renewable energy systems in accordance with Company standards and specifications.</p>
            <p className="mb-3"><strong>2. Compensation:</strong> Company shall pay Partner according to the agreed-upon fee structure for completed financings that meet program requirements.</p>
            <p className="mb-3"><strong>3. Compliance:</strong> Partner agrees to maintain all financing activities in compliance with applicable laws and regulations.</p>
            <p className="mb-3"><strong>4. Reporting:</strong> Partner agrees to provide regular reports on financing activities as required by Company.</p>
            <p className="mb-3"><strong>5. Insurance:</strong> Partner agrees to maintain adequate liability insurance coverage for all financing activities.</p>
            <p className="mb-3"><strong>6. Term:</strong> This Agreement shall commence on the date of execution and continue for 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
            <p className="mb-3"><strong>7. Termination:</strong> Either party may terminate this Agreement with 30 days written notice.</p>
            <p className="mb-4"><strong>8. Governing Law:</strong> This Agreement shall be governed by the laws of the state of Texas.</p>
          </div>

          <div className="mb-8">
            <h3 className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Signature <span className="text-red-500">*</span>
            </h3>
            {signatureUrl ? (
              <div className="border border-gray-300 rounded p-4 mb-4 text-gray-700">
                <img src={signatureUrl} alt="Partner signature" className="max-w-full h-auto" />
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded p-4 mb-4 text-gray-500 italic font-sfpro">
                No signature yet
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleSignFirst}
              disabled={!isChecked || loading}
              className={`flex-1 rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors ${
                isChecked && !loading
                  ? "bg-[#039994] hover:bg-[#02857f]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : hasSigned ? "Accept" : "Sign Agreement"}
            </button>
            <button
              onClick={() => router.back()}
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
    </>
  );
}