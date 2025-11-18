import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { Dataset, loadData } from '@embeddable.com/core';
import Component from './index';

export const meta = {
    name: 'Heatmap_settings',
    label: 'Heatmap with settings',
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
            type: 'string', // Now a plain string instead of a dimension selector
            label: 'xDim (as string)',
            category: 'Configure chart',
            defaultValue: 'impressions.hour'
        },
        {
            name: 'yDim',
            type: 'string', // Now a plain string instead of a dimension selector
            label: 'yDim (as string)',
            category: 'Configure chart',
            defaultValue: 'impressions.month'
        },
        {
            name: 'valueMeasure',
            type: 'string',
            label: 'valueMeasure (as string)',
            config: {
                dataset: 'ds'
            },
            category: 'Configure chart',
            defaultValue: 'impressions.impression_unfiltered_calculation'
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
            defaultValue: 'false'
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
            name: 'title',  // Updated to allow multiple values
            type: 'string',
            label: 'Title',  // Plural for multiple values
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

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs,
            results: loadData({
                from: inputs.ds,
                dimensions: [asDimension(inputs.xDim), asDimension(inputs.yDim)], // Convert the slice to a dimension
                measures: [asMeasure(inputs.valueMeasure)]
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
