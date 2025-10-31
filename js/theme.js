// Theme Management
// ================

// Theme application function
function applyTheme() {
    const colors = THEME_COLORS;
    
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

