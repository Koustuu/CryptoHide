import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Lock, FileText, Info, Image, Music, Video, QrCode, AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { extractEncryptedQR } from '../../utils/qrSteganography';
import { decodeAudio } from '../../utils/audioSteganography';
import { decodeMessage } from '../../utils/steganography';
import { fileToImageData } from '../../utils/imageSteganography';

type StegType = 'image' | 'audio' | 'video' | 'qrcode';

const DecodeForm: React.FC = () => {
  const [selectedType, setSelectedType] = useState<StegType | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decodeSuccess, setDecodeSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form state when component mounts (page reload/navigation)
  useEffect(() => {
    setSelectedType(null);
    setFile(null);
    setFileObject(null);
    setPassword('');
    setDecodedMessage(null);
    setWebsiteUrl(null);
    setDecodeError(null);
    setDecodeSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const stegTypes = [
    { id: 'image', name: 'Image Steganography', icon: Image, accept: 'image/*' },
    { id: 'audio', name: 'Audio Steganography', icon: Music, accept: 'audio/*' },
    { id: 'video', name: 'Video Steganography', icon: Video, accept: 'video/*,.avi' },
    { id: 'qrcode', name: 'QR Code Steganography', icon: QrCode, accept: 'image/*' },
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
    // Check if it's the same file to avoid clearing results unnecessarily
    const isSameFile = fileObject &&
      fileObject.name === file.name &&
      fileObject.size === file.size &&
      fileObject.lastModified === file.lastModified;

    // Store both the File object and the data URL for display
    setFileObject(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFile(reader.result as string);

      // Only clear results if it's a different file
      if (!isSameFile) {
        setDecodedMessage(null);
        setWebsiteUrl(null);
        setDecodeError(null);
        setDecodeSuccess(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    // If there are decoded results, ask for confirmation
    if (decodedMessage || websiteUrl) {
      const confirmed = window.confirm(
        'Removing this file will also clear the decoded results. Are you sure you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    setFile(null);
    setFileObject(null);
    setDecodedMessage(null);
    setWebsiteUrl(null);
    setDecodeError(null);
    setDecodeSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) {
      setDecodeError('Please select a file and enter a password');
      return;
    }

    setIsProcessing(true);
    setDecodeError(null);
    setDecodeSuccess(null);
    setDecodedMessage(null);
    setWebsiteUrl(null);

    try {
      if (selectedType === 'qrcode') {
        // Handle QR code decoding with encryption
        if (!fileObject) {
          setDecodeError('Please select a QR code image file');
          setIsProcessing(false);
          return;
        }

        // Validate file type
        if (!fileObject.type.startsWith('image/')) {
          setDecodeError('Please select a valid image file (PNG, JPG, etc.)');
          setIsProcessing(false);
          return;
        }

        console.log('Processing QR code file:', fileObject.name, 'Type:', fileObject.type, 'Size:', fileObject.size);

        const result = await extractEncryptedQR(fileObject, password);

        if (result.success) {
          setWebsiteUrl(result.websiteUrl || null);
          setDecodedMessage(result.hiddenMessage || null);

          if (result.hiddenMessage) {
            setDecodeSuccess(`Successfully extracted hidden message from QR code! The QR code links to ${result.websiteUrl} and contains an encrypted message.`);
          } else {
            setDecodeSuccess(`QR code decoded successfully. This QR code links to ${result.websiteUrl} but contains no hidden message.`);
          }
        } else {
          console.error('QR decoding failed:', result.error);
          setDecodeError(result.error || 'Failed to decode QR code');
        }
      } else {
        // Handle decoding for other steganography types
        if (selectedType === 'audio' && fileObject) {
          try {
            const decodedMessage = await decodeAudio(fileObject, password);
            setDecodedMessage(decodedMessage);
            setDecodeSuccess('Successfully extracted hidden message!');
            setDecodeError(null);
          } catch (error: any) {
            // Customize error message for wrong password
            if (error.message && error.message.toLowerCase().includes('incorrect password')) {
              setDecodeError('Wrong password, could not extract the hidden message');
            } else {
              setDecodeError(error.message || 'Failed to decode message from audio.');
            }
            setDecodeSuccess(null);
          }
        } else if (selectedType === 'image' && fileObject) {
          try {
            // Convert file to ImageData
            const imageData = await fileToImageData(fileObject);
            // Decode message from image data
            const decodedMessage = await decodeMessage(imageData, password, 'image');
            if (decodedMessage) {
              setDecodedMessage(decodedMessage);
              setDecodeSuccess('Successfully extracted hidden message!');
              setDecodeError(null);
            } else {
              setDecodeError('No hidden message found in the image.');
              setDecodeSuccess(null);
            }
          } catch (error: any) {
            setDecodeError(error.message || 'Failed to decode message from image.');
            setDecodeSuccess(null);
          }
        } else if (selectedType === 'video' && fileObject) {
          try {
            // For video steganography, we decode from the encoded video file
            const decodedMessage = await decodeMessage(fileObject, password, 'video');
            if (decodedMessage) {
              setDecodedMessage(decodedMessage);
              setDecodeSuccess('Successfully extracted hidden message from video!');
              setDecodeError(null);
            } else {
              setDecodeError('No hidden message found in the video file.');
              setDecodeSuccess(null);
            }
          } catch (error: any) {
            // Customize error message for wrong password
            if (error.message && error.message.toLowerCase().includes('invalid password')) {
              setDecodeError('Wrong password, could not extract the hidden message');
            } else {
              setDecodeError(error.message || 'Failed to decode message from video.');
            }
            setDecodeSuccess(null);
          }
        } else {
          setTimeout(() => {
            const simulatedMessage = "This is a hidden message that was extracted from the file. In a real application, this would be the actual message hidden using steganography.";
            setDecodedMessage(simulatedMessage);
            setDecodeSuccess('Successfully extracted hidden message!');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error during decoding:', error);
      setDecodeError('An unexpected error occurred during decoding');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFileUpload = () => {
    if (!selectedType) return null;

    const acceptedTypes = stegTypes.find(type => type.id === selectedType)?.accept;

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Upload {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} File with Hidden Message
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
            <p className="text-gray-500 text-sm">Upload a {selectedType} file that contains a hidden message</p>
            {selectedType === 'audio' && (
              <p className="text-yellow-400 text-xs mt-2">⚠️ Only WAV files are supported for audio steganography</p>
            )}
            {selectedType === 'video' && (
              <p className="text-yellow-400 text-xs mt-2">⚠️ Only MP4 files are supported for video steganography</p>
            )}
            {selectedType === 'image' && (
              <p className="text-yellow-400 text-xs mt-2">⚠️ Only PNG, JPG/JPEG, BMP, and WebP formats are supported for image steganography</p>
            )}
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
            {selectedType === 'qrcode' && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <img
                    src={file}
                    alt="QR Code"
                    className="w-full object-contain max-h-60 rounded"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-gray-300 text-sm font-medium">
                    📱 {fileObject?.name}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    QR Code ready for decoding
                  </p>
                  {(decodedMessage || websiteUrl) && (
                    <div className="mt-2 px-3 py-1 bg-green-900/30 border border-green-600 rounded-full">
                      <p className="text-green-300 text-xs">
                        ✅ Successfully decoded
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
        <h2 className="text-2xl font-bold text-white mb-2">Reveal Hidden Messages</h2>
        <p className="text-gray-400">Choose the type of file to decode</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stegTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSelectedType(type.id as StegType);
                // Reset form state when switching steganography types
                setFile(null);
                setFileObject(null);
                setPassword('');
                setDecodedMessage(null);
                setWebsiteUrl(null);
                setDecodeError(null);
                setDecodeSuccess(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
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

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Enter decryption password (accepts numbers, letters, special characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <Info size={14} className="mr-1" />
                Enter the password that was used to encrypt the message
              </p>
            </div>

            {/* Error Message */}
            {decodeError && (
              <div className="p-4 bg-red-900 border border-red-700 rounded-md">
                <div className="flex items-center">
                  <AlertCircle size={18} className="text-red-300 mr-2" />
                  <p className="text-red-300 text-sm">{decodeError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {decodeSuccess && (
              <div className="p-4 bg-green-900 border border-green-700 rounded-md">
                <div className="flex items-center">
                  <CheckCircle size={18} className="text-green-300 mr-2" />
                  <p className="text-green-300 text-sm">{decodeSuccess}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || !password || isProcessing}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 ${
                (!file || !password || isProcessing) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Decoding...
                </>
              ) : (
                <>
                  <FileText size={18} className="mr-2" />
                  Reveal Hidden Message
                </>
              )}
            </button>
          </>
        )}
      </form>

      {(decodedMessage || websiteUrl) && (
        <div className="mt-8 p-6 bg-indigo-900/50 border border-purple-600 rounded-lg">
          {selectedType === 'qrcode' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <QrCode size={20} className="mr-2 text-purple-400" />
                  Decoded QR Code Results
                </h3>
                {fileObject && (
                  <div className="text-sm text-gray-400">
                    From: {fileObject.name}
                  </div>
                )}
              </div>

              {websiteUrl && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-white mb-2 flex items-center">
                    <ExternalLink size={16} className="mr-2 text-blue-400" />
                    Website URL
                  </h4>
                  <div className="bg-gray-900 p-3 rounded-md">
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline break-all"
                    >
                      {websiteUrl}
                    </a>
                  </div>
                </div>
              )}

              {decodedMessage && (
                <div>
                  <h4 className="text-md font-medium text-white mb-2 flex items-center">
                    <FileText size={16} className="mr-2 text-green-400" />
                    Hidden Message
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-md text-gray-300 whitespace-pre-wrap break-words border-l-4 border-green-500">
                    {decodedMessage}
                  </div>
                </div>
              )}

              {!decodedMessage && websiteUrl && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-md">
                  <p className="text-yellow-300 text-sm">
                    ℹ️ This QR code contains only a website URL. No hidden message was found.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-purple-700/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      // Clear only the results, keep the file
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Decode Again
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileObject(null);
                      setPassword('');
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Different QR Code
                  </button>
                  <button
                    onClick={handleRemoveFile}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Clear All
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  💡 Your uploaded QR code image remains visible above for reference
                </p>
              </div>
            </>
          ) : selectedType === 'image' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Image size={20} className="mr-2 text-purple-400" />
                  Decoded Image Steganography Results
                </h3>
                {fileObject && (
                  <div className="text-sm text-gray-400">
                    From: {fileObject.name}
                  </div>
                )}
              </div>

              {decodedMessage && (
                <div>
                  <h4 className="text-md font-medium text-white mb-2 flex items-center">
                    <FileText size={16} className="mr-2 text-green-400" />
                    Hidden Message
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-md text-gray-300 whitespace-pre-wrap break-words border-l-4 border-green-500">
                    {decodedMessage}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-purple-700/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      // Clear only the results, keep the file
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Decode Again
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileObject(null);
                      setPassword('');
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Different Image File
                  </button>
                  <button
                    onClick={handleRemoveFile}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Clear All
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  💡 Your uploaded image file remains visible above for reference
                </p>
              </div>
            </>
          ) : selectedType === 'audio' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Music size={20} className="mr-2 text-purple-400" />
                  Decoded Audio Steganography Results
                </h3>
                {fileObject && (
                  <div className="text-sm text-gray-400">
                    From: {fileObject.name}
                  </div>
                )}
              </div>

              {decodedMessage && (
                <div>
                  <h4 className="text-md font-medium text-white mb-2 flex items-center">
                    <FileText size={16} className="mr-2 text-green-400" />
                    Hidden Message
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-md text-gray-300 whitespace-pre-wrap break-words border-l-4 border-green-500">
                    {decodedMessage}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-purple-700/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      // Clear only the results, keep the file
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Decode Again
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileObject(null);
                      setPassword('');
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Different Audio File
                  </button>
                  <button
                    onClick={handleRemoveFile}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Clear All
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  💡 Your uploaded audio file remains visible above for reference
                </p>
              </div>
            </>
          ) : selectedType === 'video' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Video size={20} className="mr-2 text-purple-400" />
                  Decoded Video Steganography Results
                </h3>
                {fileObject && (
                  <div className="text-sm text-gray-400">
                    From: {fileObject.name}
                  </div>
                )}
              </div>

              {decodedMessage && (
                <div>
                  <h4 className="text-md font-medium text-white mb-2 flex items-center">
                    <FileText size={16} className="mr-2 text-green-400" />
                    Hidden Message
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-md text-gray-300 whitespace-pre-wrap break-words border-l-4 border-green-500">
                    {decodedMessage}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-purple-700/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      // Clear only the results, keep the file
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Decode Again
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileObject(null);
                      setPassword('');
                      setDecodedMessage(null);
                      setWebsiteUrl(null);
                      setDecodeError(null);
                      setDecodeSuccess(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Different Video File
                  </button>
                  <button
                    onClick={handleRemoveFile}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Clear All
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  💡 Your uploaded video file remains visible above for reference
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DecodeForm;