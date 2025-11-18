import { DataResponse, DimensionOrMeasure, OrderBy, OrderDirection } from '@embeddable.com/core';
import { useEmbeddableState } from '@embeddable.com/react';
import React, { useCallback, useState, useRef } from 'react';
import DownloadMenu from '../../DownloadMenu';

import { SortDirection } from '../../../../enums/SortDirection';
import { REGULAR_FONT_SIZE } from '../../../constants';

export type Props = {
  limit?: number;
  results: DataResponse;
  defaultSort?: { property: DimensionOrMeasure; direction: string }[];
  columns: DimensionOrMeasure[];
  title: string;
  fontSize?: number;
  minColumnWidth?: number;
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  Explanation?: string;
  NewDs?: boolean;
};

type Meta = {
  sort: OrderBy[];
  prevVariableValues: Record<string, any>;
};

export default (props: Props) => {
  const { columns: originalColumns, results, Explanation, NewDs } = props;
  const tableRef = useRef<HTMLTableElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [preppingDownload, setPreppingDownload] = useState(false);

  // Get all unique statuses from the data
  const getUniqueStatuses = (data: any[]) => {
    const statuses = new Set<string>();
    if (!data) return [];

    data.forEach(row => {
      const status = NewDs ? row['store_device_status.status'] : row['mon_heartbeat.status'];
      if (status) {
        statuses.add(status.toLowerCase());
      }
    });

    return Array.from(statuses).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  };

  const uniqueStatuses = getUniqueStatuses(results?.data || []);

  // Create additional columns for each status
  const statusColumns = uniqueStatuses.map(status => ({
    name: `status_${status.toLowerCase()}`,
    title: status,
    isStatusColumn: true
  }));

  // Combine original columns with status columns
  const columns = [
  ...originalColumns.filter(col =>
    NewDs ? col.name !== 'store_device_status.status' : col.name !== 'mon_heartbeat.status'
  ),
  ...statusColumns
];


  // Column title mappings
  const mapColumnTitle = (title: string) => {
    const mappings: Record<string, string> = {
      'Total Frequency': 'Frequency',
      'Total revenue': 'Revenue',
      'Total Sale': 'Sales'
    };
    return mappings[title] || title;
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

  // Function to determine status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return '#1e8f4dff';
      case 'closed':
        return '#1770abff';
      case 'offline':
        return '#e74c3c';
      case 'reconnecting':
        return '#9E9E9E';
      default:
        return '#9E9E9E'; // default to grey for unknown statuses
    }
  };

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
                    {columns.map((column, columnIndex) => (
                      <th
                        key={columnIndex}
                        className="pivot-table-header-cell"
                        style={{
                          minWidth: props.minColumnWidth || '150px',
                          position: columnIndex === 0 ? 'sticky' : undefined,
                          left: columnIndex === 0 ? '0' : undefined,
                          zIndex: columnIndex === 0 ? 20 : 10,
                          backgroundColor: '#62626E',
                          color: 'white',
                          padding: '8px', // match td
                          fontWeight: 'bold',
                          fontSize: '12px',
                          lineHeight: '1.5', // normal line-height
                          border: 'none',
                          textAlign: 'center'
                        }}
                      >
                        <div className="truncate" style={{
                          minWidth: props.minColumnWidth || '150px',
                          maxWidth: '500px',
                          color: 'white',
                          lineHeight: '24px'
                        }}>
                          {mapColumnTitle(column.title || column.name)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {results?.data?.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="pivot-table-row"
                      style={{
                        backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9',
                        borderBottom: '1px solid #ccc'
                      }}
                    >
                      {columns.map((column, columnIndex) => {
                        // For original columns
                        if (!column.isStatusColumn) {
                          return (
                            <td
                              key={columnIndex}
                              className="pivot-table-cell center"
                              style={{
                                minWidth: props.minColumnWidth || '150px',
                                maxWidth: '500px',
                                padding: '8px',
                                borderBottom: '1px solid #ccc',
                                textAlign: 'center',
                                verticalAlign: 'middle',  // Ensures text aligns to center vertically
                                position: columnIndex === 0 ? 'sticky' : undefined,
                                left: columnIndex === 0 ? '0' : undefined,
                                zIndex: columnIndex === 0 ? 1 : undefined,
                                backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9',
                                borderRight: columnIndex === 0 ? '1px solid #ccc' : undefined
                              }}
                            >
                              {column.name === 'mon_heartbeat.max_timestamp' ? (
                                formatDateTime(row[column.name])
                              ) : (
                                row[column.name]
                              )}
                            </td>
                          );
                        }

                        // For status columns
                        const statusType = column.title.toLowerCase();
                        const isCurrentStatus = (NewDs ? row['store_device_status.status'] : row['mon_heartbeat.status'])
  ?.toLowerCase() === statusType;


                        return (
                          <td
                            key={columnIndex}
                            className="pivot-table-cell center"
                            style={{
                              minWidth: props.minColumnWidth || '150px',
                              maxWidth: '500px',
                              padding: '8px',
                              borderBottom: '1px solid #ccc',
                              textAlign: 'center'
                            }}
                          >
                            {isCurrentStatus ? (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                              }}>
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: getStatusColor(NewDs ? row['store_device_status.status'] : row['mon_heartbeat.status'])
                                }} />
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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

        .pivot-table-header-cell {
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

function formatDateTime(isoString: string): string {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);

    // Get UTC components
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return isoString;
  }
}