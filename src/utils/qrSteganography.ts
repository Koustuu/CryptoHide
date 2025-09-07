import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

/**
 * QR Code Steganography Utilities
 * JavaScript/TypeScript implementation of Python QR steganography functionality
 */

export interface QRSteganographyResult {
  success: boolean;
  data?: string;
  websiteUrl?: string;
  hiddenMessage?: string;
  error?: string;
}

export interface QRGenerationOptions {
  websiteUrl: string;
  hiddenMessage: string;
  password: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate or retrieve encryption key from localStorage
 * Equivalent to Python's generate_key() and load_key() functions
 */
function getEncryptionKey(password: string): string {
  // Use password-based key derivation for consistent encryption
  // This ensures the same password always generates the same key
  const salt = 'cryptohide-qr-salt'; // Static salt for consistency
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  });
  return key.toString();
}

/**
 * Encrypt hidden message using AES encryption
 * Equivalent to Python's encrypt_message() function
 */
function encryptMessage(message: string, password: string): string {
  try {
    const key = getEncryptionKey(password);
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    // Base64 encode for QR compatibility (equivalent to Python's base64.b64encode)
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
  } catch {
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt hidden message using AES decryption
 * Equivalent to Python's decrypt_message() function
 */
function decryptMessage(encryptedMessage: string, password: string): string {
  try {
    const key = getEncryptionKey(password);
    // Base64 decode (equivalent to Python's base64.b64decode)
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedMessage).toString(CryptoJS.enc.Utf8);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedMessage) {
      throw new Error('Invalid password or corrupted data');
    }
    
    return decryptedMessage;
  } catch {
    throw new Error('Failed to decrypt message: Invalid password or corrupted data');
  }
}

/**
 * Create encrypted QR code with hidden message
 * Equivalent to Python's create_encrypted_qr() function
 */
export async function createEncryptedQR(options: QRGenerationOptions): Promise<QRSteganographyResult> {
  try {
    const { websiteUrl, hiddenMessage, password, errorCorrectionLevel = 'H' } = options;

    // Validate inputs
    if (!websiteUrl || !hiddenMessage || !password) {
      return {
        success: false,
        error: 'Website URL, hidden message, and password are required'
      };
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return {
        success: false,
        error: 'Please enter a valid website URL (e.g., https://example.com)'
      };
    }

    // Encrypt the hidden message
    const encryptedHidden = encryptMessage(hiddenMessage, password);

    // Combine website URL with encrypted hidden message
    // Format: {url}#hidden={encrypted_data} (same as Python implementation)
    const fullData = `${websiteUrl}#hidden=${encryptedHidden}`;

    // Generate QR code with high error correction (equivalent to Python's ERROR_CORRECT_H)
    const qrCodeDataUrl = await QRCode.toDataURL(fullData, {
      errorCorrectionLevel: errorCorrectionLevel,
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    });

    return {
      success: true,
      data: qrCodeDataUrl,
      websiteUrl: websiteUrl,
      hiddenMessage: hiddenMessage
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create encrypted QR code'
    };
  }
}

/**
 * Extract and decrypt hidden message from QR code
 * Equivalent to Python's extract_encrypted_qr() function
 */
export async function extractEncryptedQR(imageFile: File, password: string): Promise<QRSteganographyResult> {
  try {
    console.log('Starting QR extraction for file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);

    if (!imageFile || !password) {
      return {
        success: false,
        error: 'Image file and password are required'
      };
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please upload a valid image file (PNG, JPG, GIF, etc.)'
      };
    }

    // Convert image file to ImageData for jsQR processing
    console.log('Converting image file to ImageData...');
    const imageData = await getImageDataFromFile(imageFile);
    console.log('ImageData created:', imageData.width, 'x', imageData.height);

    // Decode QR code using jsQR (equivalent to Python's pyzbar.decode)
    console.log('Attempting to decode QR code...');
    const qrResult = jsQR(imageData.data, imageData.width, imageData.height);

    if (!qrResult) {
      console.log('No QR code detected in image');
      return {
        success: false,
        error: 'No QR code found in the image. Please ensure the image contains a clear, readable QR code and try again.'
      };
    }

    const decodedText = qrResult.data;
    console.log('QR code decoded successfully. Data length:', decodedText.length);
    console.log('QR code content preview:', decodedText.substring(0, 100) + (decodedText.length > 100 ? '...' : ''));

    // Extract hidden part from the URL (same logic as Python implementation)
    if (decodedText.includes('#hidden=')) {
      console.log('Hidden data detected in QR code');
      const [websiteUrl, hiddenEncoded] = decodedText.split('#hidden=', 2);
      console.log('Website URL:', websiteUrl);
      console.log('Encrypted data length:', hiddenEncoded.length);

      try {
        console.log('Attempting to decrypt hidden message...');
        const hiddenMessage = decryptMessage(hiddenEncoded, password);
        console.log('Decryption successful. Message length:', hiddenMessage.length);

        return {
          success: true,
          websiteUrl: websiteUrl,
          hiddenMessage: hiddenMessage
        };
      } catch (error) {
        console.error('Decryption failed:', error);
        return {
          success: false,
          error: 'Decryption failed: Invalid password or corrupted data. Please check your password and try again.'
        };
      }
    } else {
      // QR code contains only website URL, no hidden data
      console.log('No hidden data found - regular QR code');
      return {
        success: true,
        websiteUrl: decodedText,
        hiddenMessage: undefined
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract data from QR code'
    };
  }
}

/**
 * Convert image file to ImageData for QR code processing
 */
async function getImageDataFromFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to create canvas context. Your browser may not support this feature.'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('ImageData extracted:', imageData.data.length, 'bytes');

        // Clean up object URL
        URL.revokeObjectURL(img.src);

        resolve(imageData);
      } catch (error) {
        console.error('Error processing image:', error);
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to process image data. The image may be corrupted or in an unsupported format.'));
      }
    };

    img.onerror = (error) => {
      console.error('Image load error:', error);
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image. Please ensure the file is a valid image format (PNG, JPG, GIF, etc.).'));
    };

    // Set CORS to anonymous to handle potential cross-origin issues
    img.crossOrigin = 'anonymous';

    try {
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating object URL:', error);
      reject(new Error('Failed to process the uploaded file. Please try again.'));
    }
  });
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download QR code image as file
 */
export function downloadQRCode(dataUrl: string, filename: string = 'encrypted-qr-code.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
