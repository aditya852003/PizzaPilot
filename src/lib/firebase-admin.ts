import admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization.
function getAdminApp() {
  if (!admin.apps.length) {
    // Only initialize if we have the necessary environment variables.
    // This avoids errors during the build step on platforms like Vercel.
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      } catch (e: any) {
        console.error('Firebase Admin SDK initialization error:', e);
      }
    }
  }
  return admin.apps.length ? admin.app() : null;
}

/**
 * Lazy getter for Firebase Admin Auth.
 * Returns the Auth instance or throws if the app couldn't be initialized.
 */
export const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
  }
  return admin.auth(app);
};

/**
 * Lazy getter for Firebase Admin Firestore.
 * Returns the Firestore instance or throws if the app couldn't be initialized.
 */
export const getAdminDb = () => {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
  }
  return admin.firestore(app);
};

export const adminAuth = {
    verifyIdToken: (token: string) => getAdminAuth().verifyIdToken(token)
};

export const adminDb = {
    collection: (path: string) => getAdminDb().collection(path)
};
