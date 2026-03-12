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

const PORTFOLIO_CONNECTION_LAYER_IDS = ['portfolio-connection-lines', 'portfolio-connection-lines-hover'];

function applyFilter() {
    if (!map || !map.getLayer(PORTFOLIO_COMPANIES_LAYER_ID)) return;
    const expr = buildFilterExpression();
    const filterExpr = expr === null ? ['has', 'id'] : expr;
    map.setFilter(PORTFOLIO_COMPANIES_LAYER_ID, filterExpr);
    PORTFOLIO_CONNECTION_LAYER_IDS.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setFilter(layerId, filterExpr);
        }
    });
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
    const dualTrack = block.querySelector('.filter-slider-dual-track');
    const valuesEl = block.querySelector('.filter-slider-values');
    if (!dualTrack) return;

    const isValuation = config.id === 'valuation';
    const range = config.max - config.min;
    const step = config.step || 1;

    const trackEl = document.createElement('div');
    trackEl.className = 'filter-slider-track';
    const fillEl = document.createElement('div');
    fillEl.className = 'filter-slider-track-fill';
    const thumbMin = document.createElement('button');
    thumbMin.type = 'button';
    thumbMin.className = 'filter-slider-thumb';
    thumbMin.setAttribute('data-thumb', 'min');
    thumbMin.setAttribute('aria-valuemin', config.min);
    thumbMin.setAttribute('aria-valuemax', config.max);
    thumbMin.setAttribute('aria-label', 'Minimum value');
    const thumbMax = document.createElement('button');
    thumbMax.type = 'button';
    thumbMax.className = 'filter-slider-thumb';
    thumbMax.setAttribute('data-thumb', 'max');
    thumbMax.setAttribute('aria-valuemin', config.min);
    thumbMax.setAttribute('aria-valuemax', config.max);
    thumbMax.setAttribute('aria-label', 'Maximum value');
    trackEl.appendChild(fillEl);
    trackEl.appendChild(thumbMin);
    trackEl.appendChild(thumbMax);
    dualTrack.appendChild(trackEl);

    let minVal = config.min;
    let maxVal = config.max;
    let draggingThumb = null;

    function valueToPct(value) {
        return ((value - config.min) / range) * 100;
    }

    function snapToStep(value) {
        const n = Math.round((value - config.min) / step) * step + config.min;
        return Math.max(config.min, Math.min(config.max, n));
    }

    function positionToValue(clientX) {
        const rect = trackEl.getBoundingClientRect();
        const pct = (clientX - rect.left) / rect.width;
        const value = config.min + pct * range;
        return snapToStep(value);
    }

    function updateUI() {
        const minPct = valueToPct(minVal);
        const maxPct = valueToPct(maxVal);
        fillEl.style.left = minPct + '%';
        fillEl.style.width = (maxPct - minPct) + '%';
        thumbMin.style.left = minPct + '%';
        thumbMax.style.left = maxPct + '%';
        thumbMin.setAttribute('aria-valuenow', minVal);
        thumbMax.setAttribute('aria-valuenow', maxVal);
    }

    function updateDisplay() {
        if (valuesEl) {
            if (isValuation && maxVal >= config.max) {
                valuesEl.textContent = minVal + ' – ' + (config.noUpperLimitLabel || '1000+');
            } else {
                valuesEl.textContent = minVal + ' – ' + maxVal;
            }
        }
        setStateFromSlider(config.id, minVal, isValuation && maxVal >= config.max ? null : maxVal);
    }

    function handleMove(e) {
        if (e.cancelable && e.touches) e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const value = positionToValue(clientX);
        if (draggingThumb === 'min') {
            minVal = value;
            if (minVal > maxVal) maxVal = minVal;
        } else {
            maxVal = value;
            if (maxVal < minVal) minVal = maxVal;
        }
        updateUI();
        updateDisplay();
    }

    function handleEnd() {
        draggingThumb = null;
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove, { passive: false });
        document.removeEventListener('touchend', handleEnd);
    }

    function startDrag(which) {
        draggingThumb = which;
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
    }

    function handleKeydown(which, e) {
        const delta = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? step : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -step : 0;
        if (delta === 0) return;
        e.preventDefault();
        if (which === 'min') {
            minVal = snapToStep(minVal + delta);
            minVal = Math.max(config.min, Math.min(maxVal, minVal));
            if (minVal > maxVal) maxVal = minVal;
        } else {
            maxVal = snapToStep(maxVal + delta);
            maxVal = Math.max(minVal, Math.min(config.max, maxVal));
            if (maxVal < minVal) minVal = maxVal;
        }
        updateUI();
        updateDisplay();
    }
    thumbMin.addEventListener('keydown', (e) => handleKeydown('min', e));
    thumbMax.addEventListener('keydown', (e) => handleKeydown('max', e));

    thumbMin.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag('min'); });
    thumbMax.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag('max'); });
    thumbMin.addEventListener('touchstart', (e) => { startDrag('min'); }, { passive: true });
    thumbMax.addEventListener('touchstart', (e) => { startDrag('max'); }, { passive: true });

    updateUI();
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
