// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGyCiOVYfEW4x1iYAQbeCzKckEfv5IP7o",
  authDomain: "blog-axelpadilla.firebaseapp.com",
  projectId: "blog-axelpadilla",
  storageBucket: "blog-axelpadilla.appspot.com",
  messagingSenderId: "214304242620",
  appId: "1:214304242620:web:7905fc9bd47e9764ee49b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
