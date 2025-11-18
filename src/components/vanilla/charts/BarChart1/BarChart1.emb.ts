import { OrderBy, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
    name: 'BarChart1',
    label: 'Bar chart (dynamic axis)',
    classNames: ['inside-card'],
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset',
            description: 'Dataset',
            defaultValue: false,
            category: 'Chart data',
        },
        {
            name: 'xAxis',
            type: 'string',
            label: 'X-Axis',
            config: {
                dataset: 'ds',
            },
            category: 'Chart data',
        },
        {
            name: 'metrics',
            type: 'dimensionOrMeasure',
            array: true,
            label: 'Metrics',
            config: {
                dataset: 'ds',
            },
            category: 'Chart data',
        },
        {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
        },
        {
            name: 'KPIvalue',
            type: 'string',
            label: 'KPI value',
            description: 'The kpi to display',
            category: 'Configure chart'
        },
        {
            name: 'InstoreDuration',
            type: 'boolean',
            label: 'Instore Duration',
            description: 'First Bar Chart',
            category: 'Configure chart'
        },

        {
            name: 'InstoreDuration2',
            type: 'boolean',
            label: 'Instore Duration2',
            description: 'Second Bar Chart',
            category: 'Configure chart'
        },
        {
            name: 'Overview',
            type: 'boolean',
            label: 'Overview',
            description: 'overview',
            category: 'Configure chart'
        },
        {
            name: 'Master',
            type: 'boolean',
            label: 'Master',
            description: 'Master',
            category: 'Configure chart'
        },
        {
            name: 'MasterLines',
            type: 'boolean',
            label: 'Master Lines',
            description: 'Master Lines',
            category: 'Configure chart'
        },
        {
            name: 'MasterRetail',
            type: 'boolean',
            label: 'Master Retail',
            description: 'Master Retail',
            defaultValue: false,
            category: 'Configure chart'
        },
        {
            name: 'displayYaxis',
            type: 'boolean',
            label: 'display Y-axis',
            defaultValue: 'true',
            category: 'Chart settings',
        },
        {
            name: 'displayXaxis',
            type: 'boolean',
            label: 'display X-axis',
            defaultValue: 'true',
            category: 'Chart settings',
        },

        {
            name: 'sortBy',
            type: 'string',
            label: 'Sort by (optional)',
            config: {
                dataset: 'ds',
            },
            category: 'Chart data',
        },
        {
            name: 'limit',
            type: 'number',
            label: 'Limit results',
            category: 'Chart data',
        },
        {
            name: 'lineMetrics',
            type: 'dimensionOrMeasure',
            array: true,
            label: 'Add a line(s)',
            config: {
                dataset: 'ds',
            },
            category: 'Optional chart data',
        },
        {
            name: 'showSecondYAxis',
            type: 'boolean',
            label: 'Show 2nd axis',
            category: 'Optional chart data',
            defaultValue: false,
        },
        {
            name: 'secondAxisTitle',
            type: 'string',
            label: '2nd axis title',
            description: 'The title for the chart',
            category: 'Optional chart data',
        },
        {
            name: 'title',
            type: 'string',
            label: 'Title',
            description: 'The title for the chart',
            category: 'Chart settings',
        },
        {
            name: 'description',
            type: 'string',
            label: 'Description',
            description: 'The description for the chart',
            category: 'Chart settings',
        },
        {
            name: 'showLegend',
            type: 'boolean',
            label: 'Show Legend',
            category: 'Chart settings',
            defaultValue: true,
        },
        {
            name: 'showLabels',
            type: 'boolean',
            label: 'Show Labels',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'displayHorizontally',
            type: 'boolean',
            label: 'Display Horizontally',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'stackMetrics',
            type: 'boolean',
            label: 'Stack Metrics',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'PercentageSign',
            type: 'boolean',
            label: 'Show Percentage Sign',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'TrolleyUsage',
            type: 'boolean',
            label: 'Trolley Usage',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'Profitability',
            type: 'boolean',
            label: 'Profitability',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'Profitability2',
            type: 'boolean',
            label: 'Profitability2',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'Despar',
            type: 'boolean',
            label: 'Despar',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'GeneralKPIs',
            type: 'boolean',
            label: 'GeneralKPIs',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'MarketingActivities',
            type: 'boolean',
            label: 'MarketingActivities',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'AbsolutePercentage',
            type: 'boolean',
            label: 'Absolute Percentage',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'reverseXAxis',
            type: 'boolean',
            label: 'Reverse X Axis',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'sortDirection',
            type: 'string',
            label: 'Sort direction',
            category: 'Chart data',
            defaultValue: 'asc',
        },

        {
            name: 'xAxisTitle',
            type: 'string',
            label: 'X-Axis Title',
            category: 'Chart settings',
        },
        {
            name: 'yAxisTitle',
            type: 'string',
            label: 'Y-Axis Title',
            category: 'Chart settings',
        },
        {
            name: 'filter',
            type: 'dimension', 
            label: 'Filter',
            config: {
                dataset: 'ds', 
            }
        },
        {
            name: 'filterValue',
            type: 'string', 
            label: 'Filter Value',
            config: {
                dataset: 'ds', 
            },
            array: true
        },
        
        {
            name: 'dps',
            type: 'number',
            label: 'Decimal Places',
            category: 'Formatting',
        },
        {
            name: 'enableDownloadAsCSV',
            type: 'boolean',
            label: 'Show download as CSV',
            category: 'Export options',
            defaultValue: true,
        },
        {
            name: 'enableDownloadAsPNG',
            type: 'boolean',
            label: 'Show download as PNG',
            category: 'Export options',
            defaultValue: true,
        },
    ],
} as const satisfies EmbeddedComponentMeta;

