
// iverson code

let repairListDiv = document.querySelector('.repair-list');


       let repairViewHTML=``;
       
     repairViewHTML  +=`
        <div class="repair-item clickable" data-repair-id="1">
                            <div class="current-status"><i class="bx bx-check-circle status-icon"></i> Repaired</div>
                            <div class="repair-date"><i class="bx bx-calendar date-icon"></i> 07/17/2023</div>                
                    </div>
        
       
        `;

        repairListDiv.innerHTML=repairViewHTML;

//jiro code

// Repair history data (for demo purposes)
const repairData = {
    "1": {
        date: "07/17/2023",
        status: "Repaired",
        technician: "James Wilson",
        partsReplaced: "CPU Fan, Thermal Paste",
        notes: "System was overheating due to dust buildup and worn out CPU fan. Cleaned interior thoroughly and replaced fan with new model. Applied fresh thermal paste to CPU."
    },
    "2": {
        date: "09/13/2023",
        status: "Repaired",
        technician: "Sarah Johnson",
        partsReplaced: "RAM (8GB DDR4)",
        notes: "Frequent system crashes reported. Diagnostic found faulty RAM module. Replaced with new compatible memory module and ran stability tests. System functioning properly now."
    },
    "3": {
        date: "07/17/2023",
        status: "Repaired",
        technician: "James Wilson",
        partsReplaced: "CPU Fan, Thermal Paste",
        notes: "System was overheating due to dust buildup and worn out CPU fan. Cleaned interior thoroughly and replaced fan with new model. Applied fresh thermal paste to CPU."
    },
    "4": {
        date: "09/13/2023",
        status: "Repaired",
        technician: "Sarah Johnson",
        partsReplaced: "RAM (8GB DDR4)",
        notes: "Frequent system crashes reported. Diagnostic found faulty RAM module. Replaced with new compatible memory module and ran stability tests. System functioning properly now."
    }
};

// Initialize or load stored components
let componentsData = {};
// Global object to store edits to default components
let defaultComponentEdits = {}

// Initialize 
if (localStorage.getItem('pcComponents')) {
    componentsData = JSON.parse(localStorage.getItem('pcComponents'));
}

// Load default component edits
if (localStorage.getItem('defaultComponentEdits')) {
    defaultComponentEdits = JSON.parse(localStorage.getItem('defaultComponentEdits'));
}

// Function to load saved components and apply edits to default components
function loadSavedComponents() {
    const specsGrid = document.querySelector(".specs-grid");
    const addComponentButton = document.getElementById("add-component");
    
    // Apply edits to default components
    if (localStorage.getItem('defaultComponentEdits')) {
        Object.keys(defaultComponentEdits).forEach(componentId => {
            const edit = defaultComponentEdits[componentId];
            const defaultComponent = document.getElementById(componentId);
            
            // If component is marked as deleted, remove it
            if (edit.deleted && defaultComponent) {
                defaultComponent.remove();
                return;
            }
            
            // If default component exists and has edits, update it
            if (defaultComponent && !edit.deleted) {
                defaultComponent.className = `spec-card ${edit.type || defaultComponent.classList[1]}`;
                defaultComponent.innerHTML = `
                    <div class="spec-header">
                        <h3 class="component-title">${edit.name}</h3>
                        <i class='bx ${edit.icon} component-icon'></i>
                        <span class="spec-component">${edit.model}</span>
                    </div>
                    <div class="spec-description">
                        <p>Description: ${edit.description}</p>
                    </div>
                `;
            }
        });
    }
    
    // Load user-added components
    if (localStorage.getItem('pcComponents')) {
        // Loop through stored components and add them to the DOM
        Object.keys(componentsData).forEach(componentId => {
            const component = componentsData[componentId];
            
            // Create component element
            const newComponent = document.createElement("div");
            newComponent.className = `spec-card ${component.type}`;
            newComponent.id = componentId;
            
            // Populate with component data
            newComponent.innerHTML = `
                <div class="spec-header">
                    <h3 class="component-title">${component.name}</h3>
                    <i class='bx ${component.icon} component-icon'></i>
                    <span class="spec-component">${component.model}</span>
                </div>
                <div class="spec-description">
                    <p>Description: ${component.description}</p>
                </div>
            `;
            
            // Insert the component before the add button
            specsGrid.insertBefore(newComponent, addComponentButton);
        });
    }
}

// Function to clear all user-added components (for testing)
function clearAllUserComponents() {
    localStorage.removeItem('pcComponents');
    componentsData = {};
    // Reload the page to reflect changes
    window.location.reload();
}

