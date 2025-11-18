import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { Dataset, Dimension, Measure, loadData } from '@embeddable.com/core';
import Component from './index';

export const meta = {
    name: 'GeoMap',
    label: 'Geo Scatter Chart',
    classNames: ['inside-card-map'],
    category: 'Cyreen Components',

    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset to display',
            category: 'Configure chart'
        },
        {
            name: 'latDim',
            type: 'dimension',
            label: 'Latitude',
            config: { dataset: 'ds' },
            category: 'Configure chart'
        },
        {
            name: 'lonDim',
            type: 'dimension',
            label: 'Longitude',
            config: { dataset: 'ds' },
            category: 'Configure chart'
        },
        {
            name: 'valueMetric1',  // Updated to allow multiple values
            type: 'dimension',
            label: 'Value Metric 1',  // Plural for multiple values
            config: { dataset: 'ds' },
            category: 'Configure chart'
        },

        {
            name: 'valueMetric2',  // Updated to allow multiple values
            type: 'measure',
            label: 'Value Metric 2',  // Plural for multiple values
            config: { dataset: 'ds' },
            category: 'Configure chart'
        },
        {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
        },
        {
            name: 'title',  // Updated to allow multiple values
            type: 'string',
            label: 'Title',  // Plural for multiple values
            config: { dataset: 'ds' },
            category: 'Configure chart'
        },
        {
            name: 'showLabels',
            type: 'boolean',
            label: 'Show Labels',
            category: 'Chart settings',
            defaultValue: true,
        },
        {
            name: 'Despar',
            type: 'boolean',
            label: 'Despar',
            category: 'Chart settings',
            defaultValue: false,
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
    ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs,
            results: loadData({
                from: inputs.ds,
                dimensions: [
                    inputs.latDim,
                    inputs.lonDim,
                    inputs.valueMetric1 // Spread to handle multiple value metrics
                ],
                measures: [inputs.valueMetric2]

            })
        };
    }
});
