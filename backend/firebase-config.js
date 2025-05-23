import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  //storageBucket: "labsystem-481dc.appspot.com", // ⚠️ Corrected typo from `.app` to `.appspot.com`
  storageBucket: "labsystem-481dc.firebasestorage.app",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  measurementId: "G-06ZR4P16MC"
};
//
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Initialize storage

export { db, storage,app }; // ✅ Export storage

// Function to add a report
// Function to add a report and return its ID
export async function addReport(equipment, issue, pc, room, statusReport, imageFile) {
  try {
    let imageUrl = null;

    // 1. Upload image to Firebase Storage if provided
    if (imageFile) {
      const imageRef = ref(storage, `reportImage/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref); // Get download URL
    }

    // 2. Save the report data to Firestore
    const docRef = await addDoc(collection(db, "reportList"), {
      equipment,
      issue,
      pc,
      room,
      statusReport,
      imageUrl: imageUrl || null,
      date: serverTimestamp()
    });

    const docId = docRef.id;
    console.log("Report added successfully with ID:", docId);

    return docId; // You can use this ID to set as a data-set attribute
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function addBorrow( equipment,borrowDate, returnDate, purpose,statusReport,downloadURL) {
  try {
    const docRef = await addDoc(collection(db, "borrowList"), {
   
      equipment,
      borrowDate,
      returnDate,
       purpose,
       statusReport,
      downloadURL,
      timestamp: serverTimestamp()
    });


    const docId = docRef.id;
    console.log("Report added successfully with ID:", docId);

    return docId; // You can use this ID to set as a data-set attribute
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
