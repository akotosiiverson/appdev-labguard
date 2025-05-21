// Import Firebase modules - No longer needed for custom auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase configuration
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

/* Logout button DOM, adding eventListener to the logout button */
document.querySelector('.logout-button a').addEventListener('click', () => {
  const main = document.querySelector('.dashboard');

  // Create overlay (optional)
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  main.appendChild(overlay);

  // Create modal
  const modal = document.createElement('div');
  modal.classList.add('logout-modal');
  modal.innerHTML = `
      <div class="logout-icon-container">
          <img src="/asset/icons/qmark-icon.png" alt="Question Mark Icon">
      </div>
      <p class="confirm-text">CONFIRM LOGOUT</p>
      <p class="confirmation-text">Are you sure you want to exit application?</p>
      <div class="confirm-button-container">
          <button class="confirmed-btn">Yes, Log me out!</button>
          <button class="declined-btn">Cancel</button>
      </div>
  `;
  main.appendChild(modal);

  // Cancel button closes modal
  modal.querySelector('.declined-btn').addEventListener('click', () => {
      main.removeChild(modal);
      main.removeChild(overlay);
  });
  // Logout confirmation
  modal.querySelector('.confirmed-btn').addEventListener('click', () => {
      // Sign out the user with custom auth
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('currentUser');
      
      // Redirect to login page
      window.location.href = '/index.htm';
  });
});