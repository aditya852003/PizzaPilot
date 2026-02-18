'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    const app = getApp();
    const auth = getAuth(app);
    return getSdks(app, auth);
  }

  const firebaseApp = initializeApp(firebaseConfig);
  
  // Get auth instance and set persistence
  const auth = getAuth(firebaseApp);
  // This is an async operation, but we don't need to wait for it.
  // The onAuthStateChanged listener in the provider will correctly
  // pick up the user state once persistence is resolved.
  setPersistence(auth, browserLocalPersistence);

  return getSdks(firebaseApp, auth);
}

export function getSdks(firebaseApp: FirebaseApp, auth: any) {
  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
