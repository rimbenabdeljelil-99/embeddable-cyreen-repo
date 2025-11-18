import { DataResponse, Dimension, Granularity, Measure } from '@embeddable.com/core';

import useTimeseries from '../../../hooks/useTimeseries';
import { useState, useEffect } from 'react';
import Container from '../../Container';
import BarChart from './components/BarChart';
import { BlocklistConfig } from 'tailwindcss/types/config';

type Props = {
  description?: string;
  displayHorizontally?: boolean;
  dps?: number;
  enableDownloadAsCSV?: boolean;
  granularity?: Granularity;
  isTSBarChart?: boolean;
  limit?: number;
  metrics: Measure[];
  lineMetrics?: Measure[];
  results: DataResponse;
  reverseXAxis?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  sortBy?: Dimension | Measure;
  stackMetrics?: boolean;
  title?: string;
  xAxis: Dimension;
  xAxisTitle?: string;
  yAxisTitle?: string;
  showSecondYAxis?: boolean;
  secondAxisTitle?: string;
  Overview?: boolean
  Explanation?: string
};

export default (props: Props) => {
  //add missing dates to time-series barcharts
  const { fillGaps } = useTimeseries(props, 'desc');
  const { results, isTSBarChart } = props;
  const [showLabels, setShowLabels] = useState(props.showLabels || false);
  const updatedProps = {
    ...props,
    showLabels,
    onToggleLabels: setShowLabels,
    results: isTSBarChart
      ? { ...props.results, data: results?.data?.reduce(fillGaps, []) }
      : props.results,
  };

  return (
    <Container {...updatedProps} className="overflow-y-hidden">
      <BarChart {...updatedProps} />
    </Container>
  );
};