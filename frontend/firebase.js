// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "foodease-food-delivery.firebaseapp.com",
  projectId: "foodease-food-delivery",
  storageBucket: "foodease-food-delivery.firebasestorage.app",
  messagingSenderId: "883008900738",
  appId: "1:883008900738:web:86cf5c3e3e93158afb2e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {app, auth };