/**
 * Client-side Firebase configuration.
 * Uses NEXT_PUBLIC_ environment variables for Vercel compatibility.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALsWVy9uKZ1zkvhssLY8Evt_Jop1w9tUY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-119737383-b0534.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-119737383-b0534",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:783192861379:web:f9e6c83919a105b2c89076",
};
