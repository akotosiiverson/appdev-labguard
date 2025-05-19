// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // 🔧 You missed these

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.firebasestorage.app",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firestore
const db = getFirestore(app);

// Add a document to "reportList"
 export async function addReport(Name,equipment,issue,pc,position,room, date) {
  try {
    await addDoc(collection(db, "reportList"), {
      Name,
      equipment,
      issue,
      pc,
      position,
      room,
      date
    });
    console.log("Report added successfully.");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

//addReport(); // Call this based on your app's logic


