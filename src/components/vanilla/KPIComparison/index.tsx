import React, { useState, useRef, useEffect } from 'react';
import { DataResponse, Measure } from '@embeddable.com/core';
import TimesplitIcon from '../../../assets/Timesplit.png';
import Frequency from '../../../assets/Frequency.png';
import EngagementRate from '../../../assets/EngagementRate.png';
import gender from '../../../assets/gender.png';
import DownloadMenu from '../DownloadMenu';

type Props = {
  title?: string;
  metrics?: Measure[];
  metrics2?: Measure[];
  metrics3?: Measure[];
  primaryResults: DataResponse;
  comparisonResults: DataResponse;
  primaryResults2: DataResponse;
  comparisonResults2: DataResponse;
  primaryResults3: DataResponse;
  comparisonResults3: DataResponse;
  primaryRange?: { from?: string; to?: string; relativeTimeString?: string };
  comparisonRange?: { from?: string; to?: string; relativeTimeString?: string };
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  Despar?: boolean;
  Explanation?: string;
};

export default (props: Props) => {
  const {
    title,
    metrics,
    metrics2,
    metrics3,
    primaryResults,
    comparisonResults,
    primaryResults2,
    comparisonResults2,
    primaryResults3,
    comparisonResults3,
    primaryRange,
    comparisonRange,
    enableDownloadAsCSV,
    enableDownloadAsPNG,
    Despar,
    Explanation
  } = props;

  // 🧠 Select which dataset to use based on the title
  let activeMetrics: Measure[] | undefined = metrics;
  let activePrimary = primaryResults;
  let activeComparison = comparisonResults;
  const [preppingDownload, setPreppingDownload] = useState(false);
  const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (title?.toLowerCase() === 'average dwell time') {
    activeMetrics = metrics2;
    activePrimary = primaryResults2;
    activeComparison = comparisonResults2;
  } else if (title?.toLowerCase() === 'engagement rate') {
    activeMetrics = metrics3;
    activePrimary = primaryResults3;
    activeComparison = comparisonResults3;
  }

  const { isLoading: isPrimaryLoading, data: primaryData } = activePrimary;
  const { isLoading: isComparisonLoading, data: comparisonData } = activeComparison;

  const firstKPI = activeMetrics?.[0];
  const firstValue = firstKPI ? (primaryData?.[0]?.[firstKPI.name] ?? null) : null;
  const secondValue = firstKPI ? (comparisonData?.[0]?.[firstKPI.name] ?? null) : null;

  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (chartRef.current) {
      const { width } = chartRef.current.getBoundingClientRect();
      setContainerWidth(width);
    }
  }, []);

  // --- Formatting helpers ---
  const formatNumber = (value: number | string | null, despar?: boolean) => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'No data';
    const num = Number(value);
    return despar ? num.toLocaleString('en-US').replace(/,/g, '.') : num.toLocaleString('en-US');
  };

  const formatKPIValue = (title?: string, value?: number | string | null, despar?: boolean) => {
    if (value === null || value === undefined || isNaN(Number(value))) return 'No data';
    const num = Number(value);
    if (title?.toLowerCase() === 'average dwell time') return `${num.toFixed(1)} Seconds`;
    if (title?.toLowerCase() === 'frequency') return `${formatNumber(num, despar)} Visitors`;
    if (title?.toLowerCase() === 'engagement rate') return `${num.toFixed(1)}%`;
    return formatNumber(num, despar);
  };

  const formattedFirstValue = formatKPIValue(title, firstValue, Despar);
  const formattedSecondValue = formatKPIValue(title, secondValue, Despar);

  // --- Format period labels dynamically ---
  const formatRangeLabel = (range?: { from?: string; to?: string; relativeTimeString?: string }) => {
  if (!range) return '';

  // Use relativeTimeString if available
  if (range.relativeTimeString) return range.relativeTimeString;

  // Parse the dates
  const fromDate = range.from ? new Date(range.from) : null;
  const toDate = range.to ? new Date(range.to) : null;

  if (!fromDate) return '';

  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (!toDate || fromDate.getTime() === toDate.getTime()) {
    return formatDate(fromDate); // single day
  }

  return `${formatDate(fromDate)} - ${formatDate(toDate)}`; // range
};

  const firstPeriodLabel = formatRangeLabel(primaryRange);
  const secondPeriodLabel = formatRangeLabel(comparisonRange);

  // --- Icon selection ---
  const getBottomRightIcon = () => {
    if (title?.toLowerCase() === 'frequency') return Frequency;
    if (title?.toLowerCase() === 'average dwell time') return TimesplitIcon;
    if (title?.toLowerCase() === 'engagement rate') return EngagementRate;
    if (title?.toLowerCase() === 'gender') return gender;
    return null;
  };

  const bottomRightIcon = getBottomRightIcon();

  // --- Percentage difference ---
  const getPercentageDiff = () => {
    if (firstValue === null || secondValue === null) return null;
    const f = Number(firstValue);
    const s = Number(secondValue);
    if (isNaN(f) || isNaN(s) || f === 0) return null;
    const diff = ((s - f) / f) * 100;
    return {
      text: `${diff > 0 ? '+' : ''}${Math.round(diff)}%`,
      color: diff > 0 ? 'green' : 'red'
    };
  };

  const percentageDiff = getPercentageDiff();

  return (
    <div
      ref={chartRef}
      style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.15)',
        position: 'relative',
        height: '100%',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Download Menu */}
      {(enableDownloadAsCSV || enableDownloadAsPNG) && (
        <div
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '14px',
            zIndex: 1000,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={() => setIsOverDownloadMenu(true)}
          onMouseLeave={() => {
            setIsOverDownloadMenu(false);
            setShowTooltip(true);
          }}
        >
          <DownloadMenu
  csvOpts={{
    chartName: props.title || 'chart',
    props: {
      ...props,
      results: (() => {
        if (title?.toLowerCase() === 'frequency') {
          return {
            ...primaryResults,
            data: [...(primaryResults.data ?? []), ...(comparisonResults.data ?? [])],
          };
        } else if (title?.toLowerCase() === 'average dwell time') {
          return {
            ...primaryResults2,
            data: [...(primaryResults2.data ?? []), ...(comparisonResults2.data ?? [])],
          };
        } else if (title?.toLowerCase() === 'engagement rate') {
          return {
            ...primaryResults3,
            data: [...(primaryResults3.data ?? []), ...(comparisonResults3.data ?? [])],
          };
        } else {
          // fallback
          return props.primaryResults;
        }
      })(),
    },
  }}
  Explanation={Explanation}
  enableDownloadAsCSV={enableDownloadAsCSV}
  enableDownloadAsPNG={enableDownloadAsPNG}
  pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
  preppingDownload={preppingDownload}
  setPreppingDownload={setPreppingDownload}
/>

        </div>
      )}

      {/* Title */}
      {title && (
        <h2 style={{ color: '#a53241', fontSize: '23px', marginBottom: '20px' }}>{title}</h2>
      )}

