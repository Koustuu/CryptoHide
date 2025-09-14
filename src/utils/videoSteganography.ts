// --- Web Crypto API Key Derivation and Encryption/Decryption ---
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-CBC", length: 128 },
    true,
    ["encrypt", "decrypt"]
  );
}

async function encryptMessage(message: string, password: string): Promise<{
  iv: Uint8Array;
  salt: Uint8Array;
  encryptedData: Uint8Array;
}> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    key,
    enc.encode(message)
  );
  return {
    iv: iv,
    salt: salt,
    encryptedData: new Uint8Array(encryptedData)
  };
}

async function decryptMessage(encryptedMessage: Uint8Array, iv: Uint8Array, salt: Uint8Array, password: string): Promise<string> {
  const key = await deriveKey(password, salt);
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    encryptedMessage
  );
  return new TextDecoder().decode(decryptedData);
}

// --- Steganography Logic ---
const SEPARATOR = new TextEncoder().encode('---STEGANOGRAPHY-DATA-START---');

// Encode Process
export async function encodeVideo(videoFile: File, message: string, password: string): Promise<Blob | null> {
  try {
    // Read video data
    const videoBuffer = await videoFile.arrayBuffer();
    const videoData = new Uint8Array(videoBuffer);

    // Encrypt message
    const { iv, salt, encryptedData } = await encryptMessage(message, password);

    // Create the final data block
    const encodedData = new Uint8Array(videoData.length + SEPARATOR.length + iv.length + salt.length + encryptedData.length);

    encodedData.set(videoData, 0);
    encodedData.set(SEPARATOR, videoData.length);
    encodedData.set(iv, videoData.length + SEPARATOR.length);
    encodedData.set(salt, videoData.length + SEPARATOR.length + iv.length);
    encodedData.set(encryptedData, videoData.length + SEPARATOR.length + iv.length + salt.length);

    const blob = new Blob([encodedData], { type: 'video/mp4' });
    return blob;
  } catch (error) {
    console.error('Video encoding failed:', error);
    throw new Error(`An error occurred during encoding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Decode Process
export async function decodeVideo(videoFile: File, password: string): Promise<string | null> {
  try {
    // Read video data
    const videoBuffer = await videoFile.arrayBuffer();
    const videoData = new Uint8Array(videoBuffer);

    // Find separator
    let separatorIndex = -1;
    for (let i = videoData.length - SEPARATOR.length; i >= 0; i--) {
      let match = true;
      for (let j = 0; j < SEPARATOR.length; j++) {
        if (videoData[i + j] !== SEPARATOR[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        separatorIndex = i;
        break;
      }
    }

    if (separatorIndex === -1) {
      throw new Error('No hidden message found in this video file.');
    }

    // Extract data
    const hiddenDataBlock = videoData.subarray(separatorIndex + SEPARATOR.length);
    const iv = hiddenDataBlock.subarray(0, 16);
    const salt = hiddenDataBlock.subarray(16, 32);
    const encryptedData = hiddenDataBlock.subarray(32);

    const decryptedMessage = await decryptMessage(encryptedData, iv, salt, password);
    return decryptedMessage;

  } catch (error) {
    console.error('Video decoding failed:', error);
    if (error instanceof DOMException && error.name === 'OperationError') {
      throw new Error('Invalid password! The hidden message could not be decrypted.');
    } else {
      throw new Error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
