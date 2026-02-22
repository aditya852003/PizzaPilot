import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * PRODUCTION-GRADE FIREBASE ADMIN INITIALIZER
 * Ensures initialization happens only once and safely handles environment variables.
 */
function getAdminApp() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // During build time, variables might be missing. We log a warning instead of crashing.
    if (process.env.NODE_ENV === 'production') {
      console.warn('Firebase Admin variables are missing. Initialization skipped.');
    }
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

// Lazy getters for services to prevent build-time initialization errors
export const getAdminDb = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized. Check environment variables.');
  return getFirestore(app);
};

export const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized. Check environment variables.');
  return getAuth(app);
};