// Function to clear all component edits (for testing)
function clearAllComponentEdits() {
    localStorage.removeItem('defaultComponentEdits');
    defaultComponentEdits = {};
    // Reload the page to reflect changes
    window.location.reload();
}

// Call the function on page load (after DOM is loaded)
document.addEventListener('DOMContentLoaded', function() {
    // First hide any default components that should be deleted
    hideDeletedDefaultComponents();
    
    // Then load saved components and apply edits
    loadSavedComponents();
    
    // Finally make all components editable
    makeComponentsEditable();
});

// Function to hide default components that were deleted
function hideDeletedDefaultComponents() {
    if (!localStorage.getItem('defaultComponentEdits')) return;
    
    Object.keys(defaultComponentEdits).forEach(componentId => {
        const edit = defaultComponentEdits[componentId];
        if (edit.deleted) {
            const component = document.getElementById(componentId);
            if (component) {
                component.style.display = 'none';
            }
        }
    });
}

// Get modal elements
const repairModal = document.getElementById("repair-modal");
const addComponentModal = document.getElementById("add-component-modal");
const editComponentModal = document.getElementById("edit-component-modal");
const deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
const closeBtns = document.querySelectorAll(".close-btn");
const addBtn = document.getElementById("add-btn");
const cancelAddBtn = document.getElementById("cancel-add");
const cancelEditBtn = document.getElementById("cancel-edit");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const addComponentForm = document.getElementById("add-component-form");
const editComponentForm = document.getElementById("edit-component-form");

// Get all clickable repair items
const repairItems = document.querySelectorAll(".repair-item.clickable");

// Function to open the repair modal with specific repair data
function openRepairModal(repairId) {
    const repair = repairData[repairId];
    
    if (!repair) {
        console.error("Repair data not found for ID:", repairId);
        return;
    }
    
    // Populate modal with repair data
    document.getElementById("modal-date").textContent = repair.date;
    document.getElementById("modal-status").textContent = repair.status;
    document.getElementById("modal-tech").textContent = repair.technician;
    document.getElementById("modal-parts").textContent = repair.partsReplaced;
    document.getElementById("modal-notes").textContent = repair.notes;
    
    // Show the modal
    repairModal.style.display = "block";
    
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = "hidden";
}

// Add click event to all repair items
repairItems.forEach(item => {
    item.addEventListener("click", function() {
        const repairId = this.getAttribute("data-repair-id");
        openRepairModal(repairId);
    });
});

// Open Add Component Modal when clicking the add button
addBtn.addEventListener("click", function() {
    addComponentModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling
});

// Close modals when clicking the X
closeBtns.forEach(btn => {
    btn.addEventListener("click", function() {
        repairModal.style.display = "none";
        addComponentModal.style.display = "none";
        editComponentModal.style.display = "none";
        deleteConfirmationModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
    });
});

// Close modal when clicking cancel button
cancelAddBtn.addEventListener("click", function() {
    addComponentModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
    // Reset the form
    addComponentForm.reset();
});

// Close edit modal when clicking cancel button
cancelEditBtn.addEventListener("click", function() {
    editComponentModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
    // Reset the form
    editComponentForm.reset();
});

// Close delete modal when clicking cancel button
cancelDeleteBtn.addEventListener("click", function() {
    deleteConfirmationModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
});

// Close modals when clicking outside the modal content
window.addEventListener("click", function(event) {
    if (event.target === repairModal) {
        repairModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
    }
    if (event.target === addComponentModal) {
        addComponentModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
        // Reset the form
        addComponentForm.reset();
    }
    if (event.target === editComponentModal) {
        editComponentModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
        // Reset the form
        editComponentForm.reset();
    }
    if (event.target === deleteConfirmationModal) {
        deleteConfirmationModal.style.display = "none";
        document.body.style.overflow = "auto"; // Restore scrolling
    }
});

// Close modals with ESC key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        if (repairModal.style.display === "block") {
            repairModal.style.display = "none";
            document.body.style.overflow = "auto"; // Restore scrolling
        }
        if (addComponentModal.style.display === "block") {
            addComponentModal.style.display = "none";
            document.body.style.overflow = "auto"; // Restore scrolling
            // Reset the form
            addComponentForm.reset();
        }
        if (editComponentModal.style.display === "block") {
            editComponentModal.style.display = "none";
            document.body.style.overflow = "auto"; // Restore scrolling
            // Reset the form
            editComponentForm.reset();
        }
        if (deleteConfirmationModal.style.display === "block") {
            deleteConfirmationModal.style.display = "none";
            document.body.style.overflow = "auto"; // Restore scrolling
        }
    }
});

