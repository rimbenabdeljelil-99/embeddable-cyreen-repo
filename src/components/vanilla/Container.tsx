import { DataResponse, Dimension, Measure } from '@embeddable.com/core';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useFont from '../hooks/useFont';
import useResize, { Size } from '../hooks/useResize';
import Description from './Description';
import DownloadMenu from './DownloadMenu';
import Spinner from './Spinner';
import Title from './Title';
import { WarningIcon } from './icons';
import './index.css';

export type ContainerProps = {
  childContainerClassName?: string;
  className?: string;
  description?: string;
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  onResize?: (size: Size) => void;
  prevResults?: DataResponse;
  results?: DataResponse | DataResponse[];
  setResizeState?: (resizing: boolean) => void;
  title?: string;
  translatedTitle?: string;
  granularity?: string;
  metrics?: Measure[];
  impression?: boolean;
  Totalperformance?: boolean;
  optimization?: boolean;
  KPIvalue?: string[];
  xAxis?: Dimension;
  showLabels?: boolean;
  Overview?: boolean;
  Explanation?: string;
  onToggleLabels?: (show: boolean) => void;
};

export default ({
  children,
  className,
  childContainerClassName,
  onResize,
  setResizeState,
  ...props
}: PropsWithChildren<ContainerProps>) => {
  const refPrevHeight = useRef<number | null>(null);
  const refExportPNGElement = useRef<HTMLDivElement | null>(null);
  const refResize = useRef<HTMLDivElement | null>(null);
  const refResizingTimeout = useRef<number | null>(null);
  const { height } = useResize(refResize, onResize || null);
  const [preppingDownload, setPreppingDownload] = useState<boolean>(false);

  useEffect(() => {
    if (!setResizeState) {
      return;
    }
    const currentHeight = height;
    if (refPrevHeight.current === null) {
      refPrevHeight.current = currentHeight;
    }
    if (currentHeight !== refPrevHeight.current) {
      setResizeState?.(true);
      if (refResizingTimeout.current) {
        window.clearTimeout(refResizingTimeout.current);
      }
      refResizingTimeout.current = window.setTimeout(() => {
        setResizeState?.(false);
      }, 300);
    }
    refPrevHeight.current = currentHeight;
    return () => {
      if (refResizingTimeout.current) {
        window.clearTimeout(refResizingTimeout.current);
      }
    };
  }, [height, setResizeState]);

  const { isLoading, error, data } = Array.isArray(props.results)
    ? {
      isLoading: props.results.some((result) => result.isLoading),
      error: props.results.some((result) => result.error),
      data: props.results.flatMap((result) => result.data).filter((data) => data),
    }
    : props.results || {};
  const noData = !isLoading && !data?.length;

  useFont();
  const granularityLabels = {
    hour: 'Hourly',
    month: 'Monthly',
    hour_group: 'Hour Group',
    total: 'Total',
    week: 'Weekly',
    day: 'Daily',
    weekday: 'Weekday'
  };

  const displayGranularity =
    props.impression && props.granularity ? (granularityLabels[props.granularity] || '') : '';

  return (
    <div className="h-full relative font-embeddable text-sm flex flex-col">
      {props.enableDownloadAsCSV || props.enableDownloadAsPNG ? (
        <div className={`${!props.title ? 'h-[32px] w-full' : ''}`}>
          {/* spacer to keep charts from overlaying download menu if no title*/}
        </div>
      ) : null}
      <Spinner show={isLoading || preppingDownload} />
      <div className="h-full relative flex flex-col" ref={refExportPNGElement}>
        {props.optimization ? (
          <Title
            title={
              props.KPIvalue?.includes('Conversion Rate')
                ? 'Conversion Rate'
                : props.KPIvalue?.includes('Average Basket Size')
                  ? 'Average Basket Size'
                  : props.KPIvalue?.includes('Sales Uplift')
                    ? 'Sales Uplift'
                    : props.KPIvalue?.includes('Conversion Uplift')
                      ? 'Conversion Uplift'
                      : props.translatedTitle
            }
          />
        ) : displayGranularity ? (
          <Title title={props.translatedTitle + ` ${displayGranularity}`} />
        ) : (props.xAxis === "receipts_retail.hour" || props.xAxis === "customer_journeys.hour") ? (
          <Title title='Hourly' />

        ) : (props.xAxis === "receipts_retail.date" || props.xAxis === "customer_journeys.date") ? (
          <Title title='Daily' />

        ) : (props.xAxis === "receipts_retail.dow" || props.xAxis === "customer_journeys.dow") ? (
          <Title title='Weekday' />

        ) : (props.xAxis === "receipts_retail.month" || props.xAxis === "customer_journeys.month1") ? (
          <Title title='Monthly' />
        )
          : (props.xAxis === "overview.hour") ? (

            <Title title={'Hourly' + props.title} />
          )
            : (props.xAxis === "overview.date") ? (

              <Title title={'Daily' + props.title} />
            )
              : (props.xAxis === "overview.dow") ? (

                <Title title={'Weekday' + props.title} />
              )

                : (props.xAxis === "overview.month1") ? (

                  <Title title={'Monthly' + props.title} />
                )

                  :

                  (props.title === "Smart Stores") ? (
                    <Title title={props.title}
                      color='white' />
                  )
                    :
                    (
                      <Title title={props.title} />
                    )}

        <Description description={props.description} />



        <div ref={refResize} className={twMerge(`relative grow flex flex-col`, className || '')}>
          <div
            className={twMerge('-z-0 flex flex-col', childContainerClassName || '')}
            style={{ height: `${height}px` }}
          >
            {height && props.results && (error || noData) ? (
              <div className="h-full flex items-center justify-center font-embeddable text-sm">
                <WarningIcon />
                <div className="whitespace-pre-wrap p-4 max-w-sm text-sm">
                  {error || '0 results'}
                </div>
              </div>
            ) : height ? (
              children
            ) : null}
          </div>
          {isLoading && !data?.length && (
            <div className="absolute left-0 top-0 w-full h-full z-10 skeleton-box bg-gray-300 overflow-hidden rounded" />
          )}
        </div>
      </div>
      {!isLoading && (props.enableDownloadAsCSV || props.enableDownloadAsPNG) ? (
        <DownloadMenu
          csvOpts={{
            chartName: props.title || 'chart',
            props: {
              ...props,
              results: props.results,
              prevResults: props.prevResults,
            },
          }}
          Explanation={props.Explanation}
          enableDownloadAsCSV={props.enableDownloadAsCSV}
          enableDownloadAsPNG={props.enableDownloadAsPNG}
          pngOpts={{ chartName: props.translatedTitle || 'chart', element: refExportPNGElement.current }}
          preppingDownload={preppingDownload}
          setPreppingDownload={setPreppingDownload}
          showLabels={props.showLabels}
          onToggleLabels={props.onToggleLabels}
        />
      ) : null}
    </div>
  );
};