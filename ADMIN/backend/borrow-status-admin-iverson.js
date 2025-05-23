import {
  orderBy, onSnapshot,
  doc, updateDoc, getDoc, collection, addDoc, serverTimestamp,
  query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";

let currentStatusFilter = "All";
let currentStartDate = null;
let currentEndDate = null;
let allReports = []; // store all reports once on load

function setupRealtimeListener() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) return;

  const reportsQuery = query(collection(db, "borrowList"), orderBy("timestamp", "desc"));

  onSnapshot(reportsQuery, (querySnapshot) => {
    allReports = [];
    querySnapshot.forEach(docSnap => {
      allReports.push({ id: docSnap.id, ...docSnap.data(), timestamp: docSnap.data().timestamp?.toDate() });
    });

    renderFilteredReports();
  });
}

function renderFilteredReports() {
  const reportListEl = document.querySelector('.report-list');
  if (!reportListEl) return;

  let reportSummary = '';

  allReports.forEach(data => {
    const status = data.statusReport || 'Pending';
    const firestoreDate = data.timestamp;

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
        <div class="action-buttons">
          <button class="approve-btn-js" data-id="${data.id}">Approve</button>
          <button class="decline-btn-js" data-id="${data.id}">Decline</button>
        </div>
      `;
    } else {
      actionButtons = `<strong>${status}</strong>`;
    }

    reportSummary += `
      <tr class="report-row"
          data-id="${data.id}"
          data-date="${formattedDate}"
          data-product="${data.equipment}"
          data-img="${data.imageUrl || ''}"
          data-issue="${data.purpose || 'No details provided'}"
          data-faculty="${data.Name || 'Unknown'}">
        <td class="td-name-clickable">${data.Name || 'Unknown'}</td>
        <td>${data.borrowDate}</td>
        <td>${data.returnDate}</td>
        <td>${data.equipment}</td>
        <td><span class="status status-span-row">${actionButtons}</span></td>
      </tr>
    `;
  });

  reportListEl.innerHTML = reportSummary;
  attachModalAndActionListeners();
  attachEventListeners();
}

function attachModalAndActionListeners() {
  document.querySelectorAll('.td-name-clickable').forEach(cell => {
    cell.addEventListener('click', async () => {
      const row = cell.closest('.report-row');
      const { date, product, issue, img, id } = row.dataset;

      const docSnap = await getDoc(doc(db, "borrowList", id));
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
          <p><strong>Date Submitted:</strong> ${date}</p>
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
}

const updateStatus = async (id, status, button) => {
  try {
    const reportRef = doc(db, "borrowList", id);
    await updateDoc(reportRef, { statusReport: status });

    if (status === "Approved") {
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) return;

      const reportData = reportSnap.data();
      const { equipment } = reportData;

      // Query the borrowItem collection by the name field
      const itemQuery = query(collection(db, "borrowItem"), where("name", "==", equipment));
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const itemDoc = itemSnapshot.docs[0]; // Get the first matching document
        const itemRef = itemDoc.ref;
        const currentQuantity = itemDoc.data().quantity || 0;

        if (currentQuantity > 0) {
          // Decrease the quantity by 1
          await updateDoc(itemRef, { quantity: currentQuantity - 1 });
          console.log(`✅ Quantity of ${equipment} decreased by 1.`);
        } else {
          console.warn(`⚠️ Quantity of ${equipment} is already 0.`);
          return;
        }
      } else {
        console.warn(`⚠️ Equipment "${equipment}" not found in borrowItem.`);
        alert(`The equipment "${equipment}" is not available in the inventory.`);
        return;
      }

      // Add a "Return" button after approval
      const returnButton = document.createElement("button");
      returnButton.textContent = "Return";
      returnButton.classList.add("return-btn-js");
      returnButton.dataset.id = id;

      console.log("Creating Return button:", returnButton);

      // Replace the parent element's content with the "Return" button
      const actionContainer = button.closest('.action-buttons');
      if (actionContainer) {
        console.log("Action container found:", actionContainer);
        actionContainer.innerHTML = ""; // Clear the container
        actionContainer.appendChild(returnButton); // Append the "Return" button
        console.log("Return button added to the DOM.");

        // Ensure the container is visible
        actionContainer.style.display = "block";
      } else {
        console.error("Action container not found.");
      }

      // Attach event listener to the "Return" button
      returnButton.addEventListener("click", async () => {
        await handleReturn(id, returnButton);
      });
    }
  } catch (err) {
    console.error(`❌ Failed to update status:`, err);
  }
};

// Function to handle the "Returns" button click
const handleReturn = async (id, button) => {
  try {
    const reportRef = doc(db, "borrowList", id);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      console.warn(`⚠️ Report with ID ${id} not found.`);
      return;
    }

    const reportData = reportSnap.data();
    const { equipment } = reportData;

    // Query the borrowItem collection by the name field
    const itemQuery = query(collection(db, "borrowItem"), where("name", "==", equipment));
    const itemSnapshot = await getDocs(itemQuery);

    if (!itemSnapshot.empty) {
      const itemDoc = itemSnapshot.docs[0]; // Get the first matching document
      const itemRef = itemDoc.ref;
      const currentQuantity = itemDoc.data().quantity || 0;

      // Increase the quantity by 1
      await updateDoc(itemRef, { quantity: currentQuantity + 1 });
      console.log(`✅ Quantity of ${equipment} increased by 1.`);
    } else {
      console.warn(`⚠️ Equipment "${equipment}" not found in borrowItem.`);
      return;
    }

    // Update the status of the report to "Returned"
    await updateDoc(reportRef, { statusReport: "Returned" });
    console.log(`✅ Report ${id} marked as "Returned".`);

    // Update the UI
    button.parentElement.innerHTML = `<strong>Returned</strong>`;
  } catch (err) {
    console.error(`❌ Failed to handle return:`, err);
  }
};

const attachEventListeners = () => {
  document.querySelectorAll('.approve-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Approved", button));
  });

  document.querySelectorAll('.decline-btn-js').forEach(button => {
    button.addEventListener('click', () => updateStatus(button.dataset.id, "Declined", button));
  });

  document.querySelectorAll('.return-btn-js').forEach(button => {
    button.addEventListener('click', () => handleReturn(button.dataset.id, button));
  });
};

// Event Listeners on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  setupRealtimeListener();

  const filterSelect = document.querySelector('#sortingReequest');
  const startDateInput = document.querySelector('#startDate');
  const endDateInput = document.querySelector('#endDate');

  filterSelect.addEventListener('change', () => {
    const selected = filterSelect.value;
    if (selected === "pending-sort") currentStatusFilter = "Pending";
    else if (selected === "approve-sort") currentStatusFilter = "Approved";
    else if (selected === "decline-sort") currentStatusFilter = "Declined";
    else currentStatusFilter = "All";

    renderFilteredReports(); // only re-render
  });

  const handleDateChange = () => {
    currentStartDate = startDateInput.value ? new Date(startDateInput.value) : null;
    currentEndDate = endDateInput.value ? new Date(endDateInput.value) : null;
    if (currentEndDate) currentEndDate.setHours(23, 59, 59, 999);
    renderFilteredReports(); // only re-render
  };

  startDateInput.addEventListener("change", handleDateChange);
  endDateInput.addEventListener("change", handleDateChange);
});
