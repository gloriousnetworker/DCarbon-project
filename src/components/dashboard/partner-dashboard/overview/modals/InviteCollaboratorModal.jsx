import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteCollaboratorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
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
    zipCode: "",
    epcMode: false,
    installerId: ""
  });
  const [loading, setLoading] = useState(false);
  const [isSalesAgent, setIsSalesAgent] = useState(false);
  const [isFinanceCompany, setIsFinanceCompany] = useState(false);
  const [isInstaller, setIsInstaller] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [zipCodeError, setZipCodeError] = useState("");
  const [installers, setInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);
  const [partnerType, setPartnerType] = useState("");
  const [states] = useState([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]);

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
          setFormData(prev => ({ ...prev, customerType: "PARTNER", role: "SALES_AGENT" }));
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

  useEffect(() => {
    if (isOpen && formData.epcMode && isFinanceCompany) {
      fetchInstallers();
    }
  }, [isOpen, formData.epcMode, isFinanceCompany]);

  const fetchInstallers = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setInstallersLoading(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-users-referrals/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        const filteredInstallers = response.data.data.referrals.filter(
          referral => 
            referral.customerType === "PARTNER" &&
            referral.role === "INSTALLER" &&
            referral.status === "ACCEPTED"
        );
        setInstallers(filteredInstallers);
      }
    } catch (error) {
      console.error("Error fetching installers:", error);
      toast.error("Failed to load installers");
    } finally {
      setInstallersLoading(false);
    }
  };

  const getInviterUserType = () => {
    if (partnerType === "sales_agent") return "SALES_AGENT";
    if (partnerType === "finance_company") return "FINANCE_COMPANY";
    if (partnerType === "installer") return "INSTALLER";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "zipCode") {
      if (!value.trim()) {
        setZipCodeError("Zip code is required");
      } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
        setZipCodeError("Invalid zip code format");
      } else {
        setZipCodeError("");
      }
    }

    if (name === "customerType") {
      if (value === "RESIDENTIAL") {
        setFormData(prev => ({ ...prev, role: "OWNER" }));
      } else if (value === "COMMERCIAL") {
        setFormData(prev => ({ ...prev, role: "OWNER" }));
      } else if (value === "PARTNER") {
        setFormData(prev => ({ ...prev, role: "SALES_AGENT" }));
      }
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = value;

    if (value.length > 3 && value.length <= 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }

    setFormData(prev => ({
      ...prev,
      phoneNumber: formattedValue
    }));
  };

  const resetForm = () => {
    setFormData({
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
      zipCode: "",
      epcMode: false,
      installerId: ""
    });
    setZipCodeError("");
  };

  const sendFacilityInvite = async (userId, authToken) => {
    try {
      const fullAddress = `${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-facility/${userId}`,
        {
          inviteeEmail: formData.email,
          zipCode: formData.zipCode,
          streetNo: fullAddress,
          message: formData.message || ""
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.status === "success") {
        toast.success(response.data.message || "Facility invitation sent successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending facility invitation:", error);
      return false;
    }
  };

  const assignInstallerToCustomer = async (userId, authToken, installerEmail, installerName) => {
    try {
      const installerResponse = await axios.get(
        `https://services.dcarbon.solutions/api/user/${installerEmail}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (installerResponse.data.status === "success") {
        const installerId = installerResponse.data.data.id;
        
        const assignResponse = await axios.put(
          `https://services.dcarbon.solutions/api/user/referral/assign-installer/${userId}`,
          {
            inviteeEmail: formData.email,
            installerId: installerId,
            installerName: installerName
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`
            }
          }
        );

        return assignResponse.data.status === "success";
      }
      return false;
    } catch (error) {
      console.error("Error assigning installer:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    const { name, email, phoneNumber, customerType, role, message, address1, city, state, zipCode, epcMode, installerId } = formData;

    if (!email) {
      toast.error("Please enter an email address");
      setLoading(false);
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    if (!isSalesAgent) {
      if (!address1 || !city || !state || !zipCode) {
        toast.error("Please complete all address fields");
        setLoading(false);
        return;
      }

      if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
        toast.error("Please enter a valid zip code");
        setLoading(false);
        return;
      }
    }

    if (epcMode && !installerId) {
      toast.error("Please select an installer for EPC mode");
      setLoading(false);
      return;
    }

    const inviterUserType = getInviterUserType();

    const payload = {
      invitees: [
        {
          name,
          email,
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          customerType,
          role,
          inviterUserType,
          ...(message && { message })
        }
      ]
    };

    try {
      const userResponse = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (userResponse.data.status === "success") {
        toast.success("Customer invitation sent successfully");
        
        if (!isSalesAgent) {
          const facilitySuccess = await sendFacilityInvite(userId, authToken);
          
          if (epcMode && installerId) {
            const selectedInstaller = installers.find(inst => inst.id === installerId);
            if (selectedInstaller) {
              const installerAssignmentSuccess = await assignInstallerToCustomer(
                userId, 
                authToken, 
                selectedInstaller.inviteeEmail, 
                selectedInstaller.name || selectedInstaller.inviteeEmail
              );

              if (installerAssignmentSuccess) {
                toast.success("Installer assigned successfully");
              } else {
                toast.error("Failed to assign installer");
              }
            }
          }
        }
        
        resetForm();
        onClose();
      } else {
        throw new Error(userResponse.data.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send invitation"
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
      <div className="relative bg-white p-5 rounded-lg w-full max-w-lg text-sm max-h-[90vh] overflow-y-auto">
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

        {loading && (
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

          <h2 className={`text-base font-semibold ${pageTitle} text-center ${formData.epcMode ? "text-green-600" : ""}`}>
            {formData.epcMode ? "EPC MODE ACTIVATED" : "Invite a Customer"}
          </h2>
          
          {formData.epcMode && (
            <p className="text-gray-500 text-xs text-center mt-1">
              Select an installer to attach to your customer for registration assistance
            </p>
          )}
        </div>

        {isFinanceCompany && (
          <div className="flex items-center justify-center my-4">
            <label className="flex items-center cursor-pointer">
              <div className="mr-3 text-xs font-medium text-gray-700">
                EPC Assisted Mode
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.epcMode}
                  onChange={() => setFormData(prev => ({ ...prev, epcMode: !prev.epcMode, installerId: "" }))}
                />
                <div className={`w-14 h-7 rounded-full ${formData.epcMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.epcMode ? 'transform translate-x-7' : ''}`}></div>
              </div>
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 mt-3">
          <div>
            <label className={`${labelClass} text-xs`}>Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter customer's email"
              required
            />
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Phone Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className={`${inputClass} text-xs`}
              placeholder="(555) 555-5555"
              required
            />
          </div>

          {!isSalesAgent && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`${labelClass} text-xs`}>Address 1 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleAddressChange}
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
                    value={formData.address2}
                    onChange={handleAddressChange}
                    className={`${inputClass} text-xs`}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`${labelClass} text-xs`}>City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleAddressChange}
                    className={`${inputClass} text-xs`}
                    placeholder="SAN DIEGO"
                    required
                  />
                </div>
                <div>
                  <label className={`${labelClass} text-xs`}>State <span className="text-red-500">*</span></label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
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
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`${inputClass} text-xs ${zipCodeError ? "border-red-500" : ""}`}
                    placeholder="92105"
                    pattern="^\d{5}(-\d{4})?$"
                    required
                  />
                  {zipCodeError && (
                    <p className="text-red-500 text-xs mt-1">{zipCodeError}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                Address must match the service address of your facility meter exactly
              </p>
            </>
          )}

          <div>
            <label className={`${labelClass} text-xs`}>Customer Type <span className="text-red-500">*</span></label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className={`${selectClass} text-xs`}
              required
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              {isSalesAgent && <option value="PARTNER">Partner</option>}
            </select>
          </div>

          <div>
            <label className={`${labelClass} text-xs`}>Role <span className="text-red-500">*</span></label>
            {formData.customerType === "COMMERCIAL" ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${selectClass} text-xs`}
                required
              >
                {commercialRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            ) : formData.customerType === "PARTNER" ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
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

          {formData.epcMode && (
            <div>
              <label className={`${labelClass} text-xs`}>Select Installer <span className="text-red-500">*</span></label>
              {installersLoading ? (
                <div className="flex justify-center">
                  <Loader size="small" />
                </div>
              ) : (
                <select
                  name="installerId"
                  value={formData.installerId}
                  onChange={handleChange}
                  className={`${selectClass} text-xs`}
                  required={formData.epcMode}
                >
                  <option value="">Select an installer</option>
                  {installers.map((installer) => (
                    <option key={installer.id} value={installer.id}>
                      {installer.name || installer.inviteeEmail}
                    </option>
                  ))}
                </select>
              )}
              {installers.length === 0 && !installersLoading && (
                <p className="text-red-500 text-xs mt-1">No registered installers found</p>
              )}
            </div>
          )}

          <div>
            <label className={`${labelClass} text-xs`}>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} text-xs h-16 resize-none`}
              placeholder="Add a custom message (optional)"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} ${formData.epcMode ? "bg-green-600 hover:bg-green-700" : ""} flex items-center justify-center py-1 text-xs`}
              disabled={loading || (formData.epcMode && installers.length === 0)}
            >
              {formData.epcMode ? "Invite by EPC Mode" : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}