import admin from 'firebase-admin';

// This is the format for the service account key you can download from the Firebase console.
// You'd typically store this in an environment variable.
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Check if the app is already initialized to prevent re-initialization.
if (!admin.apps.length) {
  try {
    // In a server environment like Vercel or Google Cloud Run,
    // you can set these environment variables for auto-initialization.
    const serviceAccount: ServiceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID!,
      client_email: process.env.FIREBASE_CLIENT_EMAIL!,
      // The private key must be formatted correctly (replace \\n with \n).
      private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    } as ServiceAccount;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e: any) {
     console.error('Firebase Admin SDK initialization error:', e);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
