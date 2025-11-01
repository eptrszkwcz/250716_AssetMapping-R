// UI Interactions and Controls
// =============================

// Make sure function is globally accessible
window.toggleZoomToDropdown = toggleZoomToDropdown;
window.zoomToRegion = zoomToRegion;
window.logMapCenter = logMapCenter;

function toggleZoomToDropdown() {
    const dropdown = document.getElementById('zoomToDropdownMenu');
    const button = document.getElementById('zoomToDropdown');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('open');
    } else {
        dropdown.classList.add('show');
        button.classList.add('open');
    }
}

function zoomToRegion(regionName, lat, lon, zoom) {
    if (map) {
        map.flyTo({
            center: [lon, lat],
            zoom: zoom,
            essential: true
        });
        
        // Close the dropdown after selection
        const dropdown = document.getElementById('zoomToDropdownMenu');
        const button = document.getElementById('zoomToDropdown');
        dropdown.classList.remove('show');
        button.classList.remove('open');
        
        console.log(`Zoomed to ${regionName}: ${lat}, ${lon}, zoom ${zoom}`);
    } else {
        console.log('Map not initialized yet');
    }
}

function logMapCenter() {
    if (map) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        console.log(`Map Center: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        console.log(`Zoom Level: ${zoom.toFixed(2)}`);
    } else {
        console.log('Map not initialized yet');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    // Zoom To dropdown
    const zoomDropdown = document.getElementById('zoomToDropdownMenu');
    const zoomButton = document.getElementById('zoomToDropdown');
    
    if (!zoomButton.contains(event.target) && !zoomDropdown.contains(event.target)) {
        zoomDropdown.classList.remove('show');
        zoomButton.classList.remove('open');
    }
});

