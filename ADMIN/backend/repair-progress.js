
/**
 * Initialize theme switching (dark/light mode)
 * Remembers user preference using localStorage
 */
function initThemeSwitcher() {
    const themeSwitch = document.getElementById('theme-switch');
    
    if (themeSwitch) {
        // Check if user previously selected dark mode
        if (localStorage.getItem('dark-mode') === 'true') {
            // Apply dark mode if previously selected
            document.body.classList.add('dark');
            themeSwitch.checked = true;
        }
        
        // Listen for changes to the theme switch
        themeSwitch.addEventListener('change', function() {
            if (this.checked) {
                // Enable dark mode
                document.body.classList.add('dark');
                localStorage.setItem('dark-mode', 'true');
            } else {
                // Disable dark mode
                document.body.classList.remove('dark');
                localStorage.setItem('dark-mode', 'false');
            }
        });
    }
}





    