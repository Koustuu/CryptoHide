const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // GCM recommended IV length
const SALT_LENGTH = 16;
const KEY_LENGTH = 256;

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(message: string, password: string): Promise<{ encryptedMessage: Uint8Array; salt: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    data
  );

  // Combine IV and encrypted data
  const encryptedMessage = new Uint8Array(iv.length + encrypted.byteLength);
  encryptedMessage.set(iv);
  encryptedMessage.set(new Uint8Array(encrypted), iv.length);

  return { encryptedMessage, salt };
}

export async function decryptMessage(encryptedMessage: Uint8Array, password: string, salt: Uint8Array): Promise<string | null> {
  try {
    const key = await deriveKey(password, salt);
    const iv = encryptedMessage.slice(0, IV_LENGTH);
    const encrypted = encryptedMessage.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
