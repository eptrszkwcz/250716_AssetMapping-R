// Connection Lines Between Points
// ================================

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
            
            // Get portfolio color for this GP (if it exists)
            const gpName = gp['Company Name'] || gp['company name'] || gp['Company'] || 'Unknown GP';
            const portfolioColor = gp.portfolioColor || portfolioColorMap[gpName] || null;
            
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
                    connectionType: 'collective-gp',
                    portfolioColor: portfolioColor // Add portfolio color to identify which portfolio this belongs to
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
            // Start with yellow, will be updated by updateCollectiveGPConnectionColors()
            'line-color': '#FFD600',
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
            // Start with yellow, will be updated by updateCollectiveGPConnectionColors()
            'line-color': '#FFD600',
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

