import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { Dataset, loadData, OrderBy } from '@embeddable.com/core';
import Component from './index';

export const meta = {
    name: 'GenderMap',
    label: 'Gender Map',
    classNames: ['add-border'],
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset to display',
            category: 'Configure chart'
        },
        {
            name: 'xDim',
            type: 'dimension',
            label: 'xDim (dimension)',
            category: 'Configure chart',
            config: { dataset: 'ds' },
            defaultValue: 'fact_line_crossings.hour_of_day'
        },
        {
            name: 'yDim',
            type: 'dimension',
            label: 'yDim (dimension)',
            config: { dataset: 'ds' },
            category: 'Configure chart',
        },
        {
            name: 'valueMeasures',
            type: 'measure',
            label: 'valueMeasure (Measure)',
            config: { dataset: 'ds' },
            array: true,
            category: 'Configure chart',
        },
        {
            name: 'sortBy',
            type: 'dimension',
            label: 'Sort by (optional)',
            config: { dataset: 'ds' },
            category: 'Configure chart',
        },
        {
            name: 'AbsolutePercentage',
            type: 'boolean',
            label: 'Absolute/Percentage',
            description: 'Absolute/Percentage',
            category: 'Configure chart',
            defaultValue: false,
        },
        {
            name: 'InstoreDurationUnimarc',
            type: 'boolean',
            label: 'Instore Duration Unimarc',
            description: 'Instore Duration Unimarc',
            category: 'Configure chart',
        },
        {
            name: 'InstoreDurationEdeka',
            type: 'boolean',
            label: 'Instore Duration Edeka',
            description: 'Instore Duration Edeka',
            category: 'Configure chart',
            defaultValue: false,
        },
        {
            name: 'edeka',
            type: 'boolean',
            label: 'Edeka',
            description: 'Edeka',
            category: 'Configure chart',
        },
        {
            name: 'Despar',
            type: 'boolean',
            label: 'Despar',
            category: 'Chart settings',
            defaultValue: false,
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
            description: 'KPI value',
            category: 'Configure chart',
        },
        {
            name: 'title',
            type: 'string',
            label: 'Title',
            config: { dataset: 'ds' },
            category: 'Configure chart'
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
        }
    ]
} as const satisfies EmbeddedComponentMeta;

// Helper function for sorting configuration
const buildSortConfig = (sortBy: string | undefined): OrderBy[] => {
    if (!sortBy) return [];

    // Handle special month sorting logic
    const sortProperty =
        sortBy === 'fact_line_crossings.month_name'
            ? 'fact_line_crossings.month_number'
            : sortBy;

    return [
        {
            property: sortProperty,
            direction: 'asc'
        }
    ];
};

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        const orderBy = buildSortConfig(inputs.sortBy);

        return {
            ...inputs,
            results: loadData({
                from: inputs.ds,
                dimensions: [inputs.xDim, inputs.yDim],
                measures: inputs.valueMeasures,
                orderBy
            })
        };
    }
});

// Helper function to wrap a string as a dimension object
function asDimension(Dim: string | any): any {
    return typeof Dim === 'string' ? { name: Dim, __type__: 'dimension' } : Dim;
}

function asMeasure(valueMeasure: string | any): any {
    return typeof valueMeasure === 'string' ? { name: valueMeasure, __type__: 'measure' } : valueMeasure;
}
