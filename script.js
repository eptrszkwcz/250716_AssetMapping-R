// Mapbox configuration
// You'll need to replace this with your actual Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNpdHVuOXpqMzAwMmEybnF2anZwbTd4aWcifQ.MF8M3qBg0AEp_-10FB4juw';
const GOOGLE_SHEET_ID = '1waBUthisVzvuqBnXjoggBanNwvOL_-xn3JsdgA5QqC0';

// Define all tabs and their styling
const TABS_CONFIG = {
  
    'Portfolio Companies': {
        color: '#006FFF', // Blue
        strokeColor: '#2E5BBA',
        strokeWidth: 0,
        opacity: 0.3,
        strokeOpacity: 0.9,
        radius: 4
    },
    'Direct Investments': {
        color: '#9B59B6', // Purple
        strokeColor: '#8E44AD',
        strokeWidth: 0,
        opacity: 0.5,
        strokeOpacity: 0.9,
        radius: 10
    },
    'General Partner Location': {
        color: '#FFD600', // Red
        strokeColor: '#C0392B',
        strokeWidth: 0,
        opacity: 0.4,
        strokeOpacity: 0.9,
        radius: 10
    },
    'Collective Locations': {
        color: '#03B570', // Teal
        strokeColor: '#03B570',
        strokeWidth: 4,
        opacity: 0,
        strokeOpacity: 1,
        radius: 6
    },
    'Allocator LPs': {
        color: '#ED5FAB', 
        strokeColor: '#ED5FAB',
        strokeWidth: 1,
        opacity: 0.2,
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
    
    console.log('Set draw order for map layers');
}

// DOM elements
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebarContent');
const closeSidebarBtn = document.getElementById('closeSidebar');

// Initialize the application
async function init() {
    try {
        // Check if Mapbox token is set
        if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
            throw new Error('Please set your Mapbox access token in script.js');
        }

        // Initialize Mapbox
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/ptrszkwcz/cmewareb800lg01si3ct95j48',
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
        let allocatorPoints = [];
        let collectivePoints = [];
        let portfolioPoints = [];
        let gpPoints = [];
        let directInvestmentPoints = [];
        
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
                    'AUM ($bn)': foundAUM || 1
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
    
    // Add circle layer
    map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        layout: {},
        paint: {
            'circle-radius': config.radius,
            'circle-color': config.color,
            'circle-stroke-color': config.color,
            'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                2,
                config.strokeWidth
            ],
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
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ED5FAB',
            'line-width': 1,
            'line-opacity': 0.3
        }
    });
    
    console.log(`Created ${connections.length} connection lines between ${allocatorPoints.length} allocators and ${collectivePoints.length} collective locations`);
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
                        gpName: nearestGP['Company Name'] || nearestGP['company name'] || nearestGP['Company'] || 'Unknown GP',
                        distance: Math.round(shortestDistance)
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
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#006FFF', // Blue to match Portfolio Companies
            'line-width': 1,
            'line-opacity': 0.4
        }
    });
    
    console.log(`Created ${connections.length} portfolio connection lines`);
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
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#FFD600', // Yellow
            'line-width': 1,
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
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#FFD600', // Yellow
            'line-width': 3,
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
    
    console.log(`Created ${connections.length} collective-GP connection lines`);
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
        paint: {
            'line-color': '#9B59B6', // Same color as direct investment points
            'line-width': 1,
            'line-opacity': 0.3
        }
    });
    
    console.log(`Created ${connections.length} direct investment connection lines`);
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
    const tagLabel = properties.tabName;
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
    const tagLabel = properties.tabName;
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
                // Define which connection lines correspond to each point type
                const layerConnections = {
                    'points-portfolio-companies': ['portfolio-connection-lines', 'portfolio-connection-lines-hover'],
                    'points-allocator-lps': ['connection-lines', 'connection-lines-hover'],
                    'points-general-partner-location': ['collective-gp-connection-lines', 'collective-gp-connection-lines-hover'],
                    'points-direct-investments': ['direct-investment-connection-lines']
                };
                
                const visibility = isVisible ? 'visible' : 'none';
                
                // Toggle the main point layer
                if (map.getLayer(targetLayerId)) {
                    map.setLayoutProperty(targetLayerId, 'visibility', visibility);
                    
                } else {
                    console.error(`Layer ${targetLayerId} does not exist on map!`);
                }
                
                // Toggle corresponding connection lines
                const connectionLayers = layerConnections[targetLayerId];
                if (connectionLayers) {
                    connectionLayers.forEach(connectionLayerId => {
                        if (map.getLayer(connectionLayerId)) {
                            map.setLayoutProperty(connectionLayerId, 'visibility', visibility);
                            
                        } else {
                            console.warn(`Connection layer ${connectionLayerId} does not exist on map!`);
                        }
                    });
                } else {
                }
                
            } catch (error) {
                console.error(`Error toggling layer ${targetLayerId}:`, error);
            }
        });
    });
    
}




// Handle errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
