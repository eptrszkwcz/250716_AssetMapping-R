// Data Loading and CSV Parsing
// =============================

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
        
        // Step 1: Fetch all data first (without displaying)
        const allTabData = {};
        
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
                    allTabData[tabName] = { data: validData, config: config };
                    totalPoints += validData.length;
                    console.log(`Fetched ${validData.length} points from ${tabName}`);
                    
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
        
        console.log(`Fetched ${totalPoints} total points from all tabs. Now displaying...`);
        
        // Step 2: Display all points at once
        for (const [tabName, tabInfo] of Object.entries(allTabData)) {
            displayPoints(tabInfo.data, tabName, tabInfo.config);
        }
        
        // Step 3: Create all connection lines
        if (allocatorPoints.length > 0 && collectivePoints.length > 0) {
            createConnectionLines(allocatorPoints, collectivePoints);
        }
        
        if (portfolioPoints.length > 0 && gpPoints.length > 0) {
            createPortfolioConnections(portfolioPoints, gpPoints);
        }
        
        if (collectivePoints.length > 0 && gpPoints.length > 0) {
            createCollectiveGPConnections(collectivePoints, gpPoints);
        }
        
        if (directInvestmentPoints.length > 0 && collectivePoints.length > 0) {
            createDirectInvestmentConnections(directInvestmentPoints, collectivePoints);
        }
        
        console.log(`Displayed ${totalPoints} total points and created all connections`);
        
        // Step 4: Set the proper draw order for all layers
        setLayerDrawOrder();
        
        // Step 5: Setup legend toggle functionality after all layers are created
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

