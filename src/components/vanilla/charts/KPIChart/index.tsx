import React, { useMemo, useState } from 'react';
import { DataResponse, Dimension, Measure, TimeRange } from '@embeddable.com/core';
import formatValue from '../../../util/format';
import Container from '../../Container';
import { WarningIcon } from '../../icons';

type Props = {
  results: DataResponse;
  prevResults?: DataResponse;
  prevTimeFilter?: TimeRange;
  title?: string;
  prefix?: string;
  suffix?: string;
  metric?: Measure;
  displayMetric?: boolean;
  dimension?: Dimension;
  dps?: number;
  fontSize?: number;
  showPrevPeriodLabel?: boolean;
};

export default (props: Props) => {
  const {
    results,
    prevResults,
    metric,
    displayMetric,
    dimension,
    dps,
    prefix,
    suffix,
  } = props;

  const [showPopup, setShowPopup] = useState(false);

  const { n } = useMemo(() => {
    if (!metric?.name || !results?.data?.length) return { n: null };

    const n = parseFloat(results?.data?.[0]?.[metric.name] || 0);

    return {
      n: formatValue(n.toString(), {
        type: 'number',
        dps: 0, // Ensure no decimals
        meta: metric?.meta,
      }),
    };
  }, [results, metric]);

  const fontSize = props.fontSize || 24; // Default font size

  return (
    <Container {...props} className="overflow-y-hidden">
      <div
        className="flex flex-col h-full items-center justify-center font-embeddable text-[#333942] text-center leading-tight font-bold relative"
      >
        {/* Title should appear once */}
        {props.title && (
          <div
            style={{ fontSize: `${fontSize}px`, color: '#a53241' }} // Title in red (#a53241)
            className="text-red-500 font-bold"
          >
            <p>{props.title}</p>
          </div>
        )}

        {/* Display Metric */}
        <div
          style={{ fontSize: `${fontSize}px`, color: '#333942', cursor: 'pointer' }} // Metric in dark black (#333942)
          onClick={() => setShowPopup(true)}
        >
          <p>{`${prefix || ''}${n || 0}${suffix || ''}`}</p>
        </div>

        {showPopup && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowPopup(false)}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold">Your total unfiltered impressions are:</p>
              <p className="text-xl font-bold text-red-500">{n}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};
