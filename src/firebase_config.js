// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBdUUS2HLIpKFa_5QHyTPf6rcFhKxHOtHQ",
  authDomain: "alash-sheker.firebaseapp.com",
  databaseURL: "https://alash-sheker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alash-sheker",
  storageBucket: "alash-sheker.appspot.com",
  messagingSenderId: "56911217429",
  appId: "1:56911217429:web:4ba02b6bcf7409f59d1f1c",
  measurementId: "G-L4K2JV8H8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { auth, db, storage, analytics, database };
