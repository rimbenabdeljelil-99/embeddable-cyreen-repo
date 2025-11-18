import React, { useRef } from 'react';
import { DataResponse, Measure } from '@embeddable.com/core';
import Title from '../Title';

type Props = {
  title?: string;
  metrics?: Measure[]; // first = min timestamp, second = max timestamp
  results: DataResponse;
  titleFontSize?: number;
  bodyFontSize?: number;
};

export default function PeriodDisplay({ title, metrics, results, titleFontSize, bodyFontSize }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const firstKPI = metrics?.[0];
  const secondKPI = metrics?.[1];

  const minValue = firstKPI ? results?.data?.[0]?.[firstKPI.name] ?? 'N/A' : 'N/A';
  const maxValue = secondKPI ? results?.data?.[0]?.[secondKPI.name] ?? 'N/A' : 'N/A';

  const containerStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    maxWidth: '400px',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: titleFontSize ? `${titleFontSize}px` : '22px',
    fontWeight: 'bold',
    color: '#a53241',
    marginBottom: '15px',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : '14px',
    lineHeight: '1.6',
    color: '#333942',
  };

  const valueStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: '#AF3241',
  };

  return (
    <div ref={chartRef} style={containerStyle}>
      {title && <Title title={title} style={titleStyle} />}
      <div style={bodyStyle}>
        <div><strong>Period:</strong></div>
        <div>
          From <span style={valueStyle}>{minValue}</span> Until <span style={valueStyle}>{maxValue}</span>
        </div>
      </div>
    </div>
  );
}
