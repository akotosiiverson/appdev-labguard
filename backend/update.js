// This file is responsible for updating the user information in the database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth ,GoogleAuthProvider ,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const firebaseConfig = {
  apiKey: "AIzaSyAPX65s6zZQV0P7bysB3taqPCt7IZJcJAg",
  authDomain: "labsystem-481dc.firebaseapp.com",
  projectId: "labsystem-481dc",
  storageBucket: "labsystem-481dc.firebasestorage.app",
  messagingSenderId: "455369088827",
  appId: "1:455369088827:web:fe50a6219919601b82611e",
  //measurementId: "G-06ZR4P16MC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {

      document.getElementById("userName").textContent = user.displayName || "No Name";
      document.getElementById("userEmail").textContent = user.email || "No Email";
      document.getElementById("userProfilePicture").src = user.photoURL || "https://via.placeholder.com/100";
      document.getElementById("userProfilePicture").alt = user.displayName || "Profile Picture";
    } else {
      alert("Please log in with Google.");
      window.location.href = "/index.htm"; // Redirect to index.html if not logged in
    }
  });
});


// Function to get the username outside of DOMContentLoaded
// export function fetchUsername() {
//   return new Promise((resolve, reject) => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         const username = user.displayName || "No Name";
//         resolve(String(username));
//       } else {
//         reject("No user logged in");
//       }
//     });
//   });
// }
// console.log(fetchUsername());

