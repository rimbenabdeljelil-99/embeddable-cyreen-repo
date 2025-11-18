import { defineComponent, EmbeddedComponentMeta, Inputs } from '@embeddable.com/react';
import { Value } from '@embeddable.com/core';
import TimeRangePickerComponent from './index';

export const meta: EmbeddedComponentMeta = {
    name: 'TimeRangePicker',
    label: 'Time Range Picker',
    category: 'Cyreen Components',
    inputs: [
        {
            name: 'defaultTimeRange',
            type: 'timeRange',
            label: 'Default Time Range',
            description: 'Initial time range (e.g. "Last 24 hours", "Last 7 days", "Last 30 days")',
        },
    ],
    events: [
        {
            name: 'onPickTimeRange',
            label: 'Pick Time Range',
            properties: [
                {
                    name: 'value',
                    type: 'timeRange',
                },
            ],
        },
    ],
    variables: [
        {
            name: 'chosenTimeRange',
            type: 'timeRange',
            defaultValue: Value.noFilter(), // Default value when no custom range is selected
            inputs: ['defaultTimeRange'], // Ties the 'defaultTimeRange' input to this variable
            events: [
                {
                    name: 'onPickTimeRange',
                    property: 'value', // Ensure the value is properly updated
                },
            ],
        },
    ],
};

export default defineComponent(TimeRangePickerComponent, meta, {
    props: (inputs: Inputs<typeof meta>) => {
        return {
            ...inputs,
        };
    },
    events: {
        onPickTimeRange: (value) => {
            // Ensure the custom time range value is properly mapped when selected
            return {
                value: value || Value.noFilter(),  // Return custom time range if provided
            };
        },
    },
});
