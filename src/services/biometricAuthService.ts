/**
 * Ileys School Management System - Biometric Authentication Service (WebAuthn)
 * Provides passkey registration and biometric quick login using the Web Authentication API
 * for teachers, students, and school administrators.
 */

export interface BiometricCredential {
  credentialId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  schoolId: string;
  schoolName: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
  publicKeyBase64?: string;
}

const STORAGE_KEY = 'ileys_biometric_credentials';
const LAST_BIOMETRIC_USER_KEY = 'ileys_last_biometric_user';

// Utility to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Utility to convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export class BiometricAuthService {
  /**
   * Check if the browser supports WebAuthn and platform authenticators (FaceID, TouchID, Windows Hello, Fingerprint)
   */
  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential !== 'undefined' &&
      typeof navigator.credentials !== 'undefined' &&
      typeof navigator.credentials.create === 'function' &&
      typeof navigator.credentials.get === 'function'
    );
  }

  /**
   * Check if a user-verifying platform authenticator (e.g. Touch ID, Face ID, Windows Hello) is available
   */
  public static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Retrieve all registered credentials from local storage
   */
  public static getStoredCredentials(): BiometricCredential[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get credential for a specific user ID or email
   */
  public static getCredentialForUser(userIdOrEmail: string): BiometricCredential | undefined {
    const creds = this.getStoredCredentials();
    return creds.find(
      (c) => c.userId === userIdOrEmail || c.userEmail.toLowerCase() === userIdOrEmail.toLowerCase()
    );
  }

  /**
   * Get the most recently used biometric user credentials
   */
  public static getLastBiometricUser(): BiometricCredential | undefined {
    const creds = this.getStoredCredentials();
    if (creds.length === 0) return undefined;
    const lastEmail = localStorage.getItem(LAST_BIOMETRIC_USER_KEY);
    if (lastEmail) {
      const found = creds.find((c) => c.userEmail.toLowerCase() === lastEmail.toLowerCase());
      if (found) return found;
    }
    return creds[0];
  }

  /**
   * Detect human-friendly device name for UI display
   */
  public static getDeviceName(): string {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'Apple iOS Face ID / Touch ID';
    if (/Macintosh/.test(ua)) return 'Mac Touch ID / Apple Passkey';
    if (/Windows/.test(ua)) return 'Windows Hello (Fingerprint / PIN / Camera)';
    if (/Android/.test(ua)) return 'Android Biometric (Fingerprint / Face)';
    if (/Linux/.test(ua)) return 'Linux FIDO2 Security Device';
    return 'Platform Biometric Authenticator';
  }

  /**
   * Register a new WebAuthn Biometric passkey for a teacher, student, or admin
   */
  public static async registerCredential(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    schoolId: string;
    schoolName: string;
  }): Promise<{ success: boolean; credential?: BiometricCredential; error?: string }> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Biometric authentication (WebAuthn) is not supported on this browser or platform.',
      };
    }

    try {
      // Generate cryptographic random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Generate user identifier buffer
      const userIdBuffer = new TextEncoder().encode(user.id);

      const creationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: `Ileys SMS - ${user.schoolName || 'School System'}`,
          id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        },
        user: {
          id: userIdBuffer,
          name: user.email,
          displayName: user.name,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Built-in TouchID, FaceID, Windows Hello
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = (await navigator.credentials.create({
        publicKey: creationOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        return {
          success: false,
          error: 'Biometric registration was cancelled or timed out.',
        };
      }

      const credIdBase64 = arrayBufferToBase64(credential.rawId);
      const newRecord: BiometricCredential = {
        credentialId: credIdBase64,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        schoolId: user.schoolId,
        schoolName: user.schoolName,
        deviceName: this.getDeviceName(),
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existing = this.getStoredCredentials().filter((c) => c.userId !== user.id);
      existing.push(newRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      localStorage.setItem(LAST_BIOMETRIC_USER_KEY, user.email);

      return { success: true, credential: newRecord };
    } catch (err: any) {
      console.warn('WebAuthn Registration Error:', err);
      let errorMsg = err?.message || 'Biometric registration failed.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Biometric scan was dismissed or cancelled by the user.';
      } else if (err.name === 'InvalidStateError') {
        errorMsg = 'This biometric credential is already registered on this device.';
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Authenticate using registered Biometric Passkey
   */
  public static async authenticate(
    targetEmail?: string
  ): Promise<{ success: boolean; credential?: BiometricCredential; error?: string }> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'WebAuthn Biometrics is not supported in this browser environment.',
      };
    }

    const stored = this.getStoredCredentials();
    if (stored.length === 0) {
      return {
        success: false,
        error: 'No biometric passkeys registered on this device. Please log in with password and enable Biometrics in Settings.',
      };
    }

    const matchedCred = targetEmail
      ? stored.find((c) => c.userEmail.toLowerCase() === targetEmail.toLowerCase())
      : this.getLastBiometricUser() || stored[0];

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        userVerification: 'preferred',
        timeout: 60000,
      };

      if (matchedCred?.credentialId) {
        getOptions.allowCredentials = [
          {
            id: base64ToUint8Array(matchedCred.credentialId),
            type: 'public-key',
            transports: ['internal'],
          },
        ];
      }

      const assertion = (await navigator.credentials.get({
        publicKey: getOptions,
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return {
          success: false,
          error: 'Biometric authentication was cancelled.',
        };
      }

      // Update last used timestamp
      if (matchedCred) {
        matchedCred.lastUsedAt = new Date().toISOString();
        const updated = stored.map((c) => (c.userId === matchedCred.userId ? matchedCred : c));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(LAST_BIOMETRIC_USER_KEY, matchedCred.userEmail);
      }

      return { success: true, credential: matchedCred };
    } catch (err: any) {
      console.warn('WebAuthn Authentication Error:', err);
      let errorMsg = err?.message || 'Biometric verification failed.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Biometric scan cancelled or permission denied.';
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Delete biometric credentials for a specific user
   */
  public static removeCredential(userId: string): boolean {
    try {
      const existing = this.getStoredCredentials().filter((c) => c.userId !== userId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return true;
    } catch {
      return false;
    }
  }
}
