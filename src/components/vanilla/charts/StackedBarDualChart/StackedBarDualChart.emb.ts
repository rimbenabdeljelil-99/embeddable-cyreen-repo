import { OrderBy, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
  name: 'StackedBarDualChart',
  label: 'Grouped dual bar chart',
  classNames: ['inside-card'],
  category: 'Embeddable Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset to display',
      category: 'Chart data',
    },
    {
      name: 'xAxis',
      type: 'dimension',
      label: 'X-Axis',
      config: { dataset: 'ds' },
      category: 'Chart data',
    },
    {
      name: 'segment',
      type: 'dimension',
      label: 'Grouping',
      config: { dataset: 'ds' },
      category: 'Chart data',
    },
    {
      name: 'metric',
      type: 'measure',
      label: 'Primary Metric',
      config: { dataset: 'ds' },
      category: 'Chart data',
    },
    {
      name: 'metric2',
      type: 'measure',
      label: 'Secondary Metric (optional)',
      config: { dataset: 'ds' },
      category: 'Chart data',
    },
    {
      name: 'sortBy',
      type: 'dimension',
      label: 'Sort by (optional)',
      config: { dataset: 'ds' },
      category: 'Chart data',
    },
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      category: 'Chart settings',
    },
    {
      name: 'AbsolutePercentage',
      type: 'boolean',
      label: 'Absolute/Percentage',
      defaultValue: false,
      category: 'Configure chart',
    },
    {
      name: 'stackBars',
      type: 'boolean',
      label: 'Stack bars',
      defaultValue: true,
      category: 'Chart settings',
    },
    {
      name: 'showLegend',
      type: 'boolean',
      label: 'Show legend',
      defaultValue: true,
      category: 'Chart settings',
    },
    {
      name: 'maxSegments',
      type: 'number',
      label: 'Max Legend Items',
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
      name: 'yAxisTitle',
      type: 'string',
      label: 'Primary Y-Axis Title',
      category: 'Chart settings',
    },
    {
      name: 'displayHorizontally',
      type: 'boolean',
      label: 'Display Horizontally',
      defaultValue: false,
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
  ],
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>) => {
    const orderProp: OrderBy[] = [];

    if (inputs.sortBy) {
      const sortProperty =
        inputs.sortBy === 'fact_line_crossings.month_name'
          ? 'fact_line_crossings.month_number'
          : inputs.sortBy;

      orderProp.push({ property: sortProperty, direction: 'asc' });
    }

    return {
      ...inputs,
      isGroupedBar: true,
      results: loadData({
        from: inputs.ds,
        dimensions: [inputs.xAxis, inputs.segment],
        measures: inputs.metric2
          ? [inputs.metric, inputs.metric2]
          : [inputs.metric],
        orderBy: orderProp,
      }),
    };
  },
});
