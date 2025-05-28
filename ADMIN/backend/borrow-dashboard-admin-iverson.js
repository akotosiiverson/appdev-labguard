import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { db } from "./firebase-config-admin-iverson.js";
import { items as staticItems } from '../backend/data/borrowItem-admin-iverson.js';
import { printYourrequestInfo } from '../backend/borrowForm-admin-iverson.js';

export const mainDashboard = document.querySelector('.dashboard');
const storage = getStorage(); // Initialize Firebase Storage

function getProduct(itemId) {
  return staticItems.find((item) => item.id === itemId);
}

async function displayItems() {
  const querySnapshot = await getDocs(collection(db, "borrowItem"));
  const fetchedItems = [];

  querySnapshot.forEach((doc) => {
    fetchedItems.push({ id: doc.id, ...doc.data() });
  });

  let itemHTML = '';
  fetchedItems.forEach((item) => {
    itemHTML += `
      <div class="item-container">
        <div class="img-container">
          <div class="quantity-div">
            <p class="quantity">${item.quantity}</p>
          </div>
          <img src="${item.image}" alt="${item.name}">
        </div>
        <p class="item-name">${item.name}</p>
        <button class="rqst-btn" 
                data-item-id="${item.id}" 
                data-name="${item.name}" 
                data-quantity="${item.quantity}" 
                data-img="${item.image}">
          EDIT
        </button>
      </div>
    `;
  });

  document.querySelector('.available-item').innerHTML = itemHTML;

  // Edit Button Handler
  document.querySelectorAll('.rqst-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-item-id');
      const name = button.getAttribute('data-name');
      const quantity = button.getAttribute('data-quantity');
      const img = button.getAttribute('data-img');

      document.querySelector('.available-item').classList.add('no-scroll');

      const formHTML = `
        <div class="details-modal-content">
          <div class="details-modal-header">
            <h3 class="details-modal-title">Edit Item</h3>
            <button class="details-modal-close">&times;</button>
          </div>
          <div class="details-modal-body">
            <div class="details-wrapper">
              <div class="details-left">
                <div class="detail-row">
                  <span class="detail-label">Edit Item Name:</span>
                  <span class="detail-value">
                    <input class="item" type="text" placeholder="Item Name" value="${name}">
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Edit Quantity:</span>
                  <span class="detail-value">
                    <input class="quantity" type="number" min="0" placeholder="0" value="${quantity}">
                  </span>
                </div>
                <div class="detail-row">
                  <button class="delete-button">Delete</button>
                  <button class="edit-button">Save</button>
                </div>
              </div>
              <div class="details-right">
                <img src="${img}" alt="Item Image" class="report-image" />
              </div>
            </div>
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.classList.add('details-modal', 'active');
      container.innerHTML = formHTML;
      mainDashboard.appendChild(container);

      const closeModal = () => {
        container.remove();
        document.querySelector('.available-item').classList.remove('no-scroll');
      };

      container.querySelector('.details-modal-close').addEventListener('click', closeModal);
      container.addEventListener('click', (e) => { if (e.target === container) closeModal(); });

      // Save Edit
      container.querySelector('.edit-button').addEventListener("click", async () => {
        const saveButton = container.querySelector('.edit-button');
        try {
          saveButton.disabled = true;
          saveButton.textContent = "Saving...";

          const editedName = container.querySelector("input.item").value.trim();
          const editedQuantity = parseInt(container.querySelector("input.quantity").value.trim(), 10);

          if (!editedName || isNaN(editedQuantity)) {
            alert("Please provide valid name and quantity.");
            saveButton.disabled = false;
            saveButton.textContent = "Save";
            return;
          }

          const itemRef = doc(db, "borrowItem", itemId);
          const itemSnap = await getDoc(itemRef);
          if (!itemSnap.exists()) throw new Error("Item not found.");
          await updateDoc(itemRef, {
            name: editedName,
            quantity: editedQuantity
          });

          const reportRef = doc(db, "borrowList", itemId);
          const reportSnap = await getDoc(reportRef);
          if (reportSnap.exists()) {
            await updateDoc(reportRef, { statusReport: "Returned" });
          }

          closeModal();
          displayItems();

        } catch (err) {
          console.error("❌ Failed to save item:", err);
          alert("An error occurred while saving the item.");
          saveButton.disabled = false;
          saveButton.textContent = "Save";
        }
      });

      // Delete Item
      container.querySelector('.delete-button').addEventListener('click', async () => {
        const deleteButton = container.querySelector('.delete-button');
        try {
          deleteButton.disabled = true;
          deleteButton.textContent = "Deleting...";

          const itemRef = doc(db, "borrowItem", itemId);
          const itemSnap = await getDoc(itemRef);
          if (!itemSnap.exists()) throw new Error("Item not found.");
          await deleteDoc(itemRef);

          const reportRef = doc(db, "borrowList", itemId);
          const reportSnap = await getDoc(reportRef);
          if (reportSnap.exists()) {
            await deleteDoc(reportRef);
          }

          closeModal();
          displayItems();

        } catch (err) {
          console.error("❌ Failed to delete item:", err);
          alert("An error occurred while deleting the item.");
          deleteButton.disabled = false;
          deleteButton.textContent = "Delete";
        }
      });

      printYourrequestInfo(); // Optional
    });
  });

  updateRequestButtonStates();
}

document.addEventListener("DOMContentLoaded", displayItems);

function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach((btn) => {
    const itemId = btn.dataset.itemId;
    const item = getProduct(itemId);
    if (item) {
      btn.textContent = 'EDIT';
    }
  });
}
