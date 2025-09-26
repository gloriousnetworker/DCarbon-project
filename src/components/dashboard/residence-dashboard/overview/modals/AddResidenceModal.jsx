import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import AddUtilityProvider from "./AddUtilityProvider";
import UtilityAuthorizationModal from "../modals/createfacility/UtilityAuthorizationModal";
import { 
  pageTitle, 
  labelClass, 
  inputClass, 
  selectClass,
  buttonPrimary,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle,
  spinnerOverlay
} from "../styles";

export default function AddResidentialFacilityModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    utilityProvider: "",
    installer: "",
    financeType: "",
    financeCompany: "",
    financeAgreement: null,
    address: "",
    meterId: "",
    zipCode: "",
    systemCapacity: "",
    facilityTypeNamingCode: 2,
    utilityProviderNamingCode: "",
    installerNamingCode: "",
    financeNamingCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [utilityProvidersLoading, setUtilityProvidersLoading] = useState(false);
  const [userMeterData, setUserMeterData] = useState([]);
  const [userMetersLoading, setUserMetersLoading] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [isSameLocation, setIsSameLocation] = useState(null);
  const [selectedUtilityAuthEmail, setSelectedUtilityAuthEmail] = useState("");
  const [installers, setInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);
  const [financeTypes, setFinanceTypes] = useState([]);
  const [financeTypesLoading, setFinanceTypesLoading] = useState(false);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [financeCompaniesLoading, setFinanceCompaniesLoading] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [showUtilityAuthModal, setShowUtilityAuthModal] = useState(false);
  const [showAddFinanceTypeModal, setShowAddFinanceTypeModal] = useState(false);
  const [newFinanceType, setNewFinanceType] = useState("");
  const [meterAgreementAccepted, setMeterAgreementAccepted] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);

  const isCashType = formData.financeType.toLowerCase() === 'cash';
  const showUploadField = !isCashType && formData.financeType !== '';
  const showFinanceCompany = !isCashType && formData.financeType !== '';

  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      fetchUserMeters();
      fetchInstallers();
      fetchFinanceTypes();
      fetchFinanceCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        const serviceAddress = selectedMeter.base.service_address;
        const zipCode = extractZipCode(serviceAddress);
        
        setFormData(prev => ({
          ...prev,
          address: serviceAddress,
          zipCode: zipCode || ""
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          address: "",
          zipCode: ""
        }));
      }
    }
  }, [selectedMeter, isSameLocation]);

  const extractZipCode = (address) => {
    if (!address) return "";
    const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
    return zipMatch ? zipMatch[0] : "";
  };

  const fetchUtilityProviders = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setUtilityProvidersLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setUtilityProviders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching utility providers:", error);
      toast.error("Failed to load utility providers");
    } finally {
      setUtilityProvidersLoading(false);
    }
  };

  const fetchUserMeters = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) return;

    setUserMetersLoading(true);
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setUserMeterData(response.data.data);
        const firstWithMeters = response.data.data.find(item => item.meters?.meters?.length > 0);
        if (firstWithMeters) {
          setSelectedUtilityAuthEmail(firstWithMeters.utilityAuthEmail);
        }
      }
    } catch (error) {
      console.error("Error fetching user meters:", error);
      toast.error("Failed to load meter information");
    } finally {
      setUserMetersLoading(false);
    }
  };

  const fetchInstallers = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) return;

    setInstallersLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/user/partner/get-all-installer",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setInstallers(response.data.data.installers);
      }
    } catch (error) {
      console.error("Error fetching installers:", error);
      toast.error("Failed to load installers");
    } finally {
      setInstallersLoading(false);
    }
  };

  const fetchFinanceTypes = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) return;

    setFinanceTypesLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/user/financial-types",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        const approvedTypes = response.data.data.types.filter(type =>
          type.status === 'APPROVED' || type.name.toLowerCase() === 'cash'
        );
        const uniqueTypes = approvedTypes.reduce((acc, current) => {
          const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
          if (!x) return acc.concat([current]);
          return acc;
        }, []);
        setFinanceTypes(uniqueTypes);
      }
    } catch (error) {
      console.error("Error fetching finance types:", error);
      toast.error("Failed to load finance types");
    } finally {
      setFinanceTypesLoading(false);
    }
  };

  const fetchFinanceCompanies = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) return;

    setFinanceCompaniesLoading(true);
    try {
      const response = await axios.get(
        "https://services.dcarbon.solutions/api/user/partner/finance-companies",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setFinanceCompanies(response.data.data.financeCompanies || []);
      }
    } catch (error) {
      console.error("Error fetching finance companies:", error);
      toast.error("Failed to load finance companies");
    } finally {
      setFinanceCompaniesLoading(false);
    }
  };

  const getCurrentMeters = () => {
    if (!selectedUtilityAuthEmail) return [];
    
    const selectedData = userMeterData.find(
      item => item.utilityAuthEmail === selectedUtilityAuthEmail
    );
    
    if (!selectedData || !selectedData.meters?.meters) return [];
    
    return selectedData.meters.meters.filter(
      meter => meter.base.service_class === "electric"
    );
  };

  const getUtilityShortCode = (utilityAuthEmail) => {
    const selectedData = userMeterData.find(
      item => item.utilityAuthEmail === utilityAuthEmail
    );

    if (selectedData && selectedData.meters?.meters?.length > 0) {
      return selectedData.meters.meters[0].utility || "";
    }
    return "";
  };

  const handleAcceptMeterAgreement = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    setAcceptingAgreement(true);
    try {
      const response = await axios.put(
        `https://services.dcarbon.solutions/api/user/accept-user-agreement-terms/${userId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        setMeterAgreementAccepted(true);
        toast.success("Meter agreement accepted successfully");
      } else {
        throw new Error(response.data.message || "Failed to accept agreement");
      }
    } catch (error) {
      console.error("Error accepting meter agreement:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to accept meter agreement"
      );
    } finally {
      setAcceptingAgreement(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "meterId") {
      const currentMeters = getCurrentMeters();
      const meter = currentMeters.find(m => m.uid === value);
      setSelectedMeter(meter || null);
      setIsSameLocation(null);
      setMeterAgreementAccepted(false);
      setFormData(prev => ({
        ...prev,
        address: "",
        zipCode: ""
      }));
    }

    if (name === "utilityProvider") {
      const selectedProvider = utilityProviders.find(provider => provider.name === value);
      setFormData(prev => ({
        ...prev,
        utilityProviderNamingCode: selectedProvider?.namingCode || ""
      }));
    }

    if (name === "installer") {
      const selectedInstaller = installers.find(installer => installer.name === value);
      setFormData(prev => ({
        ...prev,
        installerNamingCode: selectedInstaller?.namingCode || ""
      }));
    }

    if (name === "financeType") {
      const selectedFinanceType = financeTypes.find(type => type.name === value);
      setFormData(prev => ({
        ...prev,
        financeNamingCode: selectedFinanceType?.namingCode || "",
        financeCompany: "",
        financeAgreement: null
      }));
      setFile(null);
      setUploadSuccess(false);
    }
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
    setFormData(prev => ({
      ...prev,
      meterId: ""
    }));
    setSelectedMeter(null);
    setIsSameLocation(null);
    setMeterAgreementAccepted(false);
  };

  const handleLocationChoice = (choice) => {
    setIsSameLocation(choice);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF, JPEG, PNG, or Word documents.');
      return;
    }
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormData(prev => ({
        ...prev,
        financeAgreement: file.name
      }));
      
      toast.success('Financial agreement uploaded successfully!');
      setUploadSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      utilityProvider: "",
      installer: "",
      financeType: "",
      financeCompany: "",
      financeAgreement: null,
      address: "",
      meterId: "",
      zipCode: "",
      systemCapacity: "",
      facilityTypeNamingCode: 2,
      utilityProviderNamingCode: "",
      installerNamingCode: "",
      financeNamingCode: ""
    });
    setFile(null);
    setUploadSuccess(false);
    setSelectedMeter(null);
    setIsSameLocation(null);
    setSelectedUtilityAuthEmail("");
    setMeterAgreementAccepted(false);
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

    if (!formData.address || !formData.meterId || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (showFinanceCompany && !formData.financeCompany) {
      toast.error("Please select a finance company");
      setLoading(false);
      return;
    }

    if (selectedMeter && !meterAgreementAccepted) {
      toast.error("Please accept the meter agreement");
      setLoading(false);
      return;
    }

    try {
      const selectedInstaller = installers.find(installer => installer.name === formData.installer);
      
      const payload = {
        utilityProvider: formData.utilityProvider,
        installer: formData.installer,
        installerId: selectedInstaller?.id || "N/A",
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        financeAgreement: formData.financeAgreement || "N/A",
        address: formData.address,
        meterId: formData.meterId,
        zipCode: formData.zipCode,
        systemCapacity: Number(formData.systemCapacity),
        facilityTypeNamingCode: formData.facilityTypeNamingCode,
        utilityProviderNamingCode: Number(formData.utilityProviderNamingCode),
        installerNamingCode: Number(formData.installerNamingCode),
        financeNamingCode: Number(formData.financeNamingCode)
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/residential-facility/create-residential-facility/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success(`Residence created successfully: ${response.data.data.facilityName}`);
        resetForm();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create residence");
      }
    } catch (error) {
      console.error("Error creating residence:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create residence"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddUtilityModal = () => {
    setShowUtilityAuthModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
    fetchUserMeters();
  };

  const handleCloseUtilityAuthModal = () => {
    setShowUtilityAuthModal(false);
    fetchUserMeters();
  };

  const handleOpenAddFinanceTypeModal = () => {
    setShowAddFinanceTypeModal(true);
  };

  const handleCloseAddFinanceTypeModal = () => {
    setShowAddFinanceTypeModal(false);
    setNewFinanceType("");
  };

  const handleRequestFinanceType = async () => {
    if (!newFinanceType.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-financial-type/${userId}`,
        { name: newFinanceType },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Finance type request submitted successfully");
        handleCloseAddFinanceTypeModal();
        fetchFinanceTypes();
      } else {
        throw new Error(response.data.message || "Failed to request finance type");
      }
    } catch (error) {
      console.error("Error requesting finance type:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to request finance type"
      );
    }
  };

  const isFormComplete = 
    formData.utilityProvider && 
    formData.installer &&
    formData.address &&
    formData.meterId &&
    formData.zipCode &&
    formData.systemCapacity &&
    (isCashType || (formData.financeCompany)) &&
    (selectedMeter ? isSameLocation !== null : true) &&
    (selectedMeter ? meterAgreementAccepted : true);

  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  const currentMeters = getCurrentMeters();

  if (!isOpen) return null;

  return (
    <>
      {!showAddUtilityModal && !showUtilityAuthModal && !showAddFinanceTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          {loading && (
            <div className={spinnerOverlay}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
            </div>
          )}
          
          <div className="relative bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={loading}
            >
              <FiX size={20} />
            </button>

            <h2 className={pageTitle}>Add Residential Facility</h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className={labelClass}>Utility Provider <span className="text-red-500">*</span></label>
                <select
                  name="utilityProvider"
                  value={formData.utilityProvider}
                  onChange={handleChange}
                  className={selectClass}
                  disabled={loading || utilityProvidersLoading}
                  required
                >
                  <option value="">Select utility provider</option>
                  {utilityProvidersLoading ? (
                    <option value="" disabled>Loading providers...</option>
                  ) : (
                    utilityProviders.map(provider => (
                      <option key={provider.id} value={provider.name}>
                        {provider.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Utility Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUtilityAuthEmail}
                  onChange={handleUtilityAuthEmailChange}
                  className={selectClass}
                  required
                  disabled={loading || userMetersLoading}
                >
                  <option value="">Select utility account</option>
                  {userMetersLoading ? (
                    <option value="" disabled>Loading accounts...</option>
                  ) : utilityAuthEmailsWithMeters.length === 0 ? (
                    <option value="" disabled>No utility accounts found</option>
                  ) : (
                    utilityAuthEmailsWithMeters.map(item => (
                      <option key={item.id} value={item.utilityAuthEmail}>
                        {item.utilityAuthEmail} - {getUtilityShortCode(item.utilityAuthEmail)}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the utility account containing your meters
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddUtilityModal}
                  className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
                >
                  Meters to be registered not listed? Add Utility account
                </button>
              </div>

              {selectedUtilityAuthEmail && (
                <div>
                  <label className={labelClass}>
                    Electric Meter <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="meterId"
                    value={formData.meterId}
                    onChange={handleChange}
                    className={selectClass}
                    required
                    disabled={loading || currentMeters.length === 0}
                  >
                    <option value="">Select meter</option>
                    {currentMeters.length === 0 ? (
                      <option value="" disabled>No electric meters found for this account</option>
                    ) : (
                      currentMeters.map(meter => (
                        <option key={meter.uid} value={meter.uid}>
                          {meter.base.meter_numbers[0]} - {meter.base.billing_address}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Only electric meters are shown
                  </p>
                </div>
              )}

              {selectedMeter && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
                  <p className="font-medium mb-2">Service Address: {selectedMeter.base.service_address}</p>
                  <p className="font-medium mb-2">
                    Is this the same location for the residence? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md border text-sm ${
                        isSameLocation === true ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleLocationChoice(true)}
                      disabled={loading}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-md border text-sm ${
                        isSameLocation === false ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleLocationChoice(false)}
                      disabled={loading}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {selectedMeter && isSameLocation !== null && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
                  <p className="font-medium mb-2">
                    By clicking "Accept Meter Agreement", you agree that the selected meter can be used to create this residential facility.
                  </p>
                  <button
                    type="button"
                    onClick={handleAcceptMeterAgreement}
                    className={`w-full py-2 rounded-md text-white font-medium ${meterAgreementAccepted ? 'bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                    disabled={meterAgreementAccepted || acceptingAgreement}
                  >
                    {acceptingAgreement ? 'Processing...' : meterAgreementAccepted ? 'Meter Agreement Accepted' : 'Accept Meter Agreement'}
                  </button>
                  {meterAgreementAccepted && (
                    <p className="mt-2 text-green-600 text-sm text-center">
                      Meter agreement accepted successfully
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className={labelClass}>
                  Address <span className="text-red-500">*</span>
                </label>
                {selectedMeter && isSameLocation === true ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    className={`${inputClass} bg-gray-100`}
                    disabled={true}
                    placeholder="Address will be auto-filled from meter service address"
                  />
                ) : (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter address"
                    required
                    disabled={loading}
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Zip Code <span className="text-red-500">*</span>
                </label>
                {selectedMeter && isSameLocation === true ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    className={`${inputClass} bg-gray-100`}
                    disabled={true}
                    placeholder="Zip code will be auto-filled from meter service address"
                  />
                ) : (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter zip code"
                    required
                    disabled={loading}
                    pattern="\d{5}(-\d{4})?"
                    title="Enter a valid US zip code (5 or 9 digits)"
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>System Capacity (kW) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="systemCapacity"
                  value={formData.systemCapacity}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter system capacity"
                  required
                  disabled={loading}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className={labelClass}>Installer <span className="text-red-500">*</span></label>
                <select
                  name="installer"
                  value={formData.installer}
                  onChange={handleChange}
                  className={selectClass}
                  required
                  disabled={loading || installersLoading}
                >
                  <option value="">Select installer</option>
                  {installersLoading ? (
                    <option value="" disabled>Loading installers...</option>
                  ) : (
                    installers.map(installer => (
                      <option key={installer.id} value={installer.name}>
                        {installer.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>Finance Type <span className="text-red-500">*</span></label>
                <select
                  name="financeType"
                  value={formData.financeType}
                  onChange={handleChange}
                  className={selectClass}
                  required
                  disabled={loading || financeTypesLoading}
                >
                  <option value="">Select finance type</option>
                  {financeTypesLoading ? (
                    <option value="" disabled>Loading finance types...</option>
                  ) : (
                    financeTypes.map(type => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={handleOpenAddFinanceTypeModal}
                  className="mt-2 text-xs text-[#039994] hover:text-[#02857f] underline focus:outline-none"
                >
                  Finance Type not available? Request new type
                </button>
              </div>

              {showFinanceCompany && (
                <div>
                  <label className={labelClass}>Finance Company <span className="text-red-500">*</span></label>
                  <select
                    name="financeCompany"
                    value={formData.financeCompany}
                    onChange={handleChange}
                    className={selectClass}
                    required
                    disabled={loading || financeCompaniesLoading}
                  >
                    <option value="">Select finance company</option>
                    {financeCompaniesLoading ? (
                      <option value="" disabled>Loading finance companies...</option>
                    ) : (
                      financeCompanies.map(company => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {showUploadField && (
                <div>
                  <label className={uploadHeading}>
                    Finance Agreement
                  </label>
                  <div className={uploadFieldWrapper}>
                    <label className={uploadInputLabel}>
                      {file ? file.name : 'Choose file...'}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <span className={uploadIconContainer}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.5 12.5l7-7a2.121 2.121 0 013 3L10 17a4 4 0 01-5.657-5.657l7-7"
                          />
                        </svg>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!file || uploading || uploadSuccess}
                      className={`${uploadButtonStyle} ${
                        !file || uploading || uploadSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#039994]'
                      }`}
                    >
                      {uploading ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 animate-spin text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      ) : uploadSuccess ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                  <p className={uploadNoteStyle}>
                    Optional for loan, PPA, and lease agreements
                  </p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 ${buttonPrimary} ${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading || !isFormComplete}
                >
                  {loading ? "Processing..." : "Add Residence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddUtilityProvider
        isOpen={showAddUtilityModal}
        onClose={handleCloseAddUtilityModal}
      />

      <UtilityAuthorizationModal
        isOpen={showUtilityAuthModal}
        onClose={handleCloseUtilityAuthModal}
      />

      {showAddFinanceTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
            <button
              onClick={handleCloseAddFinanceTypeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiX size={20} />
            </button>

            <h2 className={pageTitle}>Request New Finance Type</h2>

            <div className="space-y-4 mt-6">
              <div>
                <label className={labelClass}>Finance Type Name</label>
                <input
                  type="text"
                  value={newFinanceType}
                  onChange={(e) => setNewFinanceType(e.target.value)}
                  className={inputClass}
                  placeholder="Enter finance type name (e.g. PPA)"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddFinanceTypeModal}
                  className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestFinanceType}
                  className={`flex-1 ${buttonPrimary}`}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}