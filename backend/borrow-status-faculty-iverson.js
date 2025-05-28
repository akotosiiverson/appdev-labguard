import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db,
} from "./firebase-config.js";
import { items } from '../ADMIN/backend/data/borrowItem-admin-iverson.js'
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Global filters
let currentStatusFilter = "all";
let currentStartDate = null;
let currentEndDate = null;
let currentUserId = null;

// Normalize status values to consistent format
function normalizeStatus(rawStatus) {
  const lower = (rawStatus || 'pending').trim().toLowerCase();
  if (lower === "approve") return "approved";
  if (lower === "decline") return "declined";
  return lower; // default is 'pending' or other values
}

// Renders the reports table using real-time updates
function renderRequestStatus() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) {
    console.warn('⚠️ .report-list not found in DOM.');
    return;
  }

  if (!currentUserId) {
    console.warn('⚠️ No logged-in user found.');
    return;
  }

  // Query Firestore for borrow requests belonging to the logged-in user
  const reportsQuery = query(
    collection(db, "borrowList"),
    where("userId", "==", currentUserId), // Filter by userId
    orderBy("timestamp", "desc")
  );

  onSnapshot(reportsQuery, (querySnapshot) => {
    let reportSummary = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const jsDate = data.timestamp?.toDate?.();
      if (!jsDate) return;

      // Apply date range filter
      if (currentStartDate && jsDate < currentStartDate) return;
      if (currentEndDate && jsDate > currentEndDate) return;

      const status = normalizeStatus(data.statusReport);
      console.log(`Status: ${status} Filter: ${currentStatusFilter}`);

      // Apply status filter
      if (currentStatusFilter !== "all" && status !== currentStatusFilter) return;

      const formattedDate = jsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      

      reportSummary += `
        <tr class="report-row"
            data-id="${doc.id}"
            data-date="${formattedDate}"
            data-product="${data.equipment}"
            data-img="${data.downloadURL || ''}"
            data-issue="${data.purpose || 'No details provided'}"
            data-faculty="${data.fullName || 'Unknown'}"
            data-position="${data.Position || 'Unknown'}"
            data-location="${data.roomAndPc || 'Unknown'}">
          <td data-label="Faculty Name">${data.fullName || 'Unknown'}</td>
          <td data-label="Request Date">${formattedDate}</td>
         <td data-label="Borrow Date">${new Date(data.borrowDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })}</td>
        <td data-label="Return Date">${new Date(data.returnDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })}</td>
          <td data-label="Unit">${data.equipment}</td>
          <td data-label="Action"><span class="status status--${status}">${status}</span></td>
        </tr>
      `;
    });

    reportListEl.innerHTML = reportSummary;
    attachRowModalListeners();
  });
}

// Handles the click logic for each row to show details modal
function attachRowModalListeners() {
  const rows = document.querySelectorAll('.report-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const facultyName = row.dataset.faculty;
      const date = row.dataset.date;
      const location = row.dataset.location;
      const product = row.dataset.product;
      const issue = row.dataset.issue;
      const position = row.dataset.position;
      const image = row.dataset.img;
      const status = row.querySelector('.status')?.textContent || 'Unknown';

      const overlay = document.createElement('div');
      overlay.classList.add('modal-overlay');
      document.body.appendChild(overlay);

      const modal = document.createElement('div');
      modal.classList.add('logout-modal', 'detail-modal');
      modal.innerHTML = `
        <div class="logout-icon-container">
          <img src="${image}" alt="Product Image">
        </div>
        <p class="confirm-text">REQUEST DETAILS</p>
        <p class="request-status-indicator">Status: ${status}</p>
        <div class="request-details">
          <p><strong>Faculty:</strong> <span>${facultyName} (${position})</span></p>
          <p><strong>Date Submitted:</strong> <span>${date}</span></p>
          <p><strong>Room & PC:</strong> <span>${location}</span></p>
          <p><strong>Unit:</strong> <span>${product}</span></p>
          <p><strong>Issue Description:</strong> <span>${issue}</span></p>
        </div>
        <div class="confirm-button-container">
          <button class="declined-btn">Close</button>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.declined-btn').addEventListener('click', () => {
        modal.remove();
        overlay.remove();
      });
      overlay.addEventListener('click', () => {
        modal.remove();
        overlay.remove();
      });
    });
  });
}

// Filter listeners
function setupFilters() {
  const filterSelect = document.querySelector('#sortingReequest');
  const startDateInput = document.querySelector('#startDate');
  const endDateInput = document.querySelector('#endDate');

  filterSelect.addEventListener('change', () => {
    const selected = filterSelect.value;
    if (selected === "pending-sort") currentStatusFilter = "pending";
    else if (selected === "approve-sort") currentStatusFilter = "approved";
    else if (selected === "decline-sort") currentStatusFilter = "declined";
    else currentStatusFilter = "all";

    renderRequestStatus();
  });

  [startDateInput, endDateInput].forEach(input => {
    input.addEventListener('change', () => {
      currentStartDate = startDateInput.value ? new Date(startDateInput.value) : null;
      currentEndDate = endDateInput.value ? new Date(endDateInput.value) : null;

      if (currentEndDate) {
        currentEndDate.setHours(23, 59, 59, 999); // Include full day
      }

      renderRequestStatus();
    });
  });
}

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid; // Get the logged-in user's ID
    console.log(`Logged-in user ID: ${currentUserId}`);
    renderRequestStatus(); // Call the function after getting the user
  } else {
    console.warn("No user is logged in.");
    const reportListEl = document.querySelector('.report-list');
    if (reportListEl) {
      reportListEl.innerHTML = '<tr><td colspan="6">Please log in to view your borrow requests.</td></tr>';
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  renderRequestStatus();
});
