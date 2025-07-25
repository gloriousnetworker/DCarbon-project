import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import InviteOperatorModal from "./InviteOperatorModal";

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-left',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/3 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  fileInputWrapper: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  rowWrapper: 'flex space-x-4',
  halfWidth: 'w-1/2',
  grayPlaceholder: 'bg-[#E8E8E8]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]',
  uploadHeading: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  uploadFieldWrapper: 'flex items-center space-x-3',
  uploadInputLabel: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  uploadIconContainer: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
  uploadButtonStyle: 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  uploadNoteStyle: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]'
};

export default function FinanceAndInstallerModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [loadingUtilityProviders, setLoadingUtilityProviders] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingFinanceType, setRequestingFinanceType] = useState(false);
  const [requestedFinanceTypeName, setRequestedFinanceTypeName] = useState('');
  const [showInviteOperatorModal, setShowInviteOperatorModal] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [facilityNickname, setFacilityNickname] = useState('');
  const [utilityProviders, setUtilityProviders] = useState([]);

  const [formData, setFormData] = useState({
    financeType: "",
    financeCompany: "",
    installer: "",
    customInstaller: "",
    utilityProvider: "",
    systemSize: "",
    cod: "",
    facilityTypeNamingCode: 1,
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

  useEffect(() => {
    if (isOpen) {
      fetchFinanceTypes();
      fetchInstallers();
      fetchUtilityProviders();
    }
  }, [isOpen]);

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

  const createCommercialFacility = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const selectedFinanceType = financeTypes.find(type => type.name === formData.financeType);
    const selectedInstaller = installers.find(installer => installer.name === (showCustomInstaller ? formData.customInstaller : formData.installer));
    const selectedUtilityProvider = utilityProviders.find(provider => provider.name === formData.utilityProvider);

    const payload = {
      nickname: facilityNickname || 'New Commercial Facility',
      address: '',
      utilityProvider: formData.utilityProvider,
      meterIds: [],
      commercialRole: 'both',
      entityType: 'company',
      facilityTypeNamingCode: 1,
      utilityProviderNamingCode: selectedUtilityProvider?.namingCode || '',
      installerNamingCode: selectedInstaller?.namingCode || '',
      financeNamingCode: selectedFinanceType?.namingCode || ''
    };

    const response = await axios.post(
      `https://services.dcarbon.solutions/api/facility/create-new-facility/${userId}`,
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
      `https://services.dcarbon.solutions/api/facility/update-facility-financial-agreement/${facilityId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
    );
  };

  const updateFinanceInfo = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const finalInstaller = showCustomInstaller ? formData.customInstaller : formData.installer;

    const payload = {
      financialType: formData.financeType,
      ...(showFinanceCompany && { financeCompany: formData.financeCompany }),
      ...(finalInstaller && { installer: finalInstaller }),
      ...(formData.systemSize && { systemSize: formData.systemSize }),
      ...(formData.cod && { cod: formData.cod }),
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

  const initiateUtilityAuth = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    setLoading(true);
    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/auth/initiate-utility-auth/${userId}`,
        { utilityAuthEmail: userEmail },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      if (response.data.status === 'success') {
        setIframeUrl('https://utilityapi.com/authorize/DCarbon_Solutions');
        setShowIframe(true);
      } else {
        toast.error('Failed to initiate utility authorization');
      }
    } catch (error) {
      toast.error('Failed to initiate utility authorization');
    } finally {
      setLoading(false);
    }
  };

  const handleIframeMessage = (event) => {
    if (event.data && event.data.type === 'utility-auth-complete') {
      setShowIframe(false);
      setShowInviteOperatorModal(true);
    }
  };

  useEffect(() => {
    if (showIframe) {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [showIframe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.financeType) return toast.error('Please select a finance type');
    if (!formData.utilityProvider) return toast.error('Please select a utility provider');
    if (!formData.installer) return toast.error('Please select an installer');
    if (showFinanceCompany && !formData.financeCompany) return toast.error('Please select a finance company');
    if (showCustomInstaller && !formData.customInstaller) return toast.error('Please enter your installer name');
    if (!facilityNickname) return toast.error('Please enter a facility nickname');

    setLoading(true);
    const toastId = toast.loading('Saving your information...');

    try {
      await updateFinanceInfo();
      const response = await createCommercialFacility();

      if (file && uploadSuccess) {
        await uploadFinanceAgreementToFacility(response.data.id);
      }

      toast.dismiss(toastId);
      await initiateUtilityAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed', { id: toastId });
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
      systemSize: "",
      cod: "",
      facilityTypeNamingCode: 1,
      utilityProviderNamingCode: "",
      installerNamingCode: "",
      financeNamingCode: ""
    });
    setFacilityNickname('');
    setFile(null);
    setUploadSuccess(false);
    onClose();
    window.location.reload();
  };

  const handleInviteOperatorModalClose = () => {
    setShowInviteOperatorModal(false);
    onClose();
    window.location.reload();
  };

  const handleInviteOperatorModalBack = () => {
    setShowInviteOperatorModal(false);
  };

  if (!isOpen) return null;

  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">Utility Authorization Portal</h3>
            <button
              onClick={handleCloseModal}
              className="text-red-500 hover:text-red-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Step 1:</strong> Enter the email of your DCarbon account you are authorizing for, then choose your utility provider.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Step 2:</strong> Enter your Utility Account credentials and authorize access when prompted.
            </p>
          </div>
          <iframe
            src={iframeUrl}
            className="w-full h-full"
            title="Utility Authorization"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Finance Type</h3>
            <div className="mb-4">
              <label className={styles.labelClass}>
                Finance Type Name
              </label>
              <input
                type="text"
                value={requestedFinanceTypeName}
                onChange={(e) => setRequestedFinanceTypeName(e.target.value)}
                placeholder="Enter finance type name"
                className={styles.inputClass}
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
                className="flex-1 px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028882] disabled:opacity-50"
              >
                {requestingFinanceType ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showInviteOperatorModal && !showIframe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative p-6 pb-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className={styles.backArrow}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <h2 className={styles.pageTitle}>
                Finance & Installer information for Owner
              </h2>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarActive}></div>
                </div>
                <span className={styles.progressStepText}>04/05</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <form onSubmit={handleSubmit} className={styles.formWrapper}>
                <div>
                  <label className={styles.labelClass}>
                    Facility Nickname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={facilityNickname}
                    onChange={(e) => setFacilityNickname(e.target.value)}
                    placeholder="e.g. Nancy's Nest"
                    className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                    required
                  />
                  <p className={styles.noteText}>Give your facility a nickname (e.g. "Nancy's Nest")</p>
                </div>

                <div>
                  <label className={styles.labelClass}>
                    Utility Provider <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="utilityProvider"
                      value={formData.utilityProvider}
                      onChange={handleInputChange}
                      className={`${styles.selectClass} appearance-none`}
                      required
                      disabled={loadingUtilityProviders}
                    >
                      <option value="">{loadingUtilityProviders ? 'Loading...' : 'Choose provider'}</option>
                      {utilityProviders.map((provider) => (
                        <option key={provider.id} value={provider.name}>{provider.name}</option>
                      ))}
                    </select>
                    <div className={styles.uploadIconContainer}>
                      <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={styles.labelClass}>
                    Finance type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="financeType"
                      value={formData.financeType}
                      onChange={handleInputChange}
                      className={`${styles.selectClass} appearance-none`}
                      required
                      disabled={loadingFinanceTypes}
                    >
                      <option value="">{loadingFinanceTypes ? 'Loading...' : 'Choose type'}</option>
                      {financeTypes.map((type) => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                    <div className={styles.uploadIconContainer}>
                      <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
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
                    <label className={styles.labelClass}>
                      Finance company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="financeCompany"
                        value={formData.financeCompany}
                        onChange={handleInputChange}
                        className={`${styles.selectClass} appearance-none`}
                        required
                      >
                        <option value="">Choose company</option>
                        <option value="company1">Company 1</option>
                        <option value="company2">Company 2</option>
                        <option value="company3">Company 3</option>
                        <option value="others">Others</option>
                        <option value="n/a">N/A</option>
                      </select>
                      <div className={styles.uploadIconContainer}>
                        <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {showUploadField && (
                  <div>
                    <label className={styles.uploadHeading}>
                      Upload Finance Agreement <span className="text-red-500">*</span>
                    </label>
                    <div className={styles.uploadFieldWrapper}>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className={styles.uploadInputLabel}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading || uploadSuccess}
                        className={styles.uploadButtonStyle}
                      >
                        {uploading ? 'Uploading...' : uploadSuccess ? '✓' : 'Upload'}
                      </button>
                    </div>
                    <p className={styles.uploadNoteStyle}>
                      Required for all finance types except Cash (PDF, JPEG, PNG, Word)
                    </p>
                  </div>
                )}

                <div>
                  <label className={styles.labelClass}>
                    Select installer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="installer"
                      value={formData.installer}
                      onChange={handleInputChange}
                      className={`${styles.selectClass} appearance-none`}
                      required
                      disabled={loadingInstallers}
                    >
                      <option value="">{loadingInstallers ? 'Loading...' : 'Choose installer'}</option>
                      {installers.map((installer) => (
                        <option key={installer.id} value={installer.name}>{installer.name}</option>
                      ))}
                      <option value="others">Others</option>
                      <option value="unknown">Don't know</option>
                    </select>
                    <div className={styles.uploadIconContainer}>
                      <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {showCustomInstaller && (
                  <div>
                    <label className={styles.labelClass}>
                      Installer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customInstaller"
                      value={formData.customInstaller}
                      onChange={handleInputChange}
                      placeholder="Enter your installer name"
                      className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                      required
                    />
                  </div>
                )}

                <div className={styles.rowWrapper}>
                  <div className={styles.halfWidth}>
                    <label className={styles.labelClass}>
                      System Size (kW) <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="systemSize"
                      value={formData.systemSize}
                      onChange={handleInputChange}
                      placeholder="Input system size in kW"
                      className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                    />
                    <p className={styles.noteText}>The system size should match your utility PTO authorization letter</p>
                  </div>

                  <div className={styles.halfWidth}>
                    <label className={styles.labelClass}>
                      Commercial Operation Date (COD) <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="cod"
                      value={formData.cod}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                      className={`${styles.inputClass} ${styles.grayPlaceholder}`}
                    />
                    <p className={styles.noteText}>The COD should match your utility PTO authorization letter</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.buttonPrimary} flex items-center justify-center`}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>

                <div className={styles.termsTextContainer}>
                  <span>Terms and Conditions</span>
                  <span className="mx-2">•</span>
                  <span>Privacy Policy</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showInviteOperatorModal && (
        <InviteOperatorModal
          isOpen={showInviteOperatorModal}
          onClose={handleInviteOperatorModalClose}
          onBack={handleInviteOperatorModalBack}
        />
      )}
    </>
  );
}