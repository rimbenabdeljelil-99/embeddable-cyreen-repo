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
}

// Column title mapping function
const mapColumnTitle = (title: string) => {
  const mappings: Record<string, string> = {
    'Total Frequency': 'Frequency',
    'Total revenue': 'Revenue',
    'Total Sale': 'Sales'
  };
  return mappings[title] || title;
};

const TableHead = ({ columns, sortBy, sortDirection, onSortingChange, minColumnWidth }: Props) => {
  return (
    <thead className="border-y border-[#B8BDC6]">
      <tr>
        {
          columns.map((column) => {
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
                style={minColumnWidth
                  ? {
                    minWidth: `${minColumnWidth}px`,
                    maxWidth: `${minColumnWidth * 1.2}px`,
                    textAlign: 'center',
                    backgroundColor: '#62626E' // Added background color
                  }
                  : { 
                    textAlign: 'center',
                    backgroundColor: '#62626E' // Added background color
                  }
                }
                onClick={() => onSortingChange?.(column, newSortDirection)}
              >
                <div className="flex items-center justify-center gap-1 hover:text-black">
                  <span className="text-white truncate"> {/* Changed text color to white for better contrast */}
                    {displayTitle}
                  </span>

                  {
                    isSorted ? (
                      <span className="w-3 text-white"> {/* Changed icon color to white */}
                        {sortDirection === SortDirection.ASCENDING ? <SortUp fill="currentcolor" /> : <SortDown fill="currentcolor" />}
                      </span>
                    ) : null
                  }
                </div>
              </th>
            );
          })
        }
      </tr>
    </thead>
  );
}

export default TableHead;