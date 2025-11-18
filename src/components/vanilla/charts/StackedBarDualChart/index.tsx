import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

import { EMB_FONT, LIGHT_FONT, SMALL_FONT_SIZE } from '../../../constants';
import useTimeseries from '../../../hooks/useTimeseries';
import getBarChartOptions from '../../../util/getBarChartOptions';
import getStackedChartData, { Props } from '../../../util/getStackedChartData2';
import Container from '../../Container';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

ChartJS.defaults.font.size = parseInt(SMALL_FONT_SIZE);
ChartJS.defaults.color = LIGHT_FONT;
ChartJS.defaults.font.family = EMB_FONT;
ChartJS.defaults.plugins.tooltip.enabled = true;

type Totals = {
  [xAxis: string]: {
    total: number;
    lastSegment: number | null;
  };
};

export default (props: Props) => {
  const colors = [
  '#F1747C', // red1
  '#a63232ff', // dark red1
  '#E0E0E0', // light grey1
  '#6B6B6B', // dark grey1
  '#a56d73ff', // red2
  '#da081dff', // dark red2
  '#f86262ff', // light grey2
  '#302c2cff', // dark grey2
  '#eee8e88f', // red3
  '#421518ff', // dark red3
  '#947272ff', // light grey3
  '#610404ff', // dark grey3
  '#943431ff', // light grey3
  '#180b0bff', // dark grey3
];

  const datasetsMeta = {
    barPercentage: 0.6,
    barThickness: 'flex',
    maxBarThickness: 25,
    minBarLength: 0,
    borderRadius: 3,
  };

  const { fillGaps } = useTimeseries(props, 'desc');
  const { results, isTSGroupedBarChart, AbsolutePercentage } = props;

  const [showLabels, setShowLabels] = useState(props.showLabels || false);

  const updatedProps = {
    ...props,
    showLabels,
    onToggleLabels: setShowLabels,
    results: isTSGroupedBarChart
      ? { ...props.results, data: results?.data?.reduce(fillGaps, []) }
      : props.results,
  };

  // Compute totals if needed
  if (props.showTotals) {
    const totals: Totals = {};
    const { data } = props.results;
    const { metric, xAxis } = props;
    if (data && data.length > 0) {
      data.forEach((d: { [key: string]: any }) => {
        const x = d[xAxis.name];
        const y = parseFloat(d[metric.name]);
        if (totals[x]) {
          totals[x].total += y;
          totals[x].lastSegment = null;
        } else {
          totals[x] = { total: y, lastSegment: null };
        }
      });
      updatedProps.totals = totals;
    }
  }

  // Generate chart data
  const chartData = getStackedChartData(updatedProps, datasetsMeta) as ChartData<'bar', number[], unknown>;

  

  // X-axis formatting (months/weeks)
  if (chartData.labels && props.xAxis?.name) {
    const xName = props.xAxis.name.toLowerCase();

    if (xName.includes('month_number')) {
      const monthNames = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];
      chartData.labels = chartData.labels.map((lbl) => {
        const monthIndex = parseInt(lbl as string, 10);
        return monthIndex >= 1 && monthIndex <= 12 ? monthNames[monthIndex-1] : lbl;
      });
    } else if (xName.includes('week_number')) {
      chartData.labels = chartData.labels.map((lbl) => `Week ${lbl}`);
    }
  }

  // Apply colors
  chartData.datasets.forEach((dataset, i) => {
    dataset.backgroundColor = colors[i % colors.length];
  });

  // Handle AbsolutePercentage
  if (AbsolutePercentage) {
    const { labels, datasets } = chartData;
    if (datasets && labels) {
      labels.forEach((_lbl, li) => {
        const labelTotal = datasets.reduce((s, ds) => s + (+ds.data[li] || 0), 0);
        if (labelTotal === 0) return;
        datasets.forEach((ds) => {
          ds.data[li] = (+ds.data[li] / labelTotal) * 100;
        });
      });
    }
  }

  // Chart options with dual y-axis
  // Chart options with dual y-axis and no grid lines
const options = getBarChartOptions({ ...updatedProps, stacked: props.stackBars });
options.scales = {
  x: {
    ticks : {
      font: function () {
            return {
              weight: 'bold',
              family: 'Arial',
              size: 12,
              color: '#62626E'
            };
          },

    },
    border: {
          display: false
        },

    position: 'top', 
    
    grid: { display: false,
      drawTicks: false,
     }, // remove vertical grid lines
  },
  y: {
    type: 'linear',
    position: 'left',
    title: { display: true, text: props.yAxisTitle || props.metric?.title },
    grid: { display: false }, // remove horizontal grid lines
  },
  y1: {
    type: 'linear',
    position: 'right',
    title: { display: !!props.metric2, text: props.metric2?.title },
    grid: { display: false }, // remove horizontal grid lines for secondary axis
  },
};


  return (
    <Container {...updatedProps} className="overflow-y-hidden">
      <Bar
        height="100%"
        options={options}
        data={chartData}
      />
    </Container>
  );
};
