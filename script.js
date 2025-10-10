// Mapbox configuration
// You'll need to replace this with your actual Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNpdHVuOXpqMzAwMmEybnF2anZwbTd4aWcifQ.MF8M3qBg0AEp_-10FB4juw';
const GOOGLE_SHEET_ID = '1waBUthisVzvuqBnXjoggBanNwvOL_-xn3JsdgA5QqC0';

// Theme configuration
let isLightTheme = false; // Boolean to control light/dark theme

// Portfolio color configuration
let isPortfolioColorMode = false; // Boolean to control portfolio vs category coloring
let portfolioColorMap = {}; // Map of portfolio names to colors

// Global point arrays for reloading
let allocatorPoints = [];
let collectivePoints = [];
let portfolioPoints = [];
let gpPoints = [];
let directInvestmentPoints = [];

// Theme color palettes
const THEME_COLORS = {
    dark: {
        // Background colors
        bodyBg: '#0f1529',
        headerBg: 'linear-gradient(135deg, #132724 0%, #0A1B19 100%)',
        mapBg: '#0A1F1C',
        legendBg: '#0A1B19',
        popupBg: '#0A1B19',
        
        // Text colors
        headerText: '#5B8E83',
        legendText: '#5B8E83',
        legendSubtext: '#43645D',
        popupText: '#43645D',
        popupTitle: '#5B8E83',
        
        // UI element colors
        buttonBg: 'rgba(255,255,255,0.05)',
        buttonBorder: 'rgba(255,255,255,0.3)',
        toggleBg: '#2f4a45',
        toggleBgChecked: '#213632',
        toggleButton: '#43645D',
        toggleHover: '#2a413c',
        
        // Border colors
        popupBorder: 'rgba(91, 142, 131, 0.3)',
        popupBorderHover: 'rgba(91, 142, 131, 0.5)',
        tagBorder: '#43645D',
        tagBg: 'rgba(255, 255, 255, 0.03)',
        
        // Map controls
        mapControlBg: '#0A1B19',
        mapControlColor: '#43645D',
        mapControlHoverBg: '#43645D',
        mapControlHoverColor: '#0A1B19'
    },
    light: {
        // Background colors
        bodyBg: '#f8f9fa',
        headerBg: 'linear-gradient(135deg, #9fb7b3 0%, #9fb7b3 100%)',
        mapBg: '#b0bfbd',
        legendBg: '#9fb7b3',
        popupBg: '#9fb7b3',
        
        // Text colors
         headerText: '#4B6360',
        legendText: '#4B6360',
        legendSubtext: '#4B6360',
        popupText: '#4B6360',
        popupTitle: '#4B6360',
        
        // UI element colors
        buttonBg: 'rgba(255,255,255,0.05)',
        buttonBorder: 'rgba(255,255,255,0.3)',
        toggleBg: 'rgba(255,255,255,0.3)',
        toggleBgChecked: 'rgba(255,255,255,0.5)',
        toggleButton: '#4B6360',
        toggleHover: 'rgba(255,255,255,0.4)',
        
        // Border colors
        popupBorder: 'rgba(255, 255, 255, 0.3)',
        popupBorderHover: 'rgba(255, 255, 255, 0.5)',
        tagBorder: 'rgba(255, 255, 255, 0.5)',
        tagBg: 'rgba(255, 255, 255, 0.1)',
        
        // Map controls
        mapControlBg: '#9fb7b3',
        mapControlColor: '#4B6360',
        mapControlHoverBg: '#4B6360',
        mapControlHoverColor: '#9fb7b3'
    }
};

// Theme application functions
function applyTheme() {
    const theme = isLightTheme ? 'light' : 'dark';
    const colors = THEME_COLORS[theme];
    
    // Apply body background
    document.body.style.backgroundColor = colors.bodyBg;
    
    // Apply header styles
    const header = document.querySelector('.header');
    if (header) {
        header.style.background = colors.headerBg;
        header.style.color = colors.headerText;
    }
    
    // Apply map container background
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.style.backgroundColor = colors.mapBg;
    }
    
    // Apply map canvas background via CSS custom property
    document.documentElement.style.setProperty('--map-bg', colors.mapBg);
    
    // Apply legend styles
    const legend = document.querySelector('.legend');
    if (legend) {
        legend.style.backgroundColor = colors.legendBg;
    }
    
    const legendH4 = document.querySelector('.legend h4');
    if (legendH4) {
        legendH4.style.color = colors.legendText;
    }
    
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.style.color = colors.legendSubtext;
    });
    
    // Apply button styles
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.style.background = colors.buttonBg;
        button.style.borderColor = colors.buttonBorder;
    });
    
    // Apply toggle switch styles
    const toggleSliders = document.querySelectorAll('.toggle-slider');
    toggleSliders.forEach(slider => {
        slider.style.backgroundColor = colors.toggleBg;
    });
    
    const toggleButtons = document.querySelectorAll('.toggle-slider:before');
    toggleButtons.forEach(button => {
        button.style.backgroundColor = colors.toggleButton;
    });
    
    // Apply popup styles via CSS custom properties
    document.documentElement.style.setProperty('--popup-bg', colors.popupBg);
    document.documentElement.style.setProperty('--popup-text', colors.popupText);
    document.documentElement.style.setProperty('--popup-title', colors.popupTitle);
    document.documentElement.style.setProperty('--popup-border', colors.popupBorder);
    document.documentElement.style.setProperty('--popup-border-hover', colors.popupBorderHover);
    document.documentElement.style.setProperty('--tag-border', colors.tagBorder);
    document.documentElement.style.setProperty('--tag-bg', colors.tagBg);
    
    // Apply toggle switch styles via CSS custom properties
    document.documentElement.style.setProperty('--toggle-bg', colors.toggleBg);
    document.documentElement.style.setProperty('--toggle-bg-checked', colors.toggleBgChecked);
    document.documentElement.style.setProperty('--toggle-button', colors.toggleButton);
    document.documentElement.style.setProperty('--toggle-hover', colors.toggleHover);
    
    // Apply map control styles
    document.documentElement.style.setProperty('--map-control-bg', colors.mapControlBg);
    document.documentElement.style.setProperty('--map-control-color', colors.mapControlColor);
    document.documentElement.style.setProperty('--map-control-hover-bg', colors.mapControlHoverBg);
    document.documentElement.style.setProperty('--map-control-hover-color', colors.mapControlHoverColor);
}

function toggleTheme() {
    isLightTheme = !isLightTheme;
    applyTheme();
    
    // Save theme preference to localStorage
    localStorage.setItem('isLightTheme', isLightTheme.toString());
    
    // Update theme toggle button text
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.textContent = isLightTheme ? '🌙 Dark' : '☀️ Light';
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('isLightTheme');
    if (savedTheme !== null) {
        isLightTheme = savedTheme === 'true';
    }
    applyTheme();
    
    // Update theme toggle button text
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.textContent = isLightTheme ? '🌙 Dark' : '☀️ Light';
    }
}

// Portfolio color functions
function generateRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#A9DFBF', '#F9E79F', '#D5DBDB', '#AED6F1', '#A3E4D7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generatePortfolioColors(gpPoints) {
    portfolioColorMap = {};
    
    // Specific colors for the first 3 portfolios
    const specificColors = ['#23F2F6', '#F85555', '#F4A300'];
    let specificColorIndex = 0;
    
    // Get unique portfolio names
    const uniquePortfolioNames = [...new Set(gpPoints.map(gp => {
        return gp['Company Name'] || gp['company name'] || gp['Company'] || '';
    }).filter(name => name.trim() !== ''))];
    
    uniquePortfolioNames.forEach(portfolioName => {
        if (!portfolioColorMap[portfolioName]) {
            // Assign specific colors to first 3 portfolios
            if (specificColorIndex < specificColors.length) {
                portfolioColorMap[portfolioName] = specificColors[specificColorIndex];
                specificColorIndex++;
            } else {
                // Use random color from palette for additional portfolios
                portfolioColorMap[portfolioName] = generateRandomColor();
            }
        }
    });
    
    // Store portfolio names for dropdown
    window.portfolioNames = uniquePortfolioNames.slice(0, 3); // Only first 3 for now
    
}

