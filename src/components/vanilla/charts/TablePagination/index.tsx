import { DataResponse, DimensionOrMeasure, OrderBy, OrderDirection } from '@embeddable.com/core';
import { useEmbeddableState } from '@embeddable.com/react';
import React, { useCallback, useEffect, useState } from 'react';

import Container from '../../Container';
import Pagination from './components/Pagination';
import TableHead from './components/TableHead';
import downloadAsCSV from '../../../util/downloadAsCSV';
import formatValue, { detectAndReturnLinks } from '../../../util/format';
import { REGULAR_FONT_SIZE } from '../../../constants';
import { SortDirection } from '../../../../enums/SortDirection';

export type Props = {
  allResults?: DataResponse;
  columns: DimensionOrMeasure[];
  defaultSort?: { property: DimensionOrMeasure; direction: string }[];
  fontSize?: number;
  limit?: number;
  minColumnWidth?: number;
  results: DataResponse;
  title: string;
  Explanation?: string;
  FirstColumn?: string[];
  SecondColumn?: string[];
  ThirdColumn?: string[];
  FourthColumn?: string[];
  FifthColumn?: string[];
};

type Meta = {
  downloadAll: boolean;
  maxRowsFit: number;
  page: number;
  prevVariableValues: Record<string, any>;
  sort: OrderBy[];
};

export default (props: Props) => {
  const {
    columns,
    results,
    allResults,
    Explanation,
    FirstColumn,
    SecondColumn,
    ThirdColumn,
    FourthColumn,
    FifthColumn,
  } = props;

  // ✅ Apply the same column hiding logic from the second code
  const visibleColumns = columns.filter((_, index) => {
  if (index === 0 && FirstColumn?.includes('Hauptwarengruppe')) return false;
  if (index === 1 && SecondColumn?.includes('Oberwarengruppe')) return false;
  if (index === 2 && ThirdColumn?.includes('Warengruppe')) return false;
  if (index === 3 && FourthColumn?.includes('Ferrero Kategorie')) return false;
  if (index === 4 && FifthColumn?.includes('Ferrero Produkt')) return false;
  return true;
});


  const [maxRowsFit, setMaxRowFit] = useState(0);
  const [resizing, setResizing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [meta, setMeta] = useEmbeddableState({
    downloadAll: false,
    maxRowsFit: 0,
    page: 0,
    prevVariableValues: {},
    sort: props.defaultSort,
  }) as [Meta, (f: (m: Meta) => Meta) => void];

  useEffect(() => {
    if (!resizing) {
      setMeta((meta) => ({ ...meta, maxRowsFit }));
    }
  }, [props.columns, maxRowsFit, setMeta, resizing]);

  // Catch "download all as csv" events
  useEffect(() => {
    if (isDownloadingAll) {
      if (!allResults || !allResults.data || allResults.data.length === 0) {
        // We haven't finished the loadData yet, so hang on
        return;
      }
      downloadAsCSV(props, allResults?.data, [], 'downloaded-chart-data');
      setIsDownloadingAll(false);
      setMeta((meta) => ({ ...meta, downloadAll: false }));
    }
  }, [allResults, isDownloadingAll, props, results, setMeta]);

  const calculateMaxRowFix = useCallback(
    ({ height }: { height: number }) => {
      let val = 0;
      const heightWithoutHead = (height || 76) - 76;
      const newMaxRowsFit = Math.floor(heightWithoutHead / 44);

      if (
        (maxRowsFit === newMaxRowsFit && newMaxRowsFit === val) ||
        props.results?.data?.length === 0
      ) {
        return;
      }
      setMaxRowFit((val = newMaxRowsFit));
    },
    [maxRowsFit, props.results],
  );

  useEffect(() => {
    if (props.results?.data?.length) {
      setHasNextPage(props.limit ? props.results.data.length >= props.limit : false);
    }
  }, [props.results, props.limit]);

  // We pass this to the download menu via the container
  const handleDownloadAll = useCallback(() => {
    setMeta((meta) => ({ ...meta, downloadAll: true }));
    setIsDownloadingAll(true);
  }, [setMeta]);

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

      setMeta((meta) => ({ ...meta, sort, page: 0 }));
    },
    [meta, setMeta],
  );

  return (
    <Container
      {...props}
      onResize={calculateMaxRowFix}
      setResizeState={(value) => setResizing(value)}
      className="overflow-y-auto"
      childContainerClassName="overflow-x-auto"
      downloadAllFunction={handleDownloadAll}
    >
      <div style={{ minWidth: `${visibleColumns?.length * (props.minColumnWidth ?? 100)}px` }}>
        {!!meta && !(props.results?.isLoading && !props.results?.data?.length) && (
          <table
            className="overflow-visible w-full"
            style={{ fontSize: props.fontSize ? `${props.fontSize}px` : REGULAR_FONT_SIZE }}
          >
            <TableHead
              columns={visibleColumns}
              sortBy={meta?.sort?.[0]?.property}
              sortDirection={
                meta?.sort?.[0]?.direction === 'asc'
                  ? SortDirection.ASCENDING
                  : SortDirection.DESCENDING
              }
              onSortingChange={updateSort}
              minColumnWidth={props.minColumnWidth ? props.minColumnWidth : undefined}
            />

            <tbody>
              {results?.data?.slice(0, maxRowsFit).map((row, index) => (
                <tr key={index} className="hover:bg-gray-400/5">
                  {visibleColumns.map((column, colIndex) => {
                    const formattedValue = formatColumn(row[column.name], column);
                    let title = '';
                    if (typeof formattedValue === 'object') {
                      title = (formattedValue as React.ReactElement).props.children;
                    } else {
                      title = formattedValue;
                    }
                    return (
                      <td
                        key={colIndex}
                        className="text-dark p-3 truncate"
                        style={{
                          fontSize: props.fontSize ? `${props.fontSize}px` : REGULAR_FONT_SIZE,
                          maxWidth: props.minColumnWidth
                            ? `${props.minColumnWidth * 1.2}px`
                            : 'auto',
                        }}
                      >
                        <span title={title}>{formattedValue}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={meta?.page || 0}
        hasNextPage={hasNextPage}
        onPageChange={(page) => {
          setMeta((meta) => ({ ...meta, page: page }));
        }}
      />
    </Container>
  );
};

function formatColumn(text: string | number | boolean, column: DimensionOrMeasure) {
  if (text === null || text === undefined) return '-';
  if (typeof text === 'number' || column.nativeType === 'number') {
    return formatValue(`${text}`, { type: 'number', meta: column?.meta });
  }

  if (typeof text === 'boolean') {
    return text ? 'True' : 'False';
  }

  if (text && column.nativeType === 'time') return formatValue(text, 'date');

  const { linkText, linkUrl } = detectAndReturnLinks(text);
  if (linkText && linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    );
  }

  return formatValue(text);
}
