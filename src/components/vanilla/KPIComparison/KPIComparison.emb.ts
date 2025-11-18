// src/components/KPIChart/KPIChart.emb.ts
 
import { EmbeddedComponentMeta, defineComponent, Inputs } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';
 
export const meta = {
    name: 'KPIComparison', // an identifier - must match KPIChart.emb.ts
    label: 'KPI Comparison', // user-facing name in the builder
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
            name: 'ds2',
            type: 'dataset', // shows a dropdown of available datasets. These are created directly in the Builder.
            label: 'Dataset2',
        },
        {
            name: 'ds3',
            type: 'dataset', // shows a dropdown of available datasets. These are created directly in the Builder.
            label: 'Dataset3',
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
            name: 'metrics2',
            type: 'measure', // shows a dropdown of measures (defined in your data models)
            label: 'KPIs2',
            array: true, // allows multiple measures to be selected
            config: {
                dataset: 'ds2', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'metrics3',
            type: 'measure', // shows a dropdown of measures (defined in your data models)
            label: 'KPIs3',
            array: true, // allows multiple measures to be selected
            config: {
                dataset: 'ds3', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'filter',
            type: 'dimension', // shows a dropdown of measures (defined in your data models)
            label: 'Filter',
            config: {
                dataset: 'ds', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'filter2',
            type: 'dimension', // shows a dropdown of measures (defined in your data models)
            label: 'Filter2',
            config: {
                dataset: 'ds2', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'filter3',
            type: 'dimension', // shows a dropdown of measures (defined in your data models)
            label: 'Filter3',
            config: {
                dataset: 'ds3', // restricts measure options to the selected dataset
            }
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
            name: 'Period',
            type: 'dimension',
            label: 'Period',
            config: {
                dataset: 'ds', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'Period2',
            type: 'dimension',
            label: 'Period2',
            config: {
                dataset: 'ds2', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'Period3',
            type: 'dimension',
            label: 'Period3',
            config: {
                dataset: 'ds3', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'Zone1Filter',
            type: 'string',
            label: 'Zone1Filter',
            config: {
                dataset: 'ds', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'Zone2Filter',
            type: 'string',
            label: 'Zone2Filter',
            config: {
                dataset: 'ds', // restricts measure options to the selected dataset
            }
        },
        {
            name: 'primaryRange',
            type: 'timeRange',
            label: 'primaryRange',
            defaultValue: { relativeTimeString: 'This Month' },
            category: 'Chart settings',
        },
       
        {
            name: 'comparisonRange',
            type: 'timeRange',
            label: 'comparisonRange',
            defaultValue: { relativeTimeString: 'Last Month' },
            category: 'Chart settings',
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
 
// Helper function to build filters only if the value is present
const buildFilter = (dimension: string | undefined, value: string | undefined) => {
    if (dimension && value) {
        return [
            {
                property: dimension,
                operator: "equals",
                value: [value],
            }
        ];
    }
    return [];
};

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        const primaryData = loadData({
            from: inputs.ds,
            filters: buildFilter(inputs.filter, inputs.Zone1Filter),
            measures: inputs.metrics,
            timeDimensions: [
                {
                    dimension: inputs.Period?.name,
                    dateRange: inputs.primaryRange
                        ? [inputs.primaryRange.from, inputs.primaryRange.to]
                        : undefined,
                },
            ],
        });

        const comparisonData = loadData({
            from: inputs.ds,
            filters: buildFilter(inputs.filter, inputs.Zone2Filter),
            measures: inputs.metrics,
            timeDimensions: [
                {
                    dimension: inputs.Period?.name,
                    dateRange: inputs.comparisonRange
                        ? [inputs.comparisonRange.from, inputs.comparisonRange.to]
                        : undefined,
                },
            ],
        });

        const primaryData2 = loadData({
            from: inputs.ds2,
            filters: buildFilter(inputs.filter2, inputs.Zone1Filter),
            measures: inputs.metrics2,
            timeDimensions: [
                {
                    dimension: inputs.Period2?.name,
                    dateRange: inputs.primaryRange
                        ? [inputs.primaryRange.from, inputs.primaryRange.to]
                        : undefined,
                },
            ],
        });

        const comparisonData2 = loadData({
            from: inputs.ds2,
            filters: buildFilter(inputs.filter2, inputs.Zone2Filter),
            measures: inputs.metrics2,
            timeDimensions: [
                {
                    dimension: inputs.Period2?.name,
                    dateRange: inputs.comparisonRange
                        ? [inputs.comparisonRange.from, inputs.comparisonRange.to]
                        : undefined,
                },
            ],
        });

        const primaryData3 = loadData({
            from: inputs.ds3,
            filters: buildFilter(inputs.filter3, inputs.Zone1Filter),
            measures: inputs.metrics3,
            timeDimensions: [
                {
                    dimension: inputs.Period3?.name,
                    dateRange: inputs.primaryRange
                        ? [inputs.primaryRange.from, inputs.primaryRange.to]
                        : undefined,
                },
            ],
        });

        const comparisonData3 = loadData({
            from: inputs.ds3,
            filters: buildFilter(inputs.filter3, inputs.Zone2Filter),
            measures: inputs.metrics3,
            timeDimensions: [
                {
                    dimension: inputs.Period3?.name,
                    dateRange: inputs.comparisonRange
                        ? [inputs.comparisonRange.from, inputs.comparisonRange.to]
                        : undefined,
                },
            ],
        });

        return {
            ...inputs,
            primaryResults: primaryData,
            comparisonResults: comparisonData,
            primaryResults2: primaryData2,
            comparisonResults2: comparisonData2,
            primaryResults3: primaryData3,
            comparisonResults3: comparisonData3,
        };
    },
});
