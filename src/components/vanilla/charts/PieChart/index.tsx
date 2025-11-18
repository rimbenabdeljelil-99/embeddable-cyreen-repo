import { DataResponse, Dimension, Measure } from '@embeddable.com/core';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  InteractionItem,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useRef, useState } from 'react';
import { Pie, getElementAtEvent } from 'react-chartjs-2';

import { EMB_FONT, LIGHT_FONT, SMALL_FONT_SIZE } from '../../../constants';
import formatValue from '../../../util/format';
import Container from '../../Container';

ChartJS.register(
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

ChartJS.defaults.font.size = parseInt(SMALL_FONT_SIZE);
ChartJS.defaults.color = LIGHT_FONT;
ChartJS.defaults.font.family = EMB_FONT;
ChartJS.defaults.plugins.tooltip.enabled = true;
ChartJS.defaults.plugins.tooltip.usePointStyle = true;

type Props = {
  results: DataResponse;
  title: string;
  dps?: number;
  slice: Dimension;
  metrics: Measure[];
  showLabels?: boolean;
  showLegend?: boolean;
  maxSegments?: number;
  displayAsPercentage?: boolean;
  enableDownloadAsCSV?: boolean;
  AbsolutePercentage?: boolean;
  Despar?: boolean;
  onClick: (args: { slice: string | null; metric: string | null }) => void;
  Explanation?: string
};

export default (props: Props) => {
  const { results, title, enableDownloadAsCSV, slice, onClick, AbsolutePercentage, Despar, Explanation } = props;
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<'pie', []>>(null);

  const fireClickEvent = (element: InteractionItem[]) => {
    if (!element.length || element[0].index === clickedIndex) {
      onClick({ slice: null, metric: null });
      setClickedIndex(null);
      return;
    }
    const { index } = element[0];
    const metricClicked = props.metrics?.[index]?.name || null;
    setClickedIndex(index);
    onClick({
      slice: results.data?.[0]?.[slice.name] ?? null,
      metric: metricClicked,
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;
    if (!chart) return;
    fireClickEvent(getElementAtEvent(chart, event));
  };

  return (
    <Container {...props} className="overflow-y-hidden">
      <Pie
        width="100%"
        height="100%"
        options={chartOptions(props)}
        data={chartData(props)}
        ref={chartRef}
        onClick={handleClick}
      />
    </Container>
  );
};

// ... (previous imports remain the same)

function chartOptions(props: Props): ChartOptions<'pie'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
      easing: 'linear',
    },
    cutout: '50%',
    plugins: {
      datalabels: {
        color: '#6E2332',
        display: props.showLabels ? 'auto' : false,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 6,
        font: {
          family: EMB_FONT,
          weight: 'bold',
          size: parseInt(SMALL_FONT_SIZE)
        },
        align: 'end',
        anchor: 'end',
        offset: 5,
        clamp: true,
        clip: false,
        formatter: (value, context) => {
          const metric = props.metrics?.[context.dataIndex];
          const metricMeta = metric?.meta;
          const formattedValue = value
            ? formatValue(value, {
              type: 'number',
              dps: props.dps,
              meta: (props.displayAsPercentage || props.AbsolutePercentage) ? undefined : metricMeta,
            }, props.Despar)
            : null;
          const displayValue = (props.displayAsPercentage || props.AbsolutePercentage)
            ? `${formattedValue}%`
            : formattedValue;
          return `${metric?.label || metric?.title || ''} ${displayValue}`;
        },
      },
      tooltip: {
        enabled: false,
        external: function (context) {
          const tooltipModel = context.tooltip;

          // Create tooltip element if not exists
          let tooltipEl = document.getElementById('custom-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'custom-tooltip';
            Object.assign(tooltipEl.style, {
              position: 'absolute',
              backgroundColor: 'rgb(255,255,255)',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
              padding: '8px 12px',
              pointerEvents: 'none',
              color: '#000',
              transition: 'opacity 0.2s ease',
              zIndex: '1000',
            });
            document.body.appendChild(tooltipEl);
          }

          // Hide tooltip if not visible
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          const labelCtx = context.tooltip.dataPoints[0];
          const value = formatValue(`${labelCtx.parsed || ''}`, {
            type: 'number',
            dps: props.dps,
            meta: props.displayAsPercentage
              ? undefined
              : props.metrics?.[labelCtx.dataIndex]?.meta,
          }, props.Despar);

          let innerHTML = '';
          const formattedValue = props.AbsolutePercentage ? `${value}%` : value;

          if (labelCtx.dataIndex === 0) {
            innerHTML = `<div><strong style="color:#AF3241">${formattedValue}</strong> of the shoppers triggered a commercial playout.</div>`;
          } else if (labelCtx.dataIndex === 1) {
            innerHTML = `<div><strong style="color:#62626E">${formattedValue}</strong> of the shoppers witness an already playing commercial.</div>`;
          }


          tooltipEl.innerHTML = innerHTML;

          // Positioning
          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
        }
      },
      legend: {
        display: props.showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxHeight: 10,
          padding: 20,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    }
  };
}

// ... (rest of the code remains the same)
function chartData(props: Props) {
  const { results, metrics, displayAsPercentage, AbsolutePercentage } = props;
  const row = results.data?.[0];
  if (!row) return { labels: [], datasets: [] };

  const labels = metrics.map((m) => m.title ?? m.label ?? m.name);

  const rawValues = metrics.map((m) => parseFloat(row[m.name] ?? '0'));

  // Calculate sum if we need to convert to percentages
  const sum = (displayAsPercentage || AbsolutePercentage) ? rawValues.reduce((a, b) => a + b, 0) : null;

  // Convert to percentages if either displayAsPercentage or AbsolutePercentage is true
  const values = (displayAsPercentage || AbsolutePercentage) && sum
    ? rawValues.map((v) => (v * 100) / sum)
    : rawValues;

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#F04B55', '#62626E'],
        borderColor: '#fff',
        borderWidth: 2,
        hoverBackgroundColor: ['#AF3241', '#2D2D37'],
      },
    ],
  };
}