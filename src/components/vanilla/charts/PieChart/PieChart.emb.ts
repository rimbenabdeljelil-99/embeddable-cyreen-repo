import { Value, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
  name: 'PieChart',
  label: 'Pie chart',
  classNames: ['inside-card'],
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset to display',
      category: 'Chart data',
    },
    {
      name: 'slice',
      type: 'dimension',
      label: 'Slice',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'metrics',
      type: 'measure',
      label: 'Metric',
      config: {
        dataset: 'ds',
      },
      array: true,
      category: 'Chart data',
    },
    {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
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
      label: 'Turn on the legend',
      defaultValue: true,
      category: 'Chart settings',
    },
    {
      name: 'maxSegments',
      type: 'number',
      label: 'Max Legend items',
      defaultValue: 8,
      category: 'Chart settings',
    },
    {
      name: 'showLabels',
      type: 'boolean',
      label: 'Show Labels',
      defaultValue: false,
      category: 'Chart settings',
    },
    {
      name: 'AbsolutePercentage',
      type: 'boolean',
      label: 'Absolute/Percentage',
      description: 'Absolute/Percentage',
      category: 'Configure chart',
      defaultValue: false
    },
    {
      name: 'Despar',
      type: 'boolean',
      label: 'Despar',
      category: 'Chart settings',
      defaultValue: false,
    },

    {
      name: 'displayAsPercentage',
      type: 'boolean',
      label: 'Display as Percentages',
      defaultValue: false,
      category: 'Chart settings',
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
  events: [
    {
      name: 'onClick',
      label: 'Click',
      properties: [
        {
          name: 'slice',
          type: 'string',
        },
        {
          name: 'metric',
          type: 'number',
        },
      ],
    },
  ],
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>) => {
    return {
      ...inputs,
      results: loadData({
        from: inputs.ds,
        dimensions: [inputs.slice],
        measures: inputs.metrics,
      }),
    };
  },
  events: {
    onClick: (value) => {
      return {
        slice: value.slice || Value.noFilter(),
        metric: value.metric || Value.noFilter(),
      };
    },
  },
});
