// Map Manager - Initialization and Core Map Operations
// =====================================================

// Initialize the application
async function init() {
    try {
        // Apply light theme
        applyTheme();
        
        // Always default to category mode on page load
        isPortfolioColorMode = false;
        
        // Update portfolio color button text
        const portfolioColorToggleBtn = document.getElementById('portfolioColorToggle');
        if (portfolioColorToggleBtn) {
            portfolioColorToggleBtn.textContent = 'Color by Portfolio';
        }
        
        // Set initial dropdown content
        updateDropdownContent();
        
        // Check if Mapbox token is set
        if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
            throw new Error('Please set your Mapbox access token in script.js');
        }

        // Initialize Mapbox
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/ptrszkwcz/cmfe3511o006w01s49mjcbg80',
            center: [0,9], 
            zoom: 1.8,
            minZoom: 1.8,
            projection: 'naturalEarth'
        });

        // Add custom zoom control (zoom in/out only, no compass)
        const zoomControl = new mapboxgl.NavigationControl({
            showCompass: false,
            showZoom: true
        });
        map.addControl(zoomControl, 'top-left');
        
        // Add fullscreen control
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Wait for map to load
        map.on('load', async () => {
            await loadAllDataFromGoogleSheets();
            
            // Hide spinner and show map with fade-in effect
            const spinner = document.getElementById('loadingSpinner');
            const mapContainer = document.getElementById('map');
            
            if (spinner && mapContainer) {
                // Add hidden class to spinner (fade out)
                spinner.classList.add('hidden');
                
                // Show map with fade-in effect
                mapContainer.classList.add('visible');
                
                // Remove spinner from DOM after fade-out completes
                setTimeout(() => {
                    spinner.style.display = 'none';
                }, 500); // Match the CSS transition duration
            }
        });

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Initialization error:', error);
        // Note: updateStatus function not defined, using console.error
        console.error(`Error: ${error.message}`);
    }
}

// Expose togglePortfolioColor globally so it can be called from HTML
window.togglePortfolioColor = togglePortfolioColor;

