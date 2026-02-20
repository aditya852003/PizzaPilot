import admin from 'firebase-admin';

/**
 * Lazy-initializes the Firebase Admin SDK.
 * This prevents errors during the build phase (e.g. on Vercel) 
 * when environment variables might not be present.
 */
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Return null instead of throwing to allow the build process to continue.
    // Logic inside route handlers will check for initialization.
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error:', e);
    return null;
  }
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const app = getAdminApp();
    if (!app) {
      throw new Error('Firebase Admin SDK not initialized. Set env variables in Vercel.');
    }
    return admin.auth(app).verifyIdToken(token);
  }
};

export const adminDb = {
  collection: (path: string) => {
    const app = getAdminApp();
    if (!app) {
      throw new Error('Firebase Admin SDK not initialized. Set env variables in Vercel.');
    }
    return admin.firestore(app).collection(path);
  }
};
