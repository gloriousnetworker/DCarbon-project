import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../../../../../../../lib/config";

export default function SignatureModal({ isOpen, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState("draw");
  const [signature, setSignature] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && activeTab === "draw") {
      initializeCanvas();
    }
  }, [isOpen, activeTab]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
  };

  const canvasToFile = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not found'));
        return;
      }

      // Check if canvas is empty
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let isEmpty = true;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) {
          isEmpty = false;
          break;
        }
      }
      
      if (isEmpty) {
        reject(new Error('Please draw your signature'));
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          resolve(file);
        } else {
          reject(new Error('Failed to create signature image'));
        }
      }, 'image/png');
    });
  };

  const textToFile = () => {
    return new Promise((resolve, reject) => {
      if (!signature.trim()) {
        reject(new Error('Please type your signature'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text signature
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px "Brush Script MT", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signature, canvas.width / 2, canvas.height / 2);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          resolve(file);
        } else {
          reject(new Error('Failed to create signature image'));
        }
      }, 'image/png');
    });
  };

  const uploadSignature = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        throw new Error('User authentication required. Please log in again.');
      }

      const formData = new FormData();
      // Make sure the field name matches what the backend expects
      formData.append('signature', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axiosInstance({
        method: 'PUT',
        url: `/api/user/update-user-agreement/${userId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        data: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check if response is successful
      if (response.status === 200 || response.status === 201) {
        toast.success('Signature uploaded successfully!');
        
        // Store signature URL if returned
        if (response.data?.data?.signature) {
          localStorage.setItem('signatureUrl', response.data.data.signature);
        }
        
        // Call onComplete after successful upload
        setTimeout(() => {
          onComplete();
        }, 500);
        
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to upload signature');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(error.message || 'Failed to upload signature');
      }
      
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignAgreement = async () => {
    try {
      let fileToUpload = null;

      if (activeTab === "draw") {
        try {
          fileToUpload = await canvasToFile();
        } catch (error) {
          toast.error(error.message);
          return;
        }
      } else if (activeTab === "type") {
        try {
          fileToUpload = await textToFile();
        } catch (error) {
          toast.error(error.message);
          return;
        }
      } else if (activeTab === "upload") {
        if (!uploadedFile) {
          toast.error('Please select a signature image to upload');
          return;
        }
        fileToUpload = uploadedFile;
      }

      if (fileToUpload) {
        const success = await uploadSignature(fileToUpload);
        // onComplete is now called inside uploadSignature after successful upload
      }
    } catch (error) {
      console.error('Signature error:', error);
      toast.error(error.message || 'Failed to save signature');
    }
  };

  const handleClose = () => {
    // Reset all states
    setActiveTab("draw");
    setSignature("");
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
          disabled={isUploading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="p-6">
          <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-6">
            Signature
          </h2>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("draw")}
              disabled={isUploading}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "draw"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Draw
            </button>
            <button
              onClick={() => setActiveTab("type")}
              disabled={isUploading}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "type"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Type
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              disabled={isUploading}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "upload"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Upload
            </button>
          </div>

          <div className="mb-6">
            {activeTab === "draw" && (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full h-48 border-2 border-gray-200 rounded-lg bg-white cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
                <button
                  onClick={clearCanvas}
                  disabled={isUploading}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}

            {activeTab === "type" && (
              <div>
                <input
                  type="text"
                  placeholder="Type your signature here"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={isUploading}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-2xl font-cursive placeholder-gray-400 focus:outline-none focus:border-[#039994] font-sfpro disabled:opacity-50"
                  style={{ fontFamily: "cursive" }}
                />
              </div>
            )}

            {activeTab === "upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {!uploadedFile ? (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#039994] hover:bg-gray-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 font-sfpro">Click to select a signature image</p>
                      <p className="text-xs text-gray-400 font-sfpro">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full h-48 border-2 border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={URL.createObjectURL(uploadedFile)} 
                        alt="Signature preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <button
                      onClick={() => setUploadedFile(null)}
                      disabled={isUploading}
                      className="text-sm text-red-500 hover:text-red-700 font-sfpro disabled:opacity-50"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-sfpro text-gray-600">Uploading...</span>
                <span className="text-sm font-sfpro text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#039994] h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mb-6 leading-relaxed font-sfpro">
            By signing this document with an electronic signature, I agree that such signature will be as valid as handwritten signatures to the extent allowed by local law.
          </p>

          <div className="flex justify-between gap-4">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignAgreement}
              disabled={isUploading || (activeTab === "upload" && !uploadedFile)}
              className="flex-1 rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Sign Agreement'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
