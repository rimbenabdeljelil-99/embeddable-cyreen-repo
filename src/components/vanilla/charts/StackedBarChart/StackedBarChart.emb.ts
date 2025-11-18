import { OrderBy, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import Component from './index';

// Input configuration for better maintainability
const INPUT_CONFIG = {
  dataset: {
    name: 'ds',
    type: 'dataset' as const,
    label: 'Dataset to display',
    category: 'Chart data'
  },
  xAxis: {
    name: 'xAxis',
    type: 'dimension' as const,
    label: 'X-Axis',
    config: { dataset: 'ds' },
    category: 'Chart data'
  },
  segment: {
    name: 'segment',
    type: 'dimension' as const,
    label: 'Grouping',
    config: { dataset: 'ds' },
    category: 'Chart data'
  },
  metric: {
    name: 'metric',
    type: 'measure' as const,
    label: 'Metric',
    config: { dataset: 'ds' },
    category: 'Chart data'
  },
  sortBy: {
    name: 'sortBy',
    type: 'dimension' as const,
    label: 'Sort by (optional)',
    config: { dataset: 'ds' },
    category: 'Chart data'
  },
  title: {
    name: 'title',
    type: 'string' as const,
    label: 'Title',
    description: 'The title for the chart',
    category: 'Chart settings'
  },
  absolutePercentage: {
    name: 'AbsolutePercentage',
    type: 'boolean' as const,
    label: 'Absolute/Percentage',
    description: 'Absolute/Percentage',
    category: 'Configure chart',
    defaultValue: false
  },
  description: {
    name: 'description',
    type: 'string' as const,
    label: 'Description',
    description: 'The description for the chart',
    category: 'Chart settings'
  },
  stackBars: {
    name: 'stackBars',
    type: 'boolean' as const,
    label: 'Stack bars',
    defaultValue: true,
    category: 'Chart settings'
  },
  showLegend: {
    name: 'showLegend',
    type: 'boolean' as const,
    label: 'Show legend',
    defaultValue: true,
    category: 'Chart settings'
  },
  maxSegments: {
    name: 'maxSegments',
    type: 'number' as const,
    label: 'Max Legend Items',
    defaultValue: 8,
    category: 'Chart settings'
  },
  showLabels: {
    name: 'showLabels',
    type: 'boolean' as const,
    label: 'Show Labels',
    defaultValue: false,
    category: 'Chart settings'
  },
  yAxisTitle: {
    name: 'yAxisTitle',
    type: 'string' as const,
    label: 'yAxisTitle',
    category: 'Chart settings'
  },
  showTotals: {
    name: 'showTotals',
    type: 'boolean' as const,
    label: 'Show Totals Above Stacked Bars',
    defaultValue: false,
    category: 'Chart settings'
  },
  displayHorizontally: {
    name: 'displayHorizontally',
    type: 'boolean' as const,
    label: 'Display Horizontally',
    defaultValue: false,
    category: 'Chart settings'
  },
  reverseXAxis: {
    name: 'reverseXAxis',
    type: 'boolean' as const,
    label: 'Reverse X Axis',
    category: 'Chart settings',
    defaultValue: false
  },
  displayAsPercentage: {
    name: 'displayAsPercentage',
    type: 'boolean' as const,
    label: 'Display as Percentages',
    defaultValue: false,
    category: 'Chart settings'
  },
  PercentageSign: {
    name: 'PercentageSign',
    type: 'boolean' as const,
    label: 'Show Percentage Sign',
    defaultValue: false,
    category: 'Chart settings'
  },
  weiden: {
    name: 'weiden',
    type: 'boolean' as const,
    label: 'Weiden',
    defaultValue: false,
    category: 'Chart settings'
  },
  decimalPlaces: {
    name: 'dps',
    type: 'number' as const,
    label: 'Decimal Places',
    category: 'Formatting'
  },
  Explanation: {
    name: 'Explanation',
    type: 'string' as const,
    label: 'Explanation',
    category: 'Chart settings'
  },
  enableDownloadCSV: {
    name: 'enableDownloadAsCSV',
    type: 'boolean' as const,
    label: 'Show download as CSV',
    category: 'Export options',
    defaultValue: true
  },
  enableDownloadPNG: {
    name: 'enableDownloadAsPNG',
    type: 'boolean' as const,
    label: 'Show download as PNG',
    category: 'Export options',
    defaultValue: true
  }
} as const;

export const meta = {
  name: 'StackedBarChart',
  label: 'Grouped bar chart',
  classNames: ['inside-card'],
  category: 'Embeddable Components',
  inputs: Object.values(INPUT_CONFIG)
} as const satisfies EmbeddedComponentMeta;

// Helper function to build sort configuration
const buildSortConfig = (sortBy: string | undefined): OrderBy[] => {
  if (!sortBy) return [];

  // Handle special case for month_name sorting
  const sortProperty = sortBy === 'fact_line_crossings.month_name' 
    ? 'fact_line_crossings.month_number' 
    : sortBy;

  return [{
    property: sortProperty,
    direction: 'asc' // always ascending for months
  }];
};

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>) => {
    const orderBy = buildSortConfig(inputs.sortBy);

    return {
      ...inputs,
      isGroupedBar: true,
      results: loadData({
        from: inputs.ds,
        dimensions: [inputs.xAxis, inputs.segment],
        measures: [inputs.metric],
        orderBy
      })
    };
  }
});