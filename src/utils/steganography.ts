import { encodeImageMessage, decodeImageMessage, fileToImageData, imageDataToBlob } from './imageSteganography';
import { encodeVideo, decodeVideo } from './videoSteganography';

/**
 * Utility functions for steganography operations
 * Note: This is a simplified implementation for demonstration purposes
 * A real implementation would use more sophisticated algorithms
 */

/**
 * Embeds a message in an image or video using LSB (Least Significant Bit) steganography
 * @param data - The original image data or video file
 * @param message - The message to hide
 * @param password - Optional password for encryption
 * @param type - 'image' or 'video'
 * @returns Modified image data with hidden message or encoded video Blob
 */
export const encodeMessage = async (
  data: ImageData | File,
  message: string,
  password?: string,
  type: 'image' | 'video' = 'image'
): Promise<ImageData | Blob | null> => {
  if (type === 'video' && data instanceof File && password) {
    return await encodeVideo(data, message, password);
  } else if (type === 'image' && data instanceof ImageData) {
    return await encodeImageMessage(data, message, password);
  }
  return null;
};

/**
 * Extracts a hidden message from an image or video
 * @param data - The image data or video file potentially containing a hidden message
 * @param password - Optional password for decryption
 * @param type - 'image' or 'video'
 * @returns The extracted message or null if no message found
 */
export const decodeMessage = async (
  data: ImageData | File,
  password?: string,
  type: 'image' | 'video' = 'image'
): Promise<string | null> => {
  if (type === 'video' && data instanceof File && password) {
    return await decodeVideo(data, password);
  } else if (type === 'image' && data instanceof ImageData) {
    return await decodeImageMessage(data, password);
  }
  return null;
};

/**
 * Converts an image element to ImageData
 * @param image - The image element
 * @returns ImageData representation of the image
 */
export const imageToImageData = (image: HTMLImageElement): ImageData => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }
  
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Converts ImageData back to a data URL
 * @param imageData - The ImageData to convert
 * @returns Data URL of the image
 */
export const imageDataToDataURL = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }
  
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  
  return canvas.toDataURL();
};