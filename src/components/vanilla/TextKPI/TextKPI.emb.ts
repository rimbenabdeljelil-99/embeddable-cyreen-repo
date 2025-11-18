import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';
import { loadData } from '@embeddable.com/core';
import Component from './index';
import {
  Dimension,
  Measure,
  OrderBy,
  isDimension,
  isMeasure,
} from '@embeddable.com/core';

export const meta = {
  name: 'TextKPI',
  label: 'Text Dimension Measure',

  category: 'Cyreen Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset',
      description: 'Dataset',
      defaultValue: false,
      category: 'Chart data',
    },
    {
      name: 'metric',
      type: 'dimensionOrMeasure',
      label: 'KPI',
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'The title text',
      category: 'Configure chart'
    },
    {
      name: 'body',
      type: 'string',
      label: 'Body',
      description: 'The body text',
      category: 'Configure chart'
    },
    {
      name: 'granularity',
      type: 'string',
      label: 'Granularity',
      description: 'The chosen granularity',
      category: 'Configure chart'
    },
    {
      name: 'titleFontSize',
      type: 'number',
      label: 'Title font size in pixels',
      category: 'Formatting'
    },
    {
      name: 'bodyFontSize',
      type: 'number',
      label: 'Body font size in pixels',
      category: 'Formatting'
    },
    {
      name: 'icon',
      type: 'string',
      label: 'Icon',
      description: 'Choose an icon to display',
      category: 'Configure chart',


    },
  ]
} as const satisfies EmbeddedComponentMeta;

//The function that tells the SDK to include this component in the no-code builder.
export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>) => {
    const { ds, metric } = inputs;


    const dimensions: Dimension[] = [];
    const measures: Measure[] = [];

    // Determine if the metric is a dimension or a measure
    if (isDimension(metric)) {
      dimensions.push(metric);
    } else if (isMeasure(metric)) {
      measures.push(metric);
    }
    return {
      ...inputs,
      results: loadData({
        from: inputs.ds,
        dimensions: dimensions,
        measures: measures
      })
    };
  }
});


