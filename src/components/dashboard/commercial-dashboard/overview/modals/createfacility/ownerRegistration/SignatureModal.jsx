import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function SignatureModal({ isOpen, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState("draw");
  const [signature, setSignature] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen, activeTab]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileUpload = async (e) => {
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
    await uploadSignature(file);
  };

  const canvasToBlob = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      canvas.toBlob(resolve, 'image/png');
    });
  };

  const createSignatureImage = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'black';
      ctx.font = '32px cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText(signature, canvas.width / 2, canvas.height / 2);
      
      canvas.toBlob(resolve, 'image/png');
    });
  };

  const uploadSignature = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setIsUploaded(false);
      
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        throw new Error('User authentication required');
      }

      const formData = new FormData();
      formData.append('signature', file); // Changed from 'File' to 'signature'

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/update-user-agreement/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload signature');
      }

      const result = await response.json();
      
      setIsUploaded(true);
      toast.success('Signature uploaded successfully!');
      
      if (result.data?.signature) {
        localStorage.setItem('signatureUrl', result.data.signature);
      }

      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload signature');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignAgreement = async () => {
    try {
      let signatureFile = null;

      if (activeTab === "draw") {
        const canvas = canvasRef.current;
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
          toast.error('Please draw your signature');
          return;
        }
        
        signatureFile = await canvasToBlob();
      } else if (activeTab === "type") {
        if (!signature.trim()) {
          toast.error('Please type your signature');
          return;
        }
        signatureFile = await createSignatureImage();
      } else if (activeTab === "upload") {
        if (!uploadedFile) {
          toast.error('Please upload a signature image');
          return;
        }
        const success = await uploadSignature(uploadedFile);
        if (success) {
          onComplete();
        }
        return;
      }

      if (signatureFile) {
        const success = await uploadSignature(new File([signatureFile], 'signature.png'));
        if (success) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Signature error:', error);
      toast.error(error.message || 'Failed to save signature');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-6">
            Signature
          </h2>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("draw")}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "draw"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => setActiveTab("type")}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "type"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Type
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 font-medium text-sm transition-colors font-sfpro ${
                activeTab === "upload"
                  ? "text-[#039994] border-b-2 border-[#039994]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
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
                  className="w-full h-48 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6H5H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                  className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-2xl font-cursive placeholder-gray-400 focus:outline-none focus:border-[#039994] font-sfpro"
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
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#039994] hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto"
                        >
                          <path
                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17 8L12 3L7 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 3V15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 font-sfpro">Drag & drop a signature image or scan</p>
                      <p className="text-xs text-gray-400 font-sfpro">or</p>
                      <div className="mt-2">
                        <span className="inline-block px-4 py-2 bg-[#039994] text-white rounded-md text-sm font-sfpro">
                          Select Image
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isUploading && (
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600 font-sfpro">Uploading signature...</p>
                        </div>
                      </div>
                    )}

                    {isUploaded && !isUploading && (
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                        <div className="text-center">
                          <div className="text-[#039994] mb-2">
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto"
                            >
                              <path
                                d="M8 12L10.5 14.5L16 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-800 font-sfpro font-medium">Signature uploaded successfully</p>
                        </div>
                      </div>
                    )}

                    {(isUploading || uploadProgress > 0) && (
                      <div className="bg-[#039994] text-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="currentColor"
                              />
                            </svg>
                            <span className="text-sm font-sfpro">{uploadedFile.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-sfpro">{uploadProgress}%</span>
                            {isUploaded && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        {isUploaded && (
                          <div className="mt-2 text-xs font-sfpro">Upload complete</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-6 leading-relaxed font-sfpro">
            By signing this document with an electronic signature, I agree that such signature will be as valid as handwritten signatures to the extent allowed by local law.
          </p>

          <div className="flex justify-between gap-4">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignAgreement}
              disabled={isUploading}
              className="flex-1 rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
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