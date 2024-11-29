import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAF_bKvkrS81NdQT85pCFjjkqlCKzMYrLA",
  authDomain: "gorrilaz-6d3ab.firebaseapp.com",
  projectId: "gorrilaz-6d3ab",
  storageBucket: "gorrilaz-6d3ab.appspot.com", // Corregido
  messagingSenderId: "312308596287",
  appId: "1:312308596287:web:7b4eae730be17ac74b428a",
  measurementId: "G-24HJKSGFW2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optional: If you use analytics
const analytics = getAnalytics(app);
export { storage };

export { auth, db };
