import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Dataset, Dimension, Measure, DataResponse, Granularity } from '@embeddable.com/core';
import DownloadMenu from '../vanilla/DownloadMenu';
type Props = {
  ds: Dataset;
  rowValues: Dimension[];
  columnValues: Dimension[];
  metrics: Measure[];
  granularity: string;
  resultsDimension0: DataResponse;
  nullValueCharacter?: string;
  minRowDimensionColumnWidth?: number;
  minColumnWidth?: number;
  ShowClips?: boolean;
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  title?: string;
  Despar?: boolean;
  Explanation?: string
};

// Memoized utility functions outside component
const formatDateDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const getWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(
    ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
};

const formatDate = (dateString: string, granularity: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  switch (granularity.toLowerCase()) {
    case 'week':
      return `Week ${getWeekNumber(date)}`;
    case 'month':
      return date.toLocaleString('en-US', { month: 'long' });
    case 'day':
      return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
    default:
      return dateString;
  }
};

export default (props: Props) => {
  const {
    rowValues,
    columnValues,
    minRowDimensionColumnWidth = 200,
    minColumnWidth = 150,
    metrics,
    granularity,
    ShowClips,
    resultsDimension0,
    nullValueCharacter = '∅', enableDownloadAsCSV,
    enableDownloadAsPNG, title, Despar, Explanation
  } = props;
  const { isLoading, data, error } = resultsDimension0;
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [preppingDownload, setPreppingDownload] = useState(false); // Add state for download preparation
  const chartRef = useRef<HTMLDivElement>(null);

  // Fixed widths for consistent columns
  const fixedStartDateWidth = 77;
  const fixedTotalWidth = 65;
  const fixedCampaignColumnWidth = minRowDimensionColumnWidth || 200;
  const fixedClipColumnWidth = 350;

  // Memoize processed data
  const processedData = useMemo(() => {
    const safeData = data || [];
    const rowKeySet = new Set();
    const columnKeySet = new Set();
    const startDateMap = new Map();
    const totalMap = new Map();
    const clipTotalMap = new Map();
    let minValue = Infinity;
    let maxValue = -Infinity;

    const clipsMap = ShowClips ? new Map() : null;

    safeData.forEach((row) => {
      const rowKey = row[rowValues[0]?.name] || null;
      const colKey = row[columnValues[0]?.name] || null;
      const clipValue = ShowClips && columnValues[1] ? row[columnValues[1]?.name] : null;

      rowKeySet.add(rowKey);
      columnKeySet.add(colKey);

      if (ShowClips && clipValue) {
        if (!clipsMap.has(rowKey)) {
          clipsMap.set(rowKey, new Set([clipValue]));
        } else {
          clipsMap.get(rowKey).add(clipValue);
        }
      }

      let metricValue = Number(row[metrics[0]?.name]) || 0;
      const dateValue = new Date(row[metrics[1]?.name]);

      if (!startDateMap.has(rowKey)) {
        startDateMap.set(rowKey, dateValue);
      } else if (dateValue < startDateMap.get(rowKey)) {
        startDateMap.set(rowKey, dateValue);
      }

      // Regular total (for campaign)
      const totalKey = `${rowKey}-${colKey}`;
      const currentTotal = totalMap.get(totalKey) || 0;
      const newTotal = currentTotal + metricValue;
      totalMap.set(totalKey, newTotal);

      // Clip-specific total (if ShowClips is true)
      if (ShowClips) {
        const clipTotalKey = `${rowKey}-${colKey}-${clipValue || ''}`;
        const currentClipTotal = clipTotalMap.get(clipTotalKey) || 0;
        clipTotalMap.set(clipTotalKey, currentClipTotal + metricValue);
      }

      if (newTotal > maxValue) maxValue = newTotal;
      if (newTotal < minValue) minValue = newTotal;
    });

    return {
      rowKeys: Array.from(rowKeySet),
      columnKeys: Array.from(columnKeySet),
      startDateMap,
      totalMap,
      clipTotalMap: ShowClips ? clipTotalMap : null,
      clipsMap: ShowClips ? clipsMap : null,
      minValue,
      maxValue
    };
  }, [data, rowValues, columnValues, metrics, ShowClips]);

  const { rowKeys, columnKeys, startDateMap, totalMap, clipTotalMap, clipsMap, minValue, maxValue } = processedData;

  useEffect(() => {
    const tooltip = document.createElement('div');
    tooltip.className = 'pivot-tooltip';
    Object.assign(tooltip.style, {
      position: 'fixed', // Changed from absolute to fixed
      visibility: 'hidden',
      backgroundColor: 'rgb(255,255,255)',
      color: 'black',
      padding: '8px',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '4px',
      fontSize: '12px',
      pointerEvents: 'none',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: '1000',
      maxWidth: '300px',
      whiteSpace: 'normal', // Ensure text wraps properly
      wordWrap: 'break-word' // Prevent overflow
    });
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      document.body.removeChild(tooltip);
    };
  }, []);

  const handleMouseOver = React.useCallback((e, rowKey, colKey, value, clipName = null) => {
    if (!tooltipRef.current || value === null || value === undefined) return;

    const formattedValue = parseFloat(value).toLocaleString(props.Despar ? 'de-DE' : 'en-US');
    const dateFormatted = formatDate(colKey, granularity);

    tooltipRef.current.innerHTML = `
    <div>
      ${granularity === 'day' ? 'On' : granularity === 'week' ? 'During' : 'In'} 
      <strong style="color:#AF3241">${dateFormatted}</strong>, 
      the <strong style="color:#AF3241">${rowKey}</strong> 
      campaign recorded <strong style="color:#AF3241">${formattedValue}</strong> impressions
      ${ShowClips && clipName ? ` for the visual <strong style="color:#AF3241">${clipName}</strong>` : ''}.
    </div>
  `;

    tooltipRef.current.style.visibility = 'visible';

    // Position the tooltip
    positionTooltip(e);
  }, [granularity]);

  const handleMouseMove = React.useCallback((e) => {
    if (!tooltipRef.current) return;
    positionTooltip(e);
  }, []);

  // New function to handle tooltip positioning with edge detection
  const positionTooltip = (e) => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Temporarily make visible to measure width
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';

    // Get tooltip dimensions
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // Calculate available space
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Determine position - default to right
    let left = mouseX + 10;
    let top = mouseY + 10;

    // Check if tooltip would go off right edge
    if (left + tooltipWidth > windowWidth) {
      left = mouseX - tooltipWidth - 10;
    }

    // Check if tooltip would go off bottom edge
    if (top + tooltipHeight > windowHeight) {
      top = mouseY - tooltipHeight - 10;
    }

    // Apply styles
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = 'visible';
    tooltip.style.display = '';
  };

  const handleMouseLeave = React.useCallback(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.visibility = 'hidden';
  }, []);

  const getBackgroundColor = React.useCallback((value) => {
    if (value === null || value === undefined || isNaN(value)) return 'transparent';
    if (minValue === maxValue) return 'rgb(98, 98, 110)';

    const normalized = (value - minValue) / (maxValue - minValue);
    const intensity = Math.min(0.9, normalized * 0.9);

    const r = Math.round(98 + (255 - 98) * (1 - intensity));
    const g = Math.round(98 + (255 - 98) * (1 - intensity));
    const b = Math.round(110 + (255 - 110) * (1 - intensity));

    return `rgb(${r}, ${g}, ${b})`;
  }, [minValue, maxValue]);

  const getTextColor = React.useCallback((bgColor) => {
    if (!bgColor || bgColor === 'transparent') return 'inherit';

    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return 'inherit';

    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 160 ? 'white' : 'black';
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || 'An error occurred'}</div>;

  const groupColumnsByYear = (columnKeys: string[], granularity: string) => {
    const groups: { year: number, keys: string[] }[] = [];

    columnKeys.forEach((colKey) => {
      const date = new Date(colKey);
      const year = date.getFullYear();
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.year !== year) {
        groups.push({ year, keys: [colKey] });
      } else {
        lastGroup.keys.push(colKey);
      }
    });

    return groups;
  };

  const renderTableRows = () => {
    if (!ShowClips) {
      return rowKeys.map((rowKey, rowIndex) => {
        const rowTotal = columnKeys.reduce((sum, colKey) => {
          const totalKey = `${rowKey}-${colKey}`;
          return sum + (totalMap.get(totalKey) || 0);
        }, 0);

        const isEvenRow = rowIndex % 2 === 0;
        const rowBgColor = isEvenRow ? 'white' : '#f9f9f9';

        return (
          <tr key={rowKey} className="pivot-table-row">
            <td
              className="pivot-table-cell first-column"
              style={{
                width: fixedCampaignColumnWidth,
                minWidth: fixedCampaignColumnWidth,
                maxWidth: fixedCampaignColumnWidth,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                backgroundColor: rowBgColor
              }}
            >
              {rowKey}
            </td>

            <td
              className="pivot-table-cell center"
              style={{
                width: fixedStartDateWidth,
                minWidth: fixedStartDateWidth,
                maxWidth: fixedStartDateWidth,
                backgroundColor: rowBgColor
              }}
            >
              {startDateMap.has(rowKey)
                ? formatDateDDMMYYYY(startDateMap.get(rowKey))
                : nullValueCharacter}
            </td>

            <td
              className="pivot-table-cell center"
              style={{
                width: fixedTotalWidth,
                minWidth: fixedTotalWidth,
                maxWidth: fixedTotalWidth,
                backgroundColor: rowBgColor
              }}
            >
              {rowTotal.toLocaleString(props.Despar ? 'de-DE' : 'en-US')
              }
            </td>

            {columnKeys.map((colKey) => {
              const totalKey = `${rowKey}-${colKey}`;
              const value = totalMap.get(totalKey) || null;
              const bgColor = getBackgroundColor(value);
              const textColor = getTextColor(bgColor);

              return (
                <td
                  key={colKey}
                  className="pivot-table-cell center"
                  style={{
                    minWidth: minColumnWidth,
                    backgroundColor: bgColor,
                    color: textColor
                  }}
                  onMouseOver={(e) => handleMouseOver(e, rowKey, colKey, value)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {value !== null ? value.toLocaleString(props.Despar ? 'de-DE' : 'en-US')
                    : nullValueCharacter}
                </td>
              );
            })}
          </tr>
        );
      });
    } else {
      return rowKeys.flatMap((rowKey, rowIndex) => {
        const clips = clipsMap?.get(rowKey) ? Array.from(clipsMap.get(rowKey)) : [null];
        const startDate = startDateMap.get(rowKey);
        const isEvenRow = rowIndex % 2 === 0;
        const rowBgColor = isEvenRow ? 'white' : '#f9f9f9';

        // Calculate campaign total (same for all clips in this campaign)
        const campaignTotal = columnKeys.reduce((sum, colKey) => {
          const totalKey = `${rowKey}-${colKey}`;
          return sum + (totalMap.get(totalKey) || 0);
        }, 0);

        return clips.map((clip, clipIndex) => {
          const isLastClip = clipIndex === clips.length - 1;
          const borderBottom = isLastClip ? '1px solid #ccc' : 'none';

          return (
            <tr
              key={`${rowKey}-${clipIndex}`}
              className="pivot-table-row"
              style={{ borderBottom }}
            >
              {clipIndex === 0 ? (
                <td
                  rowSpan={clips.length}
                  className="pivot-table-cell first-column"
                  style={{
                    width: fixedCampaignColumnWidth,
                    minWidth: fixedCampaignColumnWidth,
                    maxWidth: fixedCampaignColumnWidth,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    backgroundColor: rowBgColor,
                    borderBottom
                  }}
                >
                  {rowKey}
                </td>
              ) : null}

              {clipIndex === 0 ? (
                <td
                  rowSpan={clips.length}
                  className="pivot-table-cell center"
                  style={{
                    width: fixedStartDateWidth,
                    minWidth: fixedStartDateWidth,
                    maxWidth: fixedStartDateWidth,
                    backgroundColor: rowBgColor,
                    borderBottom
                  }}
                >
                  {startDate
                    ? formatDateDDMMYYYY(startDate)
                    : nullValueCharacter}
                </td>
              ) : null}

              <td
                className="pivot-table-cell"
                style={{
                  width: fixedClipColumnWidth,
                  minWidth: fixedClipColumnWidth,
                  maxWidth: fixedClipColumnWidth,
                  backgroundColor: rowBgColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  borderBottom
                }}
              >
                {clip || nullValueCharacter}
              </td>

              {clipIndex === 0 ? (
                <td
                  rowSpan={clips.length}
                  className="pivot-table-cell center"
                  style={{
                    width: fixedTotalWidth,
                    minWidth: fixedTotalWidth,
                    maxWidth: fixedTotalWidth,
                    backgroundColor: rowBgColor,
                    borderBottom
                  }}
                >
                  {campaignTotal.toLocaleString(props.Despar ? 'de-DE' : 'en-US')
                  }
                </td>
              ) : null}

              {columnKeys.map((colKey) => {
                const clipTotalKey = `${rowKey}-${colKey}-${clip || ''}`;
                const value = clipTotalMap?.get(clipTotalKey) || null;
                const bgColor = getBackgroundColor(value);
                const textColor = getTextColor(bgColor);

                return (
                  <td
                    key={colKey}
                    className="pivot-table-cell center"
                    style={{
                      minWidth: minColumnWidth,
                      backgroundColor: bgColor,
                      color: textColor,
                      borderBottom
                    }}
                    onMouseOver={(e) => handleMouseOver(e, rowKey, colKey, value, clip)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    {value !== null ? value.toLocaleString(props.Despar ? 'de-DE' : 'en-US')
                      : nullValueCharacter}
                  </td>
                );
              })}
            </tr>
          );
        });
      });
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Download Menu Fixed Top-Right */}
      {(enableDownloadAsCSV || enableDownloadAsPNG) && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            right: '20px',
            zIndex: 2000
          }}
        >
          <DownloadMenu
            csvOpts={{
              chartName: props.title || 'chart',
              props: {
                ...props,
                results: resultsDimension0,
              },
            }}
            Explanation={Explanation}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
            Table={true}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0
            }}
          />
        </div>
      )}
      <div className="pivot-table-container" ref={chartRef} style={{
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
      }}>

        <div className={`pivot-table-wrapper ${granularity !== 'day' ? 'compact-header' : ''}`}>
          <table className="pivot-table">
            <thead className="pivot-table-header">
              <tr className="year-header-row">
                <th
                  rowSpan={2}
                  className="pivot-table-header-cell title"
                  style={{
                    width: fixedCampaignColumnWidth,
                    minWidth: fixedCampaignColumnWidth,
                    maxWidth: fixedCampaignColumnWidth,
                  }}
                >
                  Campaign
                </th>
                <th
                  rowSpan={2}
                  className="pivot-table-header-cell center"
                  style={{
                    width: fixedStartDateWidth,
                    minWidth: fixedStartDateWidth,
                    maxWidth: fixedStartDateWidth
                  }}
                >
                  Start Date
                </th>
                {ShowClips && (
                  <th
                    rowSpan={2}
                    className="pivot-table-header-cell"
                    style={{
                      width: fixedClipColumnWidth,
                      minWidth: fixedClipColumnWidth,
                      maxWidth: fixedClipColumnWidth
                    }}
                  >
                    Visual
                  </th>
                )}
                <th
                  rowSpan={2}
                  className="pivot-table-header-cell center"
                  style={{
                    width: fixedTotalWidth,
                    minWidth: fixedTotalWidth,
                    maxWidth: fixedTotalWidth
                  }}
                >
                  Total
                </th>

                {groupColumnsByYear(columnKeys, granularity).map((group) => (
                  <th
                    key={group.year}
                    className="pivot-table-header-cell center"
                    style={{ minWidth: minColumnWidth * group.keys.length }}
                    colSpan={group.keys.length}
                  >
                    {group.year}
                  </th>
                ))}
              </tr>

              <tr className="period-header-row">
                {columnKeys.map((colKey) => (
                  <th
                    key={colKey}
                    className="pivot-table-header-cell center"
                    style={{
                      minWidth: minColumnWidth,
                      fontSize: '11px'
                    }}
                  >
                    {formatDate(colKey, granularity)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
  .pivot-table-container {
    position: relative;
    overflow: auto;
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .pivot-table-wrapper {
          overflow: visible;
          margin: -1px 0 0 -1px;
          border-radius: 8px;
        }

        .pivot-table {
          border-collapse: collapse;
          width: 100%;
          height: auto;
          min-height: 200px;  /* Changed from minHeight to min-height */
          max-height: 100vh;  /* Optional: prevents the container from growing too large */
          border-radius: 8px;
        }

  .pivot-table-header {
    position: sticky;
    top: -1px;
    z-index: 10;
    background: #62626E;
    color: white;
    border-bottom: 1px solid #ccc;
  }

  .pivot-table-header th {
    border: none !important;
    padding: 6px 8px;
    font-weight: bold;
    font-size: 12px;
    line-height: 0.7;
  }

  .pivot-table-header-cell.title {
    position: sticky;
    left: -1px;
    z-index: 20;
    background: #62626E;
    font-size: 13px;
    text-align: center;
    padding: 8px !important;
  }

  .pivot-table-cell.first-column {
    position: sticky;
    left: -1px;
    z-index: 1;
    background-color: white;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .pivot-table-row td {
    padding: 8px;
    ${!ShowClips ? 'border-bottom: 1px solid #ccc;' : ''}
  }

  .period-header-row th {
    font-size: 11px !important;
    padding: 4px 8px !important;
  }

  .pivot-table-cell {
    padding: 8px;
    text-align: left;
    white-space: nowrap;
  }

  /* Show column line after Total only when ShowClips is false */
  ${!ShowClips ? `
    .pivot-table-header > tr:first-child th:nth-child(3),
    .pivot-table-row td:nth-child(3) {
      border-right: 1px solid #ccc;
    }
  ` : ''}

  .center {
    text-align: center;
  }

  .pivot-table-container::-webkit-scrollbar {
    height: 12px;
    width: 12px;
  }

  .pivot-table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }

  .pivot-table-container::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 6px;
    border: 2px solid #f1f1f1;
  }

  .pivot-table-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`}</style>
    </div>
  );
};
