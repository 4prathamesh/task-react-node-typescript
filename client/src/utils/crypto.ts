import CryptoJS from 'crypto-js';

/**
 * FRONTEND ENCRYPTION (Level 1)
 * 
 * The frontend is responsible for Level 1 encryption using AES.
 * This key must match the FRONTEND_ENCRYPTION_KEY on the backend.
 * 
 * Flow:
 *  - Before sending to API: encrypt each sensitive field with this key
 *  - After receiving from API: decrypt each field with this key
 * 
 * The backend then applies its own Level 2 encryption before storing in MongoDB.
 */

const FRONTEND_KEY = import.meta.env.VITE_FRONTEND_ENCRYPTION_KEY
  || 'abc123';

/** Encrypt a plaintext string with AES (Level 1) */
export function encrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, FRONTEND_KEY).toString();
}

/** Decrypt a Level-1 AES encrypted string back to plaintext.
 * Falls back to the original ciphertext if decryption fails. */

export function decrypt(ciphertext: string): string {
  try {
    if (!ciphertext) return '';

    const bytes = CryptoJS.AES.decrypt(ciphertext, FRONTEND_KEY);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('Decrypt failed');
    }

    return plaintext;
  } catch (error) {
    console.error(error);
    return '';
  }
}

/** Encrypt all sensitive fields in a student object */
export function encryptStudentFields(data: Record<string, string>): Record<string, string> {
  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    encrypted[key] = value ? encrypt(value) : value;
  }
  return encrypted;
}

/** Decrypt all fields received from the API */
export function decryptStudentFields(data: Record<string, string>): Record<string, string> {
  const decrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === '_id' || key === 'createdAt' || key === 'updatedAt') {
      decrypted[key] = value;
    } else {
      try {
        decrypted[key] = value ? decrypt(value) : value;
      } catch {
        decrypted[key] = value; // fallback if not encrypted
      }
    }
  }
  return decrypted;
}