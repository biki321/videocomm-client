// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAb4HdQ4I8z9gA1ztidThvirE9DhNqhVOA",
  authDomain: "videocomm-auth.firebaseapp.com",
  projectId: "videocomm-auth",
  storageBucket: "videocomm-auth.appspot.com",
  messagingSenderId: "754112371751",
  appId: "1:754112371751:web:57e97fc8ab26a9c0384202",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("init firebase");
export const auth = getAuth(app);
