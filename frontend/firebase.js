// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "yumzy-3ab75.firebaseapp.com",
  projectId: "yumzy-3ab75",
  storageBucket: "yumzy-3ab75.firebasestorage.app",
  messagingSenderId: "938160853051",
  appId: "1:938160853051:web:cbd5e353651735aa870c1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

export {app,auth}