import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import InviteOperatorModal from "./InviteOperatorModal";
import {
  buttonPrimary,
  spinnerOverlay,
  spinner,
  labelClass,
  inputClass,
  termsTextContainer
} from '../../styles.js';

export default function FinanceAndInstallerModal({ isOpen, onClose, onBack }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loadingFinanceTypes, setLoadingFinanceTypes] = useState(false);
  const [loadingInstallers, setLoadingInstallers] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingFinanceType, setRequestingFinanceType] = useState(false);
  const [requestedFinanceTypeName, setRequestedFinanceTypeName] = useState('');
  const [showInviteOperatorModal, setShowInviteOperatorModal] = useState(false);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    financeType: "",
    financeCompany: "",
    installer: "",
    customInstaller: "",
    systemSize: "",
    cod: ""
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
    }
  }, [isOpen]);

  const fetchFinanceTypes = async () => {
    setLoadingFinanceTypes(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

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
      if (!token) throw new Error('Authentication required');

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

  const handleRequestFinanceType = async () => {
    if (!requestedFinanceTypeName.trim()) {
      toast.error('Please enter a finance type name');
      return;
    }

    setRequestingFinanceType(true);
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const token = loginResponse?.data?.token;

      if (!userId || !token) throw new Error('Authentication required');

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
    localStorage.removeItem('tempFinancialAgreement');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        localStorage.setItem('tempFinancialAgreement', base64data);
        toast.success('Financial agreement uploaded successfully!');
        setUploadSuccess(true);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.financeType) return toast.error('Please select a finance type');
    if (showFinanceCompany && !formData.financeCompany) return toast.error('Please select a finance company');
    if (showUploadField && !uploadSuccess) return toast.error('Please upload the financial agreement');
    if (showCustomInstaller && !formData.customInstaller) return toast.error('Please enter your installer name');

    setLoading(true);
    const toastId = toast.loading('Saving your information...');

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (!userId || !token) throw new Error('Authentication required');

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

      toast.success('Financial information saved successfully!', { id: toastId });

      if (showUploadField && uploadSuccess) {
        const uploadToastId = toast.loading('Uploading financial agreement...');
        try {
          const base64data = localStorage.getItem('tempFinancialAgreement');
          if (!base64data) throw new Error('File data not found');
          
          const response = await fetch(base64data);
          const blob = await response.blob();
          const fileToUpload = new File([blob], file.name, { type: blob.type });

          const formData = new FormData();
          formData.append('financialAgreement', fileToUpload);

          await axios.put(
            `https://services.dcarbon.solutions/api/user/update-financial-agreement/${userId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } }
          );

          toast.success('Financial agreement uploaded successfully!', { id: uploadToastId });
          localStorage.removeItem('tempFinancialAgreement');
        } catch (uploadErr) {
          toast.error(uploadErr.response?.data?.message || uploadErr.message || 'File upload failed', { id: uploadToastId });
          throw uploadErr;
        }
      }

      setShowInviteOperatorModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed', { id: toastId });
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Finance Type</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finance Type Name
              </label>
              <input
                type="text"
                value={requestedFinanceTypeName}
                onChange={(e) => setRequestedFinanceTypeName(e.target.value)}
                placeholder="Enter finance type name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
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

      {!showInviteOperatorModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative p-6 pb-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="absolute left-6 top-6 text-[#039994] hover:text-[#02857f]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <button
                onClick={() => { onClose(); window.location.reload(); }}
                className="absolute top-6 right-6 text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mt-8 text-center">
                Finance & Installer information for Owner
              </h2>
              
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center">
                  <div className="w-96 h-1 bg-gray-200 rounded-full mr-2">
                    <div className="h-1 bg-[#039994] rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-500 font-sfpro">04/05</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`${labelClass} text-sm flex items-center`}>
                    Finance type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="financeType"
                      value={formData.financeType}
                      onChange={handleInputChange}
                      className={`${inputClass} text-sm bg-[#F0F0F0] appearance-none pr-10`}
                      required
                      disabled={loadingFinanceTypes}
                    >
                      <option value="">{loadingFinanceTypes ? 'Loading...' : 'Choose type'}</option>
                      {financeTypes.map((type) => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <label className={`${labelClass} text-sm flex items-center`}>
                      Finance company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="financeCompany"
                        value={formData.financeCompany}
                        onChange={handleInputChange}
                        className={`${inputClass} text-sm bg-[#F0F0F0] appearance-none pr-10`}
                        required
                      >
                        <option value="">Choose company</option>
                        <option value="company1">Company 1</option>
                        <option value="company2">Company 2</option>
                        <option value="company3">Company 3</option>
                        <option value="others">Others</option>
                        <option value="n/a">N/A</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {showUploadField && (
                  <div>
                    <label className={`${labelClass} text-sm flex items-center`}>
                      Upload Finance Agreement <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#039994] file:text-white hover:file:bg-[#028882]"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading || uploadSuccess}
                        className={`px-3 py-2 rounded-md text-white text-sm ${!file || uploading || uploadSuccess ? 'bg-gray-400' : 'bg-[#039994] hover:bg-[#028882]'}`}
                      >
                        {uploading ? 'Uploading...' : uploadSuccess ? '✓' : 'Upload'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Required for all finance types except Cash (PDF, JPEG, PNG, Word)
                    </p>
                  </div>
                )}

                <div>
                  <label className={`${labelClass} text-sm flex items-center`}>
                    Select installer <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      name="installer"
                      value={formData.installer}
                      onChange={handleInputChange}
                      className={`${inputClass} text-sm bg-[#F0F0F0] appearance-none pr-10`}
                      disabled={loadingInstallers}
                    >
                      <option value="">{loadingInstallers ? 'Loading...' : 'Choose installer'}</option>
                      {installers.map((installer) => (
                        <option key={installer.id} value={installer.name}>{installer.name}</option>
                      ))}
                      <option value="others">Others</option>
                      <option value="unknown">Don't know</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {showCustomInstaller && (
                  <div>
                    <label className={`${labelClass} text-sm flex items-center`}>
                      Installer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customInstaller"
                      value={formData.customInstaller}
                      onChange={handleInputChange}
                      placeholder="Enter your installer name"
                      className={`${inputClass} text-sm bg-[#F0F0F0]`}
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`${labelClass} text-sm flex items-center`}>
                      System Size <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="systemSize"
                      value={formData.systemSize}
                      onChange={handleInputChange}
                      placeholder="Input system size"
                      className={`${inputClass} text-sm bg-[#F0F0F0] placeholder-[#626060]`}
                    />
                  </div>

                  <div>
                    <label className={`${labelClass} text-sm flex items-center`}>
                      COD <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="cod"
                      value={formData.cod}
                      onChange={handleInputChange}
                      placeholder="Input COD"
                      className={`${inputClass} text-sm bg-[#F0F0F0] placeholder-[#626060]`}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${buttonPrimary} flex items-center justify-center disabled:opacity-50 text-sm`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>

                <div className={`${termsTextContainer} text-sm text-center`}>
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