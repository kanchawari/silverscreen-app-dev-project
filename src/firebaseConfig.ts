import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCtkjoYassKasrTQoklYuOc_j5H2_wayco",
    authDomain: "app-dev-project-f7fcc.firebaseapp.com",
    projectId: "app-dev-project-f7fcc",
    storageBucket: "app-dev-project-f7fcc.appspot.com",
    messagingSenderId: "707486477446",
    appId: "1:707486477446:web:e577266f31ae0adc0db507",
    measurementId: "G-9QSQP30JLE"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);