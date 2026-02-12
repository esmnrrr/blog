import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/authentication";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPJmLc7k8LAITIk0Fr8lJbYB4ZPDWRcSo",
  authDomain: "hikamse-365db.firebaseapp.com",
  projectId: "hikamse-365db",
  storageBucket: "hikamse-365db.firebasestorage.app",
  messagingSenderId: "152114030208",
  appId: "1:152114030208:web:bb82673f4f1661007a2865",
  measurementId: "G-ZTDE7RXRZ1"
};

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);

// Diğer dosyalarda kullanmak için dışarı aktarıyoruz
export const auth = getAuth(app);
export const db = getFirestore(app);