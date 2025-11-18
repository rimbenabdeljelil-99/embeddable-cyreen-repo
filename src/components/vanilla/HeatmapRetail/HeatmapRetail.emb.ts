import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';

export const meta = {
  name: 'HeatmapRetail',
  label: 'Heatmap Retail',
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
      name: 'dimensions',
      type: 'dimension', // shows a dropdown of measures (defined in your data models)
      label: 'dimensions',
      array: true, // allows multiple measures to be selected
      config: {
        dataset: 'ds', // restricts measure options to the selected dataset
      },

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
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
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
      name: 'granularity',
      type: 'string',
      label: 'Granularity',
      description: 'The chosen granularity',
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
      name: 'icon',
      type: 'string',
      label: 'Icon',
      description: 'Choose an icon to display',
      category: 'Configure chart',


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


export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
    return {
      ...inputs,
      results: loadData({
        from: inputs.ds,  
        dimensions: inputs.dimensions,
        measures: inputs.metrics,
      }),
      clientContext
    };
  }
});


