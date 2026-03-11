// Legend and Visibility Management
// =================================

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

