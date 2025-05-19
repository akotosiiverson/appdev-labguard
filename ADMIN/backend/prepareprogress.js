import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../../backend/firebase-config.js";

const pcGrid = document.querySelector('.pc-grid');
const roomBtn = document.querySelector('.room-buttons');
const roomLabel = document.querySelector('.room-label');
const totalRoomsElement = document.querySelector('.stat-box:nth-child(1) p');
const totalPCsElement = document.querySelector('.stat-box:nth-child(2) p');
const totalAvailablePCsElement = document.querySelector('.stat-box:nth-child(3) p');

let totalRooms = 0;
let totalPCs = 0;
let totalAvailablePCs = 0;
let roomDataList = [];
let unsubscribeListeners = [];

let allPCs = {}; // Track all PCs across rooms: { roomId: { pcId: status } }

const roomsQuery = query(collection(db, "comlabrooms"), orderBy("roomNumber"));

onSnapshot(roomsQuery, async (querySnapshot) => {
  // Clean up old PC listeners
  unsubscribeListeners.forEach(unsub => unsub());
  unsubscribeListeners = [];

  totalRooms = querySnapshot.size;
  roomDataList = [];
  allPCs = {}; // Reset allPCs on every room update

  // For each room...
  const roomPromises = querySnapshot.docs.map(async (docSnap) => {
    const roomId = docSnap.id;
    const roomNumber = docSnap.data().roomNumber;

    allPCs[roomId] = {}; // Initialize room in allPCs
    let pcs = [];

    for (let i = 1; i <= 30; i++) {
      const pcId = `pc${i}`;
      const pcDocRef = doc(db, "comlabrooms", roomId, pcId, "document1");

      const unsubscribe = onSnapshot(pcDocRef, (pcSnap) => {
        if (pcSnap.exists()) {
          const status = pcSnap.data().status;

          // Update this room's PCs list (for rendering)
          const index = pcs.findIndex(pc => pc.id === pcId);
          if (index >= 0) {
            pcs[index].status = status;
          } else {
            pcs.push({ id: pcId, status });
          }

          // Update global allPCs object
          allPCs[roomId][pcId] = status;

          // Recalculate totals across all rooms
          let totalPCCount = 0;
          let totalAvailableCount = 0;
          for (const rId in allPCs) {
            totalPCCount += Object.keys(allPCs[rId]).length;
            totalAvailableCount += Object.values(allPCs[rId]).filter(s => s === "available").length;
          }
          totalPCs = totalPCCount;
          totalAvailablePCs = totalAvailableCount;

          // Update roomDataList with current room PCs
          const roomIndex = roomDataList.findIndex(r => r.id === roomId);
          if (roomIndex >= 0) {
            roomDataList[roomIndex].pcs = pcs;
          } else {
            roomDataList.push({ id: roomId, number: roomNumber, pcs });
          }

          // Update UI stats & re-render if this room is active
          renderStatsAndRooms();
          const activeBtn = document.querySelector('.room-btn.active');
          if (activeBtn && activeBtn.dataset.id === roomId) {
            renderPCs(roomId);
          }
        }
      });

      unsubscribeListeners.push(unsubscribe);
    }
  });

  await Promise.all(roomPromises);

  renderStatsAndRooms();
  pcGrid.innerHTML = ""; // Do not display PCs until a room is clicked
  roomLabel.textContent = "Select a room";
});

const renderStatsAndRooms = () => {
  totalRoomsElement.textContent = totalRooms;
  totalPCsElement.textContent = totalPCs;
  totalAvailablePCsElement.textContent = totalAvailablePCs;

  const roomsHTML = roomDataList
    .sort((a, b) => a.number - b.number)
    .map(room => `<div class="room-btn" data-id="${room.id}">${room.number}</div>`)
    .join('');

  roomBtn.innerHTML = roomsHTML;

  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const roomId = btn.dataset.id;
      await renderPCs(roomId);
    });
  });
};

const renderPCs = (roomId) => {
  const room = roomDataList.find(r => r.id === roomId);
  if (!room) {
    pcGrid.innerHTML = "<div>Room Not Found</div>";
    return;
  }

  roomLabel.textContent = `Room ${room.number}`;

  const pcsHTML = room.pcs.length === 0
    ? "<div>No PCs found.</div>"
    : room.pcs.map(pc => `
        <div class="pc ${pc.status === "available" ? "available" : "not-available"}"
          data-pc="${pc.id}" data-room="${roomId}">
          ${pc.id}
        </div>`).join('');

  pcGrid.innerHTML = pcsHTML;
};
