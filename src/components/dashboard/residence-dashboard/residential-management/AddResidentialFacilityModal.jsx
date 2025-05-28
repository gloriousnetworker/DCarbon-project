import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
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
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function AddResidentialFacilityModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    utilityProvider: "",
    installer: "",
    financeType: "",
    financeCompany: "",
    financeAgreement: null,
    address: "",
    meterId: "",
    zipCode: ""
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

  // Fetch utility providers and meters on modal open
  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
      fetchUserMeters();
    }
  }, [isOpen]);

  // Update address when location choice changes
  useEffect(() => {
    if (selectedMeter && isSameLocation !== null) {
      if (isSameLocation === true) {
        // Use meter's service address and extract zip code
        const serviceAddress = selectedMeter.base.service_address;
        const zipCode = extractZipCode(serviceAddress);
        
        setFormData(prev => ({
          ...prev,
          address: serviceAddress,
          zipCode: zipCode || ""
        }));
      } else {
        // Clear address for manual input
        setFormData(prev => ({
          ...prev,
          address: "",
          zipCode: ""
        }));
      }
    }
  }, [selectedMeter, isSameLocation]);

  // Helper function to extract zip code from address
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
        // Auto-select the first utility auth email with meters if available
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

  // Get the currently selected meters based on utility auth email
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
      setIsSameLocation(null); // Reset location choice when meter changes
      // Clear address when meter changes
      setFormData(prev => ({
        ...prev,
        address: "",
        zipCode: ""
      }));
    }
  };

  const handleUtilityAuthEmailChange = (e) => {
    const email = e.target.value;
    setSelectedUtilityAuthEmail(email);
    // Reset meter selection when changing utility auth email
    setFormData(prev => ({
      ...prev,
      meterId: ""
    }));
    setSelectedMeter(null);
    setIsSameLocation(null);
  };

  const handleLocationChoice = (choice) => {
    setIsSameLocation(choice);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      // Simulate file upload
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

    // Validate required fields
    if (!formData.address || !formData.meterId || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.financeType && formData.financeType !== "cash" && !formData.financeAgreement) {
      toast.error("Please upload the financial agreement");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        utilityProvider: formData.utilityProvider,
        installer: formData.installer,
        financeType: formData.financeType,
        financeCompany: formData.financeCompany,
        financeAgreement: formData.financeAgreement,
        address: formData.address,
        meterId: formData.meterId,
        zipCode: formData.zipCode
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
        toast.success("Residence created successfully");
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

  // Check if form is complete
  const isFormComplete = 
    formData.utilityProvider && 
    formData.installer &&
    formData.address &&
    formData.meterId &&
    formData.zipCode &&
    (formData.financeType === "cash" || (formData.financeCompany && formData.financeAgreement)) &&
    (selectedMeter ? isSameLocation !== null : true);

  // Get utility auth emails that have meters
  const utilityAuthEmailsWithMeters = userMeterData.filter(
    item => item.meters?.meters?.length > 0
  );

  // Get current meters based on selected utility auth email
  const currentMeters = getCurrentMeters();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      {loading && (
        <div className={spinnerOverlay}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      )}
      
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={loading}
        >
          <FiX size={20} />
        </button>

        <h2 className={pageTitle}>Add Residence</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Utility Provider */}
          <div>
            <label className={labelClass}>Utility Provider</label>
            <select
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={selectClass}
              disabled={loading || utilityProvidersLoading}
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

          {/* Utility Auth Email Selection */}
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
                    {item.utilityAuthEmail}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the utility account containing your meters
            </p>
          </div>

          {/* Meter Selection - only shown when a utility auth email is selected */}
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
                      {meter.base.meter_numbers[0]} - {meter.base.service_tariff}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only electric meters are shown
              </p>
            </div>
          )}

          {/* Location Confirmation */}
          {selectedMeter && (
            <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              <p className="font-medium mb-2">Service Address: {selectedMeter.base.service_address}</p>
              <p className="font-medium mb-2">
                Is this the same location for the residence?
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

          {/* Address Field */}
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

          {/* Zip Code Field */}
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

          {/* Installer */}
          <div>
            <label className={labelClass}>Installer</label>
            <input
              type="text"
              name="installer"
              value={formData.installer}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter installer name"
            />
          </div>

          {/* Finance Type */}
          <div>
            <label className={labelClass}>Finance Type</label>
            <select
              name="financeType"
              value={formData.financeType}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select finance type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company */}
          {formData.financeType && formData.financeType !== "cash" && (
            <div>
              <label className={labelClass}>Finance Company</label>
              <input
                type="text"
                name="financeCompany"
                value={formData.financeCompany}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter finance company"
              />
            </div>
          )}

          {/* Finance Agreement Upload */}
          {formData.financeType && formData.financeType !== "cash" && (
            <div>
              <label className={uploadHeading}>
                Finance Agreement <span className="text-red-500">*</span>
              </label>
              <div className={uploadFieldWrapper}>
                <label className={uploadInputLabel}>
                  {file ? file.name : 'Choose file...'}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
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
                Required for loan, PPA, and lease agreements
              </p>
            </div>
          )}

          {/* Form Actions */}
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
  );
}