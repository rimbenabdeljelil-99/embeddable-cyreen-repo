import { Value } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component, { Props } from './index';

export const meta = {
  name: 'SecondValues',
  label: 'Second Values',
  defaultWidth: 300,
  defaultHeight: 80,
  classNames: ['on-top'],
  category: 'Embeddable Components',
  inputs: [
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      category: 'Settings'
    },
    {
      name: 'placeholder',
      type: 'string',
      label: 'Placeholder',
      defaultValue: 'Select...',
      category: 'Settings'
    },
    {
      name: 'values',
      type: 'string',
      array: true,
      label: 'Dropdown Values',
      category: 'Settings'
    },
    {
      name: 'defaultValue',
      type: 'string',
      array: true,
      label: 'Default Selected Values',
      category: 'Pre-configured variables'
    }
  ],
  events: [
    {
      name: 'onChange',
      label: 'Change',
      properties: [
        {
          name: 'value',
          type: 'string',
          array: true
        }
      ]
    }
  ],
  variables: [
    {
      name: 'dropdown choices',
      type: 'string',
      defaultValue: Value.noFilter(),
      array: true,
      inputs: ['defaultValue'],
      events: [{ name: 'onChange', property: 'value' }]
    }
  ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent<Props, typeof meta, { search: string }>(Component, meta, {
  props: (inputs: Inputs<typeof meta>) => {
    // Directly use provided text values for dropdown options
    return {
      ...inputs,
      options: inputs.values || []
    };
  },
  events: {
    onChange: (value) => {
      return {
        value: value.length ? value : Value.noFilter()
      };
    }
  }
});
