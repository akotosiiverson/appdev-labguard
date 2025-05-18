
import { items } from '../backend/data/borrowItem-admin-iverson.js'//borrowItem 
import { printYourrequestInfo } from '../backend/borrowForm-admin-iverson.js';
export const  mainDashboard = document.querySelector('.dashboard');
/* Matching product */
function getProduct(itemId){
  let matchingProduct;
  items.forEach((item)=>{
                if (item.id === itemId){
                    matchingProduct = item
                }
            });
            return matchingProduct
}


let itemHTML='';
items.forEach((item) => {


  itemHTML += `
    <div class="item-container">
      <div class="img-container">
        <div class="quantity-div">
          <p class="quantity">${item.quantity}</p>
        </div>
        <img src="${item.image}" alt="Computer Icon">
      </div>
      <p class="item-name">${item.name}</p>
      <button class="rqst-btn" data-item-id="${item.id}" >EDIT</button>
    </div>
  `;
});
const addItemHTML =`
    <div class="item-container">
      <div class="img-container">
        
        <img src="/asset/icons/add-icon.png" alt="Computer Icon">
      </div>
      <p class="item-name"></p>
      <button class="rqst-btn"  >ADD ITEM</button>
    </div>
  `;
  itemHTML+= addItemHTML;
document.querySelector('.available-item').innerHTML = itemHTML ;


document.querySelectorAll('.rqst-btn').forEach((button) => {
  button.addEventListener('click', (event) => {
    console.log( button.dataset.itemId);
    console.log('working');
    
    console.log(getProduct(+button.dataset.itemId));
    
    // Disable all other buttons
    document.querySelectorAll('.rqst-btn').forEach(btn => {
      btn.disabled = true;
    });
    // Disable scrolling
    document.querySelector('.available-item').classList.add('no-scroll');
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
          <input class="full-name" type="text" placeholder="Full name:" required />
          <select class="faculty-position" required>
            <option value="" disabled selected>Select Full-time/Part-time</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
          <input class="borrowed-date" type="date" required placeholder="Borrowed Date" />
          <input class="return-date" type="date" required placeholder="Return Date" />
          <textarea class="purpose" placeholder="Remark/Purpose:" required></textarea>
          <button class="submit-button-request" type="submit">BORROW</button>
        </form>
      </div>

      <div class="form-right">
        <h2><u>BORROWER’S FORM</u></h2>
        <img src="${getProduct(+button.dataset.itemId).image}" alt="${getProduct(+button.dataset.itemId).name}" class="tv-icon" />
        <p class="tv-label">${getProduct(+button.dataset.itemId).name}</p>
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
     // Call printYourrequestInfo() AFTER appending the form
     printYourrequestInfo();

    // Add close event after form is appended
    container.querySelector('.js-close-button').addEventListener('click', function () {
      
      container.remove();
      // Disable scrolling 
    document.querySelector('.available-item').classList.remove('no-scroll');
     
      // Enable buttons again when popup is closed
      document.querySelectorAll('.rqst-btn').forEach(btn => {
        btn.disabled = false;
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


function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach(btn => {
    // Recalculate the button state based on the availability of the items
    const itemId = +btn.dataset.itemId;
    const item = getProduct(itemId);
    if (item) {
      
      btn.textContent = 'EDIT';
    } 
  });
}

