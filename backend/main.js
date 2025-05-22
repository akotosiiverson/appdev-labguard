// Import the functions you need from the SDKs you need
import { getAuth ,GoogleAuthProvider ,signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = getAuth(app);
auth.languageCode = 'en'
const provider = new GoogleAuthProvider();

// const user = auth.currentUser; 


const googleLogin = document.getElementById("google-login-btn");
googleLogin. addEventListener("click", function(){
signInWithPopup(auth, provider)
.then((result) => {
const credential = GoogleAuthProvider.credentialFromResult(result);
const user = result.user;
console.log(user);
window. location.href ="structure.html"; // Redirect to structure.html after successful login


}).catch((error) => {
const errorCode = error.code;
const errorMessage = error.message;
});

})
