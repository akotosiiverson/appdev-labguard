import {
  orderBy, onSnapshot,
  doc, updateDoc, getDoc, collection, addDoc, serverTimestamp,
  query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";

let currentStatusFilter = "All";
let currentStartDate = null;
let currentEndDate = null;
let allReports = [];

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
    } else if (status === "Approved") {
      actionButtons = `
        <div class="action-buttons">
          <button class="return-btn-js" data-id="${data.id}">Return</button>
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
          data-img="${data.downloadURL || ''}"
          data-issue="${data.purpose || 'No details provided'}"
          data-faculty="${data.fullName || 'Unknown'}">
        <td class="td-name-clickable">${data.fullName || 'Unknown'}</td>
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
      console.log(row.dataset.img)

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
          <p><strong>Unit:</strong> ${product}</p>
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

      const itemQuery = query(collection(db, "borrowItem"), where("name", "==", equipment));
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const itemDoc = itemSnapshot.docs[0];
        const itemRef = itemDoc.ref;
        const currentQuantity = itemDoc.data().quantity || 0;

        if (currentQuantity > 0) {
          await updateDoc(itemRef, { quantity: currentQuantity - 1 });
          console.log(`✅ Quantity of ${equipment} decreased by 1.`);
        } else {
          alert(`The equipment "${equipment}" is not available.`);
          return;
        }
      } else {
        alert(`The equipment "${equipment}" was not found in inventory.`);
        return;
      }

      const returnButton = document.createElement("button");
      returnButton.textContent = "Return";
      returnButton.classList.add("return-btn-js");
      returnButton.dataset.id = id;

      const actionContainer = button.closest('.action-buttons');
      if (actionContainer) {
        actionContainer.innerHTML = "";
        actionContainer.appendChild(returnButton);
        actionContainer.style.display = "block";

        returnButton.addEventListener("click", async () => {
          await handleReturn(id, returnButton);
        });
      }
    }
  } catch (err) {
    console.error(`❌ Failed to update status:`, err);
  }
};

const handleReturn = async (id, button) => {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");
  document.body.appendChild(overlay);

  const modal = document.createElement("div");
  modal.classList.add("logout-modal", "detail-modal");
  modal.innerHTML = `
    <p class="confirm-text">Confirm Return</p>
    <p class="request-status-indicator">Are you sure you want to mark this item as returned?</p>
    <div class="confirm-button-container">
      <button class="confirm-return-btn">Yes, Return</button>
      <button class="cancel-return-btn">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".cancel-return-btn").addEventListener("click", () => {
    modal.remove();
    overlay.remove();
  });

  overlay.addEventListener("click", () => {
    modal.remove();
    overlay.remove();
  });

  modal.querySelector(".confirm-return-btn").addEventListener("click", async () => {
    try {
      button.disabled = true;
      button.textContent = "Processing...";

      const reportRef = doc(db, "borrowList", id);
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) throw new Error("Report not found");

      const { equipment } = reportSnap.data();

      const itemQuery = query(collection(db, "borrowItem"), where("name", "==", equipment));
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const itemDoc = itemSnapshot.docs[0];
        const itemRef = itemDoc.ref;
        const currentQuantity = itemDoc.data().quantity || 0;

        await updateDoc(itemRef, { quantity: currentQuantity + 1 });
        console.log(`✅ Quantity of ${equipment} increased by 1.`);
      } else {
        alert(`The equipment "${equipment}" was not found.`);
        return;
      }

      await updateDoc(reportRef, { statusReport: "Returned" });
      console.log(`✅ Report ${id} marked as Returned.`);

      button.parentElement.innerHTML = `<strong>Returned</strong>`;
    } catch (err) {
      console.error(`❌ Failed to return item:`, err);
      alert("An error occurred while returning the item.");
    } finally {
      modal.remove();
      overlay.remove();
    }
  });
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
    else if (selected === "return-sort") currentStatusFilter = "Returned"; // New return-sort option
    else currentStatusFilter = "All";

    renderFilteredReports();
  });

  const handleDateChange = () => {
    currentStartDate = startDateInput.value ? new Date(startDateInput.value) : null;
    currentEndDate = endDateInput.value ? new Date(endDateInput.value) : null;
    if (currentEndDate) currentEndDate.setHours(23, 59, 59, 999);
    renderFilteredReports();
  };

  startDateInput.addEventListener("change", handleDateChange);
  endDateInput.addEventListener("change", handleDateChange);
});
