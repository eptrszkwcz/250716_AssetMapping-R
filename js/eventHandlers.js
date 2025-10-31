// Event Handlers Setup
// ====================

// Setup event listeners
function setupEventListeners() {
    // Close sidebar
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !e.target.closest('.mapboxgl-marker')) {
            sidebar.classList.remove('open');
        }
    });
}

// Handle global errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

