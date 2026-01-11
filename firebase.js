import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCU1TXBS9i9gcgOWniTjop1iUKhFjgs07Q",
  authDomain: "registration-42a25.firebaseapp.com",
  databaseURL: "https://registration-42a25-default-rtdb.firebaseio.com", // 🔴 REQUIRED
  projectId: "registration-42a25",
  storageBucket: "registration-42a25.appspot.com",
  messagingSenderId: "610526207352",
  appId: "1:610526207352:web:957390860bc06b4bd33c8d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
