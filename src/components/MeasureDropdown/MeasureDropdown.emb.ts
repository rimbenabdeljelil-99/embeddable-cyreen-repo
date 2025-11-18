import { defineComponent, EmbeddedComponentMeta, Inputs } from '@embeddable.com/react';
import { loadData, Value } from '@embeddable.com/core';
import DropdownMeasureNames from '.';

export const meta: EmbeddedComponentMeta = {
    name: 'MeasureDropdown',
    label: 'Measure dropdown',
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
            type: 'measure',
            label: 'Measure',
            config: {
                dataset: 'ds',
            },
            array: true,  // Allow multiple Measures
        },
        {
            name: 'defaultValue',
            type: 'string',
            label: 'Default value',
            description: 'Initial value',
        },
        {
            name: 'placeholder',
            type: 'string',
            label: 'Place Holder',
            description: 'Place holder',
        },
    ],
    events: [
        {
            name: 'onChange', // Pass an event called OnChange to your component as a prop
            label: 'Change', // How this event appears in the builder UI when defining interactions
            properties: [
                {
                    name: 'value', // The property name to be passed back to the builder
                    type: 'string', // The value's expected type
                    array: false // Set to true for a multi-select dropdown
                },
            ],
        },
    ],
    variables: [
        {
            name: 'measure value',  // Variable created automatically when this component is added
            type: 'string',
            defaultValue: Value.noFilter(), // Initial variable value (this can also be set in the no-code builder)
            inputs: ['defaultValue'], // Connects the variable to the 'defaultValue' input, which is passed into the React component
            events: [{ name: 'onChange', property: 'value' }], // On the 'onChange' event, update the 'chosen value' variable with the 'value' property from the event
        },
    ],
};



export default defineComponent<Inputs>(DropdownMeasureNames, meta, {
    props: (inputs) => {
        // Safely handle if inputs.values is null or undefined
        const measureNames = (inputs.values ?? []).map(measure => measure.name);
        const measureTitles = (inputs.values ?? []).map(measure => measure.title);
        return {
            ...inputs,
            measureNames,
            measureTitles
        };
    },
    events: {
        // Maps the 'onChange' event from your component to the event described in meta
        onChange: (value) => ({ value: value || Value.noFilter() }),
    },
});
