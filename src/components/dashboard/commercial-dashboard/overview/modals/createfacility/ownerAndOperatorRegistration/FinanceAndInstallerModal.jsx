import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-6 top-0 text-[#039994] cursor-pointer z-10',
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
  uploadHeading: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  uploadFieldWrapper: 'flex items-center space-x-3',
  uploadInputLabel: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  uploadIconContainer: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
  uploadButtonStyle: 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  uploadNoteStyle: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  closeButton: 'absolute top-6 right-6 text-red-500 hover:text-red-700 cursor-pointer z-50',
  dateInput: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] bg-[#E8E8E8]'
};

export default function FinanceAndInstallerModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [loadingUtilityProviders, setLoadingUtilityProviders] = useState(false);
  const [loadingFinanceCompanies, setLoadingFinanceCompanies] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showUtilityRequestModal, setShowUtilityRequestModal] = useState(false);
  const [requestingFinanceType, setRequestingFinanceType] = useState(false);
  const [requestingUtility, setRequestingUtility] = useState(false);
  const [requestedFinanceTypeName, setRequestedFinanceTypeName] = useState('');
  const [requestedUtilityName, setRequestedUtilityName] = useState('');
  const [requestedUtilityWebsite, setRequestedUtilityWebsite] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [scale, setScale] = useState(1);
  const [file, setFile] = useState(null);
  const [facilityNickname, setFacilityNickname] = useState('');
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [financeCompanies, setFinanceCompanies] = useState([]);
  const [commercialRole, setCommercialRole] = useState('both');
  const [selectedUtilityProvider, setSelectedUtilityProvider] = useState(null);

  const [formData, setFormData] = useState({
    financeType: "",
    financeCompany: "",
    financeCompanyId: "",
    installer: "",
    installerId: "",
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

  const greenButtonUtilityIds = ['PG&E', 'SCE', 'SDG&E'];
  const isCashType = formData.financeType.toLowerCase() === 'cash';
  const showUploadField = !isCashType && formData.financeType !== '';
  const showFinanceCompany = !isCashType && formData.financeType !== '';
  const showCustomInstaller = formData.installer === 'others';
  const noInstallerSelected = formData.installer === 'not_available';

  const greenButtonProviders = utilityProviders.filter(provider => 
    greenButtonUtilityIds.includes(provider.id)
  );
  const otherProviders = utilityProviders.filter(provider => 
    !greenButtonUtilityIds.includes(provider.id)
  );

  const selectedProvider = utilityProviders.find(provider => provider.name === formData.utilityProvider);
  const isGreenButtonUtility = selectedProvider && greenButtonUtilityIds.includes(selectedProvider.id);

  const fetchCommercialRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        setCommercialRole(response.data.data.commercialUser.commercialRole);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCommercialRole();
      fetchFinanceTypes();
      fetchInstallers();
      fetchUtilityProviders();
      fetchFinanceCompanies();
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

  const createFacility = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const selectedFinanceType = financeTypes.find(type => type.name === formData.financeType);
    const selectedInstaller = installers.find(installer => installer.name === (showCustomInstaller ? formData.customInstaller : formData.installer));
    const selectedUtilityProvider = utilityProviders.find(provider => provider.name === formData.utilityProvider);
    const selectedFinanceCompany = financeCompanies.find(company => company.name === formData.financeCompany);

    const payload = {
      nickname: facilityNickname || 'New Facility',
      address: '',
      utilityProvider: formData.utilityProvider,
      meterIds: [],
      commercialRole,
      entityType: 'company',
      facilityTypeNamingCode: 1,
      utilityProviderNamingCode: selectedUtilityProvider?.namingCode || '',
      installerNamingCode: noInstallerSelected ? '0' : (selectedInstaller?.namingCode || ''),
      financeNamingCode: selectedFinanceType?.namingCode || ''
    };

    if (selectedFinanceCompany) {
      payload.financeCompany = selectedFinanceCompany.name;
      payload.financeCompanyId = selectedFinanceCompany.id;
    }

    if (!noInstallerSelected && selectedInstaller) {
      payload.installer = selectedInstaller.name;
      payload.installerId = selectedInstaller.id;
    }

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
    formData.append('financeAgreementUrl', file);

    await axios.put(
      `https://services.dcarbon.solutions/api/facility/update-facility-financial-agreement/${facilityId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
    );
  };

  const updateFinanceInfo = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const selectedInstaller = installers.find(installer => installer.name === (showCustomInstaller ? formData.customInstaller : formData.installer));

    const finalInstaller = noInstallerSelected ? 'N/A' : (showCustomInstaller ? formData.customInstaller : formData.installer);
    const finalInstallerId = noInstallerSelected ? null : (selectedInstaller?.id || null);

    const payload = {
      financialType: formData.financeType
    };

    if (showFinanceCompany && formData.financeCompany) {
      payload.financeCompany = formData.financeCompany;
    }

    if (finalInstaller && finalInstaller !== 'N/A') {
      payload.installer = finalInstaller;
    }

    if (formData.systemSize) {
      payload.systemSize = formData.systemSize;
    }

    if (formData.cod) {
      payload.cod = formData.cod;
    }

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

  const handleRequestUtility = async () => {
    if (!requestedUtilityName.trim()) {
      toast.error('Please enter a utility provider name');
      return;
    }
    setRequestingUtility(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/request-utility-provider/${userId}`,
        { 
          name: requestedUtilityName.trim(),
          website: requestedUtilityWebsite.trim() || "https://example.com"
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
      toast.success(response.data.message || 'Utility provider request submitted successfully!');
      setShowUtilityRequestModal(false);
      setRequestedUtilityName('');
      setRequestedUtilityWebsite('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setRequestingUtility(false);
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
    
    if (name === "financeType") {
      const selectedFinanceType = financeTypes.find(type => type.name === value);
      setFormData(prev => ({
        ...prev,
        financeType: value,
        financeNamingCode: selectedFinanceType?.namingCode || ""
      }));
    }
    else if (name === "installer") {
      const selectedInstaller = installers.find(installer => installer.name === value);
      setFormData(prev => ({
        ...prev,
        installer: value,
        installerId: selectedInstaller?.id || "",
        installerNamingCode: selectedInstaller?.namingCode || ""
      }));
    }
    else if (name === "financeCompany") {
      const selectedFinanceCompany = financeCompanies.find(company => company.name === value);
      setFormData(prev => ({
        ...prev,
        financeCompany: value,
        financeCompanyId: selectedFinanceCompany?.id || ""
      }));
    }
    else if (name === "utilityProvider") {
      const selectedUtilityProvider = utilityProviders.find(provider => provider.name === value);
      setSelectedUtilityProvider(selectedUtilityProvider);
      setFormData(prev => ({
        ...prev,
        utilityProvider: value,
        utilityProviderNamingCode: selectedUtilityProvider?.namingCode || ""
      }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSystemSizeChange = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    
    if (value && !value.includes('.')) {
      value = value + '.0';
    }
    
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setFormData(prev => ({ ...prev, systemSize: value }));
    }
  };

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    
    if (value.length === 2 && !value.includes('/')) {
      const month = parseInt(value);
      if (month > 12) value = '12';
      if (month === 0) value = '01';
      value = value + '/';
    } else if (value.length === 5) {
      const parts = value.split('/');
      if (parts.length === 2) {
        let day = parseInt(parts[1]);
        const month = parseInt(parts[0]);
        
        const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const maxDay = month >= 1 && month <= 12 ? daysInMonth[month - 1] : 31;
        
        if (day > maxDay) day = maxDay;
        if (day === 0) day = 1;
        
        value = parts[0] + '/' + (day < 10 && day > 0 ? '0' + day : day) + '/';
      }
    } else if (value.length === 10) {
      const parts = value.split('/');
      if (parts.length === 3) {
        let day = parseInt(parts[1]);
        const month = parseInt(parts[0]);
        const year = parts[2];
        
        const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const maxDay = month >= 1 && month <= 12 ? daysInMonth[month - 1] : 31;
        
        if (day > maxDay) day = maxDay;
        if (day === 0) day = 1;
        
        value = parts[0] + '/' + (day < 10 && day > 0 ? '0' + day : day) + '/' + year;
      }
    }
    
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, cod: value }));
    }
  };

  const initiateGreenButtonAuth = async () => {
    setIframeUrl('https://www.greenbuttondata.org/index.html');
    setShowIframe(true);
    setScale(1);
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
        setScale(1);
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
      onClose();
      window.location.reload();
    }
  };

  useEffect(() => {
    if (showIframe) {
      window.addEventListener('message', handleIframeMessage);
      return () => window.removeEventListener('message', handleIframeMessage);
    }
  }, [showIframe]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const handleIframeClose = () => {
    setShowIframe(false);
    setScale(1);
    onClose();
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.financeType) return toast.error('Please select a finance type');
    if (!formData.utilityProvider) return toast.error('Please select a utility provider');
    if (!formData.installer && !noInstallerSelected) return toast.error('Please select an installer');
    if (showCustomInstaller && !formData.customInstaller) return toast.error('Please enter your installer name');
    if (!facilityNickname) return toast.error('Please enter a facility nickname');

    setLoading(true);
    const toastId = toast.loading('Saving your information...');

    try {
      await updateFinanceInfo();
      const response = await createFacility();

      if (file && uploadSuccess) {
        await uploadFinanceAgreementToFacility(response.data.id);
      }

      toast.dismiss(toastId);
      toast.success('Facility created successfully!');
      
      if (isGreenButtonUtility) {
        await initiateGreenButtonAuth();
      } else {
        await initiateUtilityAuth();
      }
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
      financeCompanyId: "",
      installer: "",
      installerId: "",
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
    setSelectedUtilityProvider(null);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  if (showIframe) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">
              {isGreenButtonUtility ? "Green Button Authorization" : "Utility Authorization Portal"}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={zoomOut}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale <= 0.5}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom Out
                </button>
                <button
                  onClick={resetZoom}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21V9M21 3L15 9M9 21H3V15M3 21L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset
                </button>
                <button
                  onClick={zoomIn}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale >= 3}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom In
                </button>
              </div>
              <button
                onClick={handleIframeClose}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className={`p-4 border-b ${isGreenButtonUtility ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className={`text-sm ${isGreenButtonUtility ? 'text-green-700' : 'text-yellow-700'}`}>
              <strong>Step 1:</strong> {isGreenButtonUtility ? 'Follow the steps on the Green Button portal to securely share your utility data.' : 'Enter the email of your DCarbon account you are authorizing for, then choose your utility provider.'}
            </p>
            <p className={`text-sm ${isGreenButtonUtility ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
              <strong>Step 2:</strong> {isGreenButtonUtility ? 'Complete the authorization process when prompted.' : 'Enter your Utility Account credentials and authorize access when prompted.'}
            </p>
            {isGreenButtonUtility && selectedUtilityProvider && (
              <p className="text-sm text-green-700 mt-1">
                <strong>Selected Utility:</strong> {selectedUtilityProvider.name}
              </p>
            )}
          </div>

          <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg overflow-auto">
              <div 
                className="w-full h-full origin-top-left"
                style={{ 
                  transform: `scale(${scale})`,
                  width: `${100/scale}%`,
                  height: `${100/scale}%`
                }}
              >
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title={isGreenButtonUtility ? "Green Button Authorization" : "Utility Authorization"}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-sm text-gray-600">
              Use scroll to navigate when zoomed in
            </span>
          </div>
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

      {showUtilityRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Utility Provider</h3>
            <div className="mb-4">
              <label className={styles.labelClass}>
                Utility Provider Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requestedUtilityName}
                onChange={(e) => setRequestedUtilityName(e.target.value)}
                placeholder="Enter utility provider name"
                className={styles.inputClass}
                required
              />
            </div>
            <div className="mb-4">
              <label className={styles.labelClass}>
                Utility Website
              </label>
              <input
                type="url"
                value={requestedUtilityWebsite}
                onChange={(e) => setRequestedUtilityWebsite(e.target.value)}
                placeholder="https://example.com"
                className={styles.inputClass}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUtilityRequestModal(false);
                  setRequestedUtilityName('');
                  setRequestedUtilityWebsite('');
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={requestingUtility}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestUtility}
                disabled={requestingUtility}
                className="flex-1 px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028882] disabled:opacity-50"
              >
                {requestingUtility ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="relative p-6 pb-4">
            {onBack && (
              <button
                onClick={onBack}
                className={styles.backArrow}
              >
              </button>
            )}

            <button
              onClick={handleCloseModal}
              className={styles.closeButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={styles.headingContainer}>
              <h2 className={styles.pageTitle}>
                {commercialRole === 'both' ? "Finance & Installer information for Owner and Operator" : "Finance & Installer information for Owner"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Please provide accurate details below. Hover over the <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg> icons
                </span> for important guidance on each field.
              </p>
            </div>

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
                    
                    {greenButtonProviders.length > 0 && (
                      <optgroup label="Green Button Utilities" className="bg-green-50">
                        {greenButtonProviders.map((provider) => (
                          <option 
                            key={provider.id} 
                            value={provider.name}
                            className="text-green-700 font-semibold"
                          >
                            {provider.name} ✓
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {otherProviders.length > 0 && (
                      <optgroup label="Other Utilities">
                        {otherProviders.map((provider) => (
                          <option key={provider.id} value={provider.name}>
                            {provider.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {isGreenButtonUtility && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse pointer-events-none"></div>
                  )}
                  <div className={styles.uploadIconContainer}>
                    <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {isGreenButtonUtility && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected utility supports Green Button authorization.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowUtilityRequestModal(true)}
                  className="text-[#039994] text-xs hover:underline mt-1"
                >
                  Not on the list?
                </button>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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
                  <div className="flex items-center gap-1">
                    <label className={styles.labelClass}>
                      Finance company
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
                      className={`${styles.selectClass} appearance-none`}
                      disabled={loadingFinanceCompanies}
                    >
                      <option value="">{loadingFinanceCompanies ? 'Loading...' : 'Choose company'}</option>
                      {financeCompanies.map((company) => (
                        <option key={company.id} value={company.name}>{company.name}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <div className={styles.uploadIconContainer}>
                      <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {showUploadField && (
                <div>
                  <label className={styles.uploadHeading}>
                    Upload Finance Agreement
                  </label>
                  <div className={styles.uploadFieldWrapper}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className={styles.uploadInputLabel}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                    Optional for loan, PPA, and lease agreements
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1">
                  <label className={styles.labelClass}>
                    Select installer
                  </label>
                  <div className="group relative flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute hidden group-hover:block bg-white p-2 rounded shadow-lg border border-gray-200 text-xs w-64 z-10 left-8 -top-20">
                      Select your installer who can submit installation documents if needed. If not listed or unavailable, choose "Not Yet Available" and your finance company can invite them later.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <select
                    name="installer"
                    value={formData.installer}
                    onChange={handleInputChange}
                    className={`${styles.selectClass} appearance-none`}
                    disabled={loadingInstallers}
                  >
                    <option value="">{loadingInstallers ? 'Loading...' : 'Choose installer'}</option>
                    {installers.map((installer) => (
                      <option key={installer.id} value={installer.name}>{installer.name}</option>
                    ))}
                    <option value="others">Others</option>
                    <option value="not_available">Not Yet Available</option>
                  </select>
                  <div className={styles.uploadIconContainer}>
                    <svg className="w-5 h-5 text-gray-400 pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {showCustomInstaller && (
                <div>
                  <label className={styles.labelClass}>
                    Installer Name
                  </label>
                  <input
                    type="text"
                    name="customInstaller"
                    value={formData.customInstaller}
                    onChange={handleInputChange}
                    placeholder="Enter your installer name"
                    className={`${styles.inputClass} ${styles.grayPlaceholder}`}
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
                    onChange={handleSystemSizeChange}
                    placeholder="e.g., 26.0"
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
                    onChange={handleDateChange}
                    placeholder="MM/DD/YYYY"
                    className={styles.dateInput}
                  />
                  <p className={styles.noteText}>The COD should match your utility PTO authorization letter</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.buttonPrimary} flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}