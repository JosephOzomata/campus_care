// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBeNvXRtzyjwhcLRXpPjuR58hnx-L2VkEA",
  authDomain: "campuscare-a43be.firebaseapp.com",
  projectId: "campuscare-a43be",
  storageBucket: "campuscare-a43be.firebasestorage.app",
  messagingSenderId: "996796618437",
  appId: "1:996796618437:web:e09738044cbc84bfaa02ac"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


