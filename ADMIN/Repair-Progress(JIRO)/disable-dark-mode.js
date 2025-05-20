/**
 * Disable Dark Mode Script
 * 
 * This script overrides and disables the dark mode functionality from the
 * backend-admin-iverson.js file, ensuring the repair progress page stays
 * in light mode regardless of user preference.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find and disable theme switch element if it exists
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        // Remove all event listeners by cloning and replacing the element
        const newThemeSwitch = themeSwitch.cloneNode(true);
        themeSwitch.parentNode.replaceChild(newThemeSwitch, themeSwitch);
        
        // Set it to unchecked (light mode)
        newThemeSwitch.checked = false;
        
        // Add a neutralized event listener
        newThemeSwitch.addEventListener('change', function(e) {
            // Prevent the change and keep it in light mode
            e.preventDefault();
            e.stopPropagation();
            this.checked = false;
            return false;
        });
    }
    
    // Force light mode by removing dark class from body
    document.body.classList.remove('dark');
    
    // Override the localStorage setting for dark mode
    localStorage.setItem('dark-mode', 'false');
    
    console.log('Dark mode successfully disabled for repair progress page');
});

// Additional override that runs immediately (not waiting for DOMContentLoaded)
if (document.body) {
    document.body.classList.remove('dark');
}
