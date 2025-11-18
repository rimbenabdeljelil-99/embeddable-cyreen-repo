import { loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
  name: 'TimeSeriesBarChart',
  label: 'Bar chart (time-series)',
  classNames: ['inside-card'],
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset',
      description: 'Dataset',
      defaultValue: false,
      category: 'Chart data',
    },
    {
      name: 'xAxis',
      type: 'dimension',
      label: 'X-Axis',
      config: {
        dataset: 'ds',
        supportedTypes: ['time'],
      },
      category: 'Chart data',
    },
    {
      name: 'metrics',
      type: 'measure',
      array: true,
      label: 'Metrics',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
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
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
        },
    {
      name: 'lineMetrics',
      type: 'measure',
      array: true,
      label: 'Add a line(s)',
      config: {
        dataset: 'ds',
      },
      category: 'Optional chart data',
    },
    {
      name: 'showSecondYAxis',
      type: 'boolean',
      label: 'Show 2nd axis',
      category: 'Optional chart data',
      defaultValue: false,
    },
    {
      name: 'secondAxisTitle',
      type: 'string',
      label: '2nd axis title',
      description: 'The title for the chart',
      category: 'Optional chart data',
    },
    {
      name: 'granularity',
      type: 'string',
      label: 'Granularity',
      defaultValue: 'week',
      category: 'Variables to configure',
    },
    {
      name: 'round',
      type: 'boolean',
      label: 'Round',
      defaultValue: 'false',
      category: 'Variables to configure',
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
      label: 'Show Legend',
      category: 'Chart settings',
      defaultValue: true,
    },
    {
      name: 'showLabels',
      type: 'boolean',
      label: 'Show Labels',
      category: 'Chart settings',
      defaultValue: true,
    },
    {
      name: 'displayHorizontally',
      type: 'boolean',
      label: 'Display Horizontally',
      category: 'Chart settings',
      defaultValue: false,
    },
    {
      name: 'stackMetrics',
      type: 'boolean',
      label: 'Stack Metrics',
      category: 'Chart settings',
      defaultValue: false,
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
      name: 'xAxisPosition',
      type: 'string',
      label: 'X-Axis Position',
      category: 'Chart settings',
    },
    {
      name: 'xAxisFont',
      type: 'number',
      label: 'X-Axis Font',
      category: 'Chart settings',
    },
    {
      name: 'LabelFont',
      type: 'number',
      label: 'Label Font',
      category: 'Chart settings',
    },
    {
      name: 'displayYaxis',
      type: 'boolean',
      label: 'display Y-axis',
      category: 'Chart settings',
    },
    {
      name: 'displayXaxis',
      type: 'boolean',
      label: 'display X-axis',
      category: 'Chart settings',
    },
    {
      name: 'impression',
      type: 'boolean',
      label: 'impression',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'performance',
      type: 'boolean',
      label: 'performance',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'Totalperformance',
      type: 'boolean',
      label: 'Total Performance',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'optimization',
      type: 'boolean',
      label: 'Optimization',
      defaultValue: 'false',
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
      name: 'KPIvalue',
      type: 'string',
      label: 'KPI value',
      description: 'The kpi to display',
      category: 'Configure chart',
      array: true
    },
    {
      name: 'edeka_hourgroup',
      type: 'boolean',
      label: 'Edeka Hour Group',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'master',
      type: 'boolean',
      label: 'Master',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'masterUplift',
      type: 'boolean',
      label: 'Master Uplift',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'PercentageSign',
      type: 'boolean',
      label: 'Show Percentage Sign',
      category: 'Chart settings',
    },
    {
      name: 'dps',
      type: 'number',
      label: 'Decimal Places',
      category: 'Formatting',
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Limit results',
      defaultValue: 100,
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
    return {
      ...inputs,
      isTSBarChart: true,
      reverseXAxis: true,
      useCustomDateFormat: true,
      results: loadData({
        from: inputs.ds,
        limit: inputs.limit || 500,
        timeDimensions: [
          {
            dimension: inputs.xAxis?.name,
            granularity: asGranularity(inputs.granularity),
          },
        ],
        measures: [...inputs.metrics, ...(inputs.lineMetrics || [])],
        orderBy: [
          {
            property: inputs.xAxis,
            direction: 'desc',
          },
        ],

      }),
    };
  },
});


function asGranularity(gran: string | any): string | null {
  if (typeof gran !== 'string') return null;

  return gran === 'hour_group' || gran === 'total'
  ? 'hour'
  : gran === 'weekday'
  ? 'day'
  : gran;

}


