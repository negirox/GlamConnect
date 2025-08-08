// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "glamconnect-yqziw",
  "appId": "1:374150609245:web:cf801af3d631ec149010b4",
  "storageBucket": "glamconnect-yqziw.appspot.com",
  "apiKey": "AIzaSyD3K_aLGR-iroJlQX2lDXfl9YAOGa5_eIw",
  "authDomain": "glamconnect-yqziw.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "374150609245"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
