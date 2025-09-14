/**
 * Image Steganography utilities using LSB (Least Significant Bit) technique
 * Ported from Python implementation for browser compatibility
 */

// Delimiter to mark the end of the message in the hidden data
const MESSAGE_DELIMITER = '###END###';

/**
 * Converts a string message into a binary string.
 * Each character is converted to its 8-bit ASCII representation.
 */
function stringToBinary(message: string): string {
  return message.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
}

/**
 * Converts a binary string back into a human-readable string.
 * Splits the binary string into 8-bit chunks and converts each to a character.
 */
function binaryToString(binaryMessage: string): string {
  let message = "";
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    if (byte.length === 8) {
      message += String.fromCharCode(parseInt(byte, 2));
    }
  }
  return message;
}

/**
 * Encodes a message into an image using the LSB technique.
 * @param imageData - The original image data
 * @param message - The secret message to hide
 * @returns Modified image data with hidden message or null if message too large
 */
export async function encodeImageMessage(
  imageData: ImageData,
  message: string
): Promise<ImageData | null> {
  console.log("Encoding message into image...");

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Add delimiter to the end of the message
  const fullMessage = message + MESSAGE_DELIMITER;
  const binaryMessage = stringToBinary(fullMessage);

  // Check if the image has enough capacity
  const requiredBits = binaryMessage.length;
  const maxBits = width * height * 4; // 4 channels: RGBA
  if (requiredBits > maxBits) {
    console.error(`Message is too large for the image. Required bits: ${requiredBits}, Available bits: ${maxBits}`);
    return null;
  }

  // Create a copy of the image data to modify
  const modifiedData = new Uint8ClampedArray(data);

  let bitIndex = 0;
  let pixelIndex = 0;

  // Iterate through the binary message and modify the LSB of pixel data
  while (bitIndex < binaryMessage.length && pixelIndex < data.length) {
    // Get current LSB
    const currentBit = modifiedData[pixelIndex] & 1;
    const messageBit = parseInt(binaryMessage[bitIndex]);

    if (currentBit !== messageBit) {
      if (messageBit === 0) {
        // Clear LSB
        modifiedData[pixelIndex] &= 254; // 11111110
      } else {
        // Set LSB
        modifiedData[pixelIndex] |= 1; // 00000001
      }
    }

    bitIndex++;
    pixelIndex++;
  }

  console.log("Encoding complete. The image has been modified.");
  return new ImageData(modifiedData, width, height);
}

/**
 * Decodes a message hidden in an image using the LSB technique.
 * @param imageData - The image data potentially containing a hidden message
 * @returns The hidden message or null if no message found
 */
export async function decodeImageMessage(imageData: ImageData): Promise<string | null> {
  console.log("Decoding message from image...");

  const data = imageData.data;
  let binaryData = "";

  // Extract LSB from each pixel
  for (let i = 0; i < data.length; i++) {
    binaryData += (data[i] & 1).toString();
  }

  // Convert binary data to string
  const decodedMessage = binaryToString(binaryData);

  // Check for delimiter
  if (decodedMessage.includes(MESSAGE_DELIMITER)) {
    const message = decodedMessage.split(MESSAGE_DELIMITER)[0];
    console.log("Decoding complete. Message found.");
    return message;
  } else {
    console.log("No message found in the image.");
    return null;
  }
}

/**
 * Converts a File object to ImageData
 * @param file - The image file
 * @returns Promise resolving to ImageData
 */
export function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts ImageData to a downloadable blob
 * @param imageData - The ImageData to convert
 * @returns Promise resolving to Blob
 */
export function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}
