import React, { useEffect, useState, useRef } from 'react';
import Title from '../Title';
import Description from '../Description';
import { Dimension, DataResponse, DimensionOrMeasure, Measure } from '@embeddable.com/core';
import Edeka from '../../../assets/Edeka.png';
import Progetranke from '../../../assets/Progetranke.png';
import Consistorial from '../../../assets/Consistorial.png';
//import Ferrero from '../../../assets/Ferrero.png';
import LL from '../../../assets/LL.png';
import LT from '../../../assets/LT.png';
import PF from '../../../assets/PF.png';
import VV from '../../../assets/vv.png';
import DownloadMenu from '../DownloadMenu';

const iconMap: { [key: number]: string } = {
  3: LL,
  5: LT,
  6: PF,
  7: VV,
  8: Consistorial,
  18: Edeka,
  //163: Ferrero,
};

type Props = {
  title?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  body?: string;
  icon?: string;
  granularity?: string;
  metrics?: Measure[];
  dimensions?: Dimension[]; // First = X, Second = Y
  results: DataResponse;
  clientContext?: {
    language?: string;
  };
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
};

function darkenColor(color: string): string {
  const shades: Record<string, string> = {
    green: '#006400',             // dark green
    pistache: '#3A5F0B',         // darker pistache
    yellow: '#b8860b',           // dark goldenrod (dark yellow)
    orange: '#cc5500',           // dark orange
    red: '#AF3241',              // dark red
  };
  return shades[color] || color;
}

