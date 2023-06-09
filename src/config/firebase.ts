import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvM7pMqzJuIETOSyRoFjmjdCvOI2FCsfQ",
  authDomain: "nlwspacetime.firebaseapp.com",
  projectId: "nlwspacetime",
  storageBucket: "nlwspacetime.appspot.com",
  messagingSenderId: "856830516034",
  appId: "1:856830516034:web:84ed37f6ad7faa9d4246db",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