function togglePortfolioColor() {
    isPortfolioColorMode = !isPortfolioColorMode;
    
    // Update button text
    const portfolioColorToggleBtn = document.getElementById('portfolioColorToggle');
    if (portfolioColorToggleBtn) {
        portfolioColorToggleBtn.textContent = isPortfolioColorMode ? 'Color by Category' : 'Color by Portfolio';
    }
    
    // Switch dropdown content
    updateDropdownContent();
    
    // Save preference to localStorage
    localStorage.setItem('isPortfolioColorMode', isPortfolioColorMode.toString());
    
    // Refresh the map with new coloring
    refreshMapColoring();
}

function updateDropdownContent() {
    const categoryContent = document.getElementById('categoryModeContent');
    const portfolioContent = document.getElementById('portfolioModeContent');
    
    // Legend content elements
    const legendCategoryContent = document.getElementById('legendCategoryModeContent');
    const legendPortfolioContent = document.getElementById('legendPortfolioModeContent');
    
    if (isPortfolioColorMode) {
        // Show portfolio toggles, hide category toggles
        categoryContent.style.display = 'none';
        portfolioContent.style.display = 'block';
        
        // Show portfolio legend items, hide category legend items
        legendCategoryContent.style.display = 'none';
        legendPortfolioContent.style.display = 'block';
        
        // Update portfolio names if available
        updatePortfolioNames();
        updateLegendPortfolioNames();
        
        // Initialize portfolio visibility state
        initializePortfolioVisibility();
    } else {
        // Show category toggles, hide portfolio toggles
        categoryContent.style.display = 'block';
        portfolioContent.style.display = 'none';
        
        // Show category legend items, hide portfolio legend items
        legendCategoryContent.style.display = 'block';
        legendPortfolioContent.style.display = 'none';
    }
}

function updatePortfolioNames() {
    if (!window.portfolioNames || window.portfolioNames.length === 0) return;
    
    const portfolioItems = document.querySelectorAll('#portfolioModeContent .dropdown-item');
    const portfolioColors = ['#23F2F6', '#F85555', '#F4A300'];
    
    portfolioItems.forEach((item, index) => {
        if (index < window.portfolioNames.length) {
            const nameSpan = item.querySelector('span:not(.legend-color)');
            if (nameSpan) {
                nameSpan.textContent = window.portfolioNames[index];
            }
        }
    });
}

function updateLegendPortfolioNames() {
    if (!window.portfolioNames || window.portfolioNames.length === 0) return;
    
    const legendPortfolioItems = document.querySelectorAll('#legendPortfolioModeContent .legend-item');
    
    legendPortfolioItems.forEach((item, index) => {
        if (index < window.portfolioNames.length) {
            const nameSpan = item.querySelector('span:not(.legend-color)');
            if (nameSpan) {
                nameSpan.textContent = window.portfolioNames[index];
            }
        }
    });
}

function getPointColor(tabName, config) {
    if (!isPortfolioColorMode || (tabName !== 'Portfolio Companies' && tabName !== 'General Partner Location')) {
        return config.color;
    }
    
    // For portfolio mode, we need to use a data-driven approach
    // This will be handled in the paint expression
    return config.color; // Fallback, actual logic in paint expression
}

function getPortfolioColorExpression(tabName) {
    if (!isPortfolioColorMode || (tabName !== 'Portfolio Companies' && tabName !== 'General Partner Location')) {
        return null; // Use default color
    }
    
    if (tabName === 'General Partner Location') {
        // For GP points, use the company name to get portfolio color
        return [
            'case',
            ['has', 'portfolioColor'],
            ['get', 'portfolioColor'],
            '#FFD600' // Default yellow
        ];
    } else if (tabName === 'Portfolio Companies') {
        // For portfolio companies, use the portfolio name to get color
        return [
            'case',
            ['has', 'portfolioColor'],
            ['get', 'portfolioColor'],
            '#006FFF' // Default blue
        ];
    }
    
    return null;
}

function getGPStrokeColor(tabName, config) {
    if (isPortfolioColorMode && tabName === 'General Partner Location') {
        // Black stroke for GP points in portfolio mode
        return '#000000';
    }
    // Use default stroke color for other cases
    return getPortfolioColorExpression(tabName) || config.color;
}

function getGPStrokeWidth(tabName, config) {
    if (isPortfolioColorMode && tabName === 'General Partner Location') {
        // Black stroke width for GP points in portfolio mode
        return [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2, // Thicker stroke on hover
            1  // Normal stroke width
        ];
    }
    // Use default stroke width for other cases
    return [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,
        config.strokeWidth
    ];
}

function refreshMapColoring() {
    // Only reload GP and Portfolio Company layers to preserve visibility toggles
    if (map) {
        // Store current visibility states for all layers
        const layerVisibilityStates = {};
        const layersToCheck = [
            'points-allocator-lps',
            'points-collective-locations', 
            'points-direct-investments',
            'points-general-partner-location',
            'points-portfolio-companies',
            'connection-lines',
            'portfolio-connection-lines',
            'collective-gp-connection-lines',
            'direct-investment-connection-lines'
        ];
        
        // Store current visibility states
        layersToCheck.forEach(layerId => {
            if (map.getLayer(layerId)) {
                const visibility = map.getLayoutProperty(layerId, 'visibility');
                layerVisibilityStates[layerId] = visibility;
            }
        });
        
        // Reload only the data that affects coloring
        reloadColoringLayers();
        
        // Restore visibility states after a short delay to ensure layers are loaded
        setTimeout(() => {
            Object.entries(layerVisibilityStates).forEach(([layerId, visibility]) => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', visibility);
                }
            });
        }, 100);
    }
}

// Dropdown functionality
function toggleDropdown() {
    const dropdown = document.getElementById('categoryDropdownMenu');
    const button = document.getElementById('categoryDropdown');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('open');
    } else {
        dropdown.classList.add('show');
        button.classList.add('open');
    }
}

// Make sure function is globally accessible
window.toggleDropdown = toggleDropdown;
window.toggleZoomToDropdown = toggleZoomToDropdown;
window.zoomToRegion = zoomToRegion;
window.logMapCenter = logMapCenter;

function toggleZoomToDropdown() {
    const dropdown = document.getElementById('zoomToDropdownMenu');
    const button = document.getElementById('zoomToDropdown');
    
    // Close category dropdown if it's open
    const categoryDropdown = document.getElementById('categoryDropdownMenu');
    const categoryButton = document.getElementById('categoryDropdown');
    if (categoryDropdown.classList.contains('show')) {
        categoryDropdown.classList.remove('show');
        categoryButton.classList.remove('open');
    }
    
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
    // Category dropdown
    const categoryDropdown = document.getElementById('categoryDropdownMenu');
    const categoryButton = document.getElementById('categoryDropdown');
    
    if (!categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
        categoryDropdown.classList.remove('show');
        categoryButton.classList.remove('open');
    }
    
    // Zoom To dropdown
    const zoomDropdown = document.getElementById('zoomToDropdownMenu');
    const zoomButton = document.getElementById('zoomToDropdown');
    
    if (!zoomButton.contains(event.target) && !zoomDropdown.contains(event.target)) {
        zoomDropdown.classList.remove('show');
        zoomButton.classList.remove('open');
    }
});

async function reloadColoringLayers() {
    // Only reload GP and Portfolio Company data and their connections
    try {
        // Reload GP points
        if (gpPoints && gpPoints.length > 0) {
            const gpConfig = TABS_CONFIG['General Partner Location'];
            displayPoints(gpPoints, 'General Partner Location', gpConfig);
        }
        
        // Reload Portfolio Company points
        if (portfolioPoints && portfolioPoints.length > 0) {
            const portfolioConfig = TABS_CONFIG['Portfolio Companies'];
            displayPoints(portfolioPoints, 'Portfolio Companies', portfolioConfig);
        }
        
        // Reload portfolio connection lines
        if (portfolioPoints && portfolioPoints.length > 0 && gpPoints && gpPoints.length > 0) {
            createPortfolioConnections(portfolioPoints, gpPoints);
        }
        
        // Set proper draw order
        setLayerDrawOrder();
        
    } catch (error) {
        console.error('Error reloading coloring layers:', error);
    }
}

