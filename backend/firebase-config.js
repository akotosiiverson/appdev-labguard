import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.appspot.com", // ⚠️ Corrected typo from `.app` to `.appspot.com`
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};
//
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Initialize storage

export { db, storage }; // ✅ Export storage

// Function to add a report
// Function to add a report and return its ID
export async function addReport( equipment, issue, pc, room,statusReport) {
  try {
    const docRef = await addDoc(collection(db, "reportList"), {
   
      equipment,
      issue,
      pc,
      room,
      statusReport,
      date: Timestamp.now()
    });

    const docId = docRef.id;
    console.log("Report added successfully with ID:", docId);

    return docId; // You can use this ID to set as a data-set attribute
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
