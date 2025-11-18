import {
  Dimension,
  Measure,
  OrderBy,
  isDimension,
  isMeasure,
  loadData,
} from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import SortDirectionType from '../../../../types/SortDirection.type.emb';
import Component, { Props } from './index';

export const meta = {
  name: 'TablePagination',
  label: 'Table Pagination',
  defaultHeight: 300,
  defaultWidth: 900,
  classNames: ['inside-card'],
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'ds',
      type: 'dataset',
      label: 'Dataset to display',
      description: 'Dataset',
      defaultValue: false,
      category: 'Chart data',
    },
    {
      name: 'columns',
      type: 'dimensionOrMeasure',
      label: 'Columns',
      array: true,
      config: {
        dataset: 'ds',
      },
      category: 'Chart data',
    },
    // Chart settings
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      category: 'Chart settings',
    },
    {
      name: 'MasterRetail',
      type: 'boolean',
      label: 'Master Retail',
      category: 'Chart settings',
    },
    {
      name: 'Explanation',
      type: 'string',
      label: 'Explanation',
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
      name: 'FirstColumn',
      type: 'string',
      label: 'Hide First Column',
      category: 'Chart settings',
      array:true
    },
    {
      name: 'SecondColumn',
      type: 'string',
      label: 'Hide Second Column',
      category: 'Chart settings',
      array:true
      
    },
    {
      name: 'ThirdColumn',
      type: 'string',
      label: 'Hide Third Column',
      category: 'Chart settings',
      array:true
    },
    {
      name: 'FourthColumn',
      type: 'string',
      label: 'Hide Fourth Column',
      category: 'Chart settings',
      array:true
    },
    {
      name: 'FifthColumn',
      type: 'string',
      label: 'Hide Fifth Column',
      category: 'Chart settings',
      array:true
    },
    {
      name: 'maxPageRows',
      type: 'number',
      label: 'Max Page Rows',
      category: 'Chart settings',
    },
    {
      name: 'defaultSort',
      type: 'dimensionOrMeasure',
      config: {
        dataset: 'ds',
      },
      label: 'Default Sort',
      category: 'Chart settings',
    },
    {
      name: 'defaultSortDirection',
      type: SortDirectionType as never,
      defaultValue: 'Ascending',
      label: 'Default Sort Direction',
      category: 'Chart settings',
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
    // Table styling
    {
      name: 'minColumnWidth',
      type: 'number',
      label: 'Minimum column width in pixels',
      defaultValue: 150,
      category: 'Chart styling',
    },
    {
      name: 'fontSize',
      type: 'number',
      label: 'Font size in pixels',
      category: 'Chart styling',
    },
  ],
} as const satisfies EmbeddedComponentMeta;

export default defineComponent<
  Props,
  typeof meta,
  { maxRowsFit: number; sort: OrderBy[]; page: number; prevVariableValues: Record<string, any> }
>(Component, meta, {
  props: (inputs: Inputs<typeof meta>, [state]) => {
    const currVariableValues = inputs?.ds?.variableValues || {};
    const prevVariableValues = state?.prevVariableValues || {};

    const limit =
      inputs.maxPageRows || state?.maxRowsFit
        ? Math.min(inputs.maxPageRows || 1000, Math.max(state?.maxRowsFit, 1) || 1000)
        : 1;

    const defaultSortDirection =
      // @ts-expect-error - defaultSortDirection.value is added by defineComponent.
      inputs.defaultSortDirection?.value === 'Ascending' ? 'asc' : 'desc';

    const defaultSort =
      inputs.columns
        ?.filter((c) => c.name !== inputs.defaultSort?.name)
        .map((property) => ({
          property,
          direction: defaultSortDirection,
        })) || [];

    if (inputs.defaultSort) {
      defaultSort.unshift({
        property: inputs.defaultSort,
        direction: defaultSortDirection,
      });
    }

    // Reset page when dataset variables change
    if (state && JSON.stringify(currVariableValues) !== JSON.stringify(prevVariableValues)) {
      state.prevVariableValues = currVariableValues;
      state.page = 0;
    }

    // === NEW PART: hide dimensions dynamically ===
    const visibleDimensions = (inputs.columns?.filter(isDimension) as Dimension[] || []).filter(
      (col, index) => {
        //if (index === 0 && inputs.FirstColumn) return false;
        //if (index === 1 && inputs.SecondColumn) return false;
        if (index === 2 && inputs.ThirdColumn?.includes('Warengruppe')) return false;
        if (index === 3 && inputs.FourthColumn?.includes('Ferrero Kategorie')) return false;
        if (index === 4 && inputs.FifthColumn?.includes('Ferrero Produkt')) return false;
        return true;
      }
    );

    const visibleMeasures = (inputs.columns?.filter(isMeasure) as Measure[] || []).filter(
      () => true
    );

    const filteredSort = (state?.sort || defaultSort).filter(
      (s) =>
        visibleDimensions.includes(s.property as Dimension) ||
        visibleMeasures.includes(s.property as Measure)
    );

    return {
      ...inputs,
      limit,
      defaultSort,
      results: loadData({
        from: inputs.ds,
        dimensions: visibleDimensions,
        measures: visibleMeasures,
        limit,
        offset: limit * (state?.page || 0),
        orderBy: filteredSort,
      }),
    };
  },
});
