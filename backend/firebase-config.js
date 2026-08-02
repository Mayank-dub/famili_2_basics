import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6LPDhzypQxoOt9rxYc5KkGL97GLjfcWk",
  authDomain: "todo-app-9c591.firebaseapp.com",
  projectId: "todo-app-9c591",
  storageBucket: "todo-app-9c591.firebasestorage.app",
  messagingSenderId: "527297663508",
  appId: "1:527297663508:web:a8651cce59c8b479658d01"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);