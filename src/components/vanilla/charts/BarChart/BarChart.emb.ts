import { OrderBy, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
  name: 'BarChart',
  label: 'Bar chart',
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
      defaultValue: false
    },
    {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
        },
    {
      name: 'sortBy',
      type: 'string',
      label: 'Sort by (optional)',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'sortByDim',
      type: 'dimension',
      label: 'Sort by (Dimension)',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Limit results',
      category: 'Chart data',
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
      name: 'reverseXAxis',
      type: 'boolean',
      label: 'Reverse X Axis',
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
      name: 'round',
      type: 'boolean',
      label: 'Round',
      defaultValue: 'false',
      category: 'Variables to configure',
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
      name: 'Referencing',
      type: 'boolean',
      label: 'Referencing',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'LabelFont',
      type: 'number',
      label: 'Label Font',
      category: 'Chart settings',
    },
    {
      name: 'TotalStores',
      type: 'boolean',
      label: 'Total Stores',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'displayYaxis',
      type: 'boolean',
      label: 'display Y-axis',
      defaultValue: 'true',
      category: 'Chart settings',
    },
    {
      name: 'displayXaxis',
      type: 'boolean',
      label: 'display X-axis',
      defaultValue: 'true',
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
      name: 'overview',
      type: 'boolean',
      label: 'Overview',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'TrolleyBar',
      type: 'boolean',
      label: 'Trolley Bar',
      defaultValue: 'false',
      category: 'Chart settings',
    },
    {
      name: 'edeka',
      type: 'boolean',
      label: 'Edeka',
      defaultValue: 'false',
      category: 'Chart settings',
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
      name: 'PercentageSign',
      type: 'boolean',
      label: 'Show Percentage Sign',
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
      name: 'FerreroProdukt',
      type: 'boolean',
      label: 'FerreroProdukt',
      category: 'Chart settings',
      defaultValue: false,
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
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
    const orderProp: OrderBy[] = [];

    if ((inputs.sortBy) || (inputs.sortByDim)) {
      orderProp.push({
        property: inputs.FerreroProdukt
          ? inputs.sortByDim   // directly use as dimension
          : asMeasure(inputs.sortBy), // keep current implementation
        direction: 'asc',
      });
    } else if (inputs.limit) {
      orderProp.push({
        property: inputs.metrics[0],
        direction: 'desc',
      });
    }

    return {
      ...inputs,
      reverseXAxis: inputs.reverseXAxis,
      results: loadData({
        from: inputs.ds,
        dimensions: [inputs.xAxis],
        measures: [...inputs.metrics, ...(inputs.lineMetrics || [])],
        orderBy: orderProp,
        limit: inputs.limit || 50,
      }),
      clientContext
    };
  },
});

function asMeasure(valueMeasure: string | any): any {
  return typeof valueMeasure === 'string' ? { name: valueMeasure, __type__: 'measure' } : valueMeasure;
}
