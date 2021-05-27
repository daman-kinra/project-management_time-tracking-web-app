import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
const config = {
  apiKey: "AIzaSyDrFKcRYkrBBGKSJXrWgnBxeXKcuosWNKI",
  authDomain: "time-tracker-2a84f.firebaseapp.com",
  projectId: "time-tracker-2a84f",
  storageBucket: "time-tracker-2a84f.appspot.com",
  messagingSenderId: "845519142230",
  appId: "1:845519142230:web:661ce956cf3b6dfb7eeaf7",
};

const app = firebase.initializeApp(config);
const fieldValue = firebase.firestore.FieldValue;
const provider = new firebase.auth.GoogleAuthProvider();
export { app, provider, fieldValue };
