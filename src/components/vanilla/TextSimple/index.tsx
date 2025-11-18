import React from 'react';
import Title from '../Title';

type Props = {
  title?: string;
  body?: string; // kept for backward compatibility
  titleFontSize?: number;
  bodyFontSize?: number;
  Filter1Value?: string[];
  Filter1Title?: string[];
  Filter2Value?: string[];
  Filter2Title?: string[];
  Filter3Value?: string[];
  Filter3Title?: string[];
  Filter4Value?: string[];
  Filter4Title?: string[];
  Filter5Value?: string[];
  Filter5Title?: string[];
  Filter6Value?: number[];
  Filter6Title?: string[];
  clientContext?: {
    language?: string;
  };
};

export default (props: Props) => {
  const {
    title,
    titleFontSize,
    bodyFontSize,
    Filter1Title, Filter1Value,
    Filter2Title, Filter2Value,
    Filter3Title, Filter3Value,
    Filter4Title, Filter4Value,
    Filter5Title, Filter5Value,
    Filter6Title, Filter6Value,
  } = props;

  // Combine all filters into one flat array
  const flatFilters = [
    { titles: Filter1Title, values: Filter1Value },
    { titles: Filter2Title, values: Filter2Value },
    { titles: Filter3Title, values: Filter3Value },
    { titles: Filter4Title, values: Filter4Value },
    { titles: Filter5Title, values: Filter5Value },
    { titles: Filter6Title, values: Filter6Value?.map(String) }, // convert numbers to strings
  ]
    .flatMap(f => {
      if (!f.titles || !f.values) return [];
      const length = Math.min(f.titles.length, f.values.length);
      return Array.from({ length }, (_, i) => ({
        title: f.titles![i],
        value: f.values![i],
      }));
    })
    .filter(f => f.title && f.value);

  // Group by title
  const groupedFilters: Record<string, string[]> = {};
  flatFilters.forEach(f => {
    if (!groupedFilters[f.title]) groupedFilters[f.title] = [];
    groupedFilters[f.title].push(f.value);
  });

  const containerStyle = {
    padding: '20px',
    borderRadius: '8px',
  };

  const titleStyle = {
    fontSize: titleFontSize ? `${titleFontSize}px` : 'inherit',
    lineHeight: titleFontSize ? '1.2em' : 'inherit',
    fontWeight: 'bold' as const,
    marginBottom: '10px',
  };

  const filterStyle = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : 'inherit',
    lineHeight: bodyFontSize ? '1.4em' : 'inherit',
    fontWeight: 'normal' as const,
  };

  return (
    <div style={containerStyle}>
      {title && <Title title={title} style={titleStyle} />}
      {Object.keys(groupedFilters).length > 0 && (
        <span style={filterStyle}>
          {Object.entries(groupedFilters)
            .map(([filterTitle, values]) => (
              <React.Fragment key={filterTitle}>
                <strong>{filterTitle}:</strong> {values.join(', ')}
              </React.Fragment>
            ))
            .reduce((prev, curr) => prev === null ? [curr] : [...prev, ' ; ', curr], null as React.ReactNode[] | null)}
        </span>
      )}
    </div>
  );
};
