
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Bun inlines process.env.* at bundle time for variables matching bunfig.toml env pattern
const firebaseConfig = {
  apiKey: process.env.BUN_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.BUN_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.BUN_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.BUN_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.BUN_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.BUN_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup and return the Firebase ID token
 */
export const signInWithGoogle = async (): Promise<string> => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
};
