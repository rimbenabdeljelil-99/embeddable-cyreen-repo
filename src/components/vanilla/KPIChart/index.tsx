import React, { useState, useRef, useEffect } from 'react';
import { DataResponse, Measure } from '@embeddable.com/core';
import DownloadMenu from '../DownloadMenu';
import TimesplitIcon from '../../../assets/Timesplit.png';
import CheckoutEvents from '../../../assets/CheckoutEvents.png';
import Frequency from '../../../assets/Frequency.png';
import EngagementRate from '../../../assets/EngagementRate.png';
import gender from '../../../assets/gender.png';
import kpis from '../../../assets/kpis.png';

type Props = {
  title?: string;
  metrics?: Measure[];
  results: DataResponse;
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  Despar?: boolean;
  Explanation?: string;
};

export default (props: Props) => {
  const { title, metrics, results, enableDownloadAsCSV, enableDownloadAsPNG, Despar, Explanation } = props;

  const { isLoading, data } = results;

  const firstKPI = metrics?.[0];
  const secondKPI = metrics?.[1];

  const firstValue = firstKPI ? (data?.[0]?.[firstKPI.name] ?? 'No data') : null;
  const secondValue = secondKPI ? (data?.[0]?.[secondKPI.name] ?? 'No data') : null;

  const chartRef = useRef<HTMLDivElement>(null);
  const [preppingDownload, setPreppingDownload] = useState(false);
  const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [Percentage, setPercentage] = useState(false); // ✅ Added percentage toggle

  useEffect(() => {
    if (chartRef.current) {
      const { width } = chartRef.current.getBoundingClientRect();
      setContainerWidth(width);
    }
  }, []);

  function formatNumber(value: number | string | null, despar?: boolean): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'No data';
    }
    const num = Number(value);
    return despar
      ? num.toLocaleString('en-US').replace(/,/g, '.')
      : num.toLocaleString('en-US');
  }

  function formatKPIValue(title?: string, value?: number | string | null, despar?: boolean): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'No data';
    }

    let num = Number(value);

    if (title === 'Average Dwell Time') {
      num = Number(num.toFixed(1));
      return `${num} Seconds`;
    }

    if (title === 'Frequency') {
      return `${formatNumber(num, despar)} Visitors`;
    }

    if (title === 'Engagement Rate') {
      num = Number(num.toFixed(1));
      return `${num}%`;
    }

    return formatNumber(num, despar);
  }

  const formattedFirstValue = formatKPIValue(title, firstValue, Despar);

  // Tooltip logic
  const getTooltipContent = () => {
  if (!title || isLoading) return null;

  if (title === 'Gender') {
    const male = Number(firstValue) || 0;
    const female = Number(secondValue) || 0;
    const total = male + female;

    const maleDisplay = Percentage && total > 0 ? `${((male / total) * 100).toFixed(0)}%` : formatNumber(male, Despar);
    const femaleDisplay = Percentage && total > 0 ? `${((female / total) * 100).toFixed(0)}%` : formatNumber(female, Despar);

    return (
      <>
        The <strong style={{ color: '#AF3241' }}>Male Visitors</strong> are{' '}
        <strong style={{ color: '#AF3241' }}>{maleDisplay}</strong> and the{' '}
        <strong style={{ color: '#AF3241' }}>Female Visitors</strong> are{' '}
        <strong style={{ color: '#AF3241' }}>{femaleDisplay}</strong> for the{' '}
        <strong style={{ color: '#AF3241' }}>Better For You Zone</strong>.
      </>
    );
  }

  let num = Number(firstValue);

  if (title === 'Frequency') {
    return (
      <>
        The total <strong style={{ color: '#AF3241' }}>Visitors Frequency</strong> for{' '}
        <strong style={{ color: '#AF3241' }}>Better For You zone</strong> is{' '}
        <strong style={{ color: '#AF3241' }}>{formatNumber(firstValue, Despar)}</strong>.
      </>
    );
  }

  if (title === 'Average Dwell Time') {
    num = Number(num.toFixed(1));
    return (
      <>
        The <strong style={{ color: '#AF3241' }}>Average Dwell Time</strong> for{' '}
        <strong style={{ color: '#AF3241' }}>Better For You zone</strong> is{' '}
        <strong style={{ color: '#AF3241' }}>{num} seconds</strong>.
      </>
    );
  }

  if (title === 'Engagement Rate') {
    num = Number(num.toFixed(1));
    return (
      <>
        The <strong style={{ color: '#AF3241' }}>Engagement Rate</strong> for{' '}
        <strong style={{ color: '#AF3241' }}>Better For You zone</strong> is{' '}
        <strong style={{ color: '#AF3241' }}>{num}%</strong>.
      </>
    );
  }

  return null;
};


  const tooltipContent = getTooltipContent();

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const yPos = e.clientY - rect.top;
    setShowTooltip(yPos > 20 && !isOverDownloadMenu);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const yPos = e.clientY - rect.top;
    setMousePos({
      x: e.clientX - rect.left,
      y: yPos,
    });
    setShowTooltip(yPos > 20 && !isOverDownloadMenu);
  };

  const getBottomRightIcon = () => {
    if (title === 'Frequency') return Frequency;
    if (title === 'Average Dwell Time') return TimesplitIcon;
    if (title === 'Engagement Rate') return EngagementRate;
    if (title === 'Gender') return gender;
    return null;
  };

  const bottomRightIcon = getBottomRightIcon();

  return (
    <div
      ref={chartRef}
      style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        height: '100%',
        backgroundColor: 'white'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (!isOverDownloadMenu) setShowTooltip(false);
      }}
      onMouseMove={handleMouseMove}
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
              props: { ...props, results: results },
            }}
            Explanation={Explanation}
            title={props.title}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
            Percentage={Percentage}              // ✅ Added
            setPercentage={setPercentage}        // ✅ Added
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>
      )}

      {/* Title */}
      {title && (
        <h2
          style={{
            color: '#a53241',
            fontSize: '23px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {title}
        </h2>
      )}

      {/* KPI Value */}
      {title === 'Gender' ? (() => {
        const male = Number(firstValue) || 0;
        const female = Number(secondValue) || 0;
        const total = male + female;
        const maleDisplay =
          Percentage && total > 0 ? `${((male / total) * 100).toFixed(0)}%` : formatNumber(male, Despar);
        const femaleDisplay =
          Percentage && total > 0 ? `${((female / total) * 100).toFixed(0)}%` : formatNumber(female, Despar);

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '80px',
              marginTop: '15px',
              justifyContent: 'flex-start',
              paddingRight: '70px',
            }}
          >
            {/* Male Visitors */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
                {isLoading ? '...' : maleDisplay}
              </div>
              <div style={{ fontSize: '14px', color: '#a53241', marginTop: '5px' }}>Male Visitors</div>
            </div>

            {/* Divider */}
            <div style={{ width: '2px', backgroundColor: '#AF3241', margin: '0 10px' }} />

            {/* Female Visitors */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
                {isLoading ? '...' : femaleDisplay}
              </div>
              <div style={{ fontSize: '14px', color: '#a53241', marginTop: '5px' }}>Female Visitors</div>
            </div>
          </div>
        );
      })() : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '15px' }}>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#333942'
            }}
          >
            {isLoading ? '...' : formattedFirstValue}
          </div>
        </div>
      )}

      {/* Bottom-right KPI Icon */}
      {bottomRightIcon && (
        <img
          src={bottomRightIcon}
          alt={`${title} icon`}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '60px',
            height: '60px',
            opacity: 0.9,
          }}
        />
      )}

      {/* Tooltip */}
      {showTooltip && tooltipContent && (
        <div
          style={{
            position: 'absolute',
            top: `${mousePos.y + 10}px`,
            left: `${Math.min(mousePos.x + 10, containerWidth - 290)}px`,
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '10px',
            borderRadius: '6px',
            zIndex: 10,
            width: 'max-content',
            maxWidth: '300px',
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#000',
            pointerEvents: 'none',
            lineHeight: '1.4',
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
