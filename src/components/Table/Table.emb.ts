import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { Dataset, Dimension, Measure, loadData } from '@embeddable.com/core';
import TableComponent from './index';

export const meta = {
    name: 'Table',
    label: 'Red Table',
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset to display',
            category: 'Configure table'
        },
        {
            name: 'column1',
            type: 'dimension', // First column is dimension
            label: 'Column 1',
            config: { dataset: 'ds' },
            category: 'Configure table'
        },
        {
            name: 'column2',
            type: 'measure', // Second column is measure
            label: 'Column 2',
            config: { dataset: 'ds' },
            category: 'Configure table'
        },
        {
            name: 'column3',
            type: 'measure', // Third column is measure
            label: 'Column 3',
            config: { dataset: 'ds' },
            category: 'Configure table'
        },
        {
            name: 'column4',
            type: 'measure', // Fourth column is measure
            label: 'Column 4',
            config: { dataset: 'ds' },
            category: 'Configure table'
        },
        {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
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
            name: 'title',
            type: 'string',
            label: 'Title text',
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

export default defineComponent(TableComponent, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        // Always include the first column (dimension)
        const dimensions: Dimension[] = [inputs.column1];

        // Collect only the measures that are defined
        const measures: Measure[] = [inputs.column2, inputs.column3, inputs.column4].filter(Boolean);

        return {
            ...inputs,
            columns: [...dimensions, ...measures], // Combine dimension and available measures
            results: loadData({
                from: inputs.ds,
                dimensions,
                measures
            })
        };
    }
});
