// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtkjoYassKasrTQoklYuOc_j5H2_wayco",
  authDomain: "app-dev-project-f7fcc.firebaseapp.com",
  projectId: "app-dev-project-f7fcc",
  storageBucket: "app-dev-project-f7fcc.appspot.com",
  messagingSenderId: "707486477446",
  appId: "1:707486477446:web:e577266f31ae0adc0db507",
  measurementId: "G-9QSQP30JLE",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