{/* KPI Comparison */}
<div style={{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start', // align top
  height: '100px'
}}>
  {/* First Period */}
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '18px', color: '#a53241', marginBottom: '5px' }}>{firstPeriodLabel}</div>
    {/* Fixed height container to align values */}
    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
      {isPrimaryLoading ? '...' : formattedFirstValue}
    </div>
  </div>

  {/* Divider */}
  <div style={{ width: '2px', backgroundColor: '#AF3241', margin: '0 20px', height: '80%' }} />

  {/* Second Period */}
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '18px', color: '#a53241', marginBottom: '5px' }}>{secondPeriodLabel}</div>
    {/* Fixed height container for value */}
    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
      {isComparisonLoading ? '...' : formattedSecondValue}
    </div>
    {/* Percentage Difference under second value */}
    {percentageDiff && (
      <div style={{
        color: percentageDiff.color,
        fontWeight: 'bold',
        marginTop: '8px',
        fontSize: '21px',
        textAlign: 'center'
      }}>
        {percentageDiff.text}
      </div>
    )}
  </div>
</div>

{/* Bottom-right Icon only */}
{bottomRightIcon && (
  <div style={{ position: 'absolute', bottom: '10px', right: '10px', textAlign: 'center' }}>
    <img
      src={bottomRightIcon}
      alt={`${title} icon`}
      style={{ width: '60px', height: '60px', opacity: 0.9 }}
    />
  </div>
)}

    </div>
  );
};
