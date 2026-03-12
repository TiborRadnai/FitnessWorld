import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAG1DAjsxdFyK8Of7uXCik2dJ-rOBFXr78",
  authDomain: "fitnessworld-56f74.firebaseapp.com",
  projectId: "fitnessworld-56f74",
  storageBucket: "fitnessworld-56f74.firebasestorage.app",
  messagingSenderId: "52967354307",
  appId: "1:52967354307:web:963eb8e82efbd4e4151776"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);


