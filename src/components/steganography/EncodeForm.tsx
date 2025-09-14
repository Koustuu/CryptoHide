import React, { useState, useRef } from 'react';
import { Upload, X, Lock, Info, Save, Image, Music, Video, QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import { createEncryptedQR, downloadQRCode, isValidUrl } from '../../utils/qrSteganography';
import { encodeAudio } from '../../utils/audioSteganography';
import { encodeMessage, imageDataToDataURL } from '../../utils/steganography';
import { fileToImageData, imageDataToBlob } from '../../utils/imageSteganography';

type StegType = 'image' | 'audio' | 'video' | 'qrcode';

const EncodeForm: React.FC = () => {
  const [selectedType, setSelectedType] = useState<StegType | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stegTypes = [
    { id: 'image', name: 'Image Steganography', icon: Image, accept: 'image/*' },
    { id: 'audio', name: 'Audio Steganography', icon: Music, accept: 'audio/*' },
    { id: 'video', name: 'Video Steganography', icon: Video, accept: 'video/*' },
    { id: 'qrcode', name: 'QR Code Steganography', icon: QrCode, accept: null },
  ];

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    preventDefaults(e);
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFile(reader.result as string);
      setFileObject(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileObject(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateEncryptedQRCode = async () => {
    if (!message || !redirectUrl || !password) return;

    // Clear previous states
    setQrError(null);
    setQrSuccess(null);
    setQrCodeData(null);

    try {
      const result = await createEncryptedQR({
        websiteUrl: redirectUrl,
        hiddenMessage: message,
        password: password,
        errorCorrectionLevel: 'H'
      });

      if (result.success && result.data) {
        setQrCodeData(result.data);
        setQrSuccess(`QR code generated successfully! It appears to link to ${result.websiteUrl} but contains your encrypted hidden message.`);
      } else {
        setQrError(result.error || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error('Error generating encrypted QR code:', err);
      setQrError('An unexpected error occurred while generating the QR code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!file && selectedType !== 'qrcode') || !message || !password) return;

    setIsProcessing(true);
    setQrError(null);
    setQrSuccess(null);

    if (selectedType === 'qrcode') {
      await generateEncryptedQRCode();
    } else if (selectedType === 'audio' && fileObject) {
      console.log('UI: Starting audio encoding for file:', fileObject.name);
      if (!fileObject.name.toLowerCase().endsWith('.wav')) {
        console.error('UI: File is not WAV');
        setQrError('Please select a WAV audio file for encoding.');
        setIsProcessing(false);
        return;
      }
      try {
        console.log('UI: Calling encodeAudio');
        const encodedBlob = await encodeAudio(fileObject, message, password);
        console.log('UI: Encoded blob received, size:', encodedBlob.size);
        const url = URL.createObjectURL(encodedBlob);
        console.log('UI: Object URL created:', url);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stego_audio.wav';
        document.body.appendChild(a);
        console.log('UI: About to trigger download');
        a.click();
        console.log('UI: Download triggered');
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setQrSuccess('Audio encoded successfully! File downloaded.');
      } catch (error: any) {
        console.error('UI: Encoding failed:', error);
        setQrError(error.message || 'Failed to encode message into audio.');
      }
    } else if (selectedType === 'image' && fileObject) {
      try {
        // Convert file to ImageData
        const imageData = await fileToImageData(fileObject);
        // Encode message into image data
        const encodedImageData = await encodeMessage(imageData, message, password, 'image');
        if (!encodedImageData) {
          setQrError('Message is too large to encode in the selected image.');
          setIsProcessing(false);
          return;
        }
        // Convert encoded ImageData to Blob
        const blob = await imageDataToBlob(encodedImageData as ImageData);
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encoded_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setQrSuccess('Image encoded successfully! File downloaded.');
      } catch (error: any) {
        console.error('UI: Encoding failed:', error);
        setQrError(error.message || 'Failed to encode message into image.');
      }
    } else if (selectedType === 'video' && fileObject) {
      try {
        // Encode message into video file
        const encodedVideoBlob = await encodeMessage(fileObject, message, password, 'video');
        if (!encodedVideoBlob) {
          setQrError('Video steganography is not yet fully implemented. Please try image steganography.');
          setIsProcessing(false);
          return;
        }
        // Create download link
        const url = URL.createObjectURL(encodedVideoBlob as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encoded_video.avi';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setQrSuccess('Video encoded successfully! File downloaded.');
      } catch (error: any) {
        console.error('UI: Encoding failed:', error);
        setQrError(error.message || 'Failed to encode message into video.');
      }
    } else {
      // Handle other steganography types
      console.log('Processing', selectedType, 'steganography with password');
      setQrError('This steganography type is not yet implemented.');
    }

    setIsProcessing(false);
  };

  const renderFileUpload = () => {
    if (!selectedType || selectedType === 'qrcode') return null;

    const acceptedTypes = stegTypes.find(type => type.id === selectedType)?.accept;

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Upload {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} File
        </label>
        
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-300 ${
              isDragging 
                ? 'border-purple-500 bg-indigo-900/30' 
                : 'border-gray-600 hover:border-purple-500 hover:bg-indigo-900/20'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept={acceptedTypes || ''}
              className="hidden"
            />
            <Upload size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">Drag & drop a file here or click to browse</p>
            <p className="text-gray-500 text-sm">Select a {selectedType} file to hide your message</p>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            {selectedType === 'image' && (
              <img 
                src={file} 
                alt="Selected" 
                className="w-full object-contain max-h-64 rounded-lg"
              />
            )}
            {selectedType === 'audio' && (
              <audio controls className="w-full">
                <source src={file} />
                Your browser does not support the audio element.
              </audio>
            )}
            {selectedType === 'video' && (
              <video controls className="w-full max-h-64">
                <source src={file} />
                Your browser does not support the video element.
              </video>
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 bg-gray-900/70 text-white p-1 rounded-full hover:bg-red-500/90 transition duration-200"
              aria-label="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Hide Your Message</h2>
        <p className="text-gray-400">Choose your preferred steganography method</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stegTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id as StegType)}
              className={`p-4 rounded-lg border transition duration-300 ${
                selectedType === type.id
                  ? 'bg-purple-900/50 border-purple-500 text-white'
                  : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-purple-500'
              }`}
            >
              <type.icon size={24} className="mx-auto mb-2" />
              <span className="block text-sm">{type.name}</span>
            </button>
          ))}
        </div>

        {selectedType && (
          <>
            {renderFileUpload()}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Your Secret Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-none"
                placeholder="Type or paste your secret message here..."
                required
              />
            </div>

            {selectedType === 'qrcode' && (
              <div>
                <label htmlFor="redirectUrl" className="block text-sm font-medium text-gray-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => {
                    setRedirectUrl(e.target.value);
                    setQrError(null); // Clear error when user types
                  }}
                  className={`block w-full px-4 py-3 border ${
                    redirectUrl && !isValidUrl(redirectUrl)
                      ? 'border-red-500'
                      : 'border-gray-600'
                  } bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
                  placeholder="https://example.com"
                  required={selectedType === 'qrcode'}
                />
                {redirectUrl && !isValidUrl(redirectUrl) && (
                  <p className="mt-1 text-sm text-red-400">Please enter a valid URL (e.g., https://example.com)</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  The QR code will appear to link to this website, but will contain your encrypted hidden message.
                </p>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Enter password for encryption"
                required
              />
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <Info size={14} className="mr-1" />
                This password will be required to decode the message
              </p>
            </div>

            {/* Error Message */}
            {qrError && (
              <div className="p-4 bg-red-900 border border-red-700 rounded-md">
                <div className="flex items-center">
                  <AlertCircle size={18} className="text-red-300 mr-2" />
                  <p className="text-red-300 text-sm">{qrError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {qrSuccess && (
              <div className="p-4 bg-green-900 border border-green-700 rounded-md">
                <div className="flex items-center">
                  <CheckCircle size={18} className="text-green-300 mr-2" />
                  <p className="text-green-300 text-sm">{qrSuccess}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={Boolean((!file && selectedType !== 'qrcode') || !message || !password || isProcessing || (selectedType === 'qrcode' && redirectUrl && !isValidUrl(redirectUrl)))}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 ${
                ((!file && selectedType !== 'qrcode') || !message || !password || isProcessing || (selectedType === 'qrcode' && redirectUrl && !isValidUrl(redirectUrl))) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {selectedType === 'qrcode' ? 'Generate QR Code' : 'Hide Message & Download File'}
                </>
              )}
            </button>
          </>
        )}
      </form>

      {qrCodeData && (
        <div className="mt-8 p-6 bg-indigo-900/50 border border-purple-600 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <QrCode size={20} className="mr-2" />
            Generated Encrypted QR Code
          </h3>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrCodeData} alt="Generated Encrypted QR Code" className="max-w-xs" />
            </div>
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm mb-2">
                ✅ Your QR code has been generated successfully!
              </p>
              <p className="text-gray-400 text-xs">
                This QR code appears to link to <span className="text-purple-300">{redirectUrl}</span><br />
                but contains your encrypted hidden message.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => downloadQRCode(qrCodeData, 'encrypted-qr-code.png')}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition duration-200 flex items-center"
              >
                <Save size={16} className="mr-2" />
                Download QR Code
              </button>
              <button
                onClick={() => {
                  setQrCodeData(null);
                  setQrSuccess(null);
                  setQrError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200"
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncodeForm;