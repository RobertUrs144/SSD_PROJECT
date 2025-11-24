// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkKHpQzUOa8VYpe2WWeeUnxa8sL2o3z8o",
  authDomain: "ssd-project-cfd40.firebaseapp.com",
  projectId: "ssd-project-cfd40",
  // storageBucket is usually in the form '<project-id>.appspot.com'
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ssd-project-cfd40.appspot.com",
  messagingSenderId: "379426672100",
  appId: "1:379426672100:web:0259503b1ed946829f0bf1",
  measurementId: "G-1KFE7RXJPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export commonly used Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;