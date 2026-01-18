// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:'AIzaSyCzzNmrf6FF9hNwcwufdoz0oNVCqTgJW_Y',
  authDomain: 'ictpi-9b2dd.firebaseapp.com',
  projectId: 'ictpi-9b2dd',
  storageBucket: 'ictpi-9b2dd.firebasestorage.app',
  messagingSenderId:'517414610711',
  appId: '1:517414610711:web:0bedd2975a3c764ea23952',
  measurementId:'G-761XRSVBD6'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);


export {auth,app};