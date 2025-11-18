import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';
import {
  Dimension,
  Measure,
  OrderBy,
  isDimension,
  isMeasure,
} from '@embeddable.com/core';

export const meta = {
  name: 'TextUpliftSummary',
  label: 'Text Uplift Summary',
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
      name: 'metrics',
      type: 'measure',
      label: 'KPI',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
      array: true
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
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
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
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'The title text',
      category: 'Configure chart'
    },
    {
      name: 'body',
      type: 'string',
      label: 'Body',
      description: 'The body text',
      category: 'Configure chart'
    },
    {
      name: 'titleFontSize',
      type: 'number',
      label: 'Title font size in pixels',
      category: 'Formatting'
    },
    {
      name: 'bodyFontSize',
      type: 'number',
      label: 'Body font size in pixels',
      category: 'Formatting'
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

//The function that tells the SDK to include this component in the no-code builder.
export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {

    return {
      ...inputs,
      results: loadData({
        from: inputs.ds,
        measures: inputs.metrics,

      }),
      clientContext
    };
  }
});


