console.log("✅ firebase-config.js loaded");

// Firebase configuration – update these with your actual config values.
const firebaseConfig = {
  apiKey: "  ",
  authDomain: "panel-auth-134b7.firebaseapp.com",
  projectId: "panel-auth-134b7",
  storageBucket: "panel-auth-134b7.firebasestorage.app",
  messagingSenderId: "892746068340",
  appId: "1:892746068340:web:f8c4d5b798e8bc48447c21"
};

// Initialize Firebase using the compat libraries
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized successfully");
} else {
  console.error("❌ Firebase SDK not found. Check your script imports.");
}
