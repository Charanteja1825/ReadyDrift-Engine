import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB7fS9LRP5NhgmkGSv0OP4OvX9pymaS0MQ",
  authDomain: "career-9d573.firebaseapp.com",
  projectId: "career-9d573",


};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
