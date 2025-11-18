// src/components/GranularityPicker/GranularityPicker.emb.ts

import { defineComponent, EmbeddedComponentMeta, Inputs } from '@embeddable.com/react';
import { Value } from '@embeddable.com/core';
import GranularityPickerComponent from './index';

export const meta: EmbeddedComponentMeta = {
    name: 'GranularityPickers',
    label: 'Granularity Picker',
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'defaultGranularity',
            type: 'string',
            label: 'Default Granularity',
            description: 'Initial granularity (e.g. "day", "week", or "month")'
        },

        {
            name: 'dashboard',
            type: 'string',
            label: 'Dashboard title'
        }
    ],
    events: [
        {
            name: 'onPickGranularity',
            label: 'Pick Granularity',
            properties: [
                {
                    name: 'value',
                    type: 'string'
                }
            ]
        }
    ],
    variables: [
        {
            name: 'chosenGranularity',
            type: 'string',
            defaultValue: 'hour', // or Value.noFilter() if you want no default
            inputs: ['defaultGranularity'], // Ties the 'defaultGranularity' input to this variable
            events: [ // Ties this variable to the onPickGranularity
                {
                    name: 'onPickGranularity',
                    property: 'value'
                }
            ]
        }
    ]
};

export default defineComponent(GranularityPickerComponent, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs
        };
    },
    events: {
        // Maps the 'onPickGranularity' event from your component to the event described in meta
        onPickGranularity: (value) => ({ value: value || Value.noFilter() })
    }
});