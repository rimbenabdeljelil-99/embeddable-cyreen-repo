import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Dataset, Dimension, Measure, DataResponse, Granularity } from '@embeddable.com/core';
import DownloadMenu from '../vanilla/DownloadMenu';

type Props = {
  ds: Dataset;
  rowValues: Dimension[];
  columnValues: Dimension[];
  metrics: Dimension[];
  granularity: string;
  resultsDimension0: DataResponse;
  nullValueCharacter?: string;
  minRowDimensionColumnWidth?: number;
  minColumnWidth?: number;
  ShowIP?: boolean;
  CheckoutEvents?: boolean;
  ShowNumber?: boolean;
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  title?: string;
  Despar?: boolean;
  Explanation?: string
};

// Utility functions
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
    case 'hour':
      return `${date.getHours()}`;
    default:
      return dateString;
  }
};

// Helper function to get marker color based on value
const getMarkerColor = (value: string) => {
  if (!value) return 'transparent';

  switch (value) {
    case 'Receipts available but not yet processed':
      return '#F4D03F'; // Blue
    case 'Receipts not yet received':
      return '#e74c3c'; // Red
    case 'Receipts processed':
      return '#1e8f4dff'; // Green
    default:
      return 'transparent';
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
    ShowIP,
    ShowNumber,
    CheckoutEvents,
    resultsDimension0,
    nullValueCharacter = '∅',
    enableDownloadAsCSV,
    enableDownloadAsPNG,
    title,
    Despar,
    Explanation
  } = props;
  const { isLoading, data, error } = resultsDimension0;
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [preppingDownload, setPreppingDownload] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fixed widths for consistent columns
  const fixedCampaignColumnWidth = minRowDimensionColumnWidth || 200;
  const fixedClipColumnWidth = 170;

  // Determine if we should show the additional column (either IP or Number)
  const showAdditionalColumn = ShowIP || ShowNumber;

  // Memoize processed data
  const processedData = useMemo(() => {
    const safeData = data || [];
    const rowKeySet = new Set();
    const columnKeySet = new Set();
    const startDateMap = new Map();
    const totalMap = new Map();
    const clipTotalMap = new Map();

    const clipsMap = showAdditionalColumn ? new Map() : null;

    safeData.forEach((row) => {
      const rowKey = row[rowValues[0]?.name] || null;
      const colKey = row[columnValues[0]?.name] || null;
      const clipValue = showAdditionalColumn && columnValues[1] ? row[columnValues[1]?.name] : null;
      const metricValue = row[metrics[0]?.name] || null;

      rowKeySet.add(rowKey);
      columnKeySet.add(colKey);

      if (showAdditionalColumn && clipValue) {
        if (!clipsMap.has(rowKey)) {
          clipsMap.set(rowKey, new Set([clipValue]));
        } else {
          clipsMap.get(rowKey).add(clipValue);
        }
      }

      const dateValue = new Date(row[metrics[1]?.name]);

      if (!startDateMap.has(rowKey)) {
        startDateMap.set(rowKey, dateValue);
      } else if (dateValue < startDateMap.get(rowKey)) {
        startDateMap.set(rowKey, dateValue);
      }

      // Regular total (for campaign)
      const totalKey = `${rowKey}-${colKey}`;
      totalMap.set(totalKey, metricValue);

      // Clip-specific total (if showAdditionalColumn is true)
      if (showAdditionalColumn) {
        const clipTotalKey = `${rowKey}-${colKey}-${clipValue || ''}`;
        clipTotalMap.set(clipTotalKey, metricValue);
      }
    });

    return {
      rowKeys: Array.from(rowKeySet),
      columnKeys: Array.from(columnKeySet),
      startDateMap,
      totalMap,
      clipTotalMap: showAdditionalColumn ? clipTotalMap : null,
      clipsMap: showAdditionalColumn ? clipsMap : null,
    };
  }, [data, rowValues, columnValues, metrics, showAdditionalColumn]);

  const { rowKeys, columnKeys, startDateMap, totalMap, clipTotalMap, clipsMap } = processedData;

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

  const handleMouseOver = React.useCallback((e, rowKey, colKey, value, clipName = null) => {
    if (!tooltipRef.current || !value) return;

    const dateFormatted = formatDate(colKey, granularity);

    let timeText = '';
    switch (granularity.toLowerCase()) {
      case 'day':
        timeText = 'On';
        break;
      case 'week':
        timeText = 'During';
        break;
      case 'hour':
        timeText = 'At hour';
        break;
      default:
        timeText = 'In';
    }

    tooltipRef.current.innerHTML = `
    <div style="font-size: 13px; line-height: 1.6;">
      <div><span style="color: black;">Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <strong style="color: #AF3241;">${dateFormatted}</strong></div>
      <div><span style="color: black;">Store:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <strong style="color: #AF3241;">${rowKey}</strong></div>
      <div><span style="color: black;">Status:&nbsp;&nbsp;&nbsp;</span> <strong style="color: #AF3241;">${value}</strong></div>
      ${showAdditionalColumn && clipName
        ? `<div><span style="color: black;">${ShowIP ? 'IP address' : 'Checkout'}:</span> <strong style="color: #AF3241;">${clipName}</strong></div>`
        : ''
      }
    </div>
  `;

    tooltipRef.current.style.visibility = 'visible';
    positionTooltip(e);
  }, [granularity, showAdditionalColumn, ShowIP]);

  const handleMouseMove = React.useCallback((e) => {
    if (!tooltipRef.current) return;
    positionTooltip(e);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.visibility = 'hidden';
  }, []);

  const groupColumnsByDate = (columnKeys: string[], granularity: string) => {
    const groups: { date: string, keys: string[] }[] = [];

    columnKeys.forEach((colKey) => {
      const date = new Date(colKey);
      let groupKey;

      if (granularity.toLowerCase() === 'hour') {
        groupKey = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
      } else {
        groupKey = date.getFullYear().toString();
      }

      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== groupKey) {
        groups.push({ date: groupKey, keys: [colKey] });
      } else {
        lastGroup.keys.push(colKey);
      }
    });

    return groups;
  };

  const renderTableRows = () => {
    if (!showAdditionalColumn) {
      return rowKeys.map((rowKey, rowIndex) => {
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

            {columnKeys.map((colKey) => {
              const totalKey = `${rowKey}-${colKey}`;
              const value = totalMap.get(totalKey) || null;

              return (
                <td
                  key={colKey}
                  className="pivot-table-cell center"
                  style={{
                    minWidth: minColumnWidth,
                  }}
                  onMouseOver={(e) => handleMouseOver(e, rowKey, colKey, value)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {value && (
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: getMarkerColor(value),
                        margin: '0 auto',
                        border: '1px solid #ddd'
                      }}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        );
      });
    } else {
      return rowKeys.flatMap((rowKey, rowIndex) => {
        const clips = clipsMap?.get(rowKey) ? Array.from(clipsMap.get(rowKey)) : [null];
        const isEvenRow = rowIndex % 2 === 0;
        const rowBgColor = isEvenRow ? 'white' : '#f9f9f9';

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

              <td
                className="pivot-table-cell center"
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

              {columnKeys.map((colKey) => {
                const clipTotalKey = `${rowKey}-${colKey}-${clip || ''}`;
                const value = clipTotalMap?.get(clipTotalKey) || null;

                return (
                  <td
                    key={colKey}
                    className="pivot-table-cell center"
                    style={{
                      minWidth: minColumnWidth,
                      borderBottom
                    }}
                    onMouseOver={(e) => handleMouseOver(e, rowKey, colKey, value, clip)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    {value && (
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: getMarkerColor(value),
                          margin: '0 auto',
                          border: '1px solid #ddd'
                        }}
                        title={value}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          );
        });
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || 'An error occurred'}</div>;

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
                  Store
                </th>
                {showAdditionalColumn && (
                  <th
                    rowSpan={2}
                    className="pivot-table-header-cell center"
                    style={{
                      width: fixedClipColumnWidth,
                      minWidth: fixedClipColumnWidth,
                      maxWidth: fixedClipColumnWidth
                    }}
                  >
                    {ShowIP ? 'IP Address' : 'Number Checkout'}
                  </th>
                )}

                {groupColumnsByDate(columnKeys, granularity).map((group) => (
                  <th
                    key={group.date}
                    className="pivot-table-header-cell center"
                    style={{ minWidth: minColumnWidth * group.keys.length }}
                    colSpan={group.keys.length}
                  >
                    {group.date}
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
  font-family: Arial, sans-serif;
  font-size: 13px;
  border: 1px solid #ccc;
  margin: 0;
  padding: 0;
  border-radius: 8px;
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
  border-right: 1px solid #ccc;

  text-align: center;
}



  .pivot-table-row td {
    padding: 8px;
    ${!showAdditionalColumn ? 'border-bottom: 1px solid #ccc;' : ''}
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