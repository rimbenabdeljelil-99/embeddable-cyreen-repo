import React, { useEffect, useState, useMemo, useRef } from 'react';
import Title from '../Title';
import { Measure, DataResponse } from '@embeddable.com/core';
import { translateText } from '../translateText';
import DownloadMenu from '../DownloadMenu';

type Props = {
  title?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  metrics?: Measure[];
  results: DataResponse;
  KPIvalue?: string[];
  AbsolutePercentage?: boolean;
  clientContext?: {
    language?: string;
  };
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  Explanation?: string
};

export default (props: Props) => {
  const {
    title,
    titleFontSize,
    bodyFontSize,
    metrics,
    results,
    KPIvalue,
    AbsolutePercentage,
    clientContext,
    enableDownloadAsCSV,
    enableDownloadAsPNG, Explanation
  } = props;

  const { isLoading, data, error } = results;
  const language = clientContext?.language;

  const [translatedTitle, setTranslatedTitle] = useState(title || '');
  const [translatedMetricTitles, setTranslatedMetricTitles] = useState<string[]>([]);
  const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const [preppingDownload, setPreppingDownload] = useState(false);

  const row = data?.[0];

  const titleStyle = {
    fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
    lineHeight: titleFontSize ? '1.2em' : undefined,
    color: '#a53241',
    fontFamily: 'Arial, sans-serif',
  };

  const bodyStyle = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : undefined,
    lineHeight: bodyFontSize ? '1.2em' : undefined,
    color: '#62626e',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  };

  const displayedMetrics: Measure[] = useMemo(() => {
    if (!metrics || !Array.isArray(metrics)) return [];

    if (KPIvalue?.includes('Units of Sales')) {
      return metrics.slice(0, 3);
    } else if (KPIvalue?.includes('Sales in (€)')) {
      return metrics.slice(-3);
    } else {
      return metrics;
    }
  }, [metrics, KPIvalue]);

  useEffect(() => {
    const doTranslation = async () => {
      if (!language) return;

      if (title) {
        const translated = await translateText(title, language);
        setTranslatedTitle(translated);
      }

      if (displayedMetrics && Array.isArray(displayedMetrics)) {
        const translations = await Promise.all(
          displayedMetrics.map((m) => translateText(m.title || '', language))
        );
        setTranslatedMetricTitles(translations);
      }
    };

    doTranslation();
  }, [language, title, displayedMetrics]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data || !Array.isArray(data) || data.length === 0) return <div>No data available</div>;

  return (
    <div
      ref={chartRef}
      style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
        height: '100%',
        position: 'relative'
      }}>
      {/* Download Menu - with mouse event handlers */}
      {(enableDownloadAsCSV || enableDownloadAsPNG) && (
        <div
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '14px',
            zIndex: 1000,
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
            border: 'none',
            outline: 'none'
          }}
          onMouseEnter={() => setIsOverDownloadMenu(true)}
          onMouseLeave={() => setIsOverDownloadMenu(false)}
        >
          <DownloadMenu
            csvOpts={{
              chartName: props.title || 'chart',
              props: {
                ...props,
                results: results,
              },
            }}
            Explanation={Explanation}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>
      )}

      {translatedTitle && <Title title={translatedTitle} style={titleStyle} />}

      {displayedMetrics.length > 0 ? (
        displayedMetrics.map((m, index, arr) => {
          const metricName = m.name;
          const originalValue = row?.[metricName] ?? 'N/A';

          let displayValue = originalValue;
          if (!AbsolutePercentage && !isNaN(Number(originalValue))) {
            const formattedNumber = Number(originalValue).toLocaleString("en-US");
            displayValue = KPIvalue?.includes('Sales in (€)') ? `${formattedNumber} €` : formattedNumber;
          }

          if (AbsolutePercentage && arr.length === 3) {
            const referenceValue = row?.[arr[2].name];
            if (
              referenceValue &&
              !isNaN(originalValue) &&
              !isNaN(referenceValue) &&
              referenceValue !== 0
            ) {
              displayValue =
                index === 2
                  ? '100%'
                  : `${Math.round((originalValue / referenceValue) * 100).toLocaleString("en-US")}%`;
            }
          }

          const translatedMetricTitle = translatedMetricTitles[index] || m.title;

          return (
            <div key={metricName} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={bodyStyle}>{translatedMetricTitle}</span>
              <span style={bodyStyle}>{displayValue}</span>
            </div>
          );
        })
      ) : (
        <div>No metrics available</div>
      )}
    </div>
  );
};