import { Value, loadData } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component, { Props } from './index';

export const meta = {
  name: 'MultiSelectDropdown',
  label: 'Multi-Select dropdown',
  defaultWidth: 300,
  defaultHeight: 80,
  classNames: ['on-top'],
  category: 'Embeddable Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset',
      description: 'Dataset',
      category: 'Dropdown values'
    },
    {
      name: 'property',
      type: 'dimension',
      label: 'Property',
      config: {
        dataset: 'ds'
      },
      category: 'Dropdown values'
    },
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      category: 'Settings'
    },
    {
      name: 'defaultValue',
      type: 'string',
      array: true,
      label: 'Default value',
      category: 'Pre-configured variables'
    },
    {
      name: 'placeholder',
      type: 'string',
      label: 'Placeholder',
      defaultValue: 'Select...',
      category: 'Settings'
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Default number of options',
      defaultValue: 100,
      category: 'Settings'
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
        },
        {
          name: 'title',
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
    },
    {
      name: 'dropdown titles',
      type: 'string',
      defaultValue: Value.noFilter(),
      array: true,
      events: [{ name: 'onChange', property: 'title' }]
    }
  ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent<Props, typeof meta, { search: string }>(Component, meta, {
  props: (inputs: Inputs<typeof meta>, [embState]) => {
    if (!inputs.ds)
      return {
        ...inputs,
        options: { data: [], isLoading: false } as DataResponse
      };

    return {
      ...inputs,
      options: loadData({
        from: inputs.ds,
        dimensions: inputs.property ? [inputs.property] : [],
        limit: inputs.limit || 1000,
        filters:
          embState?.search && inputs.property
            ? [
                {
                  operator: 'contains',
                  property: inputs.property,
                  value: embState?.search
                }
              ]
            : undefined
      })
    };
  },
  events: {
    onChange: (values) => {
      const valueArray = values.map(v => v.value);
      const titleArray = values.map(v => v.title);
      
      return {
        value: valueArray.length ? valueArray : Value.noFilter(),
        title: titleArray.length ? titleArray : Value.noFilter()
      };
    }
  }
});