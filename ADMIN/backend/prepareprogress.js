import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";



// DOM Elements
const pcGrid = document.querySelector('.pc-grid');
const roomBtn = document.querySelector('.room-buttons');
const roomLabel = document.querySelector('.room-label');
const totalRoomsElement = document.querySelector('.stat-box:nth-child(1) p');
const totalPCsElement = document.querySelector('.stat-box:nth-child(2) p');
const totalAvailablePCsElement = document.querySelector('.stat-box:nth-child(3) p');

let roomHTML = '';
let totalPCs = 0;
let totalAvailablePCs = 0;

// Query to fetch all rooms in ascending order
const reportsQuery = query(collection(db, "comlabrooms"), orderBy("roomNumber"));

// Listen for changes to the rooms collection
onSnapshot(reportsQuery, async (querySnapshot) => {
  roomHTML = '';
  totalPCs = 0;
  totalAvailablePCs = 0;

  querySnapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const docId = docSnap.id;

    // Render room buttons
    roomHTML += `
      <div class="room-btn" data-id="${docId}">
        ${data.roomNumber}
      </div>
    `;

    // For each room, count the number of PCs and their availability
    for (let i = 1; i <= 30; i++) {
      const subCollectionName = `pc${i}`;
      const pcRef = doc(db, "comlabrooms", docId, subCollectionName, "document1");
      const pcSnap = await getDoc(pcRef);

      if (pcSnap.exists()) {
        totalPCs++;
        const pcData = pcSnap.data();
        if (pcData.status === "available") {
          totalAvailablePCs++;
        }
      }
    }

    // Update stats after the loop
    totalRoomsElement.textContent = querySnapshot.size;
    totalPCsElement.textContent = totalPCs;
    totalAvailablePCsElement.textContent = totalAvailablePCs;
  });

  roomBtn.innerHTML = roomHTML;

  // Attach click listeners to each room button after rendering
  const roomButtons = document.querySelectorAll('.room-btn');
  roomButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      // Remove 'active' class from all buttons
      roomButtons.forEach(btn => btn.classList.remove('active'));

      // Add 'active' class to the clicked button
      button.classList.add('active');

      const roomId = e.currentTarget.dataset.id;
      await displayPCs(roomId);
    });
  });
});

/**
 * Fetches and displays the PCs for a given room ID.
 */
async function displayPCs(roomId) {
  console.log(`Loading PCs for room: ${roomId}`);
  pcGrid.innerHTML = `<div class="loading">Loading PCs...</div>`;

  // Fetch the room document to get the room number
  const roomRef = doc(db, "comlabrooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    const roomData = roomSnap.data();
    roomLabel.textContent = `Room ${roomData.roomNumber}`;
  } else {
    roomLabel.textContent = "Room Not Found";
  }

  let pcHTML = '';

  // Loop through the expected sub-collections pc1 to pc30
  for (let i = 1; i <= 30; i++) {
    const subCollectionName = `pc${i}`;
    const pcRef = doc(db, "comlabrooms", roomId, subCollectionName, "document1");
    const pcSnap = await getDoc(pcRef);

    // If the document exists, render it
    if (pcSnap.exists()) {
      pcHTML += `
        <div class="pc" data-pc="${subCollectionName}" data-room="roomId">${subCollectionName}</div>
      `;
      console.log(subCollectionName, roomId)
    }
  }

  // Display the PCs
  pcGrid.innerHTML = pcHTML || "<div>No PCs found.</div>";
}

