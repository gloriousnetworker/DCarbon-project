import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import ResidenceTermsAndAgreementModal from "./ResidenceTermsAndAgreementModal";
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  progressContainer,
  progressBarWrapper,
  progressBarActive,
  progressStepText,
  formWrapper,
  labelClass,
  selectClass,
  inputClass,
  fileInputWrapper,
  noteText,
  rowWrapper,
  halfWidth,
  grayPlaceholder,
  buttonPrimary,
  spinnerOverlay,
  spinner,
  termsTextContainer,
  uploadHeading,
  uploadFieldWrapper,
  uploadInputLabel,
  uploadIconContainer,
  uploadButtonStyle,
  uploadNoteStyle
} from "../../styles";

export default function FinanceAndInstallerModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [loadingUtilityProviders, setLoadingUtilityProviders] = useState(false);
  const [loadingFinanceCompanies, setLoadingFinanceCompanies] = useState(false);
  const [loadingReferrer, setLoadingReferrer] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingFinanceType, setRequestingFinanceType] = useState(false);
  const [requestedFinanceTypeName, setRequestedFinanceTypeName] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  const [systemCapacity, setSystemCapacity] = useState('');
  const [facilityNickname, setFacilityNickname] = useState('');
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [referrerFinanceCompany, setReferrerFinanceCompany] = useState(null);
  const [formData, setFormData] = useState({
    financeType: "",
    financeCompany: "",
    installer: "",
    customInstaller: "",
    utilityProvider: "",
    facilityTypeNamingCode: 2,
    utilityProviderNamingCode: "",
    installerNamingCode: "",
    financeNamingCode: ""
  });
  const [financeTypes, setFinanceTypes] = useState([]);
  const [installers, setInstallers] = useState([]);

  const isCashType = formData.financeType.toLowerCase() === 'cash';
  const showUploadField = !isCashType && formData.financeType !== '';
  const showFinanceCompany = !isCashType && formData.financeType !== '';
  const showCustomInstaller = formData.installer === 'others';
  const noInstallerSelected = formData.installer === 'not_available';
  const isReferredByFinanceCompany = referrerFinanceCompany !== null;
  const filteredFinanceCompanies = isReferredByFinanceCompany 
    ? financeCompanies.filter(company => company.name === referrerFinanceCompany.name)
    : financeCompanies;

  const generateUniqueMeterId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `METER_${timestamp}_${random}`;
  };

  const generateUniqueFacilityName = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const nickname = facilityNickname.trim() || 'Residential';
    return `${nickname}_${timestamp}_${random}`;
  };

  useEffect(() => {
    if (isOpen) {
      fetchFinanceTypes();
      fetchInstallers();
      fetchUtilityProviders();
      fetchFinanceCompanies();
      fetchReferrerInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isReferredByFinanceCompany) {
      setFormData(prev => ({
        ...prev,
        installer: 'not_available'
      }));
    }
  }, [isReferredByFinanceCompany]);

  const fetchReferrerInfo = async () => {
    setLoadingReferrer(true);
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/referrer/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success' && response.data.data.partnerType === 'FINANCE_COMPANY') {
        setReferrerFinanceCompany(response.data.data.partner);
      }
    } catch (err) {
    } finally {
      setLoadingReferrer(false);
    }
  };

  const fetchUtilityProviders = async () => {
    setLoadingUtilityProviders(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://services.dcarbon.solutions/api/auth/utility-providers',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setUtilityProviders(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load utility providers');
    } finally {
      setLoadingUtilityProviders(false);
    }
  };

  const fetchFinanceTypes = async () => {
    setLoadingFinanceTypes(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://services.dcarbon.solutions/api/user/financial-types',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
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
    } catch (err) {
      toast.error('Failed to load finance types');
    } finally {
      setLoadingFinanceTypes(false);
    }
  };

  const fetchInstallers = async () => {
    setLoadingInstallers(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://services.dcarbon.solutions/api/user/partner/get-all-installer',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setInstallers(response.data.data.installers || []);
      }
    } catch (err) {
      toast.error('Failed to load installers');
    } finally {
      setLoadingInstallers(false);
    }
  };

  const fetchFinanceCompanies = async () => {
    setLoadingFinanceCompanies(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'https://services.dcarbon.solutions/api/user/partner/finance-companies',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setFinanceCompanies(response.data.data.financeCompanies || []);
      }
    } catch (err) {
      toast.error('Failed to load finance companies');
    } finally {
      setLoadingFinanceCompanies(false);
    }
  };

  const createResidentialFacility = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const selectedFinanceType = financeTypes.find(type => type.name === formData.financeType);
    const selectedInstaller = installers.find(installer => installer.name === (showCustomInstaller ? formData.customInstaller : formData.installer));
    const selectedUtilityProvider = utilityProviders.find(provider => provider.name === formData.utilityProvider);

    const uniqueMeterId = generateUniqueMeterId();
    const uniqueFacilityName = generateUniqueFacilityName();

    const payload = {
      facilityName: uniqueFacilityName,
      utilityProvider: formData.utilityProvider || "N/A",
      installer: noInstallerSelected ? "N/A" : (showCustomInstaller ? formData.customInstaller : formData.installer || "N/A"),
      installerId: noInstallerSelected ? "N/A" : (selectedInstaller?.id || "N/A"),
      financeType: formData.financeType || "N/A",
      financeCompany: formData.financeCompany || "N/A",
      financeAgreement: file ? file.name : "N/A",
      address: "To be updated",
      meterId: uniqueMeterId,
      zipCode: "To be updated",
      systemCapacity: systemCapacity ? Number(systemCapacity) : 0,
      facilityTypeNamingCode: 2,
      utilityProviderNamingCode: selectedUtilityProvider?.namingCode || "1",
      installerNamingCode: noInstallerSelected ? "0" : (selectedInstaller?.namingCode || "1"),
      financeNamingCode: selectedFinanceType?.namingCode || "1"
    };

    const response = await axios.post(
      `https://services.dcarbon.solutions/api/residential-facility/create-residential-facility/${userId}`,
      payload,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  };

  const uploadFinanceAgreementToFacility = async (facilityId) => {
    if (!file) return;

    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);

    await axios.put(
      `https://services.dcarbon.solutions/api/residential-facility/residential-docs/finance-agreement/${facilityId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
    );
  };

  const updateFinanceInfo = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const finalInstaller = noInstallerSelected ? 'N/A' : (showCustomInstaller ? formData.customInstaller : formData.installer);

    const payload = {
      financialType: formData.financeType,
      ...(showFinanceCompany && { financeCompany: formData.financeCompany }),
      ...(finalInstaller && { installer: finalInstaller }),
      ...(systemCapacity && { systemSize: systemCapacity })
    };

    await axios.put(
      `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
      payload,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
    );
  };

  const handleRequestFinanceType = async () => {
    if (!requestedFinanceTypeName.trim()) {
      toast.error('Please enter a finance type name');
      return;
    }
    setRequestingFinanceType(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-financial-type/${userId}`,
        { name: requestedFinanceTypeName.trim() },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
      toast.success(response.data.message || 'Finance type request submitted successfully!');
      setShowRequestModal(false);
      setRequestedFinanceTypeName('');
      await fetchFinanceTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setRequestingFinanceType(false);
    }
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem('tempFinancialAgreement', base64data);
        setUploadSuccess(true);
        toast.success('Financial agreement uploaded successfully!');
      };
      reader.onerror = () => toast.error('Error reading file');
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "financeType") {
      const selectedFinanceType = financeTypes.find(type => type.name === value);
      setFormData(prev => ({
        ...prev,
        financeNamingCode: selectedFinanceType?.namingCode || ""
      }));
    }
    if (name === "installer") {
      const selectedInstaller = installers.find(installer => installer.name === value);
      setFormData(prev => ({
        ...prev,
        installerNamingCode: selectedInstaller?.namingCode || ""
      }));
    }
    if (name === "utilityProvider") {
      const selectedUtilityProvider = utilityProviders.find(provider => provider.name === value);
      setFormData(prev => ({
        ...prev,
        utilityProviderNamingCode: selectedUtilityProvider?.namingCode || ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facilityNickname) return toast.error('Please enter a facility nickname');
    if (!formData.financeType) return toast.error('Please select a finance type');
    if (showFinanceCompany && !formData.financeCompany) return toast.error('Please select a finance company');
    if (showCustomInstaller && !formData.customInstaller) return toast.error('Please enter your installer name');
    if (!formData.utilityProvider) return toast.error('Please select a utility provider');
    if (!formData.installer && !showCustomInstaller && !noInstallerSelected) return toast.error('Please select an installer');

    setLoading(true);
    const toastId = toast.loading('Creating residential facility...');

    try {
      await updateFinanceInfo();
      const response = await createResidentialFacility();

      if (file && uploadSuccess) {
        await uploadFinanceAgreementToFacility(response.data.id);
      }

      toast.success(`Residential facility created successfully: ${response.data.facilityName}`, { id: toastId });
      setCurrentStep(4);
      setShowAgreementModal(true);
    } catch (err) {
      if (err.response?.data?.message?.includes('Meter ID is already registered')) {
        toast.error('Facility creation failed due to duplicate meter ID. Please try again.', { id: toastId });
        setTimeout(() => {
          handleSubmit(e);
        }, 1000);
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to create facility', { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({
      financeType: "",
      financeCompany: "",
      installer: "",
      customInstaller: "",
      utilityProvider: "",
      facilityTypeNamingCode: 2,
      utilityProviderNamingCode: "",
      installerNamingCode: "",
      financeNamingCode: ""
    });
    setFacilityNickname('');
    setSystemCapacity('');
    setFile(null);
    setUploadSuccess(false);
    setCurrentStep(1);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Finance Type</h3>
            <div className="mb-4">
              <label className={labelClass}>
                Finance Type Name
              </label>
              <input
                type="text"
                value={requestedFinanceTypeName}
                onChange={(e) => setRequestedFinanceTypeName(e.target.value)}
                placeholder="Enter finance type name"
                className={inputClass}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestedFinanceTypeName('');
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={requestingFinanceType}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestFinanceType}
                disabled={requestingFinanceType}
                className={`flex-1 px-4 py-2 ${buttonPrimary}`}
              >
                {requestingFinanceType ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAgreementModal && !showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative p-6 pb-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className={backArrow}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-red-500 hover:text-red-700 cursor-pointer z-10"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className={headingContainer}>
                <h2 className={pageTitle}>
                  Finance & Installer Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide accurate details below. Hover over the <span className="inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg> icons</span> for important guidance on each field.
                </p>
              </div>

              <div className={progressContainer}>
                <div className={progressBarWrapper}>
                  <div className={progressBarActive} style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
                </div>
                <span className={progressStepText}>{currentStep}/{totalSteps}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <form onSubmit={handleSubmit} className={formWrapper}>
                <div>
                  <label className={labelClass}>
                    Facility Nickname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={facilityNickname}
                    onChange={(e) => setFacilityNickname(e.target.value)}
                    placeholder="e.g. Nancy's Nest"
                    className={`${inputClass} ${grayPlaceholder}`}
                    required
                  />
                  <p className={noteText}>Give your facility a nickname (e.g. "Nancy's Nest")</p>
                </div>

                <div>
                  <label className={labelClass}>
                    Utility Provider <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="utilityProvider"
                      value={formData.utilityProvider}
                      onChange={handleInputChange}
                      className={`${selectClass} ${grayPlaceholder}`}
                      required
                      disabled={loadingUtilityProviders}
                    >
                      <option value="">{loadingUtilityProviders ? 'Loading...' : 'Choose provider'}</option>
                      {utilityProviders.map((provider) => (
                        <option key={provider.id} value={provider.name}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Finance type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="financeType"
                      value={formData.financeType}
                      onChange={handleInputChange}
                      className={`${selectClass} ${grayPlaceholder}`}
                      required
                      disabled={loadingFinanceTypes}
                    >
                      <option value="">{loadingFinanceTypes ? 'Loading...' : 'Choose type'}</option>
                      {financeTypes.map((type) => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(true)}
                    className="text-[#039994] text-xs hover:underline mt-1"
                  >
                    Finance Type not listed?
                  </button>
                </div>

                {showFinanceCompany && (
                  <div>
                    <div className="flex items-center gap-1">
                      <label className={labelClass}>
                        Finance company <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg border border-gray-200 text-xs w-64 z-10 -left-32 -top-20">
                          If you were referred by a finance company, select them here so they can help submit required documents if needed.
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        name="financeCompany"
                        value={formData.financeCompany}
                        onChange={handleInputChange}
                        className={`${selectClass} ${grayPlaceholder}`}
                        required
                        disabled={loadingFinanceCompanies}
                      >
                        <option value="">{loadingFinanceCompanies ? 'Loading...' : 'Choose company'}</option>
                        {filteredFinanceCompanies.map((company) => (
                          <option key={company.id} value={company.name}>{company.name}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {showUploadField && (
                  <div>
                    <label className={uploadHeading}>
                      Upload Finance Agreement
                    </label>
                    <div className={`${uploadFieldWrapper} items-center`}>
                      <label className={`${uploadInputLabel} flex items-center h-10`}>
                        <span className="truncate flex-1">{file ? file.name : 'Choose file...'}</span>
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l7-7a2.121 2.121 0 013 3L10 17a4 4 0 01-5.657-5.657l7-7" />
                          </svg>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                      </label>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading || uploadSuccess}
                        className={`${uploadButtonStyle} h-10 ${(!file || uploading || uploadSuccess) ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        ) : uploadSuccess ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          'Upload'
                        )}
                      </button>
                    </div>
                    <p className={uploadNoteStyle}>Optional for loan, PPA, and lease agreements</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1">
                    <label className={labelClass}>
                      Select installer <span className="text-red-500">*</span>
                    </label>
                    <div className="group relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg border border-gray-200 text-xs w-64 z-10 -left-24 -top-20">
                        Select your installer who can submit installation documents if needed. If not listed or unavailable, choose "Installer Not Yet Available" and your finance company can invite them later.
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      name="installer"
                      value={formData.installer}
                      onChange={handleInputChange}
                      className={`${selectClass} ${grayPlaceholder}`}
                      required
                      disabled={loadingInstallers || isReferredByFinanceCompany}
                    >
                      <option value="">{loadingInstallers ? 'Loading...' : 'Choose installer'}</option>
                      {!isReferredByFinanceCompany && installers.map((installer) => (
                        <option key={installer.id} value={installer.name}>{installer.name}</option>
                      ))}
                      {!isReferredByFinanceCompany && <option value="others">Others</option>}
                      <option value="not_available">Installer Not Yet Available</option>
                    </select>
                  </div>
                  {isReferredByFinanceCompany && (
                    <p className="text-xs text-gray-500 mt-1">
                      Your finance company will invite your installer to complete the registration process.
                    </p>
                  )}
                </div>

                {showCustomInstaller && (
                  <div>
                    <label className={labelClass}>
                      Installer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customInstaller"
                      value={formData.customInstaller}
                      onChange={handleInputChange}
                      placeholder="Enter your installer name"
                      className={`${inputClass} ${grayPlaceholder}`}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    (kW AC) (must exactly match value on Utilities Permission to Operate (PTO) letter or email, skip if unknown) ​ <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={systemCapacity}
                    onChange={(e) => setSystemCapacity(e.target.value)}
                    className={`${inputClass} ${grayPlaceholder}`}
                    placeholder="Enter system capacity"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Match the value on your <strong>utilities Permission to Operate (PTO)</strong> solar approval letter.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${buttonPrimary} flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>

                <div className={termsTextContainer}>
                  <span>Terms and Conditions</span>
                  <span className="mx-2">•</span>
                  <span>Privacy Policy</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAgreementModal && (
        <ResidenceTermsAndAgreementModal
          isOpen={showAgreementModal}
          onClose={() => {
            setShowAgreementModal(false);
            handleCloseModal();
          }}
        />
      )}
    </>
  );
}