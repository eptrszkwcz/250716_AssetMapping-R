// Portfolio Color Management
// ==========================

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

