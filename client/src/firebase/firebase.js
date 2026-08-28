// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYe2oJ1u60RZG4ihE-IsK6lEUz-xaWCYA",
    authDomain: "stylecloset.firebaseapp.com",
    projectId: "stylecloset",
    storageBucket: "stylecloset.firebasestorage.app",
    messagingSenderId: "260158137032",
    appId: "1:260158137032:web:48d09ff1beb0e625cd7bfd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // Login.jsx এর সাথে নাম মিল রাখা হয়েছে

// Named exports
export { app, auth, googleProvider };

// Default export
export default app;


// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDYe2oJ1u60RZG4ihE-IsK6lEUz-xaWCYA",
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "stylecloset.firebaseapp.com",
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "stylecloset",
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "stylecloset.firebasestorage.app",
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "260158137032",
//     appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:260158137032:web:48d09ff1beb0e625cd7bfd"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const googleProvider = new GoogleAuthProvider(); // Login.jsx এর সাথে নাম মিল রাখা হয়েছে

// // Named exports
// export { app, auth, googleProvider };

// // Default export
// export default app;
