import { DataResponse, DimensionOrMeasure, OrderBy, OrderDirection } from '@embeddable.com/core';
import { useEmbeddableState } from '@embeddable.com/react';
import React, { useCallback, useState, useRef } from 'react';
import DownloadMenu from '../vanilla/DownloadMenu';

import { SortDirection } from '../../enums/SortDirection';
import { REGULAR_FONT_SIZE } from '../constants';

export type Props = {
  limit?: number;
  results: DataResponse;
  defaultSort?: { property: DimensionOrMeasure; direction: string }[];
  columns: DimensionOrMeasure[];
  title: string;
  fontSize?: number;
  minColumnWidth?: number;
  clipColumnWidth?: number;
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  Explanation?: string
};

type Meta = {
  sort: OrderBy[];
  prevVariableValues: Record<string, any>;
};

export default (props: Props) => {
  const { columns, results, Explanation } = props;
  const [tooltip, setTooltip] = useState<{
    content: React.ReactNode;
    x: number;
    y: number;
    showBelow?: boolean;
    showLeft?: boolean;
  } | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [preppingDownload, setPreppingDownload] = useState(false);

  // Process the data to create the pivot table format
  const processData = (data) => {
    if (!data) return { uniqueNames: [], uniqueVideos: [], nameVideoMap: {} };

    const nameVideoMap = {};
    const uniqueNames = new Set<string>();
    const uniqueVideos = new Set<string>();

    data.forEach(item => {
      const name = item['pictures_with_stores.name'];
      const video = item['pictures_with_stores.original_content_name'];

      uniqueNames.add(name);
      uniqueVideos.add(video);

      if (!nameVideoMap[name]) {
        nameVideoMap[name] = new Set();
      }
      nameVideoMap[name].add(video);
    });

    return {
      uniqueNames: Array.from(uniqueNames),
      uniqueVideos: Array.from(uniqueVideos),
      nameVideoMap
    };
  };

  const { uniqueNames, uniqueVideos, nameVideoMap } = processData(results?.data);

  // Format tooltip content
  const formatTooltipContent = (name: string, video: string, item: any) => {
    const startRaw = item?.['pictures_with_stores.date_start_only'];
    const endRaw = item?.['pictures_with_stores.date_end_only'];

    const formatDate = (iso: string) => {
      const date = new Date(iso);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const startFormatted = startRaw ? formatDate(startRaw) : 'N/A';
    const endFormatted = endRaw ? formatDate(endRaw) : 'N/A';

    return (
      <div>
        <div>
          <strong style={{ color: '#AF3241' }}>{video}</strong> is live at{' '}
          <strong style={{ color: '#AF3241' }}>{name}</strong>.
        </div>
        <div style={{ marginTop: '8px' }}>
          <div>
            <span style={{ display: 'inline-block', width: '50px' }}>Start:</span>
            <strong style={{ color: '#AF3241' }}>{startFormatted}</strong>
          </div>
          <div>
            <span style={{ display: 'inline-block', width: '50px' }}>End:</span>
            <strong style={{ color: '#AF3241' }}>{endFormatted}</strong>
          </div>
        </div>
      </div>
    );
  };

  const [meta, setMeta] = useEmbeddableState({
    sort: props.defaultSort,
    prevVariableValues: {},
  }) as [Meta, (f: (m: Meta) => Meta) => void];

  const updateSort = useCallback(
    (column: DimensionOrMeasure) => {
      if (!meta) return;

      const sort: OrderBy[] = meta.sort?.slice() || [];
      const invert = { asc: 'desc', desc: 'asc' };
      const index = sort.findIndex((c) => c.property.name === column.name);

      if (index === 0) {
        sort[0] = { ...sort[0], direction: invert[sort[0].direction] as OrderDirection };
      } else {
        const [newOrder] = sort.splice(index, 1);
        sort.unshift(newOrder);
      }

      setMeta((meta) => ({ ...meta, sort }));
    },
    [meta, setMeta],
  );

  const handleCellMouseEnter = useCallback(
    (e: React.MouseEvent, name: string, video: string, item: any) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const tableRect = tableRef.current?.getBoundingClientRect();

      if (!tableRect) return;

      const tooltipWidth = 600;
      const tooltipHeight = 100;

      const xRelative = rect.left - tableRect.left + rect.width / 2;
      const yRelative = rect.top - tableRect.top;

      const showBelow = rect.top - tableRect.top < tooltipHeight + 20;
      const showLeft = rect.left + tooltipWidth > (tableRect.left + tableRect.width);

      setTooltip({
        content: formatTooltipContent(name, video, item),
        x: xRelative,
        y: yRelative,
        showBelow,
        showLeft,
      });
    },
    []
  );

  const handleCellMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Download Menu Fixed Top-Right */}
      {(props.enableDownloadAsCSV || props.enableDownloadAsPNG) && (
        <div style={{
          position: 'fixed', // Changed from sticky to fixed
          top: '5px',
          right: '20px',
          zIndex: 2000,
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          border: 'none'
        }}>
          <DownloadMenu
            csvOpts={{
              chartName: props.title || 'chart',
              props: {
                ...props,
                results: results,
              },
            }}
            Explanation={Explanation}
            enableDownloadAsCSV={props.enableDownloadAsCSV}
            enableDownloadAsPNG={props.enableDownloadAsPNG}
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
      <div
        ref={chartRef}
        className="pivot-table-container"
        style={{
          position: 'relative',
          overflow: 'auto',
          height: '100%',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          border: '1px solid #ccc',
          margin: 0,
          padding: 0,
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
        }}
      >

        {!!meta && (
          results?.isLoading ? (
            <div style={{ padding: '20px', textAlign: 'left' }}>
              Loading data...
            </div>
          ) : results?.data?.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'left', fontStyle: 'bold', color: '#AF3241' }}>
              No data available to display.
            </div>
          ) : (
            <div className="pivot-table-wrapper" style={{ overflow: 'visible', margin: '-1px 0 0 -1px', borderRadius: '8px' }}>
              <table
                ref={tableRef}
                className="pivot-table"
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  height: 'auto',
                  minHeight: '200px',
                  maxHeight: '100vh',
                  fontSize: props.fontSize ? `${props.fontSize}px` : REGULAR_FONT_SIZE,
                }}
              >
                <thead className="pivot-table-header">
                  <tr>
                    <th
                      className="pivot-table-header-cell title"
                      style={{
                        width: '200px',
                        minWidth: '200px',
                        maxWidth: '200px',
                        position: 'sticky',
                        left: '-1px',
                        zIndex: 20,
                        backgroundColor: '#62626E',
                        color: 'white',
                        padding: '8px',
                        textAlign: 'center',
                        border: 'none',
                        fontSize: '13px'
                      }}
                    >
                      Store Name
                    </th>
                    {uniqueVideos.map((video, index) => (
                      <th
                        key={index}
                        className="pivot-table-header-cell center"
                        style={{
                          minWidth: '150px',
                          backgroundColor: '#62626E',
                          color: 'white',
                          padding: '6px 8px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          lineHeight: '0.7',
                          border: 'none',
                          textAlign: 'center'
                        }}
                      >
                        <div className="truncate" style={{
                          minWidth: '150px',
                          color: 'white',
                          lineHeight: '24px'
                        }}>
                          {video}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {uniqueNames.map((name, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="pivot-table-row"
                      style={{
                        backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9',
                        borderBottom: '1px solid #ccc'
                      }}
                    >
                      <td
                        className="pivot-table-cell first-column"
                        style={{
                          width: '200px',
                          minWidth: '200px',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9',
                          borderBottom: '1px solid #ccc',
                          borderRight: '1px solid #ccc',
                          position: 'sticky',
                          left: '-1px',
                          zIndex: 1,
                          padding: '8px',
                          textAlign: 'center'
                        }}
                      >
                        {name}
                      </td>
                      {uniqueVideos.map((video, colIndex) => {
                        const hasVideo = nameVideoMap[name]?.has(video);
                        return (
                          <td
                            key={colIndex}
                            className="pivot-table-cell center"
                            style={{
                              minWidth: '150px',
                              padding: '8px',
                              borderBottom: '1px solid #ccc',
                              textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                              if (!hasVideo) return;
                              const item = results?.data?.find(
                                (d) => d['pictures_with_stores.name'] === name && d['pictures_with_stores.original_content_name'] === video
                              );
                              handleCellMouseEnter(e, name, video, item);
                            }}
                            onMouseLeave={handleCellMouseLeave}
                          >
                            {hasVideo ? (
                              <div className="w-full flex justify-center">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="12" cy="12" r="10" fill="#4CAF50" />
                                  <path
                                    d="M9 8V16L16 12L9 8Z"
                                    fill="white"
                                  />
                                </svg>
                              </div>
                            ) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tooltip element */}
              {tooltip && !preppingDownload && (
                <div
                  style={{
                    position: 'absolute',
                    top: tooltip.showBelow
                      ? `${tooltip.y + 30}px`
                      : `${tooltip.y}px`,
                    left: tooltip.showLeft
                      ? `${tooltip.x - 300}px`
                      : `${tooltip.x}px`,
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif',
                    pointerEvents: 'none',
                    minWidth: '200px',
                    maxWidth: '600px',
                    border: '1px solid #eee',
                    transform: `translateX(-50%) ${tooltip.showBelow ? 'translateY(0%)' : 'translateY(-100%)'}`,
                  }}
                >
                  {tooltip.content}
                </div>
              )}
            </div>
          ))}

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
          min-height: 200px;
          max-height: 100vh;
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
          lineHeight: 0.7;
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
          border-bottom: 1px solid #ccc;
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
    </div>
  );
};