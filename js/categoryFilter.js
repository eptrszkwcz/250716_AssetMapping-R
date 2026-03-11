// Filter all Points - Category multi-select (show/hide point layers by category)
// =============================================================================

const CATEGORY_OPTIONS = [
    'Collective Global',
    'Allocator Partner',
    "Collective's Direct Investment",
    'Partner Venture Manager',
    'Underlying Portfolio Company'
];

const CATEGORY_TO_LAYERS = {
    'Collective Global': ['points-collective-locations-shadow', 'points-collective-locations-small-circle', 'points-collective-locations'],
    'Allocator Partner': ['points-allocator-lps'],
    "Collective's Direct Investment": ['points-direct-investments'],
    'Partner Venture Manager': ['points-general-partner-location'],
    'Underlying Portfolio Company': ['points-portfolio-companies']
};

/** Connection line layer id -> [category1, category2] (both must be selected to show the line) */
const CONNECTION_LAYER_TO_CATEGORIES = {
    'connection-lines': ['Allocator Partner', 'Collective Global'],
    'connection-lines-hover': ['Allocator Partner', 'Collective Global'],
    'portfolio-connection-lines': ['Underlying Portfolio Company', 'Partner Venture Manager'],
    'portfolio-connection-lines-hover': ['Underlying Portfolio Company', 'Partner Venture Manager'],
    'collective-gp-connection-lines': ['Collective Global', 'Partner Venture Manager'],
    'collective-gp-connection-lines-hover': ['Collective Global', 'Partner Venture Manager'],
    'direct-investment-connection-lines': ["Collective's Direct Investment", 'Collective Global']
};

let categoryFilterState = [];

function applyCategoryFilter() {
    if (!map) return;
    const selected = categoryFilterState;
    CATEGORY_OPTIONS.forEach(displayName => {
        const visible = selected.length === 0 ? false : selected.includes(displayName);
        const layerIds = CATEGORY_TO_LAYERS[displayName];
        if (layerIds) {
            layerIds.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
                }
            });
        }
    });
    Object.entries(CONNECTION_LAYER_TO_CATEGORIES).forEach(([connectionLayerId, categories]) => {
        if (map.getLayer(connectionLayerId)) {
            const bothSelected = selected.length > 0 && categories.every(cat => selected.includes(cat));
            map.setLayoutProperty(connectionLayerId, 'visibility', bothSelected ? 'visible' : 'none');
        }
    });
}

function initCategoryFilter() {
    const block = document.querySelector('.filter-panel-all-points .filter-block[data-filter-id="category"]');
    if (!block) return;
    const optionsEl = block.querySelector('.filter-multiselect-options');
    if (!optionsEl) return;
    optionsEl.innerHTML = '';
    categoryFilterState = CATEGORY_OPTIONS.slice();
    CATEGORY_OPTIONS.forEach(option => {
        const id = `filter-category-${option.replace(/\s+/g, '-').replace(/'/g, '')}`;
        const label = document.createElement('label');
        label.className = 'filter-multiselect-option';
        label.setAttribute('for', id);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.value = option;
        input.checked = true;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        optionsEl.appendChild(label);
    });
    const selectAllBtn = block.querySelector('.filter-multiselect-select-all');
    const unselectAllBtn = block.querySelector('.filter-multiselect-unselect-all');
    const inputs = optionsEl.querySelectorAll('input[type="checkbox"]');
    function updateState() {
        categoryFilterState = Array.from(inputs).filter(i => i.checked).map(i => i.value);
        applyCategoryFilter();
    }
    selectAllBtn.addEventListener('click', () => {
        inputs.forEach(i => { i.checked = true; });
        updateState();
    });
    unselectAllBtn.addEventListener('click', () => {
        inputs.forEach(i => { i.checked = false; });
        updateState();
    });
    inputs.forEach(input => input.addEventListener('change', updateState));
    applyCategoryFilter();
}