// Handle form submission to add a new component
addComponentForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Get form values
    const componentName = document.getElementById("component-name").value;
    const componentType = document.getElementById("component-type").value;
    const componentModel = document.getElementById("component-model").value;
    const componentDesc = document.getElementById("component-desc").value;
    const componentIcon = document.getElementById("component-icon").value;
    
    // Create a unique ID for the component
    const componentId = componentName.toLowerCase().replace(/\s+/g, "-") + "-spec";
    
    // Store component data
    componentsData[componentId] = {
        name: componentName,
        type: componentType,
        model: componentModel,
        description: componentDesc,
        icon: componentIcon,
        dateAdded: new Date().toISOString()
    };
    
    // Save to local storage
    localStorage.setItem('pcComponents', JSON.stringify(componentsData));
    
    // Create a new component card
    const newComponent = document.createElement("div");
    newComponent.className = `spec-card ${componentType}`;
    newComponent.id = componentId;
    
    // Create the component HTML
    newComponent.innerHTML = `
        <div class="spec-header">
            <h3 class="component-title">${componentName}</h3>
            <i class='bx ${componentIcon} component-icon'></i>
            <span class="spec-component">${componentModel}</span>
        </div>
        <div class="spec-description">
            <p>Description: ${componentDesc}</p>
        </div>
    `;
    
    // Apply animation to the new component
    newComponent.style.animation = "fadeInScale 0.6s ease-out forwards";
    
    // Add component to grid before the add button
    const specsGrid = document.querySelector(".specs-grid");
    const addComponentButton = document.getElementById("add-component");
    specsGrid.insertBefore(newComponent, addComponentButton);
    
    // Close the modal
    addComponentModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
    
    // Reset the form
    addComponentForm.reset();
    
    // Show success message
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = `${componentName} added successfully!`;
    document.body.appendChild(successMessage);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add("fade-out");
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 500);
    }, 3000);
});

// Function to make existing components editable
function makeComponentsEditable() {
    const specCards = document.querySelectorAll('.spec-card');
    
    specCards.forEach(card => {
        // Skip adding edit/delete buttons if they already exist
        if (card.querySelector('.edit-btn')) return;
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.innerHTML = '<i class="bx bx-edit"></i>';
        editButton.setAttribute('title', 'Edit Component');
        
        // Add click event to edit button
        editButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events
            openEditModal(card.id);
        });
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="bx bx-trash"></i>';
        deleteButton.setAttribute('title', 'Delete Component');
        
        // Add click event to delete button
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events
            openDeleteModal(card.id);
        });
        
        // Add buttons to the card
        card.appendChild(editButton);
        card.appendChild(deleteButton);
    });
}

// Function to open the edit modal with component data
function openEditModal(componentId) {
    // Get component data
    let componentData;
    let isDefaultComponent = true;
    
    // Check if it's a user-added component first
    if (componentsData[componentId]) {
        componentData = componentsData[componentId];
        isDefaultComponent = false;
    } else {
        // For default components, extract data from the DOM
        const card = document.getElementById(componentId);
        if (!card) return;
        
        const title = card.querySelector('.component-title').textContent;
        const icon = card.querySelector('.component-icon').className.split(' ')[1];
        const model = card.querySelector('.spec-component').textContent;
        let description = card.querySelector('.spec-description p').textContent;
        
        // Remove "Description: " prefix if it exists
        if (description.startsWith('Description: ')) {
            description = description.substring('Description: '.length);
        }
        
        // Determine component type based on class
        let type = 'hardware'; // default
        if (card.classList.contains('peripheral')) {
            type = 'peripheral';
        } else if (card.classList.contains('system')) {
            type = 'system';
        }
        
        componentData = {
            name: title,
            icon: icon,
            model: model,
            description: description,
            type: type
        };
    }
    
    // Fill the edit form with component data
    document.getElementById('edit-component-id').value = componentId;
    document.getElementById('edit-component-name').value = componentData.name;
    document.getElementById('edit-component-type').value = componentData.type;
    document.getElementById('edit-component-model').value = componentData.model;
    document.getElementById('edit-component-desc').value = componentData.description;
    document.getElementById('edit-component-icon').value = componentData.icon;
    
    // Show the modal
    editComponentModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling
}

