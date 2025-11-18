import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { Dataset, Dimension, Measure, loadData } from '@embeddable.com/core';

import Component from './index'; // Import your matrix chart component

export const meta = {
    name: 'Matrix',
    label: 'Matrix Chart',
    classNames: ['add-border'],
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset to display',
            category: 'Configure chart',
        },
        {
            name: 'xMeasures',
            type: 'measure',
            label: 'X Axis Measure',
            config: {
                dataset: 'ds',
            },
            category: 'Configure chart',
            array: true
        },
        {
            name: 'yMeasures',
            type: 'measure',
            label: 'Y Axis Measure',
            config: {
                dataset: 'ds',
            },
            category: 'Configure chart',
            array: true
        },
        {
            name: 'matrixValue',
            type: 'dimension',
            label: 'Matrix Values (Dimension)',
            config: {
                dataset: 'ds',
            },
            category: 'Configure chart',
        },
        {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
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
            name: 'MatrixKPIvalue',
            type: 'string',
            label: 'KPI value',
            category: 'Chart settings',
        },
        {
            name: 'Despar',
            type: 'boolean',
            label: 'Despar',
            category: 'Chart settings',
            defaultValue: false,
        },
        {
            name: 'xAxisKPI',
            type: 'string',
            label: 'xAxis KPI value',
            category: 'Chart settings',
        },
        {
            name: 'yAxisKPI',
            type: 'string',
            label: 'yAxis KPI value',
            category: 'Chart settings',
        },
        {
            name: 'title',
            type: 'string',
            label: 'Title text',
        },
        {
            name: 'MasterRetail',
            type: 'boolean',
            label: 'Master Retail',
            category: 'Chart settings',
            defaultValue: false
        },
        {
            name: 'RetailOptimization',
            type: 'boolean',
            label: 'Retail Optimization',
            category: 'Chart settings',
            defaultValue: false
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

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs,
            results: loadData({
                from: inputs.ds,
                dimensions: [inputs.matrixValue],
                measures: [...inputs.xMeasures, ...inputs.yMeasures],
            }),
        };
    },
});
