import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { addBorrow } from '../backend/firebase-config.js';
export function printYourrequestInfo() {
  // ⬇️ Freshly select fields again when called
  const requestButton = document.querySelector('.submit-button-request');
  const borrowedDate = document.querySelector('.borrowed-date');
  const returnDate = document.querySelector('.return-date');
  const purpose = document.querySelector('.purpose');
  const statusReport = 'Pending';

  if (requestButton) {
    requestButton.addEventListener('click', (e) => {
      e.preventDefault(); // prevent form submission

      // Check if borrowedDate is after returnDate
      if (dayjs(borrowedDate.value).isAfter(dayjs(returnDate.value))) {
        console.log('Borrowed date cannot be after the return date!');
        return;
      }

      // Check if borrowedDate is before today (i.e., in the past)
      if (dayjs(borrowedDate.value).isBefore(dayjs(), 'day')) {
        console.log('Borrowed date cannot be in the past!');
        return;
      }
      const productName = requestButton.dataset.productName;
      const productImage = requestButton.dataset.img;
      console.log('Borrowed Date:', borrowedDate.value);
      console.log('Return Date:', returnDate.value);
      console.log('Purpose:', purpose.value);
      console.log('Product Name:', productName);
      console.log('Product Image:', productImage);
      addBorrow(productName, borrowedDate.value, returnDate.value, purpose.value,statusReport,productImage);

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
