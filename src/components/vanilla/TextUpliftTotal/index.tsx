import React, { useEffect, useState, useRef } from 'react';
import Title from '../Title';
import Description from '../Description';
import { translateText } from '../translateText';
import { Measure, DataResponse } from '@embeddable.com/core';
import DownloadMenu from '../DownloadMenu';

type Props = {
  title?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  body?: string;
  KPIvalue?: string;
  metrics: Measure[];
  results: DataResponse;
  AbsolutePercentage?: boolean;
  clientContext?: {
    language?: string;
  };
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  master?: boolean;
  Explanation?: string;
  kpi?: string
};

export default (props: Props) => {
  const {
    title,
    body,
    titleFontSize,
    metrics,
    bodyFontSize,
    results,
    KPIvalue,
    AbsolutePercentage,
    clientContext,
    enableDownloadAsCSV,
    enableDownloadAsPNG,
    master, Explanation,
    kpi
  } = props;

  const { isLoading, data, error } = results;
  const language = clientContext?.language;

  const [translatedTitle, setTranslatedTitle] = useState(title || '');
  const [translatedBody, setTranslatedBody] = useState(body || '');
  const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  const chartRef = useRef<HTMLDivElement>(null);
  const [preppingDownload, setPreppingDownload] = useState(false);

  // Divide metrics into two slices
  const slice1 = metrics.slice(0, 2);
  const slice2 = metrics.slice(2, 4);
  const selectedSlice = AbsolutePercentage ? slice2 : slice1;

  let metricValue: any = null;
  let displayBody = body;

  if (KPIvalue?.includes('Units of Sales') && selectedSlice[0]) {
    metricValue = data?.[0]?.[selectedSlice[0].name];
    if (!master) {
      displayBody = 'Units of Sales';
    }
  } else if (KPIvalue?.includes('Sales in (€)') && selectedSlice[1]) {
    metricValue = data?.[0]?.[selectedSlice[1].name];
    displayBody = 'Sales in (€)';
  }

  const displayMetricValue =
    metricValue !== null && metricValue !== undefined
      ? master
        ? `+${Math.round(Number(metricValue))}%`
        : AbsolutePercentage
          ? `+${Number(metricValue).toLocaleString("en-US")}%`
          : KPIvalue?.includes('Sales in (€)')
            ? `+$${Number(metricValue).toLocaleString("en-US")}`
            : `+${Number(metricValue).toLocaleString("en-US")}`
      : 'No data';

  // Translation side effect
  useEffect(() => {
    const doTranslation = async () => {
      if (!language) return;

      if (title) {
        const translated = await translateText(title, language);
        setTranslatedTitle(translated);
      }

      if (displayBody) {
        const translatedBodyText = await translateText(displayBody, language);
        setTranslatedBody(translatedBodyText);
      }
    };

    doTranslation();
  }, [language, title, displayBody]);

  // Tooltip handlers
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!master) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const yPos = e.clientY - rect.top;
    setShowTooltip(yPos > 20 && !isOverDownloadMenu);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!master) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const yPos = e.clientY - rect.top;

    setMousePos({
      x: e.clientX - rect.left,
      y: yPos,
    });

    setShowTooltip(yPos > 20 && !isOverDownloadMenu);
  };

  // Style settings
  const titleStyle = {
    fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
    lineHeight: titleFontSize ? '1.2em' : undefined,
    color: '#a53241',
    fontFamily: 'Arial, sans-serif',
  };

  const bodyStyle = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : undefined,
    lineHeight: bodyFontSize ? '1.2em' : undefined,
    color: '#00aa00',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
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
      style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
        height: '100%',
        position: 'relative'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (!isOverDownloadMenu) {
          setShowTooltip(false);
        }
      }}
      onMouseMove={handleMouseMove}
    >
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
          onMouseLeave={() => {
            setIsOverDownloadMenu(false);
            if (!preppingDownload && master) {
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
            Explanation={Explanation}
                        onCloseExplanation={() => {
      setIsOverDownloadMenu(false);
      setShowTooltip(true);
  }}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={(prepping) => {
              setPreppingDownload(prepping);
              if (!prepping) {
                setIsOverDownloadMenu(false);
                if (master) {
                  setShowTooltip(true);
                }
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

      {translatedTitle && <Title title={translatedTitle} style={titleStyle} />}
      <Description
        description={`${displayMetricValue} ${translatedBody || displayBody ? ` ${translatedBody || displayBody}` : ''}`}
        style={bodyStyle}
      />

      {master && showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: `${mousePos.y + 10}px`,
            left: `${Math.min(mousePos.x + 10, containerWidth - 240)}px`,
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '10px',
            borderRadius: '6px',
            zIndex: 10,
            width: 'max-content',
            maxWidth: '300px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
            {kpi} is {displayMetricValue}
          </div>
        </div>
      )}
    </div>
  );
};