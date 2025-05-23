import { items } from '../backend/data/reportItem.js';
import { printYourrequestInfo } from '../backend/reportForm.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const mainDashboard = document.querySelector('.dashboard');

function getProduct(itemId) {
  return items.find((item) => item.id === itemId);
}

let itemHTML = '';
items.forEach((item) => {
  itemHTML += `
    <div class="item-container">
      <div class="img-container">
        <img src="${item.image}" alt="Computer Icon">
      </div>
      <p class="item-name">${item.name}</p>
      <button class="rqst-btn" data-item-id="${item.id}">REPORT</button>
    </div>
  `;
});
const othersData = { id: 13, name: 'OTHERS', image: '/ADMIN/asset/icons/others-icon.png' };
const addItemHTML = `<div class="item-container">
      <div class="img-container">
          <img src="${othersData.image}" alt="Others Icon">    
      </div>
      <p class="item-name">${othersData.name}</p>
      <button class="rqst-btn" data-item-id="${othersData.id}">OTHERS</button>
    </div>
  `;
itemHTML += addItemHTML;
document.querySelector('.available-item').innerHTML = itemHTML;

document.querySelectorAll('.rqst-btn').forEach((button) => {
  button.addEventListener('click', (event) => {
    let product = getProduct(+button.dataset.itemId);
    // Handle "OTHERS" case
    if (!product && +button.dataset.itemId === 13) {
      product = { id: 13, name: 'OTHERS', image: '/ADMIN/asset/icons/others-icon.png' };
    }
    console.log(product);
    document.querySelectorAll('.rqst-btn').forEach((btn) => {
      btn.disabled = true;
    });
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
          
          <select class="room-number" required>
            <option value="" disabled selected>Select Room</option>
            <option value="517">517</option>
            <option value="518">518</option>
            <option value="519">519</option>
            <option value="520">520</option>
            <option value="521">521</option>
            <option value="522">522</option>
            <option value="523">523</option>
            <option value="524">524</option>
            <option value="525">525</option>
            <option value="526">526</option>
            <option value="527">527</option>
          </select>
          <select id="pc-number" class="pc-number" required>
            <option value="" disabled selected>Select Pc</option>
          </select>
          <input type="file" id="upload-report-image" class="uplload-report-image" accept="image/*" required />

          <textarea class="issue" placeholder="Problem/issue:" required></textarea>
          <button class="submit-button-request js-submit-button-report" type="submit" data-product-name="${product.name}">SUBMIT</button>
        </form>
      </div>

      <div class="form-right">
        <h2><u>REPORT FORM</u></h2>
        <img src="${product.image}" data-report-image="${product.image}" alt="${product.name}" class="tv-icon report-image" />
        <p class="tv-label">${product.name}</p>
        <div class="notice">
          <strong>Important Information:</strong>
          <p>This report form is intended for reporting any issues with laboratory equipment at Gordon College. If you encounter a problem, please complete the form with accurate details to ensure timely inspection and resolution by the Management Information Unit (MIS).</p>
        </div>
      </div>
    `;

    let container = document.createElement('div');
    container.classList.add('container');
    container.innerHTML = formHTML;
    mainDashboard.appendChild(container);

    const selectPc = container.querySelector('#pc-number');
    for (let i = 1; i <= 30; i++) {
      const option = document.createElement('option');
      option.value = `${i}`;
      option.textContent = `PC ${i}`;
      selectPc.appendChild(option);
    }

    printYourrequestInfo();

    container.querySelector('.js-close-button').addEventListener('click', function () {
      container.remove();
      document.querySelector('.available-item').classList.remove('no-scroll');
      document.querySelectorAll('.rqst-btn').forEach((btn) => {
        btn.disabled = false;
        updateRequestButtonStates();
      });
    });

    // Add image preview functionality
    const imageUpload = container.querySelector('#upload-report-image');

    // Create or select the preview image element (place it after the upload input)
    let previewImg = container.querySelector('#report-image-preview');
    if (!previewImg) {
      previewImg = document.createElement('img');
      previewImg.id = 'report-image-preview';
      previewImg.classList.add('report-image-preview'); // Add the CSS class
      // Insert after the file input
      imageUpload.parentNode.insertBefore(previewImg, imageUpload.nextSibling);
    }

    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
          previewImg.style.display = 'block'; // Ensure the image is visible
        };
        reader.readAsDataURL(file);
      } else {
        previewImg.style.display = 'none'; // Hide the image if no file is selected
      }
    });
  });
});

function updateRequestButtonStates() {
  document.querySelectorAll('.rqst-btn').forEach((btn) => {
    const itemId = +btn.dataset.itemId;
    const item = getProduct(itemId);
    if (item) {
      btn.disabled = false;
      btn.textContent = 'REPORT';
    }
  });
}

// Modified addReport function to handle image upload
export async function addReport(statusReport,equipment, issue, pc, room, date, imageFile) {
  try {
    let imageUrl = null;
    
    // If an image file is provided, upload it to Firebase Storage
    if (imageFile) {
      // Create a reference to the storage location
      const storageRef = ref(storage, `report-images/${Date.now()}_${imageFile.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Add the report to Firestore with the image URL
    const docRef = await addDoc(collection(db, "reportList"), {
      
      equipment,
      issue,
      pc,
      room,
      date,
      imageUrl,// Add the image URL to the document
      statusReport,
      timestamp: serverTimestamp()
    });

    const docId = docRef.id;
    console.log("Report added successfully with ID:", docId);
    return docId;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e; // Re-throw the error to handle it in the calling code
  }
}

