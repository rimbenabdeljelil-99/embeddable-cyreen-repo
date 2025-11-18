import { DataResponse, DimensionOrMeasure, OrderBy, OrderDirection } from '@embeddable.com/core';
import { useEmbeddableState } from '@embeddable.com/react';
import React, { useCallback, useEffect, useState, useRef } from 'react';

import { SortDirection } from '../../../../enums/SortDirection';
import { REGULAR_FONT_SIZE } from '../../../constants';
import formatValue from '../../../util/format';
import Container from '../../Container';
import TableHead from './components/TableHead';

export type Props = {
  limit?: number;
  results: DataResponse;
  defaultSort?: { property: DimensionOrMeasure; direction: string }[];
  columns: DimensionOrMeasure[];
  title: string;
  fontSize?: number;
  minColumnWidth?: number;
  Explanation?: string;
  FirstColumn?: boolean;
  SecondColumn?: boolean;
  ThirdColumn?: boolean;
  FourthColumn?: boolean;
  FifthColumn?: boolean;
  PercentageSign?: boolean;
  Ferrero?: boolean;
};

type Meta = {
  sort: OrderBy[];
  prevVariableValues: Record<string, any>;
};

export default (props: Props) => {
  const { columns, results, Explanation, FirstColumn, SecondColumn, ThirdColumn, FourthColumn, FifthColumn } = props;

  // ✅ Filter out columns based on props
  const visibleColumns = columns.filter((_, index) => {
    if (index === 0 && FirstColumn) return false;
    if (index === 1 && SecondColumn) return false;
    if (index === 2 && ThirdColumn) return false;
    if (index === 3 && FourthColumn) return false;
    if (index === 4 && FifthColumn) return false;
    return true;
  });

  const [tooltip, setTooltip] = useState<{
    content: React.ReactNode;
    x: number;
    y: number;
    rowIndex?: number;
  } | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  // Column title mappings (unchanged)
  const mapColumnTitle = (title: string) => {
    const mappings: Record<string, string> = {
      'Total Frequency': 'Shoppers (Amount)',
      'Total revenue': 'Revenue',
      'Total Sale': 'Sales'
    };
    return mappings[title] || title;
  };

  const formatTooltipContent = (rowValue: string, cellValue: string | number, column: DimensionOrMeasure) => {
    const formattedValue = formatColumn(cellValue, column);
    const columnTitle = mapColumnTitle(column.title || column.name);

    return (
      <span>
        <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{rowValue}</span>
        {` generated `}
        <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formattedValue}</span>
        {` in `}
        {columnTitle}
        {`.`}
      </span>
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
    (e: React.MouseEvent, row: Record<string, any>, column: DimensionOrMeasure, columnIndex: number, rowIndex: number) => {
      if (columnIndex < 1) return;

      const rowValue = row[visibleColumns[0].name];
      const cellValue = row[column.name];
      if (!rowValue || cellValue === undefined || cellValue === null) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const tableRect = tableRef.current?.getBoundingClientRect();
      if (!tableRect) return;

      setTooltip({
        content: formatTooltipContent(rowValue, cellValue, column),
        x: rect.left - tableRect.left + rect.width / 2,
        y: rect.top - tableRect.top,
        rowIndex
      });
    },
    [visibleColumns]
  );

  const handleCellMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <Container {...props} className="overflow-y-auto" childContainerClassName="overflow-x-auto">
      <div style={{ minWidth: `${visibleColumns.length * (props.minColumnWidth ?? 100)}px`, position: 'relative' }}>
        {!!meta && !(props.results?.isLoading && !props.results?.data?.length) && (
          <div style={{ position: 'relative' }}>
            <table
              ref={tableRef}
              className="overflow-visible w-full"
              style={{ fontSize: props.fontSize ? `${props.fontSize}px` : REGULAR_FONT_SIZE }}
            >
              <TableHead
              Ferrero={props.Ferrero}
                columns={visibleColumns}
                sortBy={meta?.sort?.[0]?.property}
                sortDirection={
                  meta?.sort?.[0]?.direction === 'asc'
                    ? SortDirection.ASCENDING
                    : SortDirection.DESCENDING
                }
                onSortingChange={updateSort}
                minColumnWidth={props.minColumnWidth ?? undefined}
              />

              <tbody>
  {results?.data?.map((row, rowIndex) => (
    <tr key={rowIndex} className="hover:bg-gray-400/5">
      {visibleColumns.map((column, columnIndex) => (
        <td
          key={columnIndex}
          className="text-dark p-3 truncate"
          style={{
            fontSize: props.fontSize ? `${props.fontSize}px` : REGULAR_FONT_SIZE,
            maxWidth: props.minColumnWidth ? `${props.minColumnWidth * 1.2}px` : 'auto',
            fontWeight:
              props.Ferrero && columnIndex === 1 ? 'bold' : 'normal', // ✅ Bold 2nd column when Ferrero is true
          }}
          onMouseEnter={(e) =>
            handleCellMouseEnter(e, row, column, columnIndex, rowIndex)
          }
          onMouseLeave={handleCellMouseLeave}
        >
          <span
            title={formatColumn(row[column.name], column, props.PercentageSign) ?? ''}
          >
            {formatColumn(row[column.name], column, props.PercentageSign)}
          </span>
        </td>
      ))}
    </tr>
  ))}
</tbody>

            </table>

            {tooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: `${tooltip.y}px`,
                  left: `${tooltip.x}px`,
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  fontSize: '12px',
                  fontFamily: 'Arial, sans-serif',
                  pointerEvents: 'none',
                  transform: tooltip.rowIndex === 0
                    ? 'translateX(-50%) translateY(20px)'
                    : 'translateX(-50%) translateY(-100%)',
                  minWidth: '200px',
                  maxWidth: '300px',
                  border: '1px solid #eee'
                }}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};


function formatColumn(
  text: string | number,
  column: DimensionOrMeasure,
  PercentageSign?: boolean
) {
  if (text === null || text === undefined) return '';

  // Only convert to number if it's a numeric string
  let numValue: number | null = null;
  if (typeof text === 'number') {
    numValue = text;
  } else if (!isNaN(Number(text))) {
    numValue = Number(text);
  }

  // Format percentage if flag is true
  if (PercentageSign && numValue !== null) {
    return `${numValue.toFixed(2)}%`;
  }

  // Special formatting for "Total revenue"
  if ((column.title === 'Total revenue' || column.name === 'Total revenue') && numValue !== null) {
    const valueInThousands = Math.round(numValue / 1000);
    return `CLP$ ${valueInThousands.toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
  }

  // Special formatting for "Total Sale"
  if (column.title === 'Total Sale' && numValue !== null) {
    const valueInThousands = Math.round(numValue / 1000);
    return `${valueInThousands.toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
  }

  // Default number formatting
  if (numValue !== null || column.nativeType === 'number') {
    return formatValue(`${numValue}`, { type: 'number', meta: column?.meta });
  }

  // Time formatting
  if (column.nativeType === 'time') return formatValue(text, 'date');

  // If it's a string that cannot be parsed to number, return as-is
  return String(text);
}
