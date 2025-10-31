// Configuration and Constants
// ============================

// API Configuration
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNpdHVuOXpqMzAwMmEybnF2anZwbTd4aWcifQ.MF8M3qBg0AEp_-10FB4juw';
const GOOGLE_SHEET_ID = '1waBUthisVzvuqBnXjoggBanNwvOL_-xn3JsdgA5QqC0';

// Portfolio color configuration
let isPortfolioColorMode = false; // Boolean to control portfolio vs category coloring
let portfolioColorMap = {}; // Map of portfolio names to colors

// Global point arrays for reloading
let allocatorPoints = [];
let collectivePoints = [];
let portfolioPoints = [];
let gpPoints = [];
let directInvestmentPoints = [];

// Theme colors (light theme only)
const THEME_COLORS = {
    // Background colors
    bodyBg: '#f8f9fa',
    headerBg: 'linear-gradient(135deg, #9fb7b3 0%, #9fb7b3 100%)',
    mapBg: '#b0bfbd',
    legendBg: '#9fb7b3',
    popupBg: '#9fb7b3',
    
    // Text colors
    headerText: '#4B6360',
    legendText: '#4B6360',
    legendSubtext: '#4B6360',
    popupText: '#4B6360',
    popupTitle: '#4B6360',
    
    // UI element colors
    buttonBg: 'rgba(255,255,255,0.05)',
    buttonBorder: 'rgba(255,255,255,0.3)',
    toggleBg: 'rgba(255,255,255,0.3)',
    toggleBgChecked: 'rgba(255,255,255,0.5)',
    toggleButton: '#4B6360',
    toggleHover: 'rgba(255,255,255,0.4)',
    
    // Border colors
    popupBorder: 'rgba(255, 255, 255, 0.3)',
    popupBorderHover: 'rgba(255, 255, 255, 0.5)',
    tagBorder: 'rgba(255, 255, 255, 0.5)',
    tagBg: 'rgba(255, 255, 255, 0.1)',
    
    // Map controls
    mapControlBg: '#9fb7b3',
    mapControlColor: '#4B6360',
    mapControlHoverBg: '#4B6360',
    mapControlHoverColor: '#9fb7b3'
};

// Define all tabs and their styling
const TABS_CONFIG = {
    'Portfolio Companies': {
        color: '#006FFF', // Blue
        strokeColor: '#2E5BBA',
        strokeWidth: 0,
        opacity: 0.5,
        strokeOpacity: 0.9,
        radius: 5
    },
    'Direct Investments': {
        color: '#9B59B6', // Purple
        strokeColor: '#8E44AD',
        strokeWidth: 0,
        opacity: 0.8,
        strokeOpacity: 0.9,
        radius: 10
    },
    'General Partner Location': {
        color: '#FFD600', // Yellow
        strokeColor: '#C0392B',
        strokeWidth: 0,
        opacity: 0.7,
        strokeOpacity: 0.9,
        radius: 10
    },
    'Collective Locations': {
        color: '#03B570', // Teal
        strokeColor: '#03B570',
        strokeWidth: 5,
        opacity: 1,
        strokeOpacity: 1,
        radius: 2
    },
    'Allocator LPs': {
        color: '#ED5FAB', 
        strokeColor: '#ED5FAB',
        strokeWidth: 1.5,
        opacity: 0.3,
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
    'points-collective-locations-shadow': 45, // Shadow layer beneath collective points
    'points-collective-locations-small-circle': 47, // Small black circle beneath collective points
    'points-collective-locations': 50
};

// DOM elements
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebarContent');
const closeSidebarBtn = document.getElementById('closeSidebar');

