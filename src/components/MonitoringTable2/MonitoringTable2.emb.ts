import {
  Dimension,
  EmbeddableType,
  Measure,
  NativeType,
  OrderBy,
  OrderDirection,
  isDimension,
  isMeasure,
  loadData,
} from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import { SortDirection } from '../../enums/SortDirection';
import SortDirectionType from '../../types/SortDirection.type.emb';
import { MeasureVisualizationFormat } from '../vanilla/charts/PivotTable/enums/MeasureVisualizationFormat';
import Component from './index';

export const meta = {
  name: 'MonitoringTable2',
  label: 'Monitoring table2',
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset to display',
      category: 'Chart data',
    },
    {
      name: 'metrics',
      type: 'dimension',  // Changed from 'measure' to 'dimension'
      label: 'Metrics',
      array: true,
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'rowValues',
      type: 'dimension',
      label: 'Row Values',
      array: true,
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    {
      name: 'columnValues',
      type: 'dimension',
      label: 'Column Values',
      array: true,
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    // Variables to configure
    {
      name: 'granularity',
      type: 'string',
      label: 'Granularity (for dates)',
      defaultValue: 'week',
      category: 'Variables to configure',
    },
    {
      name: 'ShowIP',
      type: 'boolean',
      label: 'Show IP',
      category: 'Variables to configure',
    },
    {
      name: 'ShowNumber',
      type: 'boolean',
      label: 'Show Number',
      category: 'Variables to configure',
    },
    {
      name: 'CheckoutEvents',
      type: 'boolean',
      label: 'Checkout Events',
      category: 'Variables to configure',
    },
    {
      name: 'Despar',
      type: 'boolean',
      label: 'Despar',
      category: 'Chart settings',
      defaultValue: false,
    },
    {
            name: 'Explanation',
            type: 'string',
            label: 'Explanation',
            category: 'Chart settings',
        },
    // Table settings
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      description: 'The title for the chart',
      category: 'Chart settings',
    },
    {
      name: 'description',
      type: 'string',
      label: 'Description',
      description: 'The description for the chart',
      category: 'Chart settings',
    },
    {
      name: 'nullValueCharacter',
      type: 'string',
      label: 'Null value character',
      description: 'Character that should be displayed if value does not exist',
      defaultValue: '∅',
      category: 'Chart settings',
    },
    {
      name: 'isRowGroupDefaultExpanded',
      type: 'boolean',
      label: 'Row group expanded by default',
      defaultValue: false,
      category: 'Chart settings',
    },
    {
      name: 'columnSortingEnabled',
      type: 'boolean',
      label: 'Enable column sorting',
      defaultValue: true,
      category: 'Chart settings',
    },
    {
      name: 'rowSortDirection',
      type: SortDirectionType,
      defaultValue: { value: SortDirection.ASCENDING },
      label: 'Default Row Sort Direction',
      category: 'Chart settings',
    },
    {
      name: 'columnSortDirection',
      type: SortDirectionType,
      defaultValue: { value: SortDirection.ASCENDING },
      label: 'Default Column Sort Direction',
      category: 'Chart settings',
    },
    // Table styling
    {
      name: 'minColumnWidth',
      type: 'number',
      label: 'Minimum metric column width in pixels',
      defaultValue: 150,
      category: 'Chart styling',
    },
    {
      name: 'minRowDimensionColumnWidth',
      type: 'number',
      label: 'Minimum row value width in pixels',
      defaultValue: 200,
      category: 'Chart styling',
    },
    {
      name: 'fontSize',
      type: 'number',
      label: 'Font size in pixels',
      category: 'Chart styling',
    },
    {
      name: 'enableDownloadAsCSV',
      type: 'boolean',
      label: 'Show download as CSV',
      category: 'Export options',
      defaultValue: true,
    },
    {
      name: 'enableDownloadAsPNG',
      type: 'boolean',
      label: 'Show download as PNG',
      category: 'Export options',
      defaultValue: true,
    },
  ],
} as const satisfies EmbeddedComponentMeta;

const aggregateRowDimensions = true; // This is unfinished functionality to disable aggregation rows and show row dimension in separate column

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, [state]) => {
    const rowValuesInputData = Array.isArray(inputs.rowValues)
      ? inputs.rowValues
      : [inputs.rowValues];
    const columnValuesInputData = Array.isArray(inputs.columnValues)
      ? inputs.columnValues
      : [inputs.columnValues];

    const rowDimensions = (rowValuesInputData || []).filter((input) =>
      isDimension(input),
    ) as Dimension[];
    const columnDimensions = (columnValuesInputData || []).filter((input) =>
      isDimension(input),
    ) as Dimension[];
    const metrics = inputs.metrics?.filter((metric) => isDimension(metric)) as Dimension[];

    const filteredRowDimensions: Dimension[] = rowDimensions.filter(
      (dimension) => dimension && isDimension(dimension),
    );

    const sort: OrderBy[] = filteredRowDimensions.map((rowDimension) => ({
      property: rowDimension,
      direction: (inputs.rowSortDirection?.value === SortDirection.ASCENDING
        ? 'asc'
        : 'desc') as OrderDirection,
    }));

    // Include metrics in the dimensions to fetch
    const allDimensions = [
      ...filteredRowDimensions,
      ...columnDimensions,
      ...metrics
    ];

    // Fetch data for each row dimension level
    const dataResults =
      rowDimensions?.length && aggregateRowDimensions
        ? rowDimensions.reduce((resultSet, dimension, index, dimensions) => {
          const dimensionsToFetch = [
            ...filteredRowDimensions.slice(0, index + 1),
            ...columnDimensions,
            ...metrics
          ];

          return {
            ...resultSet,
            [`resultsDimension${index}`]: loadData({
              from: inputs.ds,
              dimensions: dimensionsToFetch.filter(
                (dimension) => dimension.nativeType !== 'time',
              ),
              measures: [], // Keep this empty since we're using dimensions
              timeDimensions: dimensionsToFetch
                .filter((dimension) => dimension.nativeType === 'time')
                .map((timeDimension) => ({
                  dimension: timeDimension.name,
                  granularity: asGranularity(inputs.granularity),
                })),
              orderBy: sort.slice(0, index + 1),
              limit: 10_000,
            }),
          };
        }, {})
        : {
          resultsDimension0: loadData({
            from: inputs.ds,
            dimensions: allDimensions.filter(
              (dimension) => dimension.nativeType !== 'time',
            ),
            timeDimensions: allDimensions
              .filter((dimension) => dimension.nativeType === 'time')
              .map((timeDimension) => ({
                dimension: timeDimension.name,
                granularity: asGranularity(inputs.granularity),
              })),
            measures: [], // Keep this empty since we're using dimensions
            limit: 10_000,
          }),
        };

    return {
      ...inputs,
      rowValues: rowValuesInputData,
      columnValues: columnDimensions,
      metrics, // Make sure metrics are included in the returned props
      rowSortDirection: inputs.rowSortDirection?.value,
      columnSortDirection: inputs.columnSortDirection?.value,
      measureVisualizationFormat: MeasureVisualizationFormat.NUMERIC_VALUES_ONLY,
      aggregateRowDimensions,
      fontSize: inputs.fontSize,
      ...dataResults,
    };
  },
});

function asGranularity(gran: string | any): string | null {
  if (typeof gran !== 'string') return null;
  return gran === 'hour_group' || gran === 'total' ? 'hour' : gran;
}