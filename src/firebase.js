import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCV2ArXzGn9_X-uFsqg5EQh_rVl5Cs8ZP0",
  authDomain: "ssd-proiect-urs.firebaseapp.com",
  projectId: "ssd-proiect-urs",
  storageBucket: "ssd-proiect-urs.firebasestorage.app",
  messagingSenderId: "447176070740",
  appId: "1:447176070740:web:b9fcf77fb0779c93743fc1",
  measurementId: "G-J0172BD5FE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Google Provider Only
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider, signInWithPopup };