import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import Component from './index';
import { loadData } from '@embeddable.com/core';

export const meta = {
  name: 'DateInput',
  label: 'Date Input',
  category: 'Cyreen Components',
  inputs: [
    {
            name: 'ds',
            type: 'dataset', // shows a dropdown of available datasets. These are created directly in the Builder.
            label: 'Dataset',
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
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'The title text',
      category: 'Configure chart',
    },
    {
      name: 'body',
      type: 'string',
      label: 'Body',
      description: 'The body text',
      category: 'Configure chart',
    },
    {
      name: 'titleFontSize',
      type: 'number',
      label: 'Title font size in pixels',
      category: 'Formatting',
    },
    {
      name: 'bodyFontSize',
      type: 'number',
      label: 'Body font size in pixels',
      category: 'Formatting',
    },
  ],
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs, // the inputs are passed through to the component as props
            results: loadData({ // fetches data from your database and passes it to your component
                from: inputs.ds,
                measures: inputs.metrics, // now supports multiple measures
            })
        };
    }
});
