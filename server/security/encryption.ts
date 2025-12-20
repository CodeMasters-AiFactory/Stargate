import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Secure encryption utility for project secrets
 * Uses AES-256 encryption like Replit's system
 */
export class SecretsEncryption {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly ENCRYPTION_KEY = (() => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.trim().length === 0) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required. ' +
        'Set it to a secure 32-byte (or longer) string. ' +
        'Example: ENCRYPTION_KEY=your-secure-random-key-here-at-least-32-chars'
      );
    }
    return Buffer.from(key, 'utf8').subarray(0, 32);
  })();

  /**
   * Encrypt a secret value using AES-256-CBC
   */
  static encrypt(value: string): string {
    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Format: iv:encrypted
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Failed to encrypt secret value');
    }
  }

  /**
   * Decrypt an encrypted secret value
   */
  static decrypt(encryptedValue: string): string {
    try {
      const parts = encryptedValue.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = createDecipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt secret value');
    }
  }

  /**
   * Validate secret key name (follows environment variable conventions)
   */
  static validateKeyName(keyName: string): boolean {
    // Allow letters, numbers, underscores - like environment variables
    const keyPattern = /^[A-Za-z][A-Za-z0-9_]*$/;
    return keyPattern.test(keyName) && keyName.length <= 100;
  }

  /**
   * Sanitize secret key name for storage
   */
  static sanitizeKeyName(keyName: string): string {
    return keyName
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100);
  }

  /**
   * Generate secure random secret (for auto-generation)
   */
  static generateRandomSecret(length: number = 32): string {
    return randomBytes(length).toString('base64');
  }
}