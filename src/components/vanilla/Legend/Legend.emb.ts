import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';

export const meta = {
  name: 'Legend',
  label: 'Legend',
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'The title text',
      category: 'Configure chart'
    },
    {
      name: 'ds',
      type: 'dataset', // shows a dropdown of available datasets. These are created directly in the Builder.
      label: 'Dataset',
    },
    {
      name: 'IdStore',
      type: 'dimension',
      label: 'ID Store',
      config: {
        dataset: 'ds',
      },
      category: 'Configure chart'
    },
    {
      name: 'Monitoring',
      type: 'boolean',
      label: 'Monitoring',
      defaultValue: false
    },
    {
      name: 'Horiz',
      type: 'boolean',
      label: 'Horiz',
      defaultValue: false
    },
    {
      name: 'MonStatus',
      type: 'boolean',
      label: 'MonStatus',
      defaultValue: false
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
      name: 'LowColor',
      type: 'string',
      label: 'Low Color',
      category: 'Configure chart'
    },
    {
      name: 'MediumColor',
      type: 'string',
      label: 'Medium Color',
      category: 'Configure chart'
    },
    {
      name: 'HighColor',
      type: 'string',
      label: 'High Color',
      category: 'Configure chart'
    },
    {
      name: 'bodyFontSize',
      type: 'number',
      label: 'Body font size in pixels',
      category: 'Formatting'
    },
  ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
    return {
      ...inputs,
      results: loadData({ // fetches data from your database and passes it to your component
        from: inputs.ds,
        dimensions: [inputs.IdStore],
      }),
      clientContext
    };
  }
});
