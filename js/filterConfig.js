// Filter configuration for Underlying Portfolio Company points
// =============================================================

const PORTFOLIO_COMPANY_FILTERS = [
    {
        id: 'portfolio',
        name: 'Portfolio',
        column: 'Portfolio',
        type: 'multiselect',
        options: ['General Catalyst', 'Drive Capital', 'Second Sight Ventures']
    },
    {
        id: 'sector',
        name: 'Sector',
        column: 'Industry',
        type: 'multiselect',
        options: [
            'AI and ML',
            'Consumer Goods and Services',
            'Healthcare',
            'Climate and Energy',
            'Manufacturing',
            'Cybersecurity',
            'Fintech',
            'Consumer Products and Services',
            'Business Products',
            'Information Technology',
            'Energy',
            'Financial Services',
            'Consumer Products',
            'Health & Wellness',
            'Food and Beverage'
        ]
    },
    {
        id: 'valuation',
        name: 'Valuation',
        column: 'ValuationNum',
        type: 'slider',
        min: 0,
        max: 1000,
        step: 50,
        noUpperLimitLabel: '1000+'
    },
    {
        id: 'firstFinancingDate',
        name: 'First Financing Date',
        column: 'FirstFinancingYear',
        type: 'slider',
        min: 1999,
        max: 2026,
        step: 1
    }
];