// Helper function to build filters only if the value is present
const buildFilter = (dimension: string | undefined, value: string[] | undefined) => {
    if (dimension && value && value.length > 0) {
        return [
            {
                property: dimension,
                operator: "equals",
                value: value, // <— no nested array
            }
        ];
    }
    return [];
};



export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        const orderProp: OrderBy[] = [];

        if (inputs.sortBy) {
            orderProp.push({
                property: asMeasure(inputs.sortBy),
                direction: inputs.sortDirection === 'desc' ? 'desc' : 'asc',
            });
        } else if (inputs.limit && inputs.metrics?.length) {
            orderProp.push({
                property: inputs.metrics[0],
                direction: 'desc',
            });
        }

        // Split lineMetrics into dimensions and measures
        const lineDimensions = (inputs.lineMetrics || []).filter(
            (item) => item?.__type__ === 'dimension'
        );
        const lineMeasures = (inputs.lineMetrics || []).filter(
            (item) => item?.__type__ !== 'dimension'
        );

        // Split metrics into dimensions and measures
        const metricDimensions = (inputs.metrics || []).filter(
            (item) => item?.__type__ === 'dimension'
        );
        const metricMeasures = (inputs.metrics || []).filter(
            (item) => item?.__type__ !== 'dimension'
        );

        // Transform xAxis if MarketingActivities is true
        let xAxisName = inputs.xAxis;
        if (inputs.MarketingActivities) {
            const xAxisTransformMap: Record<string, string> = {
                Other: 'big_dm.activity_4',
                Discount: 'big_dm.activity_1',
                'Second placement': 'big_dm.activity_2',
                'Regal Wochen': 'big_dm.activity_3',
                'Design Edition': 'big_dm.activity_5',
            };
            xAxisName = xAxisTransformMap[inputs.xAxis] ?? inputs.xAxis;
        }

        return {
            ...inputs,
            reverseXAxis: inputs.reverseXAxis,
            results: loadData({
                from: inputs.ds,
                dimensions: [
                    asDimension(xAxisName),
                    ...lineDimensions.map(asDimension),
                    ...metricDimensions.map(asDimension),
                ],
                measures: [...metricMeasures.map(asMeasure), ...lineMeasures.map(asMeasure)],
                filters: buildFilter(inputs.filter, inputs.filterValue),
                orderBy: orderProp,
                limit: inputs.limit || 50,
            }),
        };
    },
});

// Helper functions
function asDimension(value: string | any): any {
    return typeof value === 'string'
        ? { name: value, __type__: 'dimension' }
        : value;
}

function asMeasure(value: string | any): any {
    return typeof value === 'string'
        ? { name: value, __type__: 'dimensionOrMeasure' }
        : value;
}