// Define all tabs and their styling
const TABS_CONFIG = {
  
    'Portfolio Companies': {
        color: '#006FFF', // Blue
        strokeColor: '#2E5BBA',
        strokeWidth: 0,
        // opacity: 0.3,
        opacity: 0.5,
        strokeOpacity: 0.9,
        radius: 5
    },
    'Direct Investments': {
        color: '#9B59B6', // Purple
        strokeColor: '#8E44AD',
        strokeWidth: 0,
        // opacity: 0.5,
        opacity: 0.8,
        strokeOpacity: 0.9,
        radius: 10
    },
    'General Partner Location': {
        color: '#FFD600', // Red
        strokeColor: '#C0392B',
        strokeWidth: 0,
        // opacity: 0.4,
        opacity: 0.7,
        strokeOpacity: 0.9,
        radius: 10
    },
    'Collective Locations': {
        color: '#03B570', // Teal
        strokeColor: '#03B570',
        strokeWidth: 5,
        opacity: 1,
        strokeOpacity: 1,
        radius: 2
    },
    'Allocator LPs': {
        color: '#ED5FAB', 
        strokeColor: '#ED5FAB',
        strokeWidth: 1.5,
        opacity: 0.3,
        strokeOpacity: 0.9,
        radius: ['interpolate', ['linear'], ['get', 'AUM ($bn)'], 1, 16, 300, 32]
    }
};

// Initialize map
let map;
let currentPopup = null; // Track the current open popup
let currentClickPopup = null; // Track the current click popup separately

// Draw order configuration
const DRAW_ORDER = {
    // Connection lines (lowest)
    'connection-lines': 1,
    'connection-lines-hover': 2,
    'portfolio-connection-lines': 3,
    'portfolio-connection-lines-hover': 4,
    'collective-gp-connection-lines': 5,
    'collective-gp-connection-lines-hover': 6,
    'direct-investment-connection-lines': 7,
    
    // Points (in order from lowest to highest)
    'points-allocator-lps': 10,
    'points-portfolio-companies': 20,
    'points-direct-investments': 30,
    'points-general-partner-location': 40,
    'points-collective-locations-shadow': 45, // Shadow layer beneath collective points
    'points-collective-locations-small-circle': 47, // Small black circle beneath collective points
    'points-collective-locations': 50
};

// Function to set proper draw order for map layers
function setLayerDrawOrder() {
    // Get all layer IDs and sort them by draw order
    const layers = Object.keys(DRAW_ORDER).sort((a, b) => DRAW_ORDER[a] - DRAW_ORDER[b]);
    
    // Move each layer to the correct position using moveLayer
    layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            // Move the layer to the top (it will be in the correct order based on our sorted array)
            map.moveLayer(layerId);
        }
    });
    
}

// DOM elements
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebarContent');
const closeSidebarBtn = document.getElementById('closeSidebar');

// Initialize the application
async function init() {
    try {
        // Load theme preference first
        loadThemePreference();
        
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
            // style: 'mapbox://styles/ptrszkwcz/cmewareb800lg01si3ct95j48',
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
        });

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

// Load data from all Google Sheet tabs
async function loadAllDataFromGoogleSheets() {
    try {
        let totalPoints = 0;
        // Reset global point arrays
        allocatorPoints = [];
        collectivePoints = [];
        portfolioPoints = [];
        gpPoints = [];
        directInvestmentPoints = [];
        
        for (const [tabName, config] of Object.entries(TABS_CONFIG)) {
            try {
                const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
                
                const response = await fetch(csvUrl);
                if (!response.ok) {
                    console.warn(`Failed to fetch ${tabName}: ${response.status}`);
                    continue;
                }
                
                const csvText = await response.text();
                const data = parseCSV(csvText);
                
                if (data.length === 0) {
                    console.warn(`No data found in ${tabName}`);
                    continue;
                }

                // Filter data to only include rows with valid lat/lon coordinates
                const validData = data.filter(row => {
                    const lat = parseFloat(row.latitude || row.lat || row.Lat || row.Latitude || row.LAT);
                    const lng = parseFloat(row.longitude || row.lng || row.lon || row.Lon || row.long || row.Longitude || row.LNG);
                    return !isNaN(lat) && !isNaN(lng);
                });
                
                if (validData.length > 0) {
                    displayPoints(validData, tabName, config);
                    totalPoints += validData.length;
                    console.log(`Loaded ${validData.length} points from ${tabName}`);
                    
                    // Store points for connection lines
                    if (tabName === 'Allocator LPs') {
                        allocatorPoints = validData;
                    } else if (tabName === 'Collective Locations') {
                        collectivePoints = validData;
                    } else if (tabName === 'Portfolio Companies') {
                        portfolioPoints = validData;
                    } else if (tabName === 'General Partner Location') {
                        gpPoints = validData;
                        // Generate portfolio colors when GP points are loaded
                        generatePortfolioColors(validData);
                    } else if (tabName === 'Direct Investments') {
                        directInvestmentPoints = validData;
                    }
                }
                
            } catch (error) {
                console.error(`Error loading ${tabName}:`, error);
            }
        }
        
        // Create connection lines between Allocator LPs and Collective Locations
        if (allocatorPoints.length > 0 && collectivePoints.length > 0) {
            createConnectionLines(allocatorPoints, collectivePoints);
        }
        
        // Create connection lines between Portfolio Companies and their parent company locations
        if (portfolioPoints.length > 0 && gpPoints.length > 0) {
            createPortfolioConnections(portfolioPoints, gpPoints);
        }
        
        // Create connection lines between Collective Locations and General Partner Locations
        if (collectivePoints.length > 0 && gpPoints.length > 0) {
            createCollectiveGPConnections(collectivePoints, gpPoints);
        }
        
        // Create connection lines between Direct Investments and their closest two Collective Locations
        if (directInvestmentPoints.length > 0 && collectivePoints.length > 0) {
            createDirectInvestmentConnections(directInvestmentPoints, collectivePoints);
        }
        
        console.log(`Loaded ${totalPoints} total points from all tabs`);
        
        // Set the proper draw order for all layers
        setLayerDrawOrder();
        
        // Setup legend toggle functionality after all layers are created
        setupLegendToggles();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Parse CSV data with proper handling of commas in quoted fields
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    
    // Parse headers
    const headers = parseCSVLine(lines[0]);
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = parseCSVLine(lines[i]);
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        data.push(row);
    }
    
    return data;
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current.trim());
    
    // Remove quotes from the beginning and end of each field
    return result.map(field => field.replace(/^"|"$/g, ''));
}

