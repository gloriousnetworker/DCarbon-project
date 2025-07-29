"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaTimes } from "react-icons/fa";
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
  const [signatureData, setSignatureData] = useState(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setScrolledToBottom(isBottom);
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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

      return await response.json();
    } catch (error) {
      console.error("Error accepting user agreement:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!isChecked) {
      toast.error("Please accept the agreement first");
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

  const handleSignFirst = () => {
    if (!isChecked) {
      toast.error("Please accept the agreement first");
      return;
    }
    setShowSignatureModal(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'normal');
    
    doc.setFontSize(14);
    doc.setTextColor(3, 153, 148);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRAM PARTNER AGREEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const agreementText = [
      "This Program Partner Agreement ('Agreement') is made between DCarbon Solutions ('Company')",
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
    doc.text('By signing below, I acknowledge that I have read and agree to the Program Partner', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('Agreement presented in this document.', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    if (signatureData) {
      const img = new Image();
      img.src = signatureData;
      doc.addImage(img, 'PNG', 40, yPosition, 40, 20);
      yPosition += 25;
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
    
    doc.save("DCarbon_Partner_Agreement.pdf");
  };

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <CustomerIDLoader />
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <button 
            onClick={() => router.back()}
            className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
          >
            <FaTimes size={24} />
          </button>

          <div className="border-b border-gray-300 mt-4"></div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
                Program Partner Agreement
              </h2>
              <button onClick={handleDownload} className="text-[#15104D] hover:opacity-80">
                <FaDownload size={20} />
              </button>
            </div>

            <div className="border-b border-gray-300 mb-4"></div>

            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#039994] border-gray-300 rounded focus:ring-[#039994] accent-[#039994]"
              />
              <label className="ml-3 font-sfpro font-[400] text-[14px] leading-[150%] text-[#039994] cursor-pointer">
                I agree to the Program Partner Agreement <span className="text-red-500">*</span>
              </label>
            </div>

            <div
              ref={contentRef}
              className="agreement-content h-[300px] overflow-y-auto mb-6 font-sfpro text-[12px] leading-[150%] font-[400] text-[#1E1E1E] p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="font-bold text-[#039994] mb-2">PROGRAM PARTNER AGREEMENT</h3>
              <p className="mb-4">
                This Program Partner Agreement ("Agreement") is made between DCarbon Solutions ("Company") and the undersigned Partner ("Partner").
              </p>
              <p className="mb-2"><strong>1. Partner Responsibilities:</strong> Partner agrees to install, maintain, and service renewable energy systems in accordance with Company standards and specifications.</p>
              <p className="mb-2"><strong>2. Compensation:</strong> Company shall pay Partner according to the agreed-upon rate schedule for completed installations that meet quality standards.</p>
              <p className="mb-2"><strong>3. Quality Standards:</strong> Partner agrees to maintain all installations to Company's quality standards and specifications.</p>
              <p className="mb-2"><strong>4. Training:</strong> Partner agrees to participate in Company-provided training programs as required.</p>
              <p className="mb-2"><strong>5. Insurance:</strong> Partner agrees to maintain adequate liability insurance coverage for all installation activities.</p>
              <p className="mb-2"><strong>6. Term:</strong> This Agreement shall commence on the date of execution and continue for 12 months, automatically renewing for successive 12-month terms unless terminated.</p>
              <p className="mb-2"><strong>7. Termination:</strong> Either party may terminate this Agreement with 30 days written notice.</p>
              <p className="mb-4"><strong>8. Governing Law:</strong> This Agreement shall be governed by the laws of the state of Texas.</p>
            </div>

            <div className="mb-6">
              <h3 className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                Signature <span className="text-red-500">*</span>
              </h3>
              {signatureData ? (
                <div className="border border-gray-300 rounded p-4 mb-2 text-gray-700">
                  <img src={signatureData} alt="Partner signature" className="max-w-full h-auto" />
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded p-4 mb-2 text-gray-500 italic font-sfpro">
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
                {loading ? "Processing..." : signatureData ? "Accept" : "Sign Agreement"}
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
        onClose={() => setShowSignatureModal(false)}
        onSaveSignature={handleSaveSignature}
      />
    </>
  );
}