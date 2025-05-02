

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDSDYQ1M7D7xZECH5MTrgnAByZAEGBmn6k",
    authDomain: "deduction-of-subscription.firebaseapp.com",
    projectId: "deduction-of-subscription",
    storageBucket: "deduction-of-subscription.firebasestorage.app",
    messagingSenderId: "973156046410",
    appId: "1:973156046410:web:0c9e68a9429825064638b3",
    measurementId: "G-KBE8VMS43W"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);