export default (props: Props) => {
  const {
    title,
    body,
    titleFontSize,
    bodyFontSize,
    results,
    icon,
    dimensions,
    metrics,
    enableDownloadAsCSV,
    enableDownloadAsPNG,
    clientContext
  } = props;

  const { isLoading, data, error } = results;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [preppingDownload, setPreppingDownload] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    border: '1px solid #ccc',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
    height: 'auto',
    minHeight: '450px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
    lineHeight: '1.2em',
    color: '#a53241',
    fontFamily: 'Arial, sans-serif',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : 'inherit',
    fontWeight: 'bold',
    marginTop: '10px',
  };

  // Filter data based on storeId and id_reader_type condition
  const filteredData = Array.isArray(data) ? data.filter((item) => {
    const storeId = item[dimensions?.[2]?.name || 'id_store'];
    const readerType = item[dimensions?.[3]?.name || 'id_reader_type'];
    const storeIdNum = Number(storeId);

    // If storeId is 3,5,6,7,8, only include items with id_reader_type = 1
    if ([3, 5, 6, 7, 8].includes(storeIdNum)) {
      return Number(readerType) === 1;
    }
    // For other storeIds, include all items
    return true;
  }) : [];

  const storeId = filteredData[0]?.[dimensions?.[2]?.name || 'id_store'];
  const iconUrl = storeId ? iconMap[Number(storeId)] || null : null;
  const isFerreroStore = Number(storeId) === 163;

  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const imageWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    marginTop: '15px',
    borderRadius: '6px',
    flex: '1 0 auto' // Grow but don't shrink below content
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '6px',
  };

  // Extract metric values from filtered data
  const metricValues = filteredData
    .map((item) => Number(item[metrics?.[0]?.name || 'value']))
    .filter(v => !isNaN(v));

  // Tableau-style smart binning
  const sortedValues = [...metricValues].sort((a, b) => a - b);
  const total = sortedValues.length;

  const getColorForValue = (value: number, hovered = false): string => {
    const minValue = Math.min(...sortedValues);
    const maxValue = Math.max(...sortedValues);
    const range = maxValue - minValue;

    if (isFerreroStore) {
      // 5-color scale for Ferrero stores
      const stepSize = range / 5;
      const threshold1 = minValue + stepSize;
      const threshold2 = minValue + (2 * stepSize);
      const threshold3 = minValue + (3 * stepSize);
      const threshold4 = minValue + (4 * stepSize);

      if (value <= threshold1) return hovered ? darkenColor('green') : '#006400'; // dark green
      if (value <= threshold2) return hovered ? darkenColor('pistache') : '#93C572'; // pistache green
      if (value <= threshold3) return hovered ? darkenColor('yellow') : '#F4D03F'; // yellow
      if (value <= threshold4) return hovered ? darkenColor('orange') : '#FFA500'; // orange
      return hovered ? darkenColor('red') : '#f04b55'; // red
    } else {
      // 3-color scale for other stores
      const stepSize = range / 3;
      const lowThreshold = minValue + stepSize;
      const mediumThreshold = minValue + (2 * stepSize);

      if (value <= lowThreshold) return hovered ? darkenColor('green') : '#006400';
      if (value <= mediumThreshold) return hovered ? darkenColor('yellow') : '#F4D03F';
      return hovered ? darkenColor('red') : '#f04b55';
    }
  };

  const markerStyle = (x: number, y: number, color: string): React.CSSProperties => ({
    position: 'absolute',
    left: `${x}%`,
    top: isFerreroStore ? `${100 - y}%` : `${100 - (y / 50) * 100}%`,
    width: '45px',
    height: '45px',
    backgroundColor: color,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  });

  const markers = filteredData.map((item, index) => {
    const x = item[dimensions?.[0]?.name || 'x'];
    const y = item[dimensions?.[1]?.name || 'y'];
    const metricValue = Number(item[metrics?.[0]?.name || 'value']);

    const isHovered = hoveredMetric === metricValue;
    const markerColor = getColorForValue(metricValue, isHovered);

    if (typeof x === 'number' && typeof y === 'number' && !isNaN(metricValue)) {
      return (
        <div
          key={index}
          style={markerStyle(x, y, markerColor)}
          onMouseEnter={(e) => {
            const rect = chartRef.current?.getBoundingClientRect();
            setTooltipPos({
              x: e.clientX - (rect?.left || 0),
              y: e.clientY - (rect?.top || 0),
            });
            setHoveredMetric(metricValue);
          }}
          onMouseLeave={() => {
            setHoveredMetric(null);
            setTooltipPos(null);
          }}
        />
      );
    }
    return null;
  });

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

  return (
    <div
      ref={(el) => {
        chartRef.current = el;
        if (el) {
          const { width } = el.getBoundingClientRect();
          setContainerWidth(width);
        }
      }}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (!isOverDownloadMenu) {
          setShowTooltip(false);
        }
      }}
      onMouseMove={handleMouseMove}
    >
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
          onMouseLeave={() => {
            setIsOverDownloadMenu(false);
            if (!preppingDownload) {
              setShowTooltip(true);
            }
          }}
        >
          <DownloadMenu
            csvOpts={{
              chartName: props.title || 'chart',
              props: {
                ...props,
                results: results,
              },
            }}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={(prepping) => {
              setPreppingDownload(prepping);
              if (!prepping) {
                setIsOverDownloadMenu(false);
                setShowTooltip(true);
              }
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>
      )}

      {title && <Title title={title} style={titleStyle} />}
      {body && <Description description={body} style={bodyStyle} />}
      {iconUrl && (
        <div style={imageWrapperStyle}>
          <img src={iconUrl} alt="Heatmap" style={imageStyle} />
          {markers}
        </div>
      )}

      {tooltipPos && hoveredMetric && (
        <div
          style={{
            position: 'absolute',
            top: `${tooltipPos.y + 10}px`,
            left: `${Math.min(tooltipPos.x + 10, containerWidth - 290)}px`,
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '10px',
            borderRadius: '6px',
            zIndex: 10,
            width: 'max-content',
            maxWidth: '300px',
            pointerEvents: 'none',
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#000',
          }}
        >
          Amount of shoppers that passed this position is <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{parseFloat(hoveredMetric).toLocaleString('en-US')}</span>
        </div>
      )}
    </div>
  );
};