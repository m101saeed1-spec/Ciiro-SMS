import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  getDocFromServer,
  Firestore,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigJson) : getApp();

export const auth = getAuth(app);

// Use specified databaseId if present, else default
// Initialize Firestore with forced long-polling to eliminate WebChannel streaming 10s timeout in browser/iframe environments
const targetDbId =
  firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? firebaseConfigJson.firestoreDatabaseId
    : undefined;

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    targetDbId
  );
} catch {
  firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

// Test connection on boot per Firebase skill guidelines
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    } else {
      console.debug('Firebase initial connection status:', error);
    }
  }
}
testFirebaseConnection();

/**
 * 1. User Profile Sync in Firestore `users/{uid}`
 */
export async function syncUserProfileToFirestore(user: FirebaseUser, additionalData: Record<string, any> = {}) {
  if (!user || !user.uid) return null;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || additionalData.name || 'Ileys User',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified || false,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const existing = snap.data();
      return existing;
    }
  } catch (err) {
    console.warn('Firestore sync user warning (falling back to local cache):', err);
    return null;
  }
}

/**
 * 2. Platform Admin Authorization Check & Secure Document Storage in `platformUsers/{uid}`
 *
 * Checks platformUsers/{uid} for the authenticated user.
 * If user has role 'platformAdmin' or 'platformOwner', or is the designated platform admin email,
 * stores/verifies the authorization relationship in platformUsers/{uid}:
 * {
 *   "uid": "FIREBASE_UID",
 *   "email": "m101saeed1@gmail.com",
 *   "role": "platformAdmin",
 *   "status": "active",
 *   "createdAt": "..."
 * }
 */
export async function checkPlatformAdmin(uid: string, email: string): Promise<{ isPlatformAdmin: boolean; role?: string }> {
  try {
    const platRef = doc(db, 'platformUsers', uid);
    const platSnap = await getDoc(platRef);
    if (platSnap.exists()) {
      const data = platSnap.data();
      if (data.role === 'platformAdmin' || data.role === 'platformOwner') {
        return { isPlatformAdmin: true, role: data.role };
      }
    }

    // If email matches designated platform administrator (m101saeed1@gmail.com or superadmin)
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'm101saeed1@gmail.com' || cleanEmail.includes('owner@ileys') || cleanEmail.includes('superadmin')) {
      const adminRecord = {
        uid,
        email: cleanEmail,
        role: 'platformAdmin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await setDoc(platRef, adminRecord, { merge: true });
      return { isPlatformAdmin: true, role: 'platformAdmin' };
    }

    return { isPlatformAdmin: false };
  } catch (err) {
    console.warn('Firestore platformUsers check fallback:', err);
    if (email.trim().toLowerCase() === 'm101saeed1@gmail.com') {
      return { isPlatformAdmin: true, role: 'platformAdmin' };
    }
    return { isPlatformAdmin: false };
  }
}

/**
 * 3. Secure Firebase Authentication Sign In & Platform Admin Verification
 */
export async function signInWithFirebase(email: string, password: string): Promise<{
  success: boolean;
  user?: FirebaseUser;
  isPlatformAdmin?: boolean;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    let userCredential;

    try {
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (authErr: any) {
      // If user does not exist or credentials mismatch, attempt auto-creating account securely in Firebase Auth
      if (
        authErr.code === 'auth/user-not-found' ||
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/wrong-password'
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw authErr;
          }
          throw createErr;
        }
      } else {
        throw authErr;
      }
    }

    const firebaseUser = userCredential.user;

    // Sync basic profile in users/{uid}
    await syncUserProfileToFirestore(firebaseUser);

    // Check platformUsers/{uid}
    const adminCheck = await checkPlatformAdmin(firebaseUser.uid, cleanEmail);

    return {
      success: true,
      user: firebaseUser,
      isPlatformAdmin: adminCheck.isPlatformAdmin,
    };
  } catch (err: any) {
    console.error('Firebase Auth sign in error:', err);
    let msg = 'Authentication failed. Please check your email and password.';
    if (err?.code === 'auth/invalid-email') {
      msg = 'The email address is formatted incorrectly.';
    } else if (err?.code === 'auth/user-disabled') {
      msg = 'This user account has been disabled.';
    } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      msg = 'Invalid password or user credentials.';
    } else if (err?.code === 'auth/user-not-found') {
      msg = 'No account found with this email address.';
    }
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * 4. Secure Firebase Authentication Sign Up & Role Document Provisioning
 */
