import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { printYourrequestInfo } from '../backend/borrowForm.js';

export const mainDashboard = document.querySelector('.dashboard');

const itemMap = {}; // Store items for quick lookup

// Check quantity and return button label
function availabilityOfQuantityOfItem(item) {
  return item.quantity <= 0 ? 'NOT AVAILABLE' : 'BORROW';
}

function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach(btn => {
    const itemId = btn.dataset.itemId;
    const item = itemMap[itemId];
    if (item.quantity <= 0) {
      btn.disabled = true;
      btn.textContent = 'NOT AVAILABLE';
    } else {
      btn.disabled = false;
      btn.textContent = 'BORROW';
    }
  });
}

async function displayItems() {
  const querySnapshot = await getDocs(collection(db, "borrowItem"));
  const items = [];

  querySnapshot.forEach((doc) => {
    const item = { id: doc.id, ...doc.data() };
    items.push(item);
    itemMap[item.id] = item;
  });

  let itemHTML = '';
  items.forEach((item) => {
    const availabilityText = availabilityOfQuantityOfItem(item);
    const isAvailable = item.quantity > 0;

    itemHTML += `
      <div class="item-container">
        <div class="img-container">
          <div class="quantity-div">
            <p class="quantity">${item.quantity}</p>
          </div>
          <img src="${item.image}" alt="${item.name}">
        </div>
        <p class="item-name">${item.name}</p>
        <button class="rqst-btn" data-item-id="${item.id}" ${isAvailable ? '' : 'disabled'}>
          ${availabilityText}
        </button>
      </div>
    `;
  });

  const availableItemDiv = document.querySelector('.available-item');
  availableItemDiv.innerHTML = itemHTML;

  // Attach event listeners
  document.querySelectorAll('.rqst-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.itemId;
      const product = itemMap[itemId];
      console.log(itemId);

      document.querySelectorAll('.rqst-btn').forEach(btn => btn.disabled = true);
      availableItemDiv.classList.add('no-scroll');

      let formHTML = `
        <button class="close-button js-close-button">
          <img src="/asset/icons/close-icon.png" alt="Close" />
        </button>
        <div class="form-left">
          <div class="gc-logo">
            <img src="/asset/image/CCS-GCLOGO.png" alt="Gordon College Logo" class="logo" />
            <div>
              <h1>GORDON COLLEGE</h1>
              <p class="unit">Management Information Unit - MIS Unit</p>
            </div>
          </div>

          <form>
            <label for="borrowed-date">Borrowed Date</label>
            <input id="borrowed-date" class="borrowed-date" type="date" required />

            <label for="return-date">Return Date</label>
            <input id="return-date" class="return-date" type="date" required />
            
            <textarea class="purpose" placeholder="Remark/Purpose:" required></textarea>
            <button class="submit-button-request" type="submit" data-img="${product.image}" data-product-name="${product.name}">BORROW</button>
          </form>
        </div>

        <div class="form-right">
          <h2><u>BORROWER’S FORM</u></h2>
          <img src="${product.image}" alt="${product.name}" class="tv-icon" />
          <p class="tv-label">${product.name}</p>
          <div class="notice">
            <strong>Notice:</strong>
            <p>This item/equipment belongs to Gordon College. The borrower agrees to accept responsibility for the return of this equipment on time, and to return the equipment in the same functional condition, with all included accessories if any. If damage occurs to the item/equipment, repair or replacement with the same unit and model shall be at the expense of the borrower.</p>
          </div>
        </div>
      `;

      let container = document.createElement('div');
      container.classList.add('container');
      container.innerHTML = formHTML;
      mainDashboard.appendChild(container);

      printYourrequestInfo();

      container.querySelector('.js-close-button').addEventListener('click', () => {
        container.remove();
        availableItemDiv.classList.remove('no-scroll');
        document.querySelectorAll('.rqst-btn').forEach(btn => btn.disabled = false);
        updateRequestButtonStates();
      });
    });
  });
});


/* borrowed form dom */
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('.logout-button');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    document.body.appendChild(overlay);

    // Create modal
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

    // Cancel button
    modal.querySelector('.declined-btn').addEventListener('click', () => {
      modal.remove();
      overlay.remove();                                                                                 
    });

    // Confirm button
    modal.querySelector('.confirmed-btn').addEventListener('click', () => {
      window.location.href = 'grid.html'; // Or your logout logic
    });
  });
});

//function check the quantity, if 0 it will return a string of NOT AVAILABLE if greater than 0 it will return "REQUEST"
function availabilityOfQuantityOfItem(item){

  if(item.quantity <=0){
    return 'NOT AVAILABLE'
  }
  else{
    return 'BORROW'
  }

};

function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach(btn => {
    // Recalculate the button state based on the availability of the items
    const itemId = +btn.dataset.itemId;
    const item = getProduct(itemId);
    if (item.quantity <= 0) {
      btn.disabled = true;  // Disable the button for unavailable items
      btn.textContent = 'NOT AVAILABLE';
    } else {
      btn.disabled = false; // Enable the button for available items
      btn.textContent = 'BORROW';
    }
  });
}