// Display points on the map
function displayPoints(data, tabName, config) {
    const layerId = `points-${tabName.replace(/\s+/g, '-').toLowerCase()}`;
    const sourceId = `source-${tabName.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Clear existing layers and sources for this tab
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
    
    if (data.length === 0) {
        return;
    }
    
    // Prepare GeoJSON data
    const geojsonData = {
        type: 'FeatureCollection',
        features: data.map((point, index) => {
            // Extract coordinates with support for various column names
            const lat = parseFloat(point.latitude || point.lat || point.Lat || point.Latitude || point.LAT);
            const lng = parseFloat(point.longitude || point.lng || point.lon || point.Lon || point.long || point.Longitude || point.LNG);
            const { latitude, longitude, lat: latCol, lon: lonCol, ...properties } = point;
            
            // Check all possible AUM column names (only for Allocator LPs)
            let foundAUM = null;
            if (tabName === 'Allocator LPs') {
                const possibleAUMColumns = ['AUM ($bn)', 'AUM', 'AUM ($B)', 'AUM ($Billion)', 'Assets Under Management', 'AUM ($)', 'AUM ($M)', 'AUM ($MM)'];
                
                for (const col of possibleAUMColumns) {
                    if (properties[col] !== undefined && properties[col] !== '') {
                        const value = properties[col];
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            foundAUM = numValue;
                            break;
                        }
                    }
                }
                
                if (!foundAUM) {
                    for (const [col, value] of Object.entries(properties)) {
                        if (col && value && col !== 'id' && col !== 'latitude' && col !== 'longitude') {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue) && numValue > 0 && numValue < 10000) {
                                foundAUM = numValue;
                                break;
                            }
                        }
                    }
                }
            }
            
            // Determine portfolio color for this point
            let portfolioColor = null;
            if (isPortfolioColorMode && (tabName === 'Portfolio Companies' || tabName === 'General Partner Location')) {
                if (tabName === 'General Partner Location') {
                    const companyName = point['Company Name'] || point['company name'] || point['Company'] || '';
                    portfolioColor = portfolioColorMap[companyName] || null;
                } else if (tabName === 'Portfolio Companies') {
                    const portfolioName = point['portfolio'] || point['Portfolio'] || '';
                    // Find matching GP to get portfolio color
                    for (const [gpName, color] of Object.entries(portfolioColorMap)) {
                        if (portfolioName.toLowerCase().includes(gpName.toLowerCase()) || 
                            gpName.toLowerCase().includes(portfolioName.toLowerCase())) {
                            portfolioColor = color;
                            break;
                        }
                    }
                }
            }
            
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                properties: {
                    ...properties,
                    id: index,
                    tabName: tabName,
                    'AUM ($bn)': foundAUM || 1,
                    portfolioColor: portfolioColor
                }
            };
        })
    };
    
    // Add source
    map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        promoteId: 'id'
    });
    
    // For Collective Locations, add a shadow layer first (beneath the main points)
    if (tabName === 'Collective Locations') {
        const shadowLayerId = `${layerId}-shadow`;
        const shadowSourceId = `${sourceId}-shadow`;
        
        // Clear existing shadow layer and source
        if (map.getLayer(shadowLayerId)) {
            map.removeLayer(shadowLayerId);
        }
        if (map.getSource(shadowSourceId)) {
            map.removeSource(shadowSourceId);
        }
        
        // Add shadow source (same data as main points)
        map.addSource(shadowSourceId, {
            type: 'geojson',
            data: geojsonData,
            promoteId: 'id'
        });
        
        // Add shadow layer (larger, blurred circle beneath main points)
        map.addLayer({
            id: shadowLayerId,
            type: 'circle',
            source: shadowSourceId,
            layout: {
                'visibility': 'visible'
            },
            paint: {
                'circle-radius': config.radius * 4, // Make shadow larger than main point
                'circle-color': '#324945', // Black shadow
                'circle-opacity': 0.8, // Subtle shadow opacity
                'circle-blur': 1 // Blur the shadow for soft effect
            }
        });
        
        // Add small black circle beneath shadow layer
        const smallCircleLayerId = `${layerId}-small-circle`;
        const smallCircleSourceId = `${sourceId}-small-circle`;
        
        // Clear existing small circle layer and source
        if (map.getLayer(smallCircleLayerId)) {
            map.removeLayer(smallCircleLayerId);
        }
        if (map.getSource(smallCircleSourceId)) {
            map.removeSource(smallCircleSourceId);
        }
        
        // Add small circle source (same data as main points)
        map.addSource(smallCircleSourceId, {
            type: 'geojson',
            data: geojsonData,
            promoteId: 'id'
        });
        
        // Add small black circle layer
        map.addLayer({
            id: smallCircleLayerId,
            type: 'circle',
            source: smallCircleSourceId,
            layout: {
                'visibility': 'visible'
            },
            paint: {
                'circle-radius': 7, // Make small circle half the size of main point
                'circle-stroke-width': 3,
                'circle-stroke-color': '#324945',
                'circle-stroke-opacity': 1,
                'circle-color': '#000000', // Black circle
                'circle-opacity': 0.01, // More opaque than shadow
                'circle-blur': 0 // No blur for sharp edges
            }
        });

    }
    
    // Add main circle layer
    map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        layout: {
            'visibility': 'visible'
        },
        paint: {
            'circle-radius': config.radius,
            'circle-color': getPortfolioColorExpression(tabName) || config.color,
            'circle-stroke-color': getGPStrokeColor(tabName, config),
            'circle-stroke-width': getGPStrokeWidth(tabName, config),
            'circle-stroke-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                config.strokeOpacity
            ],
            'circle-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                tabName === 'Allocator LPs' ? 0.4 : 1,
                config.opacity
            ]
        }
    });
    
    // Add hover event to the layer for simple popup
    map.on('mouseenter', layerId, (e) => {
        const properties = e.features[0].properties;
        
        // Check if this point should be interactive
        if (!isPointInteractive(properties)) {
            return; // Don't show popup for hidden points
        }
        
        // Close any existing hover popup
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
        
        // Close any existing click popup when hovering over other points
        if (currentClickPopup) {
            currentClickPopup.remove();
            currentClickPopup = null;
        }
        
        // Create simple hover popup at the center of the hovered point
        const popupContent = createHoverPopupContent(properties);
        currentPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '250px',
            className: 'custom-popup hover-popup'
        })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
        
        // Add event listener to clear currentPopup when popup is closed
        currentPopup.on('close', () => {
            currentPopup = null;
        });
    });
    
    // Remove hover popup on mouse leave (but keep click popup open)
    map.on('mouseleave', layerId, (e) => {
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
        // Note: We don't close currentClickPopup here - it should stay open
    });
    
    // Add click event for detailed popup
    map.on('click', layerId, (e) => {
        const properties = e.features[0].properties;
        
        // Check if this point should be interactive
        if (!isPointInteractive(properties)) {
            return; // Don't show popup for hidden points
        }
        
        // Close any existing hover popup
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
        
        // Close any existing click popup
        if (currentClickPopup) {
            currentClickPopup.remove();
            currentClickPopup = null;
        }
        
        // Create detailed click popup
        const popupContent = createClickPopupContent(properties);
        currentClickPopup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '350px',
            className: 'custom-popup click-popup'
        })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
        
        // Add event listener to clear currentClickPopup when popup is closed
        currentClickPopup.on('close', () => {
            currentClickPopup = null;
        });
    });
    
    // Add hover effect
    let hoveredFeatureId = null;
    
    map.on('mouseenter', layerId, (e) => {
        const properties = e.features[0].properties;
        
        // Check if this point should be interactive
        if (!isPointInteractive(properties)) {
            return; // Don't apply hover effects to hidden points
        }
        
        map.getCanvas().style.cursor = 'pointer';
        
        // Set hover state for the specific feature
        if (e.features.length > 0) {
            hoveredFeatureId = e.features[0].properties.id;
            map.setFeatureState(
                {
                    source: sourceId,
                    id: hoveredFeatureId
                },
                { hover: true }
            );
        }
    });
    
    map.on('mouseleave', layerId, (e) => {
        map.getCanvas().style.cursor = '';
        
        // Remove hover state for the specific feature
        if (hoveredFeatureId !== null) {
            map.setFeatureState(
                {
                    source: sourceId,
                    id: hoveredFeatureId
                },
                { hover: false }
            );
            hoveredFeatureId = null;
        }
    });
}

// Create connection lines between Allocator LPs and Collective Locations
function createConnectionLines(allocatorPoints, collectivePoints) {
    const connectionLayerId = 'connection-lines';
    const connectionSourceId = 'connection-source';
    
    // Clear existing connection layers and sources
    if (map.getLayer(connectionLayerId)) {
        map.removeLayer(connectionLayerId);
    }
    if (map.getSource(connectionSourceId)) {
        map.removeSource(connectionSourceId);
    }
    
    // Create all possible connections
    const connections = [];
    
    allocatorPoints.forEach((allocator, allocatorIndex) => {
        const allocatorLat = parseFloat(allocator.latitude || allocator.lat || allocator.Lat || allocator.Latitude || allocator.LAT);
        const allocatorLng = parseFloat(allocator.longitude || allocator.lng || allocator.lon || allocator.Lon || allocator.long || allocator.Longitude || allocator.LNG);
        
        collectivePoints.forEach((collective, collectiveIndex) => {
            const collectiveLat = parseFloat(collective.latitude || collective.lat || collective.Lat || collective.Latitude || collective.LAT);
            const collectiveLng = parseFloat(collective.longitude || collective.lng || collective.lon || collective.Lon || collective.long || collective.Longitude || collective.LNG);
            
            connections.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [allocatorLng, allocatorLat],
                        [collectiveLng, collectiveLat]
                    ]
                },
                properties: {
                    id: `connection-${allocatorIndex}-${collectiveIndex}`,
                    allocatorName: allocator['Allocator Name'] || 'Unknown Allocator',
                    collectiveName: collective['Collective Name'] || 'Unknown Collective'
                }
            });
        });
    });
    
    const connectionData = {
        type: 'FeatureCollection',
        features: connections
    };
    
    // Add connection source
    map.addSource(connectionSourceId, {
        type: 'geojson',
        data: connectionData
    });
    
    // Add connection layer
    map.addLayer({
        id: connectionLayerId,
        type: 'line',
        source: connectionSourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none' // Start hidden, will be shown by updateConnectionLineVisibility()
        },
        paint: {
            'line-color': '#ED5FAB',
            'line-width': 1.5,
            'line-opacity': 0.3
        }
    });
    
}

// Create connection lines between Portfolio Companies and their nearest parent company location
function createPortfolioConnections(portfolioPoints, gpPoints) {
    const portfolioConnectionLayerId = 'portfolio-connection-lines';
    const portfolioConnectionSourceId = 'portfolio-connection-source';
    
    // Clear existing portfolio connection layers and sources
    if (map.getLayer(portfolioConnectionLayerId)) {
        map.removeLayer(portfolioConnectionLayerId);
    }
    if (map.getSource(portfolioConnectionSourceId)) {
        map.removeSource(portfolioConnectionSourceId);
    }
    
    // Create connections
    const connections = [];
    
    portfolioPoints.forEach((portfolio, portfolioIndex) => {
        const portfolioName = portfolio['portfolio'] || portfolio['Portfolio'] || '';
        if (!portfolioName) return;
        
        const portfolioLat = parseFloat(portfolio.latitude || portfolio.lat || portfolio.Lat || portfolio.Latitude || portfolio.LAT);
        const portfolioLng = parseFloat(portfolio.longitude || portfolio.lng || portfolio.lon || portfolio.Lon || portfolio.long || portfolio.Longitude || portfolio.LNG);
        
        // Find all GP locations that match this portfolio name
        const matchingGPLocations = gpPoints.filter(gp => {
            const gpCompanyName = gp['Company Name'] || gp['company name'] || gp['Company'] || '';
            return gpCompanyName.toLowerCase().includes(portfolioName.toLowerCase()) || 
                   portfolioName.toLowerCase().includes(gpCompanyName.toLowerCase());
        });
        
        if (matchingGPLocations.length > 0) {
            // Find the nearest GP location
            let nearestGP = null;
            let shortestDistance = Infinity;
            
            matchingGPLocations.forEach(gp => {
                const gpLat = parseFloat(gp.latitude || gp.lat || gp.Lat || gp.Latitude || gp.LAT);
                const gpLng = parseFloat(gp.longitude || gp.lng || gp.lon || gp.Lon || gp.long || gp.Longitude || gp.LNG);
                
                const distance = calculateDistance(portfolioLat, portfolioLng, gpLat, gpLng);
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestGP = gp;
                }
            });
            
            if (nearestGP) {
                const gpLat = parseFloat(nearestGP.latitude || nearestGP.lat || nearestGP.Lat || nearestGP.Latitude || nearestGP.LAT);
                const gpLng = parseFloat(nearestGP.longitude || nearestGP.lng || nearestGP.lon || nearestGP.Lon || nearestGP.long || nearestGP.Longitude || nearestGP.LNG);
                
                // Get portfolio color for the connection line
                const gpName = nearestGP['Company Name'] || nearestGP['company name'] || nearestGP['Company'] || 'Unknown GP';
                const connectionColor = isPortfolioColorMode ? (portfolioColorMap[gpName] || '#006FFF') : '#006FFF';
                
                connections.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [portfolioLng, portfolioLat],
                            [gpLng, gpLat]
                        ]
                    },
                    properties: {
                        id: `portfolio-connection-${portfolioIndex}`,
                        portfolioName: portfolioName,
                        gpName: gpName,
                        distance: Math.round(shortestDistance),
                        connectionColor: connectionColor
                    }
                });
            }
        }
    });
    
    const connectionData = {
        type: 'FeatureCollection',
        features: connections
    };
    
    // Add connection source
    map.addSource(portfolioConnectionSourceId, {
        type: 'geojson',
        data: connectionData
    });
    
    // Add connection layer
    map.addLayer({
        id: portfolioConnectionLayerId,
        type: 'line',
        source: portfolioConnectionSourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none' // Start hidden, will be shown by updateConnectionLineVisibility()
        },
        paint: {
            'line-color': [
                'case',
                ['has', 'connectionColor'],
                ['get', 'connectionColor'],
                '#006FFF' // Default blue
            ],
            'line-width': 1.5,
            'line-opacity': 0.4
        }
    });
    
}

// Create connection lines between Collective Locations and General Partner Locations
function createCollectiveGPConnections(collectivePoints, gpPoints) {
    const collectiveGPConnectionLayerId = 'collective-gp-connection-lines';
    const collectiveGPConnectionSourceId = 'collective-gp-connection-source';
    
    // Clear existing collective-GP connection layers and sources
    if (map.getLayer(collectiveGPConnectionLayerId)) {
        map.removeLayer(collectiveGPConnectionLayerId);
    }
    if (map.getLayer(collectiveGPConnectionLayerId + '-hover')) {
        map.removeLayer(collectiveGPConnectionLayerId + '-hover');
    }
    if (map.getSource(collectiveGPConnectionSourceId)) {
        map.removeSource(collectiveGPConnectionSourceId);
    }
    
    // Create connections - each GP connects to its closest collective location
    const connections = [];
    
    gpPoints.forEach((gp, gpIndex) => {
        const gpLat = parseFloat(gp.latitude || gp.lat || gp.Lat || gp.Latitude || gp.LAT);
        const gpLng = parseFloat(gp.longitude || gp.lng || gp.lon || gp.Lon || gp.long || gp.Longitude || gp.LNG);
        
        // Find the nearest collective location
        let nearestCollective = null;
        let shortestDistance = Infinity;
        
        collectivePoints.forEach(collective => {
            const collectiveLat = parseFloat(collective.latitude || collective.lat || collective.Lat || collective.Latitude || collective.LAT);
            const collectiveLng = parseFloat(collective.longitude || collective.lng || collective.lon || collective.Lon || collective.long || collective.Longitude || collective.LNG);
            
            const distance = calculateDistance(gpLat, gpLng, collectiveLat, collectiveLng);
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestCollective = collective;
            }
        });
        
        if (nearestCollective) {
            const collectiveLat = parseFloat(nearestCollective.latitude || nearestCollective.lat || nearestCollective.Lat || nearestCollective.Latitude || nearestCollective.LAT);
            const collectiveLng = parseFloat(nearestCollective.longitude || nearestCollective.lng || nearestCollective.lon || nearestCollective.Lon || nearestCollective.long || nearestCollective.Longitude || nearestCollective.LNG);
            
            connections.push({
                type: 'Feature',
                id: `collective-gp-connection-${gpIndex}`,
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [gpLng, gpLat],
                        [collectiveLng, collectiveLat]
                    ]
                },
                properties: {
                    id: `collective-gp-connection-${gpIndex}`,
                    gpName: gp['General Partner Name'] || 'Unknown GP',
                    collectiveName: nearestCollective['Collective Name'] || 'Unknown Collective',
                    distance: Math.round(shortestDistance),
                    connectionType: 'collective-gp'
                }
            });
        }
    });
    
    const connectionData = {
        type: 'FeatureCollection',
        features: connections
    };
    
    // Add connection source
    map.addSource(collectiveGPConnectionSourceId, {
        type: 'geojson',
        data: connectionData
    });
    
    // Add base connection layer (thin, low opacity)
    map.addLayer({
        id: collectiveGPConnectionLayerId,
        type: 'line',
        source: collectiveGPConnectionSourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none' // Start hidden, will be shown by updateConnectionLineVisibility()
        },
        paint: {
            'line-color': '#FFD600', // Yellow
            'line-width': 1.5,
            'line-opacity': 0.3
        }
    });
    
    // Add hover layer (thick, high opacity, initially invisible)
    map.addLayer({
        id: collectiveGPConnectionLayerId + '-hover',
        type: 'line',
        source: collectiveGPConnectionSourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none' // Start hidden, will be shown by updateConnectionLineVisibility()
        },
        paint: {
            'line-color': '#FFD600', // Yellow
            'line-width': 1.5,
            'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8,
                0
            ]
        }
    });
    
    // Add hover effects
    let hoveredCollectiveGPConnectionId = null;
    
    map.on('mouseenter', collectiveGPConnectionLayerId, (e) => {
        if (e.features.length > 0) {
            let featureId = e.features[0].id || e.features[0].properties?.id;
            if (featureId !== undefined) {
                map.setFeatureState({
                    source: collectiveGPConnectionSourceId,
                    id: featureId
                }, { hover: true });
                hoveredCollectiveGPConnectionId = featureId;
            }
        }
    });
    
    map.on('mouseleave', collectiveGPConnectionLayerId, () => {
        if (hoveredCollectiveGPConnectionId !== null && hoveredCollectiveGPConnectionId !== undefined) {
            map.setFeatureState({
                source: collectiveGPConnectionSourceId,
                id: hoveredCollectiveGPConnectionId
            }, { hover: false });
            hoveredCollectiveGPConnectionId = null;
        }
    });
    
    // Add click handler for collective-GP connections
    map.on('click', collectiveGPConnectionLayerId, (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const properties = feature.properties;
            
            // Close any existing popups
            if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
            }
            if (currentClickPopup) {
                currentClickPopup.remove();
                currentClickPopup = null;
            }
            
            // Find the two endpoints
            const coordinates = feature.geometry.coordinates;
            const collectiveCoord = coordinates[0];
            const gpCoord = coordinates[1];
            
            // Find the actual point data
            const collectivePoint = collectivePoints.find(p => {
                const lat = parseFloat(p.latitude || p.lat || p.Lat || p.Latitude || p.LAT);
                const lng = parseFloat(p.longitude || p.lng || p.lon || p.Lon || p.long || p.Longitude || p.LNG);
                return Math.abs(lat - collectiveCoord[1]) < 0.001 && Math.abs(lng - collectiveCoord[0]) < 0.001;
            });
            
            const gpPoint = gpPoints.find(p => {
                const lat = parseFloat(p.latitude || p.lat || p.Lat || p.Latitude || p.LAT);
                const lng = parseFloat(p.longitude || p.lng || p.lon || p.Lon || p.long || p.Longitude || p.LNG);
                return Math.abs(lat - gpCoord[1]) < 0.001 && Math.abs(lng - gpCoord[0]) < 0.001;
            });
            
            if (collectivePoint && gpPoint) {
                // Create connection popup
                const distance = properties.distance || 'Unknown';
                const popupContent = `
                    <div class="connection-popup">
                        <div class="connection-separator">
                            <h3>GP → Collective Connection</h3>
                            <div class="endpoint-detail">Distance: ${distance} km</div>
                        </div>
                        <div class="endpoint-section">
                            <div class="endpoint-title">General Partner Location</div>
                            <div class="endpoint-name">${gpPoint['General Partner Name'] || 'Unknown GP'}</div>
                            <div class="endpoint-detail">${gpPoint['Company Location'] || 'Unknown Location'}</div>
                        </div>
                        <div class="endpoint-section">
                            <div class="endpoint-title">Nearest Collective Location</div>
                            <div class="endpoint-name">${collectivePoint['Collective Name'] || 'Unknown Collective'}</div>
                            <div class="endpoint-detail">${collectivePoint['Company Location'] || 'Unknown Location'}</div>
                        </div>
                    </div>
                `;
                
                currentClickPopup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: false,
                    className: 'connection-popup'
                })
                .setLngLat([(collectiveCoord[0] + gpCoord[0]) / 2, (collectiveCoord[1] + gpCoord[1]) / 2])
                .setHTML(popupContent)
                .addTo(map);
                
                // TODO: Highlight the endpoints (function not yet implemented)
            }
        }
    });
    
}

// Create connection lines between Direct Investments and their closest two Collective Locations
function createDirectInvestmentConnections(directInvestmentPoints, collectivePoints) {
    const directInvestmentConnectionLayerId = 'direct-investment-connection-lines';
    const directInvestmentConnectionSourceId = 'direct-investment-connection-source';
    
    // Clear existing direct investment connection layers and sources
    if (map.getLayer(directInvestmentConnectionLayerId)) {
        map.removeLayer(directInvestmentConnectionLayerId);
    }
    if (map.getSource(directInvestmentConnectionSourceId)) {
        map.removeSource(directInvestmentConnectionSourceId);
    }
    
    const connections = [];
    
    // For each direct investment point, find the closest two collective locations
    directInvestmentPoints.forEach((directInvestment, index) => {
        const directInvestmentLat = parseFloat(directInvestment.latitude || directInvestment.lat || directInvestment.Lat || directInvestment.Latitude || directInvestment.LAT);
        const directInvestmentLng = parseFloat(directInvestment.longitude || directInvestment.lng || directInvestment.lon || directInvestment.Lon || directInvestment.long || directInvestment.Longitude || directInvestment.LNG);
        
        if (isNaN(directInvestmentLat) || isNaN(directInvestmentLng)) {
            return;
        }
        
        // Calculate distances to all collective locations
        const distances = collectivePoints.map(collective => {
            const collectiveLat = parseFloat(collective.latitude || collective.lat || collective.Lat || collective.Latitude || collective.LAT);
            const collectiveLng = parseFloat(collective.longitude || collective.lng || collective.lon || collective.Lon || collective.long || collective.Longitude || collective.LNG);
            
            if (isNaN(collectiveLat) || isNaN(collectiveLng)) {
                return { distance: Infinity, collective };
            }
            
            const distance = calculateDistance(directInvestmentLat, directInvestmentLng, collectiveLat, collectiveLng);
            return { distance, collective };
        });
        
        // Sort by distance and take the closest two
        distances.sort((a, b) => a.distance - b.distance);
        const closestTwo = distances.slice(0, 2);
        
        // Create connection lines to the closest two collective locations
        closestTwo.forEach(({ collective, distance }, connectionIndex) => {
            const collectiveLat = parseFloat(collective.latitude || collective.lat || collective.Lat || collective.Latitude || collective.LAT);
            const collectiveLng = parseFloat(collective.longitude || collective.lng || collective.lon || collective.Lon || collective.long || collective.Longitude || collective.LNG);
            
            const connectionId = `direct-investment-connection-${index}-${connectionIndex}`;
            
            const connection = {
                type: 'Feature',
                id: connectionId,
                properties: {
                    id: connectionId,
                    directInvestmentName: directInvestment['Company Name'] || directInvestment['company name'] || directInvestment['Company'] || 'Unknown Direct Investment',
                    collectiveName: collective['Company Name'] || collective['company name'] || collective['Company'] || 'Unknown Collective',
                    distance: distance.toFixed(2)
                },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [directInvestmentLng, directInvestmentLat],
                        [collectiveLng, collectiveLat]
                    ]
                }
            };
            
            connections.push(connection);
        });
    });
    
    if (connections.length === 0) {
        return;
    }
    
    // Add the connection source and layer
    map.addSource(directInvestmentConnectionSourceId, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: connections
        }
    });
    
    // Add connection layer (same color as direct investment points)
    map.addLayer({
        id: directInvestmentConnectionLayerId,
        type: 'line',
        source: directInvestmentConnectionSourceId,
        layout: {
            'visibility': 'none' // Start hidden, will be shown by updateConnectionLineVisibility()
        },
        paint: {
            'line-color': '#9B59B6', // Same color as direct investment points
            'line-width': 1.5,
            'line-opacity': 0.3
        }
    });
    
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

// Get tag color based on tab name
function getTagColor(tabName) {
    const colorMap = {
        'Portfolio Companies': '#006FFF',
        'Direct Investments': '#9B59B6',
        'General Partner Location': '#FFD600',
        'Collective Locations': '#03B570',
        'Allocator LPs': '#ED5FAB'
    };
    return colorMap[tabName] || '#43645D';
}

// Convert internal tab names to display names (singular form)
function getDisplayName(tabName) {
    const displayNameMap = {
        'Portfolio Companies': 'Underlying Portfolio Company',
        'Direct Investments': "Collective's Direct Investment",
        'General Partner Location': 'Partner Venture Manager',
        'Collective Locations': 'Collective Global',
        'Allocator LPs': 'Allocator Partner'
    };
    return displayNameMap[tabName] || tabName;
}

// Create simple hover popup content (company name, tag, location only)
function createHoverPopupContent(properties) {
    let content = '<div class="popup-content hover-popup">';
    
    // Find company name for title
    let companyName = '';
    let hasCompanyName = false;
    
    // Look for company name fields
    const companyNameFields = ['company name', 'company', 'allocator name', 'portfolio', 'name'];
    for (const [key, value] of Object.entries(properties)) {
        const keyLower = key.toLowerCase();
        if (value && companyNameFields.some(field => keyLower.includes(field))) {
            companyName = value;
            hasCompanyName = true;
            break;
        }
    }
    
    // Add company name as title if found
    if (hasCompanyName) {
        content += `<h4 class="popup-title">${companyName}</h4>`;
    }
    
    // Add tag showing point type
    const tagColor = getTagColor(properties.tabName);
    const tagLabel = getDisplayName(properties.tabName);
    content += `<div class="popup-tag">
        <div class="popup-tag-dot" style="background-color: ${tagColor}; opacity: 0.5;"></div>
        <span class="popup-tag-label">${tagLabel}</span>
    </div>`;
    
    // Add location information
    const locationFields = ['location', 'hq location', 'headquarters', 'address', 'city', 'country'];
    for (const [key, value] of Object.entries(properties)) {
        const keyLower = key.toLowerCase();
        if (value && locationFields.some(field => keyLower.includes(field))) {
            let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            // Fix specific label formatting
            if (formattedKey.includes('H Q Location')) {
                formattedKey = formattedKey.replace('H Q Location', 'HQ Location');
            }
            if (formattedKey.includes('H Q')) {
                formattedKey = formattedKey.replace('H Q', 'HQ');
            }
            
            content += `<p><span class="popup-label">${formattedKey}</span>   <span class="popup-value">${value}</span></p>`;
            break; // Only show the first location field found
        }
    }
    
    content += '</div>';
    return content;
}

// Create detailed click popup content (all information)
function createClickPopupContent(properties) {
    let content = '<div class="popup-content click-popup">';
    
    // Fields to exclude from popup
    const excludedFields = [
        'latitude', 'longitude', 'lat', 'lon', 'lng',
        'tab', 'tabname', 'tab name',
        'id', 'Id', 'ID',
        'website', 'Website', 'url', 'URL'
    ];
    
    // Check if this is an Allocator LP popup
    const isAllocatorLP = properties.tabName === 'Allocator LPs';
    
    // Find company name for title
    let companyName = '';
    let hasCompanyName = false;
    
    // Look for company name fields
    const companyNameFields = ['company name', 'company', 'allocator name', 'portfolio', 'name'];
    for (const [key, value] of Object.entries(properties)) {
        const keyLower = key.toLowerCase();
        if (value && companyNameFields.some(field => keyLower.includes(field))) {
            companyName = value;
            hasCompanyName = true;
            break;
        }
    }
    
    // Add company name as title if found
    if (hasCompanyName) {
        content += `<h4 class="popup-title">${companyName}</h4>`;
    }
    
    // Add tag showing point type
    const tagColor = getTagColor(properties.tabName);
    const tagLabel = getDisplayName(properties.tabName);
    content += `<div class="popup-tag">
        <div class="popup-tag-dot" style="background-color: ${tagColor}; opacity: 0.5;"></div>
        <span class="popup-tag-label">${tagLabel}</span>
    </div>`;
    
    // Add other properties
    Object.entries(properties).forEach(([key, value]) => {
        const keyLower = key.toLowerCase();
        const shouldExclude = excludedFields.some(field => keyLower.includes(field));
        const isCompanyName = companyNameFields.some(field => keyLower.includes(field));
        
        // Exclude AUM fields from non-Allocator LP popups
        const isAUMField = keyLower.includes('aum') || keyLower.includes('assets under management');
        if (!isAllocatorLP && isAUMField) {
            return; // Skip this field
        }
        
        if (value && !shouldExclude && !isCompanyName) {
            let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            // Fix specific label formatting
            if (formattedKey.includes('H Q Location')) {
                formattedKey = formattedKey.replace('H Q Location', 'HQ Location');
            }
            if (formattedKey.includes('H Q')) {
                formattedKey = formattedKey.replace('H Q', 'HQ');
            }
            if (formattedKey.includes('A U M')) {
                formattedKey = formattedKey.replace('A U M', 'AUM');
            }
            
            content += `<p><span class="popup-label">${formattedKey}</span>   <span class="popup-value">${value}</span></p>`;
        }
    });
    
    content += '</div>';
    return content;
}

// Show sidebar with point details
function showSidebar(properties) {
    let content = '<div class="sidebar-details">';
    
    Object.entries(properties).forEach(([key, value]) => {
        if (value && key.toLowerCase() !== 'latitude' && key.toLowerCase() !== 'longitude') {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            content += `
                <div class="detail-item">
                    <h4>${formattedKey}</h4>
                    <p>${value}</p>
                </div>
            `;
        }
    });
    
    content += '</div>';
    
    sidebarContent.innerHTML = content;
    sidebar.classList.add('open');
}

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

// Setup legend toggle functionality
function setupLegendToggles() {
    
    const toggleInputs = document.querySelectorAll('.toggle-switch input[data-layer]');
    
    
    toggleInputs.forEach((toggle, index) => {
        const layerId = toggle.getAttribute('data-layer');
        
        // Check if layer exists
        const layerExists = map.getLayer(layerId);
        
        if (!layerExists) {
            console.warn(`Layer ${layerId} not found on map!`);
        }
        
        toggle.addEventListener('change', (e) => {
            const targetLayerId = e.target.getAttribute('data-layer');
            const isVisible = e.target.checked;
            
            
            try {
                // Connection line visibility will be handled by updateConnectionLineVisibility()
                
                const visibility = isVisible ? 'visible' : 'none';
                
                // Toggle the main point layer
                if (map.getLayer(targetLayerId)) {
                    map.setLayoutProperty(targetLayerId, 'visibility', visibility);
                    
                } else {
                    console.error(`Layer ${targetLayerId} does not exist on map!`);
                }
                
                // For collective points, also toggle the shadow and small circle layers
                if (targetLayerId === 'points-collective-locations') {
                    const shadowLayerId = 'points-collective-locations-shadow';
                    const smallCircleLayerId = 'points-collective-locations-small-circle';
                    if (map.getLayer(shadowLayerId)) {
                        map.setLayoutProperty(shadowLayerId, 'visibility', visibility);
                    }
                    if (map.getLayer(smallCircleLayerId)) {
                        map.setLayoutProperty(smallCircleLayerId, 'visibility', visibility);
                    }
                }
                
                // Update connection line visibility based on both connected point types
                updateConnectionLineVisibility();
                
            } catch (error) {
                console.error(`Error toggling layer ${targetLayerId}:`, error);
            }
        });
    });
    
    // Setup portfolio toggles
    setupPortfolioToggles();
    
    // Initialize connection line visibility after all data is loaded
    updateConnectionLineVisibility();
}

// Setup portfolio toggle functionality
function setupPortfolioToggles() {
    const portfolioToggleInputs = document.querySelectorAll('.toggle-switch input[data-portfolio]');
    
    portfolioToggleInputs.forEach((toggle) => {
        toggle.addEventListener('change', (e) => {
            const portfolioId = e.target.getAttribute('data-portfolio');
            const isVisible = e.target.checked;
            
            
            // Toggle portfolio visibility based on portfolio ID
            togglePortfolioVisibility(portfolioId, isVisible);
        });
    });
}

// Toggle individual portfolio visibility
// Initialize portfolio visibility state
function initializePortfolioVisibility() {
    if (!window.portfolioVisibility) {
        window.portfolioVisibility = {};
    }
    
    // Initialize all portfolios as visible by default
    const portfolioColors = ['#23F2F6', '#F85555', '#F4A300'];
    portfolioColors.forEach(color => {
        if (window.portfolioVisibility[color] === undefined) {
            window.portfolioVisibility[color] = true;
        }
    });
    
}

// Check if a point should be interactive (visible and hoverable)
function isPointInteractive(properties) {
    // If not in portfolio color mode, all points are interactive
    if (!isPortfolioColorMode) {
        return true;
    }
    
    // If in portfolio color mode, check if the point's portfolio is visible
    const portfolioColor = properties.portfolioColor;
    if (portfolioColor && window.portfolioVisibility) {
        return window.portfolioVisibility[portfolioColor] === true;
    }
    
    // Default to interactive if no portfolio color or visibility state
    return true;
}

// Check if a layer is currently visible
function isLayerVisible(layerId) {
    if (!map.getLayer(layerId)) {
        return false;
    }
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    const isVisible = visibility === 'visible';
    return isVisible;
}

// Update connection line visibility based on both connected point types
function updateConnectionLineVisibility() {
    
    // Define which connection lines connect which point types
    const connectionMappings = {
        'connection-lines': ['points-allocator-lps', 'points-collective-locations'],
        'connection-lines-hover': ['points-allocator-lps', 'points-collective-locations'],
        'portfolio-connection-lines': ['points-portfolio-companies', 'points-general-partner-location'],
        'portfolio-connection-lines-hover': ['points-portfolio-companies', 'points-general-partner-location'],
        'collective-gp-connection-lines': ['points-collective-locations', 'points-general-partner-location'],
        'collective-gp-connection-lines-hover': ['points-collective-locations', 'points-general-partner-location'],
        'direct-investment-connection-lines': ['points-direct-investments', 'points-collective-locations']
    };
    
    // Check each connection line type
    Object.entries(connectionMappings).forEach(([connectionLayerId, requiredPointLayers]) => {
        
        if (map.getLayer(connectionLayerId)) {
            
            // Check if ALL required point layers are visible
            const allRequiredLayersVisible = requiredPointLayers.every(pointLayerId => isLayerVisible(pointLayerId));
            
            const visibility = allRequiredLayersVisible ? 'visible' : 'none';
            
            map.setLayoutProperty(connectionLayerId, 'visibility', visibility);
        } else {
        }
    });
    
}

function togglePortfolioVisibility(portfolioId, isVisible) {
    // Ensure portfolio visibility is initialized
    initializePortfolioVisibility();
    
    // Get the portfolio color for this portfolio
    const portfolioColors = ['#23F2F6', '#F85555', '#F4A300'];
    const portfolioIndex = parseInt(portfolioId.replace('portfolio', '')) - 1;
    const portfolioColor = portfolioColors[portfolioIndex];
    
    // Get the actual portfolio name
    const portfolioName = window.portfolioNames && window.portfolioNames[portfolioIndex] ? window.portfolioNames[portfolioIndex] : null;
    
    // Store portfolio visibility state by both color and name
    window.portfolioVisibility[portfolioColor] = isVisible;
    if (portfolioName) {
        window.portfolioVisibility[portfolioName] = isVisible;
    }
    
    
    // Update the map layers to reflect the new visibility
    updatePortfolioLayerVisibility();
}

// Update map layer visibility based on portfolio toggle states
function updatePortfolioLayerVisibility() {
    if (!window.portfolioVisibility) return;
    
    // Close any existing popups when visibility changes
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    }
    if (currentClickPopup) {
        currentClickPopup.remove();
        currentClickPopup = null;
    }
    
    // Update GP points layer
    if (map.getLayer('points-general-partner-location')) {
        const gpOpacityExpression = [
            'case',
            ['==', ['get', 'portfolioColor'], '#23F2F6'], window.portfolioVisibility['#23F2F6'] ? 0.7 : 0,
            ['==', ['get', 'portfolioColor'], '#F85555'], window.portfolioVisibility['#F85555'] ? 0.7 : 0,
            ['==', ['get', 'portfolioColor'], '#F4A300'], window.portfolioVisibility['#F4A300'] ? 0.7 : 0,
            0.7 // Default opacity for non-portfolio points
        ];
        
        const gpStrokeOpacityExpression = [
            'case',
            ['==', ['get', 'portfolioColor'], '#23F2F6'], window.portfolioVisibility['#23F2F6'] ? 1 : 0,
            ['==', ['get', 'portfolioColor'], '#F85555'], window.portfolioVisibility['#F85555'] ? 1 : 0,
            ['==', ['get', 'portfolioColor'], '#F4A300'], window.portfolioVisibility['#F4A300'] ? 1 : 0,
            1 // Default stroke opacity for non-portfolio points
        ];
        
        map.setPaintProperty('points-general-partner-location', 'circle-opacity', gpOpacityExpression);
        map.setPaintProperty('points-general-partner-location', 'circle-stroke-opacity', gpStrokeOpacityExpression);
    }
    
    // Update portfolio companies layer
    if (map.getLayer('points-portfolio-companies')) {
        const portfolioOpacityExpression = [
            'case',
            ['==', ['get', 'portfolioColor'], '#23F2F6'], window.portfolioVisibility['#23F2F6'] ? 0.5 : 0,
            ['==', ['get', 'portfolioColor'], '#F85555'], window.portfolioVisibility['#F85555'] ? 0.5 : 0,
            ['==', ['get', 'portfolioColor'], '#F4A300'], window.portfolioVisibility['#F4A300'] ? 0.5 : 0,
            0.5 // Default opacity for non-portfolio points
        ];
        
        map.setPaintProperty('points-portfolio-companies', 'circle-opacity', portfolioOpacityExpression);
    }
    
    // Update connection lines layer
    if (map.getLayer('portfolio-connection-lines')) {
        const connectionOpacityExpression = [
            'case',
            ['==', ['get', 'connectionColor'], '#23F2F6'], window.portfolioVisibility['#23F2F6'] ? 0.4 : 0,
            ['==', ['get', 'connectionColor'], '#F85555'], window.portfolioVisibility['#F85555'] ? 0.4 : 0,
            ['==', ['get', 'connectionColor'], '#F4A300'], window.portfolioVisibility['#F4A300'] ? 0.4 : 0,
            0.4 // Default opacity for non-portfolio connections
        ];
        
        map.setPaintProperty('portfolio-connection-lines', 'line-opacity', connectionOpacityExpression);
    }
    
    // Also update connection line visibility for other connection types
    updateConnectionLineVisibility();
}




// Handle errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