export async function signUpWithFirebase(
  name: string,
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: FirebaseUser;
  isPlatformAdmin?: boolean;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth Display Name
    if (name) {
      await updateFirebaseAuthProfile(firebaseUser, { displayName: name });
    }

    // Sync to users/{uid}
    await syncUserProfileToFirestore(firebaseUser, { displayName: name });

    // Check / Provision platformUsers/{uid} if platformAdmin
    const adminCheck = await checkPlatformAdmin(firebaseUser.uid, cleanEmail);

    return {
      success: true,
      user: firebaseUser,
      isPlatformAdmin: adminCheck.isPlatformAdmin,
    };
  } catch (err: any) {
    console.error('Firebase Auth sign up error:', err);
    let msg = 'Account registration failed. Please try again.';
    if (err?.code === 'auth/email-already-in-use') {
      msg = 'An account already exists with this email address. Please sign in instead.';
    } else if (err?.code === 'auth/weak-password') {
      msg = 'Password is too weak. Please use at least 6 characters.';
    } else if (err?.code === 'auth/invalid-email') {
      msg = 'The email address is formatted incorrectly.';
    }
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * 5. Secure Ileys 4-Digit ID Claim Transaction
 */
export async function claimIleysIdTransaction(params: {
  schoolId: string;
  role: string;
  ileysId: string;
  authUid: string;
  email: string;
  displayName: string;
}): Promise<{ success: boolean; membership?: any; error?: string }> {
  const { schoolId, role, ileysId, authUid, email, displayName } = params;

  try {
    // Query schoolMemberships matching schoolId and ileysId
    const memQuery = query(
      collection(db, 'schoolMemberships'),
      where('schoolId', '==', schoolId),
      where('ileysId', '==', ileysId)
    );
    const snap = await getDocs(memQuery);

    if (snap.empty) {
      // Create new active membership record
      const newDocRef = doc(collection(db, 'schoolMemberships'));
      const newMem = {
        id: newDocRef.id,
        schoolId,
        role,
        ileysId,
        authUid,
        email,
        name: displayName,
        status: 'active',
        createdAt: new Date().toISOString(),
        linkedAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, newMem);
      return { success: true, membership: newMem };
    }

    const targetDoc = snap.docs[0];
    const targetData = targetDoc.data();

    // Verify role match
    if (targetData.role !== role) {
      return {
        success: false,
        error: `Ileys ID ${ileysId} is registered for role '${targetData.role}', not '${role}'.`,
      };
    }

    // Check if already claimed by another user
    if (targetData.authUid && targetData.authUid !== authUid) {
      return {
        success: false,
        error: `Ileys ID ${ileysId} has already been claimed by another authenticated account (${targetData.email || 'verified user'}).`,
      };
    }

    // Run atomic transaction to link authUid
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(targetDoc.ref);
      if (!docSnap.exists()) {
        throw new Error('Membership record does not exist.');
      }
      const data = docSnap.data();
      if (data.authUid && data.authUid !== authUid) {
        throw new Error('This Ileys ID was just claimed by another account.');
      }

      transaction.update(targetDoc.ref, {
        authUid,
        email,
        status: 'active',
        linkedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return {
      success: true,
      membership: {
        ...targetData,
        id: targetDoc.id,
        authUid,
        email,
        status: 'active',
      },
    };
  } catch (err: any) {
    console.error('Error in claimIleysIdTransaction:', err);
    return {
      success: false,
      error: err?.message || 'Failed to claim Ileys ID. Please verify your credentials.',
    };
  }
}
