// src/components/KPIChart/KPIChart.emb.ts

import { EmbeddedComponentMeta, defineComponent, Inputs } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';

export const meta = {
    name: 'KPIChartTrolleyUsage', // an identifier - must match KPIChart.emb.ts
    label: 'KPI Chart Trolley Usage', // user-facing name in the builder 
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'title',
            type: 'string',
            label: 'Title text',
        },
        {
            name: 'ds',
            type: 'dataset', // shows a dropdown of available datasets. These are created directly in the Builder.
            label: 'Dataset',
        },
        {
            name: 'metrics',
            type: 'measure', // shows a dropdown of measures (defined in your data models)
            label: 'KPIs',
            array: true, // allows multiple measures to be selected
            config: {
                dataset: 'ds', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'enableDownloadAsCSV',
            type: 'boolean',
            label: 'Show download as CSV',
            category: 'Export options',
            defaultValue: true,
        },
        {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
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

//The function that tells the SDK to include this component in the no-code builder.
export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
        return {
            ...inputs, // the inputs are passed through to the component as props
            results: loadData({ // fetches data from your database and passes it to your component
                from: inputs.ds,
                measures: inputs.metrics, // now supports multiple measures
            }),
            clientContext
        };
    }
});
