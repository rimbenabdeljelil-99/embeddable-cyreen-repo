import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';



export const meta = {
  name: 'Text',
  label: 'Text component',
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
      name: 'weathertypes',
      type: 'boolean',
      label: 'Weather Types',
      description: 'Weather Types',
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
  ]
} as const satisfies EmbeddedComponentMeta;


export default defineComponent(Component, meta, {
  
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
    return {
      ...inputs,
      clientContext // Add it to the props
    };
  }
});
