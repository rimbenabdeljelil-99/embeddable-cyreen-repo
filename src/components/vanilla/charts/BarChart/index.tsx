import { DataResponse, Dimension, Granularity, Measure } from '@embeddable.com/core';
import useTimeseries from '../../../hooks/useTimeseries';
import Container from '../../Container';
import BarChart from './components/BarChart';
import { useState, useEffect } from 'react';
import { translateText } from '../../translateText';

type Props = {
  description?: string;
  displayHorizontally?: boolean;
  dps?: number;
  enableDownloadAsCSV?: boolean;
  granularity?: string;
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
  impression?: boolean;
  optimization?: boolean;
  showSecondYAxis?: boolean;
  secondAxisTitle?: string;
  Totalperformance?: boolean;
  KPIvalue?: string;
  clientContext?: {
    language?: string;
  };
  Explanation?: string
};

export default (props: Props) => {
  const { fillGaps } = useTimeseries(props, 'desc');
  const { title, clientContext, results, isTSBarChart, granularity } = props;
  const language = clientContext?.language;
  const [showLabels, setShowLabels] = useState(props.showLabels || false);
  const [translatedTitle, setTranslatedTitle] = useState<string | undefined>(title);

  useEffect(() => {
    const translateAll = async () => {
      if (!language) return;

      if (title) {
        const translated = await translateText(title, language);
        setTranslatedTitle(translated);
      }
    };

    translateAll();
  }, [language, title]);

  const updatedProps = {
    translatedTitle,
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