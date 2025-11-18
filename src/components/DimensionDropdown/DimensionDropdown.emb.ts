import { defineComponent, EmbeddedComponentMeta, Inputs } from '@embeddable.com/react';
import { Dimension, Value } from '@embeddable.com/core';
import DropdownDimensionNames from './index';

export const meta: EmbeddedComponentMeta = {
    name: 'DimensionDropdown',
    label: 'Dimension dropdown',
    category: 'Cyreen Components',
    defaultWidth: 320,
    defaultHeight: 80,
    inputs: [
        { name: 'ds', type: 'dataset', label: 'Dataset to display' },
        { name: 'values', type: 'dimension', label: 'Dimensions', config: { dataset: 'ds' }, array: true },
        { name: 'defaultValue', type: 'string', label: 'Default value', description: 'Initial value' },
        { name: 'InstoreDuration', type: 'boolean', label: 'Instore Duration' },
        { name: 'placeholder', type: 'string', label: 'Place Holder' },
    ],
    events: [
        {
            name: 'onChange',
            label: 'Change (string value)',
            properties: [{ name: 'value', type: 'string', array: false }],
        },
        {
            name: 'onChangeDimension',
            label: 'Change (full dimension)',
            properties: [{ name: 'value', type: 'dimension', array: false }],
        },
    ],
    variables: [
        { name: 'chosenValue', type: 'string', defaultValue: 'impressions.name_store', inputs: ['defaultValue'], events: [{ name: 'onChange', property: 'value' }] },
        { name: 'chosenDimension', type: 'dimension', defaultValue: null, events: [{ name: 'onChangeDimension', property: 'value' }] },
    ],
};

export default defineComponent<Inputs>(DropdownDimensionNames, meta, {
    props: (inputs) => ({
        ...inputs,
        dimensions: inputs.values ?? [],
    }),
    events: {
        onChange: (value: string) => ({ value: value ?? Value.noFilter() }),
        onChangeDimension: (dim: Dimension | null) => ({ value: dim ?? Value.noFilter() }),
    },
});
