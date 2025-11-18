import { Value, loadData } from '@embeddable.com/core';
import { OrderBy } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component, { Props } from './index';

export const meta = {
  name: 'MultiSelectDropdownExclude',
  label: 'Multi-Select dropdown exclude',
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
      name: 'filter',
      type: 'dimension', 
      label: 'Filter',
      config: {
        dataset: 'ds', 
      }
    },
    {
      name: 'filterValue',
      type: 'string', 
      label: 'Filter Value',
      config: {
        dataset: 'ds', 
      },
      array: true
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
      name: 'sortBy',
      type: 'dimension',
      label: 'Sort by (optional)',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Default number of options',
      defaultValue: 100,
      category: 'Settings'
    },
    {
      name: 'excludeValues',
      type: 'string',
      array: true,
      label: 'Exclude Values Input',
      category: 'Pre-configured variables',
      description: 'Values that should be automatically selected (from other dropdowns)'
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
    },
    {
      name: 'onExcludedChange',
      label: 'Excluded Values Change',
      properties: [
        {
          name: 'excludedValues',
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
    },
    {
      name: 'Excluded Values',
      type: 'string',
      array: true,
      events: [{ name: 'onExcludedChange', property: 'excludedValues' }]
    },
  ]
} as const satisfies EmbeddedComponentMeta;

const buildFilter = (dimension: string | undefined, values: string[] | undefined) => {
  if (dimension && values && values.length > 0) {
    return [
      {
        property: dimension,
        operator: "equals",
        value: values,
      }
    ];
  }
  return [];
};

export default defineComponent<Props & { onExcludedChange?: (excludedValues: string[]) => void }, typeof meta, { search: string }>(Component, meta, {
  props: (inputs: Inputs<typeof meta>, [embState]) => {
    const orderProp: OrderBy[] = [];
    
        if ((inputs.sortBy)) {
          orderProp.push({
            property: (inputs.sortBy), // keep current implementation
            direction: 'asc',
          });
        } 
        



    if (!inputs.ds)
      return {
        ...inputs,
        options: { data: [], isLoading: false } as DataResponse
      };

    // Build all filters
    const searchFilters = embState?.search && inputs.property
      ? [
          {
            operator: 'contains',
            property: inputs.property,
            value: embState?.search
          }
        ]
      : [];

    const inputFilters = buildFilter(inputs.filter, inputs.filterValue);

    // Combine all filters
    const allFilters = [...searchFilters, ...inputFilters];

    return {
      ...inputs,
      options: loadData({
        from: inputs.ds,
        dimensions: inputs.property ? [inputs.property] : [],
        limit: inputs.limit || 1000,
        filters: allFilters.length > 0 ? allFilters : undefined,
        orderBy: orderProp,
      }),
      // Pass excludeValues as a separate prop to handle in component
      excludeValues: inputs.excludeValues
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
    },
    onExcludedChange: (excludedValues) => {
      return {
        excludedValues: excludedValues.length ? excludedValues : Value.noFilter()
      };
    }
  }
});