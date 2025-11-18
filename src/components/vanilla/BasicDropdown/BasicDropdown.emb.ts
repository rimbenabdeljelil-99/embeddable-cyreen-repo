import { defineComponent, EmbeddedComponentMeta, Inputs } from '@embeddable.com/react';
import { loadData, Value } from '@embeddable.com/core';
import BasicDropdown from './index';

export const meta: EmbeddedComponentMeta = {
    name: 'BasicDropdown',
    label: 'Basic Dropdown',
    category: 'Cyreen Components',
    defaultWidth: 320,
    defaultHeight: 80,
    inputs: [
        {
            name: 'ds',
            type: 'dataset',
            label: 'Dataset to display',
        },
        {
            name: 'values',
            type: 'dimension',
            label: 'Values',
            config: {
                dataset: 'ds',
            },
        },
        {
            name: 'defaultValue',
            type: 'number',
            label: 'Default value',
            description: 'Initial value',
        },
    ],
    events: [
        {
            name: 'onChange', // Pass an event called OnChange to your component as a prop
            label: 'Change', // How this event appears in the builder UI when defining interactions
            properties: [
                {
                    name: 'value', // The property name to be passed back to the builder
                    type: 'number', // The value's expected type
                    array: false // Set to true for a multi-select dropdown
                },
            ],
        },
    ],
    variables: [
        {
            name: 'chosen value',  // Variable created automatically when this component is added
            type: 'number',
            defaultValue: 316, // Initial variable value (this can also be set in the no-code builder)
            inputs: ['defaultValue'], // Connects the variable to the 'defaultValue' input, which is passed into the React component
            events: [{ name: 'onChange', property: 'value' }], // On the 'onChange' event, update the 'chosen value' variable with the 'value' property from the event
        },
    ],
};

export default defineComponent<Inputs>(BasicDropdown, meta, {
    props: (inputs) => {
        return {
            ...inputs,
            // Load dimension values for the dropdown with a limit of 500 rows
            results: loadData({
                from: inputs.ds,
                dimensions: [inputs.values],
                limit: 500
            }),
        };
    },
    events: {
        onChange: (value) => ({ value: value || Value.noFilter() }),
    },
});
