"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaDownload } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jsPDF } from "jspdf";

const ContactInformation = ({ userData }) => {
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass = "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  const [isOpen, setIsOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [partnerType, setPartnerType] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  const baseUrl = "https://services.dcarbon.solutions";

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const userResponse = await axios.get(
          `${baseUrl}/api/user/get-one-user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const user = userResponse.data.data;
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setEmail(user.email || "");
        setUserType(user.userType || "");
        setReferralCode(user.referralCode || "");

        const partnerResponse = await axios.get(
          `${baseUrl}/api/user/partner/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        if (partnerResponse.data?.data?.partnerType) {
          setPartnerType(partnerResponse.data.data.partnerType);
        }

        const agreementResponse = await axios.get(
          `${baseUrl}/api/user/agreement/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        if (agreementResponse.data?.data?.signature) {
          setSignatureUrl(agreementResponse.data.data.signature);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("User not authenticated");
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
    };

    try {
      await axios.put(
        `${baseUrl}/api/user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("User information updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user information"
      );
      console.error("Update error:", error);
    }
  };

  const fetchSignatureAsBase64 = async (url) => {
    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");
      
      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        timeout: 10000
      });
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      throw new Error(`Failed to fetch signature: ${error.message}`);
    }
  };

  const loadImageAsBase64Fallback = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load image'));
      };
      
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const handleDownloadAgreement = async () => {
    if (!partnerType) {
      toast.error("No partner agreement available");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(3, 153, 148);
      doc.setFont('helvetica', 'bold');

      let agreementTitle = "";
      let agreementText = [];
      let fileName = "";

      if (partnerType === "sales_agent") {
        agreementTitle = "SALES AGENT AGREEMENT";
        fileName = "DCarbon_Sales_Agent_Agreement.pdf";
        agreementText = [
          "This Sales Agent Agreement ('Agreement') is made between DCarbon Solutions ('Company')",
          "and the undersigned Sales Agent ('Agent').",
          "",
          "1. Agent Responsibilities: Agent agrees to promote and sell renewable energy systems",
          "in accordance with Company standards, specifications, and sales guidelines.",
          "",
          "2. Commission Structure: Company shall pay Agent according to the agreed-upon",
          "commission schedule for completed sales that meet quality standards.",
          "",
          "3. Sales Standards: Agent agrees to maintain all sales activities to Company's quality",
          "standards and ethical guidelines.",
          "",
          "4. Training: Agent agrees to participate in Company-provided training programs and",
          "product education as required.",
          "",
          "5. Compliance: Agent agrees to comply with all applicable laws, regulations, and",
          "industry standards in sales activities.",
          "",
          "6. Confidentiality: Agent agrees to maintain confidentiality of Company proprietary",
          "information and customer data.",
          "",
          "7. Term: This Agreement shall commence on the date of execution and continue for",
          "12 months, automatically renewing for successive 12-month terms unless terminated.",
          "",
          "8. Termination: Either party may terminate this Agreement with 30 days written notice.",
          "",
          "9. Governing Law: This Agreement shall be governed by the laws of the state of Texas."
        ];
      } else if (partnerType === "installer") {
        agreementTitle = "PROGRAM PARTNER AGREEMENT";
        fileName = "DCarbon_Partner_Agreement.pdf";
        agreementText = [
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
      } else if (partnerType === "finance_company") {
        agreementTitle = "FINANCE COMPANY AGREEMENT";
        fileName = "DCarbon_Finance_Agreement.pdf";
        agreementText = [
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
      } else {
        toast.error("No valid partner type found");
        return;
      }

      doc.text(agreementTitle, 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
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
      doc.text('By signing below, I acknowledge that I have read and agree to the agreement', 105, yPosition, { align: 'center' });
      yPosition += 7;
      doc.text('presented in this document.', 105, yPosition, { align: 'center' });
      yPosition += 20;
      
      if (signatureUrl) {
        try {
          toast.loading("Adding signature to document...");
          let signatureBase64;
          
          try {
            signatureBase64 = await fetchSignatureAsBase64(signatureUrl);
          } catch (fetchError) {
            console.log('Fetch method failed, trying direct image load:', fetchError.message);
            signatureBase64 = await loadImageAsBase64Fallback(signatureUrl);
          }
          
          const imgWidth = 50;
          const imgHeight = 25;
          doc.addImage(signatureBase64, 'PNG', 40, yPosition, imgWidth, imgHeight);
          
          doc.setFontSize(8);
          doc.text('Digitally Signed', 65, yPosition + imgHeight + 3, { align: 'center' });
          
          yPosition += imgHeight + 10;
          toast.dismiss();
        } catch (error) {
          console.error('All signature loading methods failed:', error);
          toast.dismiss();
          
          doc.line(40, yPosition, 90, yPosition);
          doc.setFontSize(8);
          doc.text('Signature', 65, yPosition + 5, { align: 'center' });
          yPosition += 15;
        }
      } else {
        doc.line(40, yPosition, 90, yPosition);
        doc.setFontSize(8);
        doc.text('Signature', 65, yPosition + 5, { align: 'center' });
        yPosition += 15;
      }
      
      const currentDate = new Date().toLocaleDateString();
      doc.line(130, yPosition - 15, 170, yPosition - 15);
      doc.setFontSize(8);
      doc.text('Date', 150, yPosition - 10, { align: 'center' });
      doc.text(currentDate, 150, yPosition - 5, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Printed Name: ${firstName} ${lastName}`, 40, yPosition + 5);
      doc.text('Company Name: DCarbon Solutions', 40, yPosition + 15);
      
      doc.save(fileName);
      toast.success("Agreement downloaded successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate agreement PDF");
    }
  };

  if (loading) {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={sectionTitle}>Contact Information</h2>
          {isOpen ? (
            <FaChevronUp className="text-[#039994]" size={20} />
          ) : (
            <FaChevronDown className="text-[#039994]" size={20} />
          )}
        </div>
        {isOpen && (
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <Toaster />
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Personal Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="First Name"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>User Type</label>
              <input
                type="text"
                value={userType}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Referral Code</label>
              <input
                type="text"
                value={referralCode}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {partnerType && (
            <div>
              <label className={labelClass}>Partner Type</label>
              <div className="w-full px-3 py-2 bg-[#1e1e1e] text-white rounded font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]">
                {partnerType}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleUpdate}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              Update Contact Information
            </button>
            <button
              onClick={handleDownloadAgreement}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              <FaDownload size={16} /> Download Agreement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInformation;