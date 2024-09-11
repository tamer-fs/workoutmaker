import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAvoD4Z4xrhToehnnKHl7zMYKHuw18Km_I",
  authDomain: "workoutmaker-b9eed.firebaseapp.com",
  databaseURL:
    "https://workoutmaker-b9eed-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "workoutmaker-b9eed",
  storageBucket: "workoutmaker-b9eed.appspot.com",
  messagingSenderId: "848697865835",
  appId: "1:848697865835:web:9bbbbf9f60ceabd421632e",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export default db;
