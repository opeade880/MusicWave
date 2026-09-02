// Firebase imports
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCylp-5vanO99zDK3RwKCTpA82jx0RAtk8",
    authDomain: "musicwave-ef7e1.firebaseapp.com",
    projectId: "musicwave-ef7e1",
    storageBucket: "musicwave-ef7e1.firebasestorage.app",
    messagingSenderId:  "878558541540",
    appId: "1:878558541540:web:733044e58d4a15abb79ef1",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Authentication
const auth = getAuth(app);


// Export Firebase Authentication
export { auth };

export const db = getFirestore(app);