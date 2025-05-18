import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";

let currentStatusFilter = "All";
let currentStartDate = null;
let currentEndDate = null;
//
function setupRealtimeListener() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) return;

  const reportsQuery = query(collection(db, "reportList"), orderBy("date", "desc"));

  onSnapshot(reportsQuery, (querySnapshot) => {
    let reportSummary = '';

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = data.statusReport || 'Pending';
      const firestoreDate = data.date?.toDate?.();

      if (currentStatusFilter !== "All" && status.toLowerCase() !== currentStatusFilter.toLowerCase()) return;

      if (firestoreDate) {
        if (currentStartDate && firestoreDate < currentStartDate) return;
        if (currentEndDate && firestoreDate > currentEndDate) return;
      }

      const formattedDate = firestoreDate
        ? firestoreDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'No Date';

      let actionButtons = '';
      if (status === "Pending") {
        actionButtons = `
          <button class="approve-btn-js" data-id="${docSnap.id}">Approve</button>
          <button class="processing-btn-js" data-id="${docSnap.id}">Processing</button>
          <button class="decline-btn-js" data-id="${docSnap.id}">Decline</button>
        `;
      } else if (status === "Processing") {
        actionButtons = `
          <button class="approve-btn-js" data-id="${docSnap.id}">Approve</button>
          <button class="decline-btn-js" data-id="${docSnap.id}">Decline</button>
        `;
      } else {
        actionButtons = `<strong>${status}</strong>`;
      }

      reportSummary += `
        <tr class="report-row"
            data-id="${docSnap.id}"
            data-faculty="${data.Name}"
            data-date="${formattedDate}"
            data-location="${data.room} - ${data.pc}"
            data-product="${data.equipment}"
            data-img="${data.imageUrl || ''}"
            data-issue="${data.issue || 'No details provided'}"
            data-position="${data.position || 'Faculty'}">
          <td class="td-name-clickable">${data.Name}</td>
          <td>${formattedDate}</td>
          <td>${data.room} - ${data.pc}</td>
          <td>${data.equipment}</td>
          <td><span class="status status-span-row">${actionButtons}</span></td>
        </tr>
      `;
    });

    reportListEl.innerHTML = reportSummary;
    attachModalAndActionListeners();
  });
}

function attachModalAndActionListeners() {
  document.querySelectorAll('.td-name-clickable').forEach(cell => {
    cell.addEventListener('click', async () => {
      const row = cell.closest('.report-row');
      const { faculty, date, location, product, issue, position, img, id } = row.dataset;

      const docSnap = await getDoc(doc(db, "reportList", id));
      const status = docSnap.exists() ? (docSnap.data().statusReport || 'Unknown') : 'Unknown';

      const overlay = document.createElement('div');
      overlay.classList.add('modal-overlay');
      document.body.appendChild(overlay);

      const modal = document.createElement('div');
      modal.classList.add('logout-modal', 'detail-modal');
      modal.innerHTML = `
        <div class="logout-icon-container"><img src="${img}" alt="Product Image"></div>
        <p class="confirm-text">REQUEST DETAILS</p>
        <p class="request-status-indicator">Status: ${status}</p>
        <div class="request-details">
          <p><strong>Faculty:</strong> ${faculty} (${position})</p>
          <p><strong>Date Submitted:</strong> ${date}</p>
          <p><strong>Room & PC:</strong> ${location}</p>
          <p><strong>Item Type:</strong> ${product}</p>
          <p><strong>Issue:</strong> ${issue}</p>
        </div>
        <div class="confirm-button-container"><button class="declined-btn">Close</button></div>
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

  const updateStatus = async (id, status, button) => {
    try {
      const ref = doc(db, "reportList", id);
      await updateDoc(ref, { statusReport: status });

      if (status === 'Processing') {
        button.remove();
      } else {
        button.parentElement.innerHTML = `<strong>${status}</strong>`;
      }
    } catch (err) {
      console.error(`Failed to update status:`, err);
    }
  };

  document.querySelectorAll('.approve-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Approved", button));
  });
  document.querySelectorAll('.processing-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Processing", button));
  });
  document.querySelectorAll('.decline-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Declined", button));
  });
}

// Event Listeners on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  setupRealtimeListener();

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

    setupRealtimeListener();
  });

  const handleDateChange = () => {
    const startVal = startDateInput.value;
    const endVal = endDateInput.value;

    currentStartDate = startVal ? new Date(startVal) : null;
    currentEndDate = endVal ? new Date(endVal) : null;

    if (currentEndDate) currentEndDate.setHours(23, 59, 59, 999);
    setupRealtimeListener();
  };

  startDateInput.addEventListener("change", handleDateChange);
  endDateInput.addEventListener("change", handleDateChange);
});
