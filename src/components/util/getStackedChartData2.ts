import { DataResponse, Dataset, Dimension, Granularity, Measure } from '@embeddable.com/core';
import { ChartData } from 'chart.js';
import { COLORS, DATE_DISPLAY_FORMATS } from '../constants';
import formatValue from './format';

type DatasetsMeta = { [key: string]: boolean | string | number };

export type Props = {
  displayAsPercentage?: boolean;
  ds?: Dataset;
  granularity?: Granularity;
  isTSGroupedBarChart?: boolean;
  maxSegments?: number;
  metric: Measure;
  metric2?: Measure;
  results: DataResponse;
  segment: Dimension;
  showLabels?: boolean;
  showLegend?: boolean;
  showTotals?: boolean;
  title?: string;
  totals?: { [key: string]: { total: number; lastSegment: number | null } };
  useCustomDateFormat?: boolean;
  xAxis: Dimension;
  yAxisTitle?: string;
  stackBars?: boolean;
  AbsolutePercentage?: boolean;
};

type LabelRef = { [key: string]: number | null };

export default function getStackedChartData(
  props: Props,
  datasetsMeta: DatasetsMeta,
): ChartData<'bar', number[], unknown> {
  const { results, xAxis, segment, metric, metric2, maxSegments } = props;

  const labels = [...new Set(results?.data?.map((d: Record<string, any>) => d[xAxis?.name || '']))];

  const segmentsList = segmentsToInclude();
  const resultMap: { [key: string]: LabelRef } = {};

  const defaultSegmentValue = null;

  labels.forEach((label) => {
    const labelRef: LabelRef = {};
    segmentsList.forEach((s) => (labelRef[s] = defaultSegmentValue));
    resultMap[label] = labelRef;
  });

  results?.data?.forEach((d) => {
    const seg = d[segment?.name || ''];
    const axis = d[xAxis?.name || ''];
    if (segmentsList.includes(seg)) {
      resultMap[axis][seg] = parseFloat(d[metric.name]);
    } else {
      resultMap[axis]['Other'] = (resultMap[axis]['Other'] || 0) + parseFloat(d[metric.name]);
    }
  });

  const datasets = segmentsList
  .map((s, i) => {
    const mainDataset: any = {
      ...datasetsMeta,
      backgroundColor: COLORS[i % COLORS.length],
      borderColor: COLORS[i % COLORS.length],
      // ✅ include segment.value (metric.title)
      label: `${s} (${metric.title})`,
      data: labels.map((label) => resultMap[label][s]),
      yAxisID: 'y', // primary axis
    };

    if (metric2) {
      const secondaryDataset: any = {
        ...datasetsMeta,
        backgroundColor: COLORS[i % COLORS.length],
        borderColor: COLORS[i % COLORS.length],
        // ✅ also use segment.value (metric2.title)
        label: `${s} (${metric2.title})`,
        data: labels.map((label) => {
          const d2 = results.data.find(
            (r) => r[xAxis.name] === label && r[segment.name] === s
          );
          return d2 ? parseFloat(d2[metric2.name]) : null;
        }),
        yAxisID: 'y1', // secondary axis
      };
      return [mainDataset, secondaryDataset];
    }

    return [mainDataset];
  })
  .flat();


  return {
    labels: labels.map((l) => formatValue(l, { meta: xAxis?.meta })),
    datasets,
  };

  function segmentsToInclude(): string[] {
    const uniqueSegments = [
      ...new Set(results?.data?.map((d: Record<string, any>) => d[segment?.name || ''] || 'No value')),
    ];

    if (!maxSegments || uniqueSegments.length <= maxSegments || maxSegments < 1) {
      return uniqueSegments;
    }

    const segmentTotals: { [key: string]: number } = {};
    results?.data?.forEach((d) => {
      segmentTotals[d[segment?.name || '']] =
        (segmentTotals[d[segment?.name || '']] || 0) + parseInt(d[metric?.name] || '0');
    });

    const summedSegments = Object.keys(segmentTotals)
      .map((item) => ({ name: item, value: segmentTotals[item] }))
      .sort((a, b) => b.value - a.value);

    const topSegments = summedSegments.slice(0, maxSegments).map((s) => s.name);
    topSegments.push('Other');
    return topSegments;
  }
}
