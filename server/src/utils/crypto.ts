import CryptoJS from 'crypto-js';

const BACKEND_KEY = process.env.BACKEND_ENCRYPTION_KEY || 'backend_aes_secret_key_32chars!!';
const FRONTEND_KEY = process.env.FRONTEND_ENCRYPTION_KEY || 'frontend_aes_secret_key_32chars!';

/**
 * ENCRYPTION FLOW:
 * 
 * STORING DATA (Write):
 *   Frontend encrypts with FRONTEND_KEY (Level 1)
 *   → Sends encrypted payload to backend
 *   → Backend decrypts with FRONTEND_KEY to get plaintext
 *   → Backend re-encrypts with BACKEND_KEY (Level 2)
 *   → Stores Level-2 encrypted data in MongoDB
 * 
 * FETCHING DATA (Read):
 *   MongoDB returns Level-2 encrypted data
 *   → Backend decrypts with BACKEND_KEY (removes Level 2)
 *   → Backend re-encrypts with FRONTEND_KEY (applies Level 1)
 *   → Sends Level-1 encrypted data to frontend
 *   → Frontend decrypts with FRONTEND_KEY (removes Level 1)
 *   → Plaintext displayed to user
 */

/** Decrypt data that was encrypted by the frontend (Level 1 → plaintext) */
export function decryptFromFrontend(encryptedData: string): string {
  if (!encryptedData) return '';
  const bytes = CryptoJS.AES.decrypt(encryptedData, FRONTEND_KEY);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return plaintext || encryptedData;
}

/** Encrypt data for storage in MongoDB (plaintext → Level 2) */
export function encryptForStorage(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, BACKEND_KEY).toString();
}

/** Decrypt data from MongoDB (Level 2 → plaintext) */
export function decryptFromStorage(encryptedData: string): string {
  if (!encryptedData) return '';

  const bytes = CryptoJS.AES.decrypt(encryptedData, BACKEND_KEY);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);

  if (!plaintext) {
    throw new Error('Storage decryption failed');
  }

  return plaintext;
}

/** Encrypt plaintext for the frontend (plaintext → Level 1) */
export function encryptForFrontend(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, FRONTEND_KEY).toString();
}

/** Full pipeline: decrypt from frontend, re-encrypt for storage */
export function processIncomingField(frontendEncrypted: string): string {
  const plaintext = decryptFromFrontend(frontendEncrypted);
  return encryptForStorage(plaintext);
}

/** Full pipeline: decrypt from storage, re-encrypt for frontend */
export function processOutgoingField(storedEncrypted: string): string {
  const plaintext = decryptFromStorage(storedEncrypted);
  return encryptForFrontend(plaintext);
}