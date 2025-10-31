// Legend and Visibility Management
// =================================

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
        }
    });
}

