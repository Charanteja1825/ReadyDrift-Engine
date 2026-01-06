import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbWmcUNj-44NgvIF3mCOqYLiKCwvSbJ-0",
  authDomain: "newcareer-lkd.firebaseapp.com",
  projectId: "newcareer-lkd"


};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
