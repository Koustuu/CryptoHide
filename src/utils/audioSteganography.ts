import CryptoJS from 'crypto-js';

/**
 * Utility functions for audio steganography using LSB (Least Significant Bit) method.
 * Adapted from Python implementation for browser environment.
 * Uses CryptoJS for encryption/decryption.
 */

/**
 * Generates a key from password using SHA256 and base64 encoding.
 * @param password - The password string.
 * @returns The generated key.
 */
const generateKey = (password: string): string => {
  const hash = CryptoJS.SHA256(password);
  return CryptoJS.enc.Base64.stringify(hash).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Encrypts a message using AES with the generated key.
 * @param message - The message to encrypt.
 * @param password - The password for key generation.
 * @returns The encrypted message.
 */
const encryptMessage = (message: string, password: string): string => {
  const key = generateKey(password);
  return CryptoJS.AES.encrypt(message, key).toString();
};

/**
 * Decrypts an encrypted message using AES with the generated key.
 * @param encryptedMessage - The encrypted message.
 * @param password - The password for key generation.
 * @returns The decrypted message.
 */
const decryptMessage = (encryptedMessage: string, password: string): string => {
  const key = generateKey(password);
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Parses a WAV file ArrayBuffer and returns the data chunk as Uint8Array.
 * @param arrayBuffer - The WAV file as ArrayBuffer.
 * @returns The data chunk bytes.
 */
const getWavData = (arrayBuffer: ArrayBuffer): Uint8Array => {
  const view = new DataView(arrayBuffer);
  let offset = 12; // After 'RIFF' and size

  // Find 'data' chunk
  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'data') {
      return new Uint8Array(arrayBuffer, offset + 8, chunkSize);
    }
    offset += 8 + chunkSize;
  }
  throw new Error('Data chunk not found in WAV file');
};

/**
 * Creates a new WAV ArrayBuffer with modified data.
 * @param originalBuffer - The original WAV ArrayBuffer.
 * @param newData - The modified data bytes.
 * @returns The new WAV ArrayBuffer.
 */
const createWavWithData = (originalBuffer: ArrayBuffer, newData: Uint8Array): ArrayBuffer => {
  const view = new DataView(originalBuffer);
  let dataOffset = -1;
  let originalDataSize = 0;
  let offset = 12;

  // Find data chunk
  while (offset < originalBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'data') {
      dataOffset = offset;
      originalDataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
  }

  if (dataOffset === -1) throw new Error('Data chunk not found');

  const originalRiffSize = view.getUint32(4, true);
  const newRiffSize = originalRiffSize - originalDataSize + newData.length;
  const newBufferSize = originalBuffer.byteLength - originalDataSize + newData.length;
  const newBuffer = new ArrayBuffer(newBufferSize);
  const newView = new DataView(newBuffer);
  const uint8View = new Uint8Array(newBuffer);

  // Copy up to RIFF size
  uint8View.set(new Uint8Array(originalBuffer, 0, 4), 0);
  // Set new RIFF size
  newView.setUint32(4, newRiffSize, true);
  // Copy from 8 to data start
  uint8View.set(new Uint8Array(originalBuffer, 8, dataOffset - 8 + 8), 8);
  // Set new data size
  newView.setUint32(dataOffset + 4, newData.length, true);
  // Set new data
  uint8View.set(newData, dataOffset + 8);
  // Copy rest if any
  const restStart = dataOffset + 8 + originalDataSize;
  if (restStart < originalBuffer.byteLength) {
    uint8View.set(new Uint8Array(originalBuffer, restStart), dataOffset + 8 + newData.length);
  }

  return newBuffer;
};

/**
 * Converts a string to its binary representation.
 * @param message - The message to convert.
 * @returns The binary string.
 */
const getBinaryString = (message: string): string => {
  let binary = '';
  for (let i = 0; i < message.length; i++) {
    binary += message.charCodeAt(i).toString(2).padStart(8, '0');
  }
  return binary;
};

/**
 * Encodes a message into an audio file using LSB steganography.
 * @param audioFile - The original audio file.
 * @param message - The message to hide.
 * @param password - The password for encryption.
 * @returns Promise resolving to the modified audio file as Blob.
 */
export const encodeAudio = async (audioFile: File, message: string, password: string): Promise<Blob> => {
  console.log('encodeAudio: Starting encoding for file:', audioFile.name, 'size:', audioFile.size);
  const encryptedMessage = encryptMessage("STEG" + message, password);
  console.log('encodeAudio: Encrypted message length:', encryptedMessage.length);
  const binaryMessage = getBinaryString(encryptedMessage + '###');
  console.log('encodeAudio: Binary message length:', binaryMessage.length);

  const arrayBuffer = await audioFile.arrayBuffer();
  console.log('encodeAudio: ArrayBuffer size:', arrayBuffer.byteLength);
  const data = getWavData(arrayBuffer);
  console.log('encodeAudio: WAV data length:', data.length);

  if (binaryMessage.length > data.length) {
    console.error('encodeAudio: Message too long');
    throw new Error('Message is too long for this audio file. Try a larger audio file or a shorter message.');
  }

  // Embed the message bits into the LSB of data
  for (let i = 0; i < binaryMessage.length; i++) {
    data[i] = (data[i] & 0xFE) | parseInt(binaryMessage[i], 2);
  }
  console.log('encodeAudio: Message embedded into LSB');

  const newBuffer = createWavWithData(arrayBuffer, data);
  console.log('encodeAudio: New buffer size:', newBuffer.byteLength);
  const blob = new Blob([newBuffer], { type: 'audio/wav' });
  console.log('encodeAudio: Blob created, size:', blob.size);
  return blob;
};

/**
 * Decodes a message from an audio file.
 * @param audioFile - The audio file containing the message.
 * @param password - The password for decryption.
 * @returns Promise resolving to the decoded message.
 */
export const decodeAudio = async (audioFile: File, password: string): Promise<string> => {
  const arrayBuffer = await audioFile.arrayBuffer();
  const data = getWavData(arrayBuffer);

  // Extract binary data
  let binaryData = '';
  for (let i = 0; i < data.length; i++) {
    binaryData += (data[i] & 1).toString();
  }

  // Convert binary to string
  let decodedChars: string[] = [];
  for (let i = 0; i < binaryData.length; i += 8) {
    const byte = binaryData.substring(i, i + 8);
    if (byte.length < 8) break;
    decodedChars.push(String.fromCharCode(parseInt(byte, 2)));
    if (decodedChars.join('').endsWith('###')) {
      break;
    }
  }

  const encryptedMessage = decodedChars.join('').replace('###', '');

  const decrypted = decryptMessage(encryptedMessage, password);
  if (!decrypted.startsWith("STEG")) {
    throw new Error('Incorrect password or corrupted file!');
  }
  return decrypted.substring(4);
};
