import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import Component from './index';

export const meta = {
  name: 'TextSimple',
  label: 'Simple Text component',
  category: 'Cyreen Components',
  inputs: [
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
      name: 'Filter1Value',
      type: 'string',
      label: 'Filter1 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter1Title',
      type: 'string',
      label: 'Filter1 Title',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter2Value',
      type: 'string',
      label: 'Filter2 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter2Title',
      type: 'string',
      label: 'Filter2 Title',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter3Value',
      type: 'string',
      label: 'Filter3 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter3Title',
      type: 'string',
      label: 'Filter3 Title',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter4Value',
      type: 'string',
      label: 'Filter4 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter4Title',
      type: 'string',
      label: 'Filter4 Title',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter5Value',
      type: 'string',
      label: 'Filter5 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter5Title',
      type: 'string',
      label: 'Filter5 Title',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter6Value',
      type: 'number',
      label: 'Filter6 Value',
      category: 'Configure chart',
      array: true,
    },
    {
      name: 'Filter6Title',
      type: 'string',
      label: 'Filter6 Title',
      category: 'Configure chart',
      array: true,
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
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => ({
    ...inputs,
    clientContext,
  }),
});
