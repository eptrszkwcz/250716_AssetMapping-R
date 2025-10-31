// Map Rendering - Point Display and Layers
// =========================================

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

