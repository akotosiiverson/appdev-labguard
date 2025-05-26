import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { addBorrow } from '../backend/firebase-config.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
export function printYourrequestInfo() {
  // ⬇️ Freshly select fields again when called
  const requestButton = document.querySelector('.submit-button-request');
  const borrowedDate = document.querySelector('.borrowed-date');
  const returnDate = document.querySelector('.return-date');
  const purpose = document.querySelector('.purpose');
  const statusReport = 'Pending';

  if (requestButton) {
    requestButton.addEventListener('click', async (e) => {
      e.preventDefault(); // prevent form submission

      // Check if borrowedDate is after returnDate
            const errorMessage = document.querySelector(".error-message");

      function showError() {
        document.querySelector(".error-message").classList.add("show");

        // Automatically hide after 3 seconds
        setTimeout(() => {
          document.querySelector(".error-message").classList.remove("show");
        }, 3000);
      }

            // Example borrowed/return date validation
      if (dayjs(borrowedDate.value).isAfter(dayjs(returnDate.value))) {
        showError();
        return;
      }

      if (dayjs(borrowedDate.value).isBefore(dayjs(), 'day')) {
        showError();
        return;
      }


      // Get current user displayName and uid asynchronously
      const { fullName, userId } = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe(); // unsubscribe immediately to avoid multiple triggers
          if (user) {
            resolve({
              fullName: user.displayName || "Anonymous",
              userId: user.uid
            });
          } else {
            reject("User not logged in");
          }
        });
      }).catch((error) => {
        alert("You must be logged in to submit a borrow request.");
        throw new Error(error);
      });

      console.log(`User: ${fullName}, ID: ${userId}`);

      const productName = requestButton.dataset.productName;
      const productImage = requestButton.dataset.img;
      console.log('Borrowed Date:', borrowedDate.value);
      console.log('Return Date:', returnDate.value);
      console.log('Purpose:', purpose.value);
      console.log('Product Name:', productName);
      console.log('Product Image:', productImage);

      // Pass fullName and userId to addBorrow
      addBorrow(productName, borrowedDate.value, returnDate.value, purpose.value, statusReport, productImage, fullName, userId);

      // Close the popup form after submission
      const popupContainer = requestButton.closest('.container');
      if (popupContainer) {
        popupContainer.remove();
        // Optionally re-enable buttons or remove no-scroll class if needed:
        document.querySelector('.available-item')?.classList.remove('no-scroll');
        document.querySelectorAll('.rqst-btn').forEach(btn => btn.disabled = false);
      }
    });
  }
}
