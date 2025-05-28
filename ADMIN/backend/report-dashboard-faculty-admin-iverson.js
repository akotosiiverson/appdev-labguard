import { items } from '../backend/data/reportItem-admin-iverson.js';//reportItem.js
import { printYourrequestInfo } from '../backend/reportForm-admin-iverson.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const mainDashboard = document.querySelector('.dashboard');

function getProduct(itemId) {
  return items.find((item) => item.id === itemId);
}

let itemHTML = '';
items.forEach((item) => {
  itemHTML += `
    <div class="item-container">
      <div class="img-container">
        <img src="${item.image}" alt="Computer Icon">
      </div>
      <p class="item-name">${item.name}</p>
      <button class="rqst-btn" data-item-id="${item.id}">REPORT</button>
    </div>
  `;
});
const addItemHTML = `<div class="item-container">
      <div class="img-container">
        <img src="/asset/icons/add-icon.png" alt="Computer Icon">
      </div>
      <p class="item-name"></p>
      <button class="rqst-btn" ">ADD ITEM</button>
    </div>
  `;
document.querySelector('.available-item').innerHTML = itemHTML;



document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('.logout-button');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.classList.add('logout-modal');
    modal.innerHTML = `
      <div class="logout-icon-container">
        <img src="/asset/icons/qmark-icon.png" alt="Question Icon">
      </div>
      <p class="confirm-text">CONFIRM LOGOUT</p>
      <p class="confirmation-text">Are you sure you want to exit the application?</p>
      <div class="confirm-button-container">
        <button class="confirmed-btn">Yes, Log me out!</button>
        <button class="declined-btn">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.declined-btn').addEventListener('click', () => {
      modal.remove();
      overlay.remove();
    });

    modal.querySelector('.confirmed-btn').addEventListener('click', () => {
      window.location.href = 'grid.html';
    });
  });
});

function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach((btn) => {
    const itemId = +btn.dataset.itemId;
    const item = getProduct(itemId);
    if (item) {
      
      btn.textContent = 'EDIT';
    }
  });
}

// Modified addReport function to handle image upload
export async function addReport(equipment, issue, pc, room, date, imageFile) {
  try {
    let imageUrl = null;
    
    // If an image file is provided, upload it to Firebase Storage
    if (imageFile) {
      // Create a reference to the storage location
      const storageRef = ref(storage, `report-images/${Date.now()}_${imageFile.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Add the report to Firestore with the image URL
    const docRef = await addDoc(collection(db, "reportList"), {
      equipment,
      issue,
      pc,
      room,
      date,
      imageUrl, // Add the image URL to the document
      timestamp: serverTimestamp()
    });

    const docId = docRef.id;
    console.log("Report added successfully with ID:", docId);
    return docId;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e; // Re-throw the error to handle it in the calling code
  }
}

