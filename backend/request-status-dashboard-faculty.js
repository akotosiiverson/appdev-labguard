import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db,
} from "./firebase-config.js";

// Global filters
let currentStatusFilter = "All";
let currentStartDate = null;
let currentEndDate = null;

// Renders the reports table using real-time updates
function renderRequestStatus() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) {
    console.warn('⚠️ .report-list not found in DOM.');
    return;
  }

  const reportsQuery = query(collection(db, "reportList"), orderBy("date", "desc"));
  onSnapshot(reportsQuery, (querySnapshot) => {
    let reportSummary = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const jsDate = data.date?.toDate?.();
      if (!jsDate) return;

      // Apply date range filter
      if (currentStartDate && jsDate < currentStartDate) return;
      if (currentEndDate && jsDate > currentEndDate) return;

      const status = data.statusReport || 'Pending';
      // Apply status filter
      if (currentStatusFilter !== "All" && status.toLowerCase() !== currentStatusFilter.toLowerCase()) return;

      const formattedDate = jsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      reportSummary += `
        <tr class="report-row"
            data-id="${doc.id}"
            data-date="${formattedDate}"
            data-location="${data.room} - ${data.pc}"
            data-product="${data.equipment}"
            data-img="${data.imageUrl || ''}"
            data-issue="${data.issue || 'No details provided'}"
            data-position="${data.position || 'Faculty'}"
            data-faculty="${data.Name || 'Unknown'}">
          <td>${data.Name || 'Unknown'}</td>
          <td>${formattedDate}</td>
          <td>${data.room} - ${data.pc}</td>
          <td>${data.equipment}</td>
          <td><span class="status status--${status.toLowerCase()}">${status}</span></td>
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
          <p><strong>Item Type:</strong> <span>${product}</span></p>
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
    if (selected === "process-sort") currentStatusFilter = "Processing";
    else if (selected === "pending-sort") currentStatusFilter = "Pending";
    else if (selected === "approve-sort") currentStatusFilter = "Approved";
    else if (selected === "decline-sort") currentStatusFilter = "Declined";
    else currentStatusFilter = "All";

    renderRequestStatus();
  });

  [startDateInput, endDateInput].forEach(input => {
    input.addEventListener('change', () => {
      currentStartDate = startDateInput.value ? new Date(startDateInput.value) : null;
      currentEndDate = endDateInput.value ? new Date(endDateInput.value) : null;

      if (currentEndDate) {
        // Set to end of the day //
        currentEndDate.setHours(23, 59, 59, 999);
      }

      renderRequestStatus();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  renderRequestStatus();
});