// Handle form submission to update a component
editComponentForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Get form values
    const componentId = document.getElementById('edit-component-id').value;
    const componentName = document.getElementById('edit-component-name').value;
    const componentType = document.getElementById('edit-component-type').value;
    const componentModel = document.getElementById('edit-component-model').value;
    const componentDesc = document.getElementById('edit-component-desc').value;
    const componentIcon = document.getElementById('edit-component-icon').value;
      // Update component data
    // If it's a user-added component, update the stored data
    if (componentsData[componentId]) {
        componentsData[componentId] = {
            name: componentName,
            type: componentType,
            model: componentModel,
            description: componentDesc,
            icon: componentIcon,
            dateModified: new Date().toISOString(),
            dateAdded: componentsData[componentId].dateAdded // preserve original date
        };
        
        // Save to local storage
        localStorage.setItem('pcComponents', JSON.stringify(componentsData));
    } else {
        // This is a default component, store edit in defaultComponentEdits
        defaultComponentEdits[componentId] = {
            name: componentName,
            type: componentType,
            model: componentModel,
            description: componentDesc,
            icon: componentIcon,
            dateModified: new Date().toISOString()
        };
        
        // Save to local storage
        localStorage.setItem('defaultComponentEdits', JSON.stringify(defaultComponentEdits));
    }
    
    // Update the component in the DOM
    const componentCard = document.getElementById(componentId);
    if (componentCard) {
        // Update card class if type changed
        componentCard.className = `spec-card ${componentType}`;
          // Update component HTML
        componentCard.innerHTML = `
            <div class="spec-header">
                <h3 class="component-title">${componentName}</h3>
                <i class='bx ${componentIcon} component-icon'></i>
                <span class="spec-component">${componentModel}</span>
            </div>
            <div class="spec-description">
                <p>Description: ${componentDesc}</p>
            </div>
        `;
        
        // Add edit and delete buttons back to the card
        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.innerHTML = '<i class="bx bx-edit"></i>';
        editButton.setAttribute('title', 'Edit Component');
        
        // Add click event to edit button
        editButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events
            openEditModal(componentId);
        });
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="bx bx-trash"></i>';
        deleteButton.setAttribute('title', 'Delete Component');
        
        // Add click event to delete button
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent any parent click events
            openDeleteModal(componentId);
        });
        
        // Add buttons to the card
        componentCard.appendChild(editButton);
        componentCard.appendChild(deleteButton);
        
        // Highlight the updated component
        componentCard.style.animation = 'none';
        componentCard.offsetHeight; // Trigger reflow
        componentCard.style.animation = 'fadeInScale 0.6s ease-out forwards';
    }
    
    // Close the modal
    editComponentModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
    
    // Reset the form
    editComponentForm.reset();
    
    // Show success message
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = `${componentName} updated successfully!`;
    document.body.appendChild(successMessage);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add("fade-out");
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 500);
    }, 3000);
});

// Function to open the delete confirmation modal
function openDeleteModal(componentId) {
    // Get the component name
    const componentCard = document.getElementById(componentId);
    if (componentCard) {
        const componentName = componentCard.querySelector('.component-title').textContent;
        document.getElementById('delete-component-name').textContent = componentName;
    }
    
    // Store the component ID in the confirm button
    confirmDeleteBtn.setAttribute('data-component-id', componentId);
    
    // Show the modal
    deleteConfirmationModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling
}

// Add click event to the confirm delete button
confirmDeleteBtn.addEventListener("click", function() {
    const componentId = this.getAttribute('data-component-id');
    deleteComponent(componentId);
    
    // Close the modal
    deleteConfirmationModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
});

// Function to delete a component
function deleteComponent(componentId) {
    // For user-added components, remove from componentsData
    if (componentsData[componentId]) {
        delete componentsData[componentId];
        localStorage.setItem('pcComponents', JSON.stringify(componentsData));
    } else {
        // For default components, mark as deleted in localStorage
        defaultComponentEdits[componentId] = {
            ...defaultComponentEdits[componentId] || {},
            deleted: true,
            dateDeleted: new Date().toISOString()
        };
        localStorage.setItem('defaultComponentEdits', JSON.stringify(defaultComponentEdits));
    }
    
    // Remove component card from the DOM with animation
    const componentCard = document.getElementById(componentId);
    if (componentCard) {
        componentCard.style.animation = 'fadeOut 0.6s ease-out forwards';
        
        setTimeout(() => {
            if (componentCard.parentNode) {
                componentCard.parentNode.removeChild(componentCard);
            }
        }, 600); // Match the duration of the fade-out animation
    }
    
    // Show success message
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = `Component deleted successfully!`;
    document.body.appendChild(successMessage);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add("fade-out");
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 500);
    }, 3000);
}




