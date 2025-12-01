// firebase.js
// Import the functions you need from the SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // <--- Auth import
import { getFirestore } from "firebase/firestore"; // optional, if using Firestore
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCV2ArXzGn9_X-uFsqg5EQh_rVl5Cs8ZP0",
  authDomain: "ssd-proiect-urs.firebaseapp.com",
  projectId: "ssd-proiect-urs",
  storageBucket: "ssd-proiect-urs.firebasestorage.app",
  messagingSenderId: "447176070740",
  appId: "1:447176070740:web:b9fcf77fb0779c93743fc1",
  measurementId: "G-J0172BD5FE"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);