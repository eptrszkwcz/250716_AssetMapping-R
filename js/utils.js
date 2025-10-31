// Utility Functions
// =================

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

