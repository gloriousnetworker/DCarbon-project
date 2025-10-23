import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteCollaboratorModal({ isOpen, onClose }) {
  const [invitees, setInvitees] = useState([
    {
      name: "",
      email: "",
      phoneNumber: "",
      customerType: "RESIDENTIAL",
      role: "OWNER",
      message: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: ""
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [phoneErrors, setPhoneErrors] = useState([]);
  const [zipCodeErrors, setZipCodeErrors] = useState([]);
  const [isSalesAgent, setIsSalesAgent] = useState(false);
  const [isFinanceCompany, setIsFinanceCompany] = useState(false);
  const [isInstaller, setIsInstaller] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [partnerType, setPartnerType] = useState("");
  const fileInputRef = useRef(null);
  const [states] = useState([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]);

  const MAX_INVITEES = 100;

  useEffect(() => {
    const checkUserRole = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) return;

      try {
        const response = await axios.get(
          `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );

        const partnerType = response.data.data?.partnerType;
        setPartnerType(partnerType);

        if (partnerType === "sales_agent") {
          setIsSalesAgent(true);
        } else if (partnerType === "finance_company") {
          setIsFinanceCompany(true);
        } else if (partnerType === "installer") {
          setIsInstaller(true);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setUserLoaded(true);
      }
    };

    if (isOpen) checkUserRole();
  }, [isOpen]);

  const getInviterUserType = () => {
    if (partnerType === "sales_agent") return "SALES_AGENT";
    if (partnerType === "finance_company") return "FINANCE_COMPANY";
    if (partnerType === "installer") return "INSTALLER";
    return "";
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newInvitees = [...invitees];
    
    if (name === "phoneNumber") {
      const phoneRegex = /^[0-9+]*$/;
      const newPhoneErrors = [...phoneErrors];
      
      if (!phoneRegex.test(value)) {
        newPhoneErrors[index] = "Phone number can only contain numbers and +";
      } else if (value.length > 15) {
        newPhoneErrors[index] = "Phone number cannot exceed 15 characters";
      } else {
        newPhoneErrors[index] = "";
      }
      setPhoneErrors(newPhoneErrors);
    }
    
    if (name === "zipCode") {
      const newZipCodeErrors = [...zipCodeErrors];
      if (!value.trim()) {
        newZipCodeErrors[index] = "Zip code is required";
      } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
        newZipCodeErrors[index] = "Invalid zip code format";
      } else {
        newZipCodeErrors[index] = "";
      }
      setZipCodeErrors(newZipCodeErrors);
    }
    
    newInvitees[index] = {
      ...newInvitees[index],
      [name]: value
    };

    if (name === "customerType") {
      if (value === "RESIDENTIAL") {
        newInvitees[index].role = "OWNER";
      } else if (value === "COMMERCIAL") {
        newInvitees[index].role = "OWNER";
      } else if (value === "PARTNER") {
        newInvitees[index].role = "SALES_AGENT";
      }
    }

    setInvitees(newInvitees);
  };

  const handleAddressChange = (index, e) => {
    const { name, value } = e.target;
    const newInvitees = [...invitees];
    
    newInvitees[index] = {
      ...newInvitees[index],
      [name]: value.toUpperCase()
    };
    
    setInvitees(newInvitees);
  };

  const addInvitee = () => {
    if (invitees.length >= MAX_INVITEES) {
      toast.error(`Maximum ${MAX_INVITEES} invitees allowed per submission`);
      return;
    }
    setInvitees([
      ...invitees,
      {
        name: "",
        email: "",
        phoneNumber: "",
        customerType: isSalesAgent ? "PARTNER" : "RESIDENTIAL",
        role: isSalesAgent ? "SALES_AGENT" : "OWNER",
        message: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: ""
      }
    ]);
    setPhoneErrors([...phoneErrors, ""]);
    setZipCodeErrors([...zipCodeErrors, ""]);
  };

  const removeInvitee = (index) => {
    if (invitees.length === 1) {
      toast.error("At least one invitee is required");
      return;
    }
    const newInvitees = [...invitees];
    newInvitees.splice(index, 1);
    setInvitees(newInvitees);
    
    const newPhoneErrors = [...phoneErrors];
    newPhoneErrors.splice(index, 1);
    setPhoneErrors(newPhoneErrors);
    
    const newZipCodeErrors = [...zipCodeErrors];
    newZipCodeErrors.splice(index, 1);
    setZipCodeErrors(newZipCodeErrors);
  };

  const resetForm = () => {
    setInvitees([
      {
        name: "",
        email: "",
        phoneNumber: "",
        customerType: isSalesAgent ? "PARTNER" : "RESIDENTIAL",
        role: isSalesAgent ? "SALES_AGENT" : "OWNER",
        message: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: ""
      }
    ]);
    setPhoneErrors([""]);
    setZipCodeErrors([""]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,phoneNumber,customerType,role,message,address1,address2,city,state,zipCode\n" +
      "John Doe,john@example.com,+1234567890,RESIDENTIAL,OWNER,Welcome to our platform,5348 UNIVERSITY AVE,Apt 2C,SAN DIEGO,CA,92104\n" +
      "Jane Smith,jane@example.com,+1987654321,COMMERCIAL,OPERATOR,Commercial account setup,123 MAIN ST,,ANYTOWN,CA,12345\n" +
      "Sales Agent,sales@example.com,+1122334455,PARTNER,SALES_AGENT,Partner invitation,456 OAK AVE,Suite 100,SOMETOWN,CA,67890";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_invite_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setCsvLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        const rows = csvData.split('\n');
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase().replace(/\s+/g, ''));
        
        const requiredHeaders = ['email', 'name', 'address1', 'city', 'state', 'zipcode'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
        
        const newInvitees = [];
        const newPhoneErrors = [];
        const newZipCodeErrors = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          if (newInvitees.length >= MAX_INVITEES) {
            toast("Only the first ${MAX_INVITEES} invitees will be processed", {
              icon: "⚠️",
              style: {
                background: "#FEF3C7",
                color: "#92400E",
              }
            });
            break;
          }
          
          const values = rows[i].split(',').map(val => val.trim());
          if (values.length !== headers.length) {
            toast(`Row ${i} has incorrect format and was skipped`, {
              icon: "⚠️",
              style: {
                background: "#FEF3C7",
                color: "#92400E",
              }
            });
            continue;
          }
          
          const invitee = {
            name: "",
            email: "",
            phoneNumber: "",
            customerType: isSalesAgent ? "PARTNER" : "RESIDENTIAL",
            role: isSalesAgent ? "SALES_AGENT" : "OWNER",
            message: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zipCode: ""
          };
          
          headers.forEach((header, index) => {
            if (header === 'customertype') {
              const type = values[index].toUpperCase();
              invitee.customerType = ['RESIDENTIAL', 'COMMERCIAL', 'PARTNER'].includes(type) ? type : 
                isSalesAgent ? 'PARTNER' : 'RESIDENTIAL';
            } 
            else if (header === 'role') {
              const role = values[index].toUpperCase();
              if (invitee.customerType === 'COMMERCIAL' && ['OWNER', 'OPERATOR', 'BOTH'].includes(role)) {
                invitee.role = role;
              } 
              else if (invitee.customerType === 'PARTNER' && ['SALES_AGENT', 'FINANCE_COMPANY', 'INSTALLER'].includes(role)) {
                invitee.role = role;
              } 
              else if (invitee.customerType === 'RESIDENTIAL') {
                invitee.role = 'OWNER';
              }
            }
            else if (header === 'phonenumber' || header === 'phone') {
              const phoneValue = values[index].replace(/[^0-9+]/g, '');
              invitee.phoneNumber = phoneValue;
            }
            else if (header === 'zipcode') {
              invitee.zipCode = values[index];
            }
            else if (Object.keys(invitee).includes(header)) {
              invitee[header] = values[index];
            }
          });
          
          if (invitee.email && invitee.address1 && invitee.city && invitee.state && invitee.zipCode) {
            newInvitees.push(invitee);
            newPhoneErrors.push("");
            newZipCodeErrors.push("");
          }
        }
        
        if (newInvitees.length === 0) {
          throw new Error("No valid invitees found in CSV file");
        }
        
        setInvitees(newInvitees);
        setPhoneErrors(newPhoneErrors);
        setZipCodeErrors(newZipCodeErrors);
        toast.success(`Successfully imported ${newInvitees.length} invitees from CSV`);
      } catch (error) {
        console.error("CSV Processing Error:", error);
        toast.error(error.message || "Failed to process CSV file");
      } finally {
        setCsvLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading CSV file");
      setCsvLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    reader.readAsText(file);
  };

  const triggerCsvUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const sendFacilityInvite = async (invitee, userId, authToken) => {
    try {
      const fullAddress = `${invitee.address1}${invitee.address2 ? ', ' + invitee.address2 : ''}, ${invitee.city}, ${invitee.state} ${invitee.zipCode}`;
      
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-facility/${userId}`,
        {
          inviteeEmail: invitee.email,
          zipCode: invitee.zipCode,
          streetNo: fullAddress,
          message: invitee.message || ""
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      return response.data.status === "success";
    } catch (error) {
      console.error("Error sending facility invitation:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasPhoneErrors = phoneErrors.some(error => error);
    const hasZipCodeErrors = zipCodeErrors.some(error => error);
    
    if (hasPhoneErrors || hasZipCodeErrors) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    const invalidPhoneNumbers = invitees.filter(invitee => 
      invitee.phoneNumber && !/^\+?[0-9]{10,15}$/.test(invitee.phoneNumber)
    );
    
    if (invalidPhoneNumbers.length > 0) {
      toast.error("Please enter valid phone numbers (10-15 digits)");
      return;
    }

    const invalidZipCodes = invitees.filter(invitee => 
      !/^\d{5}(-\d{4})?$/.test(invitee.zipCode)
    );
    
    if (invalidZipCodes.length > 0) {
      toast.error("Please enter valid zip codes");
      return;
    }

    const missingRequiredFields = invitees.filter(invitee => 
      !invitee.email || !invitee.address1 || !invitee.city || !invitee.state || !invitee.zipCode
    );
    
    if (missingRequiredFields.length > 0) {
      toast.error("Please fill in all required fields for all invitees");
      return;
    }

    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const inviterUserType = getInviterUserType();
      
      const userInvitePayload = {
        invitees: invitees.map(({ name, email, phoneNumber, customerType, role, message }) => ({
          name,
          email,
          phoneNumber,
          customerType,
          role,
          inviterUserType,
          ...(message && { message })
        }))
      };

      const userResponse = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        userInvitePayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (userResponse.data.status === "success") {
        const facilityInviteResults = await Promise.all(
          invitees.map(invitee => sendFacilityInvite(invitee, userId, authToken))
        );
        
        const successfulFacilityInvites = facilityInviteResults.filter(result => result).length;
        
        if (successfulFacilityInvites === invitees.length) {
          toast.success(`Successfully sent ${invitees.length} invitation${invitees.length > 1 ? 's' : ''} with facility details`);
        } else {
          toast(`Sent user invitations but ${invitees.length - successfulFacilityInvites} facility invitations failed`, {
            icon: "⚠️",
            style: {
              background: "#FEF3C7",
              color: "#92400E",
            }
          });
        }
        
        resetForm();
        onClose();
        window.location.reload();
      } else {
        throw new Error(userResponse.data.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send invitations"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !userLoaded) return null;

  const partnerRoles = [
    { value: "SALES_AGENT", label: "Sales Agent" },
    { value: "FINANCE_COMPANY", label: "Finance Company" },
    { value: "INSTALLER", label: "Contractor/EPC" }
  ];

  const commercialRoles = [
    { value: "OWNER", label: "Owner" },
    { value: "OPERATOR", label: "Operator" },
    { value: "BOTH", label: "Both" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 overflow-y-auto">
      <div className="relative bg-white p-5 rounded-lg w-full max-w-4xl text-sm max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {(loading || csvLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Invite Collaborator"
              className="h-16 w-auto"
            />
          </div>

          <h2 className={`text-base font-semibold ${pageTitle} text-center`}>Invite Customers</h2>
          <p className="text-gray-500 text-xs mb-4">Send invitations to one or multiple customers at once</p>
        </div>

        <div className="mb-6 mt-2 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <div className="flex flex-col items-center justify-center text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="text-sm font-medium mb-1">Import invitees from CSV</p>
            <p className="text-xs text-gray-500 mb-3">CSV should include columns: name, email, phoneNumber, customerType, role, message, address1, address2, city, state, zipCode</p>
            <p className="text-xs text-gray-500 mb-3">Maximum {MAX_INVITEES} invitees per upload</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCsvUpload}
              accept=".csv"
              className="hidden"
              disabled={loading || csvLoading}
            />
            
            <div className="flex space-x-2">
              <button 
                type="button"
                onClick={triggerCsvUpload}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || csvLoading}
              >
                Upload CSV File
              </button>
              <button 
                type="button"
                onClick={downloadTemplate}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || csvLoading}
              >
                Download Template
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {invitees.map((invitee, index) => (
            <div key={index} className="border rounded-lg p-3 relative">
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <h3 className="font-medium text-sm">Invitee #{index + 1}</h3>
                {invitees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvitee(index)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className={`${labelClass} text-xs`}>Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={invitee.name}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs`}
                    placeholder="Enter customer's name"
                    required
                  />
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={invitee.email}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs`}
                    placeholder="Enter customer's email"
                    required
                  />
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={invitee.phoneNumber}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs ${phoneErrors[index] ? "border-red-500" : ""}`}
                    placeholder="Enter phone number (e.g. +1234567890)"
                    pattern="^\+?[0-9]{10,15}$"
                    maxLength={15}
                  />
                  {phoneErrors[index] && (
                    <p className="text-red-500 text-xs mt-1">{phoneErrors[index]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 md:col-span-2">
                  <div>
                    <label className={`${labelClass} text-xs`}>Address 1 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="address1"
                      value={invitee.address1}
                      onChange={(e) => handleAddressChange(index, e)}
                      className={`${inputClass} text-xs`}
                      placeholder="5348 UNIVERSITY AVE"
                      required
                    />
                  </div>
                  <div>
                    <label className={`${labelClass} text-xs`}>Address 2</label>
                    <input
                      type="text"
                      name="address2"
                      value={invitee.address2}
                      onChange={(e) => handleAddressChange(index, e)}
                      className={`${inputClass} text-xs`}
                      placeholder="Apt, suite, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  <div>
                    <label className={`${labelClass} text-xs`}>City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="city"
                      value={invitee.city}
                      onChange={(e) => handleAddressChange(index, e)}
                      className={`${inputClass} text-xs`}
                      placeholder="SAN DIEGO"
                      required
                    />
                  </div>
                  <div>
                    <label className={`${labelClass} text-xs`}>State <span className="text-red-500">*</span></label>
                    <select
                      name="state"
                      value={invitee.state}
                      onChange={(e) => handleChange(index, e)}
                      className={`${selectClass} text-xs`}
                      required
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`${labelClass} text-xs`}>Zip Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="zipCode"
                      value={invitee.zipCode}
                      onChange={(e) => handleChange(index, e)}
                      className={`${inputClass} text-xs ${zipCodeErrors[index] ? "border-red-500" : ""}`}
                      placeholder="92105"
                      pattern="^\d{5}(-\d{4})?$"
                      required
                    />
                    {zipCodeErrors[index] && (
                      <p className="text-red-500 text-xs mt-1">{zipCodeErrors[index]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>Customer Type <span className="text-red-500">*</span></label>
                  <select
                    name="customerType"
                    value={invitee.customerType}
                    onChange={(e) => handleChange(index, e)}
                    className={`${selectClass} text-xs`}
                    required
                  >
                    <option value="RESIDENTIAL">Residential Owner</option>
                    <option value="COMMERCIAL">Commercial Owner</option>
                    {isSalesAgent && <option value="PARTNER">Industry Partner</option>}
                  </select>
                </div>

                <div>
                  <label className={`${labelClass} text-xs`}>Role <span className="text-red-500">*</span></label>
                  {invitee.customerType === "COMMERCIAL" ? (
                    <select
                      name="role"
                      value={invitee.role}
                      onChange={(e) => handleChange(index, e)}
                      className={`${selectClass} text-xs`}
                      required
                    >
                      {commercialRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : invitee.customerType === "PARTNER" ? (
                    <select
                      name="role"
                      value={invitee.role}
                      onChange={(e) => handleChange(index, e)}
                      className={`${selectClass} text-xs`}
                      required
                    >
                      {partnerRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value="Owner"
                      disabled
                      className={`${inputClass} bg-gray-100 text-xs cursor-not-allowed`}  
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`${labelClass} text-xs`}>Message</label>
                  <textarea
                    name="message"
                    value={invitee.message}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs h-16 resize-none`}
                    placeholder="Add a custom message (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={addInvitee}
              className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none text-xs font-medium"
              disabled={invitees.length >= MAX_INVITEES}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Another Invitee
            </button>
          </div>

          <div className="flex space-x-2 pt-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading || csvLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} flex items-center justify-center py-2 text-xs`}
              disabled={loading || csvLoading || phoneErrors.some(error => error) || zipCodeErrors.some(error => error)}
            >
              {invitees.length > 1 ? 'Send Invitations' : 'Send Invitation'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          CSV should contain columns: name, email, phoneNumber, customerType (RESIDENTIAL/COMMERCIAL/PARTNER), role (OWNER/OPERATOR/BOTH/SALES_AGENT/FINANCE_COMPANY/CONTRACTOR/EPC), message, address1, address2, city, state, zipCode
        </div>
      </div>
    </div>
  );
}