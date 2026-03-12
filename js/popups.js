// Popup Creation and Management
// ==============================

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
    const tagColor = getTagColor(properties.tabName, properties);
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
    
    const isAllocatorLP = properties.tabName === 'Allocator LPs';
    const isGeneralPartner = properties.tabName === 'General Partner Location';
    const isPortfolioCompany = properties.tabName === 'Portfolio Companies';
    
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
    const tagColor = getTagColor(properties.tabName, properties);
    const tagLabel = getDisplayName(properties.tabName);
    content += `<div class="popup-tag">
        <div class="popup-tag-dot" style="background-color: ${tagColor}; opacity: 0.5;"></div>
        <span class="popup-tag-label">${tagLabel}</span>
    </div>`;
    
    // Add website link if exists
    let websiteUrl = '';
    for (const [key, value] of Object.entries(properties)) {
        const keyLower = key.toLowerCase();
        if (value && (keyLower === 'website' || keyLower === 'url')) {
            websiteUrl = value;
            break;
        }
    }
    
    if (websiteUrl) {
        // Ensure URL has protocol
        const formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
        content += `<div class="company-link"><a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${websiteUrl}</a></div>`;
    }
    
    if (isGeneralPartner) {
        // General Partner Location: show only HQ Location, AUM, No. of Portfolios, Aggregate Portfolio Value ($mm)
        const getProp = (keys) => {
            for (const k of keys) {
                const v = properties[k];
                if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
            }
            return '';
        };
        const hqKeys = ['HQ Location', 'Hq Location', 'hq location', 'HQ location'];
        const aumKeys = ['AUM', 'aum'];
        const numPortKeys = ['No. of Portfolios', 'No of Portfolios', 'no. of portfolios'];
        const aggKeys = ['Aggregate Portfolio Value ($mm)', 'Aggregate Portfolio Value', 'aggregate portfolio value ($mm)'];
        const hq = getProp(hqKeys);
        const aum = getProp(aumKeys);
        const numPort = getProp(numPortKeys);
        const aggRaw = getProp(aggKeys);
        const numPortInt = numPort !== '' ? parseInt(numPort.replace(/,/g, ''), 10) : NaN;
        const aggInt = aggRaw !== '' ? parseInt(aggRaw.replace(/,/g, ''), 10) : NaN;
        if (hq) content += `<p><span class="popup-label">HQ Location</span>   <span class="popup-value">${hq}</span></p>`;
        if (aum) content += `<p><span class="popup-label">AUM</span>   <span class="popup-value">${aum}</span></p>`;
        if (!isNaN(numPortInt)) content += `<p><span class="popup-label">No. of Portfolios</span>   <span class="popup-value">${numPortInt}</span></p>`;
        else if (numPort) content += `<p><span class="popup-label">No. of Portfolios</span>   <span class="popup-value">${numPort}</span></p>`;
        if (!isNaN(aggInt)) content += `<p><span class="popup-label">Aggregate Portfolio Value ($mm)</span>   <span class="popup-value">${aggInt.toLocaleString()}</span></p>`;
        else if (aggRaw) content += `<p><span class="popup-label">Aggregate Portfolio Value ($mm)</span>   <span class="popup-value">${aggRaw}</span></p>`;
    } else {
        // Portfolio Companies: show Portfolio then Industry first (above other fields)
        if (isPortfolioCompany) {
            const portfolioVal = properties['Portfolio'] || properties['portfolio'] || '';
            const industryVal = properties['Industry'] || properties['industry'] || '';
            if (portfolioVal) content += `<p><span class="popup-label">Portfolio</span>   <span class="popup-value">${portfolioVal}</span></p>`;
            if (industryVal) content += `<p><span class="popup-label">Industry</span>   <span class="popup-value">${industryVal}</span></p>`;
        }
        // Add other properties for non-GP popups
        Object.entries(properties).forEach(([key, value]) => {
            const keyLower = key.toLowerCase();
            const shouldExclude = excludedFields.some(field => keyLower.includes(field));
            const isCompanyName = companyNameFields.some(field => keyLower.includes(field));
            if (isPortfolioCompany && (keyLower === 'portfolio' || keyLower === 'industry')) {
                return;
            }
            const isAUMField = keyLower.includes('aum') || keyLower.includes('assets under management');
            if (!isAllocatorLP && isAUMField) {
                return;
            }
            if (isPortfolioCompany && (keyLower.includes('last financing size') || keyLower.includes('last financingsize'))) {
                return;
            }
            
            if (value && !shouldExclude && !isCompanyName) {
                let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                if (formattedKey.includes('H Q Location')) formattedKey = formattedKey.replace('H Q Location', 'HQ Location');
                if (formattedKey.includes('H Q')) formattedKey = formattedKey.replace('H Q', 'HQ');
                if (formattedKey.includes('A U M')) formattedKey = formattedKey.replace('A U M', 'AUM');
                content += `<p><span class="popup-label">${formattedKey}</span>   <span class="popup-value">${value}</span></p>`;
            }
        });
    }
    
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

