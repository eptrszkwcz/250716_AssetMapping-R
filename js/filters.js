// Portfolio Company Filters - state, expression, and UI
// =====================================================

const PORTFOLIO_COMPANIES_LAYER_ID = 'points-portfolio-companies';

let filterState = {
    portfolio: [],
    sector: [],
    valuation: { min: 0, max: null },
    firstFinancingDate: { min: 1999, max: 2026 }
};

function getFilterConfig() {
    return typeof PORTFOLIO_COMPANY_FILTERS !== 'undefined' ? PORTFOLIO_COMPANY_FILTERS : [];
}

function buildFilterExpression() {
    const configs = getFilterConfig();
    const parts = [];

    const portfolioCfg = configs.find(c => c.id === 'portfolio');
    if (portfolioCfg) {
        if (filterState.portfolio.length > 0) {
            parts.push([
                'case',
                ['has', portfolioCfg.column],
                ['in', ['get', portfolioCfg.column], ['literal', filterState.portfolio]],
                true
            ]);
        } else {
            parts.push(['all', ['has', 'id'], ['==', ['get', 'id'], -1]]);
        }
    }

    const sectorCfg = configs.find(c => c.id === 'sector');
    if (sectorCfg) {
        if (filterState.sector.length > 0) {
            parts.push([
                'case',
                ['has', sectorCfg.column],
                ['in', ['get', sectorCfg.column], ['literal', filterState.sector]],
                true
            ]);
        } else {
            parts.push(['all', ['has', 'id'], ['==', ['get', 'id'], -1]]);
        }
    }

    const valuationCfg = configs.find(c => c.id === 'valuation');
    if (valuationCfg) {
        const min = filterState.valuation.min;
        const max = filterState.valuation.max;
        const upperCondition = max === null ? true : ['<=', ['get', valuationCfg.column], max];
        parts.push([
            'case',
            ['has', valuationCfg.column],
            ['all', ['>=', ['get', valuationCfg.column], min], upperCondition],
            true
        ]);
    }

    const yearCfg = configs.find(c => c.id === 'firstFinancingDate');
    if (yearCfg) {
        const yMin = filterState.firstFinancingDate.min;
        const yMax = filterState.firstFinancingDate.max;
        parts.push([
            'case',
            ['has', yearCfg.column],
            ['all',
                ['>=', ['get', yearCfg.column], yMin],
                ['<=', ['get', yearCfg.column], yMax]
            ],
            true
        ]);
    }

    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0];
    return ['all', ...parts];
}

function applyFilter() {
    if (!map || !map.getLayer(PORTFOLIO_COMPANIES_LAYER_ID)) return;
    const expr = buildFilterExpression();
    map.setFilter(PORTFOLIO_COMPANIES_LAYER_ID, expr === null ? ['has', 'id'] : expr);
}

function setStateFromMultiselect(filterId, selectedValues) {
    if (filterId === 'portfolio') filterState.portfolio = selectedValues;
    else if (filterId === 'sector') filterState.sector = selectedValues;
    applyFilter();
}

function setStateFromSlider(filterId, min, max) {
    if (filterId === 'valuation') {
        filterState.valuation = { min, max };
    } else if (filterId === 'firstFinancingDate') {
        filterState.firstFinancingDate = { min, max };
    }
    applyFilter();
}

function initMultiselect(block, config) {
    const optionsEl = block.querySelector('.filter-multiselect-options');
    if (!optionsEl) return;
    optionsEl.innerHTML = '';
    config.options.forEach(option => {
        const id = `filter-${config.id}-${option.replace(/\s+/g, '-')}`;
        const label = document.createElement('label');
        label.className = 'filter-multiselect-option';
        label.setAttribute('for', id);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.value = option;
        input.checked = true;
        input.dataset.filterId = config.id;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        optionsEl.appendChild(label);
    });

    const selectAllBtn = block.querySelector('.filter-multiselect-select-all');
    const unselectAllBtn = block.querySelector('.filter-multiselect-unselect-all');
    const inputs = optionsEl.querySelectorAll('input[type="checkbox"]');

    function getSelected() {
        return Array.from(inputs).filter(i => i.checked).map(i => i.value);
    }
    function updateState() {
        if (config.id === 'portfolio') filterState.portfolio = getSelected();
        else if (config.id === 'sector') filterState.sector = getSelected();
        applyFilter();
    }

    selectAllBtn.addEventListener('click', () => {
        inputs.forEach(i => { i.checked = true; });
        updateState();
    });
    unselectAllBtn.addEventListener('click', () => {
        inputs.forEach(i => { i.checked = false; });
        updateState();
    });
    inputs.forEach(input => {
        input.addEventListener('change', updateState);
    });

    filterState[config.id] = config.options.slice();
}

function initSlider(block, config) {
    const minInput = block.querySelector('.filter-slider-input-min');
    const maxInput = block.querySelector('.filter-slider-input-max');
    const valuesEl = block.querySelector('.filter-slider-values');
    if (!minInput || !maxInput) return;

    const isValuation = config.id === 'valuation';
    const maxVal = config.max;

    function clampMinMax() {
        let min = parseInt(minInput.value, 10);
        let max = parseInt(maxInput.value, 10);
        if (min > max) {
            minInput.value = max;
            maxInput.value = min;
            min = parseInt(minInput.value, 10);
            max = parseInt(maxInput.value, 10);
        }
        return { min, max };
    }

    function updateDisplay() {
        const { min, max } = clampMinMax();
        if (valuesEl) {
            if (isValuation && max >= maxVal) {
                valuesEl.textContent = `${min} – ${config.noUpperLimitLabel || '1000+'}`;
            } else {
                valuesEl.textContent = `${min} – ${max}`;
            }
        }
        setStateFromSlider(config.id, min, isValuation && max >= maxVal ? null : max);
    }

    minInput.addEventListener('input', () => {
        const min = parseInt(minInput.value, 10);
        if (parseInt(maxInput.value, 10) < min) maxInput.value = min;
        updateDisplay();
    });
    maxInput.addEventListener('input', () => {
        const max = parseInt(maxInput.value, 10);
        if (parseInt(minInput.value, 10) > max) minInput.value = max;
        updateDisplay();
    });
    updateDisplay();
}

function reapplyPortfolioCompanyFilter() {
    applyFilter();
}

function initPortfolioCompanyFilters() {
    const configs = getFilterConfig();
    if (!configs.length) return;

    configs.forEach(config => {
        const block = document.querySelector(`.filter-block[data-filter-id="${config.id}"]`);
        if (!block) return;
        if (config.type === 'multiselect') {
            initMultiselect(block, config);
        } else if (config.type === 'slider') {
            initSlider(block, config);
        }
    });

    applyFilter();
}
