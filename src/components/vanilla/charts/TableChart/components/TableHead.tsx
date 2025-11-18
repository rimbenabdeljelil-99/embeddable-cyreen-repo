import React from 'react';
import { SortDirection } from '../../../../../enums/SortDirection';
import { SortDown, SortUp } from '../../../icons';
import { DimensionOrMeasure } from '@embeddable.com/core';

type Props = {
  columns: DimensionOrMeasure[];
  sortBy?: DimensionOrMeasure;
  sortDirection?: SortDirection;
  onSortingChange?: (column: any, sortDirection: SortDirection) => void;
  minColumnWidth?: number;
  Ferrero?: boolean;
};

// Column title mapping function
const mapColumnTitle = (title: string) => {
  const mappings: Record<string, string> = {
    'Total Frequency': 'Shoppers (Amount)',
    'Total revenue': 'Revenue',
    'Total Sale': 'Sales',
  };
  return mappings[title] || title;
};

const TableHead = ({
  columns,
  sortBy,
  sortDirection,
  onSortingChange,
  minColumnWidth,
  Ferrero,
}: Props) => {
  return (
    <thead className="border-y border-[#B8BDC6]">
      <tr>
        {columns.map((column) => {
          const isSorted = sortBy?.name === column.name;
          const newSortDirection = isSorted
            ? sortDirection === SortDirection.ASCENDING
              ? SortDirection.DESCENDING
              : SortDirection.ASCENDING
            : SortDirection.ASCENDING;

          const displayTitle = mapColumnTitle(column.title || column.name);

          return (
            <th
              key={column.name}
              className="select-none cursor-pointer p-3"
              style={{
                backgroundColor: Ferrero ? '#e6e6e6' : 'white',
                minWidth: minColumnWidth ? `${minColumnWidth}px` : undefined,
                maxWidth: minColumnWidth ? `${minColumnWidth * 1.2}px` : undefined,
              }}
              onClick={() => onSortingChange?.(column, newSortDirection)}
            >
              <div className="flex items-center gap-1 hover:text-black">
                <span className="text-[#333942] mr-1 truncate">
                  {displayTitle}
                </span>

                {isSorted && (
                  <span className="w-3">
                    {sortDirection === SortDirection.ASCENDING ? (
                      <SortUp fill="currentcolor" />
                    ) : (
                      <SortDown fill="currentcolor" />
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHead;
