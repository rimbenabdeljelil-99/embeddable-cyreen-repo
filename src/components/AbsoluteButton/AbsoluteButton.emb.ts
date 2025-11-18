import { Value } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';

export const meta = {
    name: 'AbsoluteButton',
    label: 'Absolute Button',
    category: 'Cyreen Components',
    defaultWidth: 400,
    defaultHeight: 80,
    inputs: [
        {
            name: 'title',
            type: 'string',
            label: 'Title',
            category: 'Settings'
        },
        {
            name: 'defaultValue',
            type: 'boolean',
            label: 'Default value',
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
                    type: 'boolean',
                }
            ]
        }
    ],
    variables: [
        {
            name: 'absoluteButton',
            type: 'boolean',
            defaultValue: false,
            inputs: ['defaultValue'],
            events: [{ name: 'onChange', property: 'value' }]
        }
    ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
    props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
        return {
            ...inputs,
            clientContext
        };
    },
    events: {
        // Return the boolean value directly
        onChange: (value) => ({ value })
    }
});
