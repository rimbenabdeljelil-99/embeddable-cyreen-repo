import { DataResponse, DimensionOrMeasure, Measure } from '@embeddable.com/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { Chart } from 'chart.js';

import formatValue from '../util/format';
import { setYAxisStepSize } from './chartjs/common';
import { Props } from './getStackedChartData';
import { isTransparent } from 'html2canvas/dist/types/css/types/color';

// We're adding a few properties to use when showing totals on the chart
type ExtendedChartDataset = ChartDataset<'bar' | 'line'> & {
  totals?: { [key: string]: { total: number; lastSegment: number | null } };
  xAxisNames?: string[];
};


const getPadding = (
  showLabels: boolean,
  showTotals: boolean,
  stacked: boolean,
  displayHorizontally: boolean,
) => {
  let left = 0;
  let right = 0;
  let top = 0;
  const bottom = 0;
  if (!stacked) {
    if (displayHorizontally) {
      right = showLabels ? 60 : 0;
      left = showLabels ? 60 : 0;
    } else {
      top = showLabels ? 20 : 20;
    }
  } else {
    if (displayHorizontally) {
      right = showTotals ? 60 : 0;
      left = showTotals ? 60 : 0;
    } else {
      top = showTotals ? 20 : 0;
    }
  }
  return { left, right, top, bottom };
};

export default function getBarChartOptions({
  displayHorizontally = false,
  dps = undefined,
  lineMetrics,
  metric,
  metrics,
  granularity,
  results,
  reverseXAxis = false,
  secondAxisTitle = '',
  segment,
  showLabels = false,
  showLegend = false,
  showSecondYAxis = false,
  showTotals = false,
  stackMetrics = false,
  stacked = false,
  xAxis,
  xAxisTitle = '',
  yAxisTitle = '',
  displayAsPercentage = false,
  isGroupedBar,
  stackBars,
  xAxisPosition = 'top',
  displayYaxis = true,
  xAxisFont,
  LabelFont,
  displayXaxis = true,
  impression = false,
  performance = false,
  optimization = false,
  Weekly = false,
  TrolleyBar = false,
  MarketingActivities = false,
  InstoreDuration2 = false,
  TrolleyUsage = false,
  Profitability = false,
  Profitability2 = false,
  GeneralKPIs = false,
  overview = false,
  edeka = false,
  Despar = false,
  master = false,
  MasterLines = false,
  MasterRetail = false,
  masterUplift = false,
  InstoreDuration = false,
  Totalperformance = false,
  KPIvalue,
  AbsolutePercentage = false,
  Weiden= false,
}: Partial<Props> & {
  lineMetrics?: DimensionOrMeasure[];
  metric?: DimensionOrMeasure;
  metrics?: DimensionOrMeasure[];
  results?: DataResponse;
  reverseXAxis?: boolean;
  secondAxisTitle?: string;
  showSecondYAxis?: boolean;
  stackMetrics?: boolean;
  stacked?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  isGroupedBar?: boolean;
  Weekly?: boolean;
  stackBars?: boolean;
  Weiden?: boolean;
  xAxisPosition?: 'top' | 'bottom';
  displayYaxis?: boolean;
  xAxisFont? : number;
  LabelFont? : number;
  displayXaxis?: boolean;
  granularity?: string;
  impression?: boolean;
  performance?: boolean;
  optimization?: boolean;
  TrolleyBar?: boolean;
  MarketingActivities?: boolean;
  Profitability?: boolean;
  Profitability2?: boolean;
  GeneralKPIs?: boolean;
  InstoreDuration2?: boolean
  TrolleyUsage?: boolean
  overview?: boolean;
  edeka?: boolean;
  master?: boolean;
  Despar?: boolean;
  masterUplift?: boolean;
  Totalperformance?: boolean;
  KPIvalue?: string;
  AbsolutePercentage?: boolean;
  MasterLines?: boolean;
  InstoreDuration?: boolean;

  MasterRetail?: boolean

}): ChartOptions<'bar' | 'line'> {
  const displayedMonths = new Set();
  const displayedYears = new Set();
  const displayedQuarters = new Set();

  const monthCounts = new Map<string, number>();
  if (results?.data && (xAxis === 'receipts_retail.date' || xAxis === 'customer_journeys.date' || xAxis === 'overview.date')) {
    results.data.forEach(item => {
      const dateObj = new Date(item[xAxis]);
      if (!isNaN(dateObj.getTime())) {
        const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
        monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
      }
    });
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: displayHorizontally ? ('y' as const) : ('x' as const),
    layout: {
      padding: getPadding(showLabels, showTotals, stacked, displayHorizontally),
    },
    scales: {
      y: {
        display: displayYaxis,
        stacked: stacked || stackMetrics,
        grace: '0%',
        position: 'left',
        grid: {
          display: false
        },

        max:
          AbsolutePercentage && !displayHorizontally

            ? stackMetrics
              ? 120 // When both displayAsPercentage and stackMetrics are true
              : isGroupedBar
                ? stackBars
                  ? 100
                  : undefined
                : 100
            : undefined,
        afterDataLimits: function (axis) {
          //Disable fractions unless they exist in the data.
          const metricsGroup = [
            ...(metric !== undefined ? [metric] : []),
            ...(metrics || []),
            ...(lineMetrics && !showSecondYAxis ? lineMetrics : []),
          ];
          setYAxisStepSize(axis, results, metricsGroup, dps);
        },
        ticks: {
          callback: function (value: number, index: number, ticks: any[]) {
            const maxY = this.chart.scales.y.max;
            const minY = this.chart.scales.y.min;

            // Skip rendering ticks during animation if the scale is clearly wrong
            //if (Math.abs(maxY - minY) < 10 && maxY < 5000) {
              //return '';
            //}

            // Determine formatting type
            let unit = '';
            let divisor = 1;

            if (maxY >= 1_000_000_000) {
              unit = 'B';
              divisor = 1_000_000_000;
            } else if (maxY >= 5_000_000) {
              unit = 'M';
              divisor = 1_000_000;
            } else if (maxY > 5000) {
              unit = 'k';
              divisor = 1000;
            }

            // Format value
            const formatted = `${(value / divisor).toFixed(0)}${unit}`;

            // Avoid duplicate tick labels
            const prevTick = ticks[index - 1];
            const prevFormatted =
              prevTick !== undefined ? `${(prevTick.value / divisor).toFixed(0)}${unit}` : null;

            if (formatted === prevFormatted) {
              return '';
            }

            return formatted;
          }
        },



        title: {
          display: !!yAxisTitle,
          text: yAxisTitle === 'Impressions' && AbsolutePercentage ? 'Impressions (%)' : yAxisTitle,
          font: {
            size: 13
          },
        },
      },

      y1: {

        //optional second y-axis for optional line metrics


        display: function (context) {
          const chart = context.chart;
          // Get all datasets assigned to the second Y-axis
          const y1Datasets = chart.data.datasets.filter(ds => ds.yAxisID === 'y1');

          // Calculate total data points across them
          const totalPoints = y1Datasets.reduce((sum, ds) => sum + (ds.data?.length || 0), 0);

          console.log(totalPoints)

          // Show axis only if total points <= 200 and showSecondYAxis is true
          return totalPoints < 200 && showSecondYAxis;
        },


        grace: '0%',
        grid: {
          display: false,
        },
        position: 'right',
        ticks: {
          callback: function (value: number, index: number, ticks: any[]) {
            const maxY = this.chart.scales.y1.max;
            const minY = this.chart.scales.y1.min;


            // Determine formatting type
            let unit = '';
            let divisor = 1;

            if (maxY >= 1_000_000_000) {
              unit = 'B';
              divisor = 1_000_000_000;
            } else if (maxY >= 5_000_000) {
              unit = 'M';
              divisor = 1_000_000;
            } else if (maxY > 5000) {
              unit = 'k';
              divisor = 1000;
            }

            // Format value
            const formatted = `${(value / divisor).toFixed(0)}${unit}`;

            // Avoid duplicate tick labels
            const prevTick = ticks[index - 1];
            const prevFormatted =
              prevTick !== undefined ? `${(prevTick.value / divisor).toFixed(0)}${unit}` : null;

            if (formatted === prevFormatted) {
              return '';
            }

            return formatted;
          }
        },
        title: {

          display: !!secondAxisTitle,
          text: secondAxisTitle,
          font: {
            size: 13
          },
        },
        afterDataLimits: function (axis) {
          //Disable fractions unless they exist in the data.
          const metricsGroup = [...(lineMetrics && showSecondYAxis ? lineMetrics : [])];
          setYAxisStepSize(axis, results, metricsGroup, dps);
        },
      },

      x: {

        display: displayXaxis,
        offset: true,
        border: {
          display: false
        },

        reverse: reverseXAxis && !displayHorizontally,
        position: xAxisPosition,
        stacked: stacked || stackMetrics,
        grid: {

          display: false,
          drawTicks: false,


        },

        afterFit: function (axis) {
          axis.paddingTop = 0;    // Reduce top padding
          axis.paddingBottom = 20; // Increase bottom padding
        },
        max:
          displayAsPercentage && displayHorizontally
            ? isGroupedBar
              ? stackBars
                ? 100
                : undefined
              : 100
            : undefined,

        ticks: {
          padding: granularity === 'hour' ? 25 : 20,

          crossAlign: 'near',
          align: 'center',
          font: function () {
            return {
              weight: 'bold',
              family: 'Arial',
              size: xAxisFont,
              color: '#62626E'
            };
          },

          //https://www.chartjs.org/docs/latest/axes/labelling.html

          callback: function (value) {

            const full = this.getLabelForValue(parseFloat(`${value}`)); // e.g. "30 Sep"
            const MIN_POINTS_PER_MONTH = 5;
            // In your ticks callback:
            
            if (xAxis?.name === 'ferrero_data.month_number') {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(full, 10) - 1; // assuming full is 1-based
    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return monthNames[monthIndex];
    }
    return full; // fallback in case of invalid number
  }

            if (xAxis === 'receipts_retail.month' || xAxis === 'customer_journeys.month1' || xAxis === 'overview.month1') {
              const [month, year] = full.split(' ');
              return month.substring(0, 3);
            }

            if ((xAxis === 'big_dm.date') || (xAxis?.name === 'ferrero_data.day_only')) {
              const date = new Date(full);
              if (isNaN(date.getTime())) return full;
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Mar 20"
            }
            if ((xAxis === 'big_dm.week') || (xAxis?.name === 'ferrero_data.week') || (xAxis?.name === 'weiden_all_customers_journey.week') || (xAxis?.name === 'weiden_count_per_day.week')) {
              // If `full` is just the week number, return "Week 12"
              return `Week ${full}`;
            }

            if (xAxis === 'receipts_retail.date' || xAxis === 'customer_journeys.date' || xAxis === 'overview.date') {
              const dateObj = new Date(full);
              if (isNaN(dateObj.getTime())) return full;

              const year = dateObj.getFullYear();
              const month = dateObj.getMonth();
              const monthKey = `${year}-${month}`;

              // Check if the month has enough data
              if ((monthCounts.get(monthKey) || 0) < MIN_POINTS_PER_MONTH) {
                return null; // Skip rendering this month
              }

              if (displayedQuarters.has(monthKey)) {
                return null;
              }

              displayedQuarters.add(monthKey);

              // Format date as "Sep 2025"
              const formattedDate = new Date(year, month, 1).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric'
              }).replace(/ /g, ' ');

              return '          ' + formattedDate;
            }

            if (granularity === 'day') {
              return full.split(' ')[0]; // "30"
            }
            if (granularity === 'total') {
              return full.split(' ')[1];   // "17"
            }
            if (granularity === 'week' && performance && !stackMetrics) {
              // full could be something like "2024-02-13 40"
              const parts = full.split(' ');
              const date = parts[2]; // "2024-02-13"
              const date2 = parts[3];
              const weekNumber = parts[1]; // "40"
              return [`Week ${weekNumber}`, `${date} to ${date2}`];  // <<=== RETURN ARRAY!
            }

            if ((full.length > 15) && (Totalperformance)) {
              // Split the label by spaces
              const words = full.split(' ');

              // Check if it's feasible to split into two lines
              let firstLine = '';
              let secondLine = '';

              words.forEach((word, index) => {
                if (firstLine.length + word.length + 1 <= 15) {
                  // Add word to the first line
                  firstLine += (firstLine.length ? ' ' : '') + word;
                } else {
                  // Add word to the second line
                  secondLine += (secondLine.length ? ' ' : '') + word;
                }
              });

              // Return the two lines
              return [firstLine, secondLine];
            } else {
              return [full]; // If length is under 15, no splitting needed
            }






            if (!displayHorizontally) {
              return full;
            }

            return displayAsPercentage
              ? `${value}%`
              : formatValue(typeof value === 'number' ? value.toString() : value, {
                type: 'number',
              });
          },
        },
        title: {
          font: {
            weight: 'bold',
          },

          display: !!xAxisTitle,
          text: xAxisTitle,
          padding: 20

        },
      },


    },
    animation: {
      duration: 400,
      easing: 'linear',
    },
    plugins: {


      drawYearLabelsPlugin: {
        active: xAxis === 'receipts_retail.month' || xAxis === 'customer_journeys.month1' || xAxis === 'overview.month1'
      },

      // In the plugins section of getBarChartOptions, add:
      stringMetric: {
        enabled: xAxis === 'big_dm.weather_bins' || xAxis === 'big_dm.weather_feels_bins' || xAxis === 'big_dm.name_market_type'
          || xAxis === 'big_dm.rain_bool' || xAxis === 'big_dm.snow_bool', // or whatever condition you want to activate it
        metrics: metrics, // pass the metrics
        rawData: results?.data // pass the raw data
      },




      monthHeader: { active: granularity === 'day' },
      dateHeader: { active: granularity === 'total' },
      legend: {
  display: function (context) {
    const chart = context.chart;

    if (xAxis === 'receipts_retail.date' || xAxis === 'customer_journeys.date') {
      return false;
    }

    const y1Datasets = chart.data.datasets.filter(ds => ds.yAxisID === 'y1');
    const totalPoints = y1Datasets.reduce((sum, ds) => sum + (ds.data?.length || 0), 0);

    return totalPoints < 200 && showLegend;
  },
  position: 'bottom',
  labels: {
    usePointStyle: true,
    boxHeight: 8,
    font: {
      size: 12,
      weight: 'bold',
    },
    padding: 20,
    generateLabels: function (chart) {
      const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);

      const labelMap = {
        'Total Frequency': 'Shoppers (Amount)',
        'Without C.A.P': 'Without C.A.P.',
        'With C.A.P': 'With C.A.P.',
        'Sales Uplift (No Negative)': 'Sales Uplift',
        'SP CR Uplift Positive': 'Conversion Uplift',
        'Sum Frequency No Device': 'Without Trolley',
        'Sum Frequency Trolley': 'With Trolley',
        'Average Frequency No Device Hourly': 'Without Trolley',
        'Average Frequency Trolley Hourly': 'With Trolley',
        'Average Frequency No Device Weekly': 'Without Trolley',
        'Average Frequency Trolley Weekly': 'With Trolley',
        'Sum Revenue No Device': 'Without Trolley',
        'Sum Revenue Trolley': 'With Trolley',
        'Sum Sales No Device': 'Without Trolley',
        'Sum Sales Trolley': 'With Trolley',
        'Average Sales No Device Hourly': 'Without Trolley',
        'Average Sales Trolley Hourly': 'With Trolley',
        'Average Sales No Device Weekly': 'Without Trolley',
        'Average Sales Trolley Weekly': 'With Trolley',
        'Average Revenue No Device Hourly': 'Without Trolley',
        'Average Revenue Trolley Hourly': 'With Trolley',
        'Average Revenue No Device Weekly': 'Without Trolley',
        'Average Revenue Trolley Weekly': 'With Trolley',
        'Week Before Baseline Reference Store (%)': 'Reference Store Pre-Campaign Period',
        'Past Quarter Baseline Reference Store (%)':'Reference Store Pre-Campaign Period',
        'Past Year Baseline Reference Store (%)':'Reference Store Pre-Campaign Period',
      };

      const mapped = original.map(label => {
        // Find the dataset this legend item represents
        const dataset = chart.data.datasets[label.datasetIndex];
        let text = labelMap[label.text] || label.text;

        // Only rename for line datasets
        if (dataset?.type === 'line' && text === 'Impressions') {
          text = 'Total Impressions';
        }

        return { ...label, text };
      });

      return (xAxis === 'receipts_retail.hour' && GeneralKPIs) ||
        xAxis === 'receipts_retail.date' ||
        xAxis === 'customer_journeys.dow' ||
        xAxis === 'customer_journeys.month1' ||
        impression
        ? mapped.reverse()
        : mapped;
    },
  },
},



      tooltip: {
        enabled: false,
        external: function (context) {
          const tooltipModel = context.tooltip;

          // Create tooltip element if not exists
          let tooltipEl = document.getElementById('custom-tooltip');
          if (tooltipModel.opacity === 0) {
            if (tooltipEl) {
              tooltipEl.parentNode.removeChild(tooltipEl);
            }
            return;
          }
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

          // Extract values
          const titleLines = tooltipModel.title || [];
          const bodyLines = tooltipModel.body.map(b => b.lines).flat();

          const labelCtx = context.tooltip.dataPoints[0];
          const chart = context.chart;
const datasetIndex = labelCtx.datasetIndex;

// Always get the label from the current chart data
const label = chart.data.datasets[datasetIndex]?.label || '';

          const parsed = labelCtx.parsed;
          const axis = displayHorizontally ? 'x' : 'y';
          const metricIndex = labelCtx.datasetIndex;
          const metricsList = [...(metrics || []), ...(lineMetrics || [])];
          const metricObj = metrics ? metricsList[metricIndex] : metric;

          let value = formatValue(parsed[axis], {
            type: 'number',
            dps: dps,
            meta: displayAsPercentage ? undefined : metricObj?.meta
          }, Despar);

          if (displayAsPercentage) value += '%';

          let innerHTML = '';
          const weekdayMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

          // Function to replace CLP$ with € if MasterRetail is true
          const formatCurrency = (text) => {
            if (MasterRetail) {
              return text.replace(/CLP\$/g, '€');
            }
            return text;
          };






          if (optimization && titleLines.length && bodyLines.length) {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (xAxis?.name === 'big_dm.hour_group') {

              //const customIndexMap = [5, 0, 1, 2, 3, 4]; // mapping from dataIndex 0 → 5, 1 → 2, 2 → 3, etc.

              const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
              const fifthMetric = metricsList[7];

              const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const sixthMetric = metricsList[6];

              const sixthMetricValue = sixthMetric && results?.data?.[mappedIndex]?.[sixthMetric.name] !== undefined
                ? formatValue(results.data[mappedIndex][sixthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';


              if (label === 'Without C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';
                innerHTML = `
                  <div>In hour group <strong style="color:#62626E">${xVal}</strong>, Conversion Rate <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
                  ${upliftLine}
                  `;

              }
              else if (label === 'With C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';

                innerHTML = `
        <div>In hour group <strong style="color:#AF3241">${xVal}</strong>, Conversion Rate <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
        ${upliftLine}
        `;
              }
              else if (label === 'Without C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
        <div>In hour group <strong style="color:#62626E">${xVal}</strong>, Average Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
        ${upliftLine}
        `;
              }

              else if (label === 'With C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
        <div>In <strong style="color:#AF3241">${xVal}</strong>, Average Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
        ${upliftLine}
        `;
              }

              else if (label === 'Sales Uplift (No Negative)') {

                innerHTML = `
        <div>In hour group <strong style="color:#AF3241">${xVal}</strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
      `;
              }

              else if (label === 'SP CR Uplift Positive') {


                innerHTML = `
        <div>In hour group <strong style="color:#AF3241">${xVal}</strong>, Conversion Uplift is <strong style="color:#AF3241">${Math.round(value)}%</strong></div>
      `;
              }


            }

            if (xAxis?.name === 'big_dm.hour') {

              //const customIndexMap = [5, 0, 1, 2, 3, 4]; // mapping from dataIndex 0 → 5, 1 → 2, 2 → 3, etc.

              const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
              const fifthMetric = metricsList[7];

              const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const sixthMetric = metricsList[6];

              const sixthMetricValue = sixthMetric && results?.data?.[mappedIndex]?.[sixthMetric.name] !== undefined
                ? formatValue(results.data[mappedIndex][sixthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';


              if (label === 'Without C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';
                innerHTML = `
                  <div>At hour <strong style="color:#62626E">${xVal}</strong>, Conversion Rate <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
                  ${upliftLine}
                  `;

              }
              else if (label === 'With C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';

                innerHTML = `
        <div>At hour <strong style="color:#AF3241">${xVal}</strong>, Conversion Rate <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
        ${upliftLine}
        `;
              }
              else if (label === 'Without C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
        <div>At hour <strong style="color:#62626E">${xVal}</strong>, Average Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
        ${upliftLine}
        `;
              }

              else if (label === 'With C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
        <div>In <strong style="color:#AF3241">${xVal}</strong>, Average Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
        ${upliftLine}
        `;
              }

              else if (label === 'Sales Uplift (No Negative)') {

                innerHTML = `
        <div>At hour <strong style="color:#AF3241">${xVal}</strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
      `;
              }

              else if (label === 'SP CR Uplift Positive') {


                innerHTML = `
        <div>At hour <strong style="color:#AF3241">${xVal}</strong>, Conversion Uplift is <strong style="color:#AF3241">${Math.round(value)}%</strong></div>
      `;
              }


            }


            

            else if (xAxis?.name === 'big_dm.weekday') {
              const dataIndex = labelCtx.dataIndex; // index of the hovered bar
              const fifthMetric = metricsList[8]; // 5th metric in the list
              const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const sixthMetric = metricsList[6]; // 5th metric in the list
              const sixthMetricValue = sixthMetric && results?.data?.[dataIndex]?.[sixthMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][sixthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const seventhMetric = metricsList[7]; // 5th metric in the list
              const seventhMetricValue = seventhMetric && results?.data?.[dataIndex]?.[seventhMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][seventhMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const ninthMetric = metricsList[9]; // 5th metric in the list
              const ninthMetricValue = ninthMetric && results?.data?.[dataIndex]?.[ninthMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][ninthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';



              const weekdayLabel = weekdayMap[Number(xVal) - 1];

              if (label === 'Without C.A.P.') {

                const differenceColor = ninthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const differencePrefix = ninthMetricValue >= 0 ? '+' : '';
                const differenceLine = ninthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Difference between <strong style="color:#AF3241">with C.A.P.</strong> and <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:${differenceColor}">${differencePrefix}${ninthMetricValue}%</strong></div>`
                  : '';

                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : ''; 

                innerHTML = `
       <div>On <strong style="color:#62626E">${xVal}</strong>, Conversion Rate <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
        ${differenceLine}
       ${upliftLine}
       `;
              }
              else if (label === 'With C.A.P.') {
                const differenceColor = ninthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const differencePrefix = ninthMetricValue >= 0 ? '+' : '';
                const differenceLine = ninthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Difference between <strong style="color:#AF3241">with C.A.P.</strong> and <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:${differenceColor}">${differencePrefix}${ninthMetricValue}%</strong></div>`
                  : '';

                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';

                innerHTML = `
       <div>On <strong style="color:#AF3241">${xVal}</strong>, Conversion Rate <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
       ${differenceLine}
       ${upliftLine}
       `;
              }
              else if (label === 'Without C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';

                const differenceColor = seventhMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const differencePrefix = seventhMetricValue >= 0 ? '+' : '';
                const differenceLine = seventhMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Difference between <strong style="color:#AF3241">with C.A.P.</strong> and <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:${differenceColor}">${differencePrefix}${seventhMetricValue}</strong></div>`
                  : '';


                innerHTML = `
       <div>On <strong style="color:#62626E">${xVal}</strong>, Average Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
      ${differenceLine}
       ${upliftLine}
       `;
              }

              else if (label === 'With C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';

                const differenceColor = seventhMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const differencePrefix = seventhMetricValue >= 0 ? '+' : '';
                const differenceLine = seventhMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Difference between <strong style="color:#AF3241">with C.A.P.</strong> and <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:${differenceColor}">${differencePrefix}${seventhMetricValue}</strong></div>`
                  : '';


                innerHTML = `
       <div>On <strong style="color:#AF3241">${xVal}</strong>, Average Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
       ${differenceLine}
       ${upliftLine}
       `;
              }

              else if (label === 'Sales Uplift (No Negative)') {

                innerHTML = `
       <div>On <strong style="color:#AF3241">${xVal}</strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
     `;
              }

              else if (label === 'SP CR Uplift Positive') {

                innerHTML = `
       <div>On <strong style="color:#AF3241">${xVal}</strong>, Conversion Uplift is <strong style="color:#AF3241">${Math.round(value)}%</strong></div>
     `;
              }


            }

            else if (xAxis?.name === 'big_dm.name_store') {
              const dataIndex = labelCtx.dataIndex; // index of the hovered bar
              const fifthMetric = metricsList[7]; // 5th metric in the list
              const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';

              const sixthMetric = metricsList[6]; // 5th metric in the list
              const sixthMetricValue = sixthMetric && results?.data?.[dataIndex]?.[sixthMetric.name] !== undefined
                ? formatValue(results.data[dataIndex][sixthMetric.name], { type: 'number', dps: dps }, Despar)
                : 'N/A';


              if (label === 'Without C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';

                innerHTML = `
     <div>In <strong style="color:#62626E">${xVal}</strong>, Conversion Rate <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
    ${upliftLine}
     `;
              }
              else if (label === 'With C.A.P.') {
                const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
                const upliftLine = fifthMetricValue != null
                  ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                  : '';

                innerHTML = `
     <div>In <strong style="color:#AF3241">${xVal}</strong>, Conversion Rate <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
     ${upliftLine}
     `
                  ;
              }
              else if (label === 'Without C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
     <div>In <strong style="color:#62626E">${xVal}</strong>, Average Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
    ${upliftLine}
     `;
              }

              else if (label === 'With C.A.P') {
                const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
                const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
                const upliftLine = sixthMetricValue != null
                  ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                  : '';


                innerHTML = `
     <div>In <strong style="color:#AF3241">${xVal}</strong>, Average Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
     ${upliftLine}
     `;
              }

              else if (label === 'Sales Uplift (No Negative)') {

                innerHTML = `
     <div>In <strong style="color:#AF3241">${xVal}</strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
   `;
              }

              else if (label === 'SP CR Uplift Positive') {

                innerHTML = `
     <div>In <strong style="color:#AF3241">${xVal}</strong>, Conversion Uplift is <strong style="color:#AF3241">${Math.round(value)}%</strong></div>
   `;
              }


            }

            else if (xAxis?.name === 'big_dm.name_market_type') {
              const dataIndex = labelCtx.dataIndex;

              const fifthMetric = metricsList[5];
              const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]
              if (label === 'With C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Conversion <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
  `;
              }

              else if (label === 'Without C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Conversion <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
  `;
              }

              if (label === 'With C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Average Basket Size <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
  `;
              }

              else if (label === 'Without C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Average Basket Size <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
  `;
              }

              else if (label === 'Sales Uplift (No Negative)') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>


                  <div  style="margin-top: 8px;"> In <strong style = "color:#AF3241"> ${xVal} </strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
                    `;
              }

            }

            else if (xAxis?.name === 'big_dm.name_region') {
              const dataIndex = labelCtx.dataIndex;

              const fifthMetric = metricsList[5];
              const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]
              if (label === 'With C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Conversion <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
  `;
              }

              else if (label === 'Without C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Conversion <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
  `;
              }

              if (label === 'With C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Average Basket Size <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
  `;
              }

              else if (label === 'Without C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Average Basket Size <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
  `;
              }

              else if (label === 'Sales Uplift (No Negative)') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>


                  <div  style="margin-top: 8px;"> In <strong style = "color:#AF3241"> ${xVal} </strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
                    `;
              }

            }


            else if (xAxis?.name === 'big_dm.nielsen_region_code') {
              const dataIndex = labelCtx.dataIndex;

              const fifthMetric = metricsList[5];
              const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]
              if (label === 'With C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Conversion <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
  `;
              }

              else if (label === 'Without C.A.P.') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Conversion <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
  `;
              }

              if (label === 'With C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#AF3241">${xVal},</strong> Average Basket Size <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
  `;
              }

              else if (label === 'Without C.A.P') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#62626E">${xVal},</strong> Average Basket Size <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
  `;
              }

              else if (label === 'Sales Uplift (No Negative)') {
                let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

                innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>


                  <div  style="margin-top: 8px;"> In <strong style = "color:#AF3241"> ${xVal} </strong>, Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
                    `;
              }

            }



          }

          else if (Totalperformance && titleLines.length && bodyLines.length) {
            const xVal = titleLines[0];  // This gives you the full first line
            const dataIndex = labelCtx.dataIndex;
            const fifthMetric = metricsList[5];
            const sixthMetric = metricsList[6];

            // Get raw numeric values first before formatting
            const fifthRawValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name] !== undefined
              ? Number(results.data[dataIndex][fifthMetric.name])
              : NaN;

            const sixthRawValue = sixthMetric && results?.data?.[dataIndex]?.[sixthMetric.name] !== undefined
              ? Number(results.data[dataIndex][sixthMetric.name])
              : NaN;

            // Format for display (if needed elsewhere)
            const fifthMetricValue = !isNaN(fifthRawValue)
              ? formatValue(fifthRawValue, { type: 'number', dps: dps })
              : 'N/A';

            const sixthMetricValue = !isNaN(sixthRawValue)
              ? formatValue(sixthRawValue, { type: 'number', dps: dps })
              : 'N/A';

            // Use Math.round on the raw numbers, not the formatted strings
            const fifthRounded = !isNaN(fifthRawValue) ? Math.round(fifthRawValue) : 'N/A';
            const sixthRounded = !isNaN(sixthRawValue) ? Math.round(sixthRawValue) : 'N/A';

            if (label === 'Without C.A.P.') {
              innerHTML = `
  <div>Analysis group <strong style="color:#AF3241">"${xVal}"</strong></div>
  <div style="margin-top: 8px;"><strong style="color:#62626E">Without C.A.P.</strong> every <strong style="color:#62626E">${fifthRounded}th</strong> shopper converted</div>
  <div style="margin-top: 8px;"><strong style="color:#AF3241">With C.A.P.</strong> every <strong style="color:#AF3241">${sixthRounded}th</strong> shopper converted</div>
  `;
            }
            else if (label === 'With C.A.P.') {
              innerHTML = `
  <div>Analysis group <strong style="color:#AF3241">"${xVal}"</strong></div>
  <div style="margin-top: 8px;"><strong style="color:#62626E">Without C.A.P.</strong> every <strong style="color:#62626E">${fifthRounded}th</strong> shopper converted</div>
  <div style="margin-top: 8px;"><strong style="color:#AF3241">With C.A.P.</strong> every <strong style="color:#AF3241">${sixthRounded}th</strong> shopper converted</div>
  `;
            }
            else if (label === 'Without C.A.P') {

              innerHTML = `
              <div>Analysis group <strong style="color:#AF3241">"${xVal}"</strong></div>
      <div style="margin-top: 8px;">Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
      
      `;
            }

            else if (label === 'With C.A.P') {

              innerHTML = `
      <div>Analysis group <strong style="color:#AF3241">"${xVal}"</strong></div>
      <div style="margin-top: 8px;">Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
      
      `;
            }

            else if (label === 'Sales Uplift (No Negative)') {

              innerHTML = `
               <div>Analysis group <strong style="color:#AF3241">"${xVal}"</strong></div>
      <div style="margin-top: 8px;">Sales Uplift is <strong style="color:#AF3241">${value}%</strong></div>
      
              `;
            }
          }



          else if (performance && granularity && titleLines.length && bodyLines.length) {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[2];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name] !== undefined
              ? formatValue(results.data[dataIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
              : 'N/A';

            const sixthMetric = metricsList[2];
            const sixthMetricValue = sixthMetric && results?.data?.[dataIndex]?.[sixthMetric.name] !== undefined
              ? formatValue(results.data[dataIndex][sixthMetric.name], { type: 'number', dps: dps }, Despar)
              : 'N/A';

            const fourthMetric = metricsList[4];
            const fourthMetricValue = fourthMetric && results?.data?.[dataIndex]?.[fourthMetric.name] !== undefined
              ? formatValue(results.data[dataIndex][fourthMetric.name], { type: 'number', dps: dps }, Despar)
              : 'N/A';

            const thirdMetric = metricsList[3];
            const thirdMetricValue = thirdMetric && results?.data?.[dataIndex]?.[thirdMetric.name] !== undefined
              ? formatValue(results.data[dataIndex][thirdMetric.name], { type: 'number', dps: dps }, Despar)
              : 'N/A';

            const thirdRounded = !isNaN(Number(thirdMetricValue)) ? Math.round(Number(thirdMetricValue)) : thirdMetricValue;
            const fourthRounded = !isNaN(Number(fourthMetricValue)) ? Math.round(Number(fourthMetricValue)) : fourthMetricValue;


            if (label === 'Without C.A.P.') {
              const upliftColor = fifthMetricValue >= 0 ? '#00aa00' : '#F04B55';
              const upliftPrefix = fifthMetricValue >= 0 ? '+' : '';
              const upliftLine = fifthMetricValue != null
                ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(fifthMetricValue)}% Uplift</strong></div>`
                : '';

              let masterLines = '';
              if (master) {
                masterLines = `
        <div style="margin-top: 8px;"><strong style="color:#AF3241">With C.A.P.</strong> every <strong style="color:#AF3241">${thirdRounded}th</strong> shopper converted.</div>
        <div style="margin-top: 8px;"><strong style="color:#62626E">Without C.A.P.</strong> every <strong style="color:#62626E">${fourthRounded}th</strong> shopper converted.</div>
      `;
              }

              innerHTML = `
      <div>In <strong style="color:#62626E">${xVal}</strong>, Conversion Rate <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}%</strong></div>
      ${upliftLine}
      ${masterLines}
    `;
            }


            else if (label === 'With C.A.P.') {
              const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
              const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
              const upliftLine = sixthMetricValue != null
                ? `<div style="margin-top: 8px;">Conversion Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                : '';

              let masterLines = '';
              if (master) {
                masterLines = `
        <div style="margin-top: 8px;"><strong style="color:#AF3241">With C.A.P.</strong> every <strong style="color:#AF3241">${thirdRounded}th</strong> shopper converted.</div>
        <div style="margin-top: 8px;"><strong style="color:#62626E">Without C.A.P.</strong> every <strong style="color:#62626E">${fourthRounded}th</strong> shopper converted.</div>
      `;
              }

              innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Conversion Rate <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}%</strong></div>
      ${upliftLine}
      ${masterLines}
      `;
            }

            else if (label === 'Without C.A.P') {

              const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
              const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
              const upliftLine = sixthMetricValue != null

                ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                : '';

              innerHTML = `
      <div>In <strong style="color:#62626E">${xVal}</strong>, Average Basket Size <strong style="color:#62626E">without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
      ${upliftLine}
      `;
            }

            else if (label === 'With C.A.P') {
              const upliftColor = sixthMetricValue >= 0 ? '#00aa00' : '#F04B55';
              const upliftPrefix = sixthMetricValue >= 0 ? '+' : '';
              const upliftLine = sixthMetricValue != null

                ? `<div style="margin-top: 8px;">Basket Uplift is <strong style="color:${upliftColor}">${upliftPrefix}${Math.round(sixthMetricValue)}% Uplift</strong></div>`
                : '';

              innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Average Basket Size <strong style="color:#AF3241">with C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
      ${upliftLine}
      `;
            }
            else if (label === 'Sales without C.A.P') {
              if (displayAsPercentage) {
                innerHTML = `
      <div>In <strong style="color:#62626E">${xVal}</strong>, Sales <strong style="color:#62626E">without C.A.P.</strong> are <strong style="color:#62626E">${value}</strong></div>
    `;
              }

              else {
                innerHTML = `
      <div>In <strong style="color:#62626E">${xVal}</strong>, Sales <strong style="color:#62626E">without C.A.P.</strong> are <strong style="color:#62626E">${value}</strong> products</div>
    `;
              }
            }

            else if (label === 'Sales with C.A.P') {

              if (displayAsPercentage) {
                innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Sales <strong style="color:#AF3241">with C.A.P.</strong> are <strong style="color:#AF3241">${value}</strong></div>
    `;
              }
              else {
                innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Sales <strong style="color:#AF3241">with C.A.P.</strong> are <strong style="color:#AF3241">${value}</strong> products</div>
    `;
              }
            }

            else if (label === 'Revenue without C.A.P') {
              if (!displayAsPercentage) {

                innerHTML = `
      <div>In <strong style="color:#62626E">${xVal}</strong>, Sales in (€) <strong style="color:#62626E">without C.A.P.</strong> are <strong style="color:#62626E">${value} €</strong> products</div>
    `;
              }
              else {
                innerHTML = `
                <div>In <strong style="color:#62626E">${xVal}</strong>, Sales in (€) <strong style="color:#62626E">without C.A.P.</strong> are <strong style="color:#62626E">${value}</strong></div>
              `;
              }
            }
            else if (label === 'Revenue with C.A.P') {
              if (!displayAsPercentage) {
                innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Sales in (€) <strong style="color:#AF3241">with C.A.P.</strong> are <strong style="color:#AF3241">${value} €</strong> products</div>
    `;
              } else {
                innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Sales in (€) <strong style="color:#AF3241">with C.A.P.</strong> are <strong style="color:#AF3241">${value}</strong></div>
    `;
              }
            }



          }
          else if (xAxis?.name === 'impressions.name_store') {
            const xVal = titleLines[0];
            if (xVal === 'Total') {
              innerHTML = `
                  <div>For all stores, impressions are <strong style="color:#AF3241">${value}</strong></div>
              `;
            } else {
              innerHTML = `
      <div>In Store <strong style="color:#AF3241">${xVal}</strong>, Impressions are <strong style="color:#AF3241">${value}</strong></div>
    `;
            }

          }

          else if (xAxis?.name === 'impressions.name_region2') {
  let xVal = titleLines[0];

  // Reverse mapping from abbreviation → full region name
  const regionMapping = {
    BW: 'Baden-Wuerttemberg',
    BY: 'Bayern',
    HH: 'Hamburg',
    SN: 'Sachsen',
    HE: 'Hessen'
  };

  // Helper to get full name if abbreviation exists
  const getFullRegionName = (abbr) => regionMapping[abbr] || abbr;

  // Apply mapping unless it's "Total"
  if (xVal !== 'Total') {
    xVal = getFullRegionName(xVal);
  }

  if (xVal === 'Total') {
    innerHTML = `
      <div>For all regions, impressions are <strong style="color:#AF3241">${value}</strong></div>
    `;
  } else {
    innerHTML = `
      <div>In Region <strong style="color:#AF3241">${xVal}</strong>, Impressions are <strong style="color:#AF3241">${value}</strong></div>
    `;
  }
}


          else if (xAxis?.name === 'impressions.nielsen_region_code') {
            const xVal = titleLines[0];
            if (xVal === 'Total') {
              innerHTML = `
                  <div>For all nielsen regions, impressions are <strong style="color:#AF3241">${value}</strong></div>
              `;
            } else {
              innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, Impressions are <strong style="color:#AF3241">${value}</strong></div>
    `;
            }

          }

          else if (xAxis === 'customer_journeys.duration_group_five') {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


            if (KPIvalue === "Average Sales (Units)") {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">${value}</strong> units</div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">CLP$${value}</strong></div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === "Total Shoppers") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

            else if (KPIvalue === "Total Shoppers (in %)") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

          }

          else if (xAxis === 'customer_journeys.duration_group_ten') {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


            if (KPIvalue === "Average Sales (Units)") {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">${value}</strong> units</div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">CLP$${value}</strong></div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === "Total Shoppers") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

            else if (KPIvalue === "Total Shoppers (in %)") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

          }

          else if (xAxis === 'customer_journeys.duration_group_fifteen') {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


            if (KPIvalue === "Average Sales (Units)") {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">${value}</strong> units</div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">CLP$${value}</strong></div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === "Total Shoppers") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

            else if (KPIvalue === "Total Shoppers (in %)") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

          }


          else if (xAxis === 'customer_journeys.duration_group_thirty') {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


            if (KPIvalue === "Average Sales (Units)") {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">${value}</strong> units</div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">CLP$${value}</strong></div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === "Total Shoppers") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

            else if (KPIvalue === "Total Shoppers (in %)") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

          }


          else if (xAxis === 'customer_journeys.duration_group_sixty') {
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


            if (KPIvalue === "Average Sales (Units)") {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">${value}</strong> units</div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
              console.log(metricObj?.name)
              if (metricObj?.name === "customer_journeys.average_sales") {
                innerHTML = `
                  <div>On average, Shoppers who spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store also spent <strong style="color:#AF3241">CLP$${value}</strong></div>
                  `;
              }
              else if (metricObj?.name === "customer_journeys.average_revenue") {
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;
              }

            }

            else if (KPIvalue === "Total Shoppers") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

            else if (KPIvalue === "TOtal Shoppers (in %)") {
              console.log(metricObj?.name)
              innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> shoppers spent <strong style="color:#AF3241">${xVal} minutes</strong> in the store</div>
                  `;


            }

          }
          else if (InstoreDuration2) {


            if (xAxis === 'customer_journeys.dow') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


              if (KPIvalue === "Average Sales (Units)") {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>on <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Sales (Units)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>on <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>on <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Revenue (CLP$)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>on <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === "Average Duration") {
                console.log(metricObj?.name)
                innerHTML = `
                  <div>on <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;


              }




            }


            else if (xAxis === 'customer_journeys.month1') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


              if (KPIvalue === "Average Sales (Units)") {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Sales (Units)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Revenue (CLP$)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === "Average Duration") {
                console.log(metricObj?.name)
                innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;


              }

            }


            else if (xAxis === 'customer_journeys.hour') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


              if (KPIvalue === "Average Sales (Units)") {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Sales (Units)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Revenue (CLP$)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === "Average Duration") {
                console.log(metricObj?.name)
                innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;


              }

            }


            else if (xAxis === 'customer_journeys.date') {
              const isoString = titleLines[0];
              const date = new Date(isoString);

              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
              const year = date.getFullYear();

              const xVal = `${day}.${month}.${year}`;


              if (KPIvalue === "Average Sales (Units)") {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Sales (Units)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                console.log(metricObj?.name)
                if (metricObj?.name === "customer_journeys.average_revenue") {
                  innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Revenue (CLP$)</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  `;
                }
                else if (metricObj?.name === "customer_journeys.average_sales") {
                  innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;
                }

              }

              else if (KPIvalue === "Average Duration") {
                console.log(metricObj?.name)
                innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, The <strong style="color:#AF3241">Average Duration</strong> spent in a store is <strong style="color:#AF3241">${value}</strong> minutes</div>
                  `;


              }

            }
          }


          else if (TrolleyUsage) {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[5];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]


            if (label === 'Average Sales') {
              if (xAxis === 'customer_journeys.hour') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} during hour <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;
                innerHTML = `
                  <div>In ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.dow') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.month1') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} in <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }


            }
            else if (label === 'Average Revenue') {
              if (xAxis === 'customer_journeys.hour') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} during hour <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;
                innerHTML = `
                  <div>In ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.dow') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }
              else if (xAxis === 'customer_journeys.month1') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div>In ${fifthMetricValue} in <strong style="color:#AF3241">${xVal}, </strong>the <strong style="color:#AF3241">${KPIvalue}</strong> is <strong style="color:#AF3241">${value}</strong></div>
                  <div style="margin-top: 8px; color:#62626e">Explanation: The average sales units as well as revenue in € only reflect the averages for shopper with a trolley.</div>
                  
                  `;

              }

            }
            else if (label === 'Trolley Ratio (%)') {
              if (xAxis === 'customer_journeys.hour') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> of the trolleys were used in ${fifthMetricValue} during hour <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

              }
              else if (xAxis === 'customer_journeys.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> of the trolleys were used in ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

              }
              else if (xAxis === 'customer_journeys.dow') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                  <div><strong style="color:#AF3241">${value}%</strong> of the trolleys were used in ${fifthMetricValue} on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

              }
              else if (xAxis === 'customer_journeys.month1') {
                const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
                innerHTML = `
                   <div><strong style="color:#AF3241">${value}%</strong> of the trolleys were used in ${fifthMetricValue} in <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

              }

            }


          }

          else if (GeneralKPIs) {

            if (xAxis === 'receipts_retail.dow') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

              if (KPIvalue === "Sales (Units)") {
                console.log(metricObj?.name)
                if (metricObj?.name === "receipts_retail.sum_sale") {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Sales (Units) were generated in the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }

              }

              else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                if (metricObj?.name === "receipts_retail.sum_revenue") {
                  innerHTML =
                    `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Revenue (CLP$) were generated in the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }

              }
            }

            else if (xAxis === 'receipts_retail.month') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

              if (KPIvalue === "Sales (Units)") {
                if (metricObj?.name === "receipts_retail.sum_sale") {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Sales (Units) were generated in the store in the month of <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store in the month of <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }
              }

              else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                if (metricObj?.name === "receipts_retail.sum_revenue") {
                  innerHTML =
                    innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store in the month of <strong style="color:#AF3241">${xVal}</strong></div>
                  `;

                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Revenue (CLP$) were generated in the store in the month of <strong style="color:#AF3241">${xVal}</strong></div>
                  `;
                }
              }
            }

            else if (xAxis === 'receipts_retail.hour') {
              const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');


              if (KPIvalue === "Sales (Units)") {
                const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
                const fifthMetric = metricsList[2];

                const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                  ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                  : 'N/A';
                if (metricObj?.name === "receipts_retail.sum_sale") {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Sales (Units) were generated in the store at hour <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Sales (Units) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  
                  `;
                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store at hour <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Sales (Units) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  `;
                }
              }

              else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
                const fifthMetric = metricsList[3];

                const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                  ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                  : 'N/A';
                if (metricObj?.name === "receipts_retail.sum_revenue") {
                  innerHTML =
                    `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store at hour <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Revenue (CLP$) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  
                  `;

                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Revenue (CLP$) were generated in the store at hour <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Revenue (CLP$) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  
                  `;
                }
              }
            }

            else if (xAxis === 'receipts_retail.date') {
              const isoString = titleLines[0];
              const date = new Date(isoString);

              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
              const year = date.getFullYear();

              const xVal = `${day}.${month}.${year}`;


              if (KPIvalue === "Sales (Units)") {
                const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
                const fifthMetric = metricsList[2];

                const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                  ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                  : 'N/A';

                if (metricObj?.name === "receipts_retail.sum_sale") {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Sales (Units) were generated in the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Sales (Units) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  
                  `;
                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Sales (Units) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  
                  `;
                }
              }

              else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
                const fifthMetric = metricsList[3];

                const fifthMetricValue = fifthMetric && results?.data?.[mappedIndex]?.[fifthMetric.name] !== undefined
                  ? formatValue(results.data[mappedIndex][fifthMetric.name], { type: 'number', dps: dps }, Despar)
                  : 'N/A';
                if (metricObj?.name === "receipts_retail.sum_revenue") {
                  innerHTML =
                    `
                  <div><strong style="color:#AF3241">${value}</strong> shoppers visited the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Revenue (CLP$) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  `;

                }
                else {
                  innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> Revenue (CLP$) were generated in the store on <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Average Revenue (CLP$) is <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
                  `;
                }
              }
            }
          }


          else if (Profitability) {
            const labelMap = {
              'Total Frequency': 'Frequency',
              'Without C.A.P': 'Without C.A.P.',
              'With C.A.P': 'With C.A.P.',
              'Sales Uplift (No Negative)': 'Sales Uplift',
              'SP CR Uplift Positive': 'Conversion Uplift',
              'Sum Frequency No Device': 'Without Trolley',
              'Sum Frequency Trolley': 'With Trolley',
              'Average Frequency No Device Hourly': 'Without Trolley',
              'Average Frequency Trolley Hourly': 'With Trolley',
              'Average Frequency No Device Weekly': 'Without Trolley',
              'Average Frequency Trolley Weekly': 'With Trolley',
              'Sum Revenue No Device': 'Without Trolley',
              'Sum Revenue Trolley': 'With Trolley',
              'Sum Sales No Device': 'Without Trolley',
              'Sum Sales Trolley': 'With Trolley',
              'Average Sales No Device Hourly': 'Without Trolley',
              'Average Sales Trolley Hourly': 'With Trolley',
              'Average Sales No Device Weekly': 'Without Trolley',
              'Average Sales Trolley Weekly': 'With Trolley',
              'Average Revenue No Device Hourly': 'Without Trolley',
              'Average Revenue Trolley Hourly': 'With Trolley',
              'Average Revenue No Device Weekly': 'Without Trolley',
              'Average Revenue Trolley Weekly': 'With Trolley',
            };

            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
            const mappedLabel = labelMap[label];
            const valueLabel = displayAsPercentage ? 'percentage' : 'amount';

            if (xAxis === 'receipts_retail.dow') {
              innerHTML = `
      <div>On <strong style="color:#AF3241">${xVal}</strong>, the ${valueLabel} of shoppers that shopped ${mappedLabel} is <strong style="color:#AF3241">${value}</strong></div>
    `;
            }

            else if (xAxis === 'receipts_retail.month') {
              innerHTML = `
      <div>In <strong style="color:#AF3241">${xVal}</strong>, the ${valueLabel} of shoppers that shopped ${mappedLabel} is <strong style="color:#AF3241">${value}</strong></div>
    `;
            }

            else if (xAxis === 'receipts_retail.hour') {
              innerHTML = `
      <div>At hour <strong style="color:#AF3241">${xVal}</strong>, the ${valueLabel} of shoppers that shopped ${mappedLabel} is <strong style="color:#AF3241">${value}</strong></div>
    `;
            }

            else if (xAxis === 'receipts_retail.date') {
              const isoString = titleLines[0];
              const date = new Date(isoString);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              const xVal = `${day}.${month}.${year}`;

              innerHTML = `
      <div>On <strong style="color:#AF3241">${xVal}</strong>, the ${valueLabel} of shoppers that shopped ${mappedLabel} is <strong style="color:#AF3241">${value}</strong></div>
    `;
            }
          }



          else if (Profitability2) {
            const labelMap = {
              'Total Frequency': 'Frequency',
              'Without C.A.P': 'Without C.A.P.',
              'With C.A.P': 'With C.A.P.',
              'Sales Uplift (No Negative)': 'Sales Uplift',
              'SP CR Uplift Positive': 'Conversion Uplift',
              'Sum Frequency No Device': 'Without Trolley',
              'Sum Frequency Trolley': 'With Trolley',
              'Average Frequency No Device Hourly': 'Without Trolley',
              'Average Frequency Trolley Hourly': 'With Trolley',
              'Average Frequency No Device Weekly': 'Without Trolley',
              'Average Frequency Trolley Weekly': 'With Trolley',
              'Sum Revenue No Device': 'Without Trolley',
              'Sum Revenue Trolley': 'With Trolley',
              'Sum Sales No Device': 'Without Trolley',
              'Sum Sales Trolley': 'With Trolley',
              'Average Sales No Device Hourly': 'Without Trolley',
              'Average Sales Trolley Hourly': 'With Trolley',
              'Average Sales No Device Weekly': 'Without Trolley',
              'Average Sales Trolley Weekly': 'With Trolley',
              'Average Revenue No Device Hourly': 'Without Trolley',
              'Average Revenue Trolley Hourly': 'With Trolley',
              'Average Revenue No Device Weekly': 'Without Trolley',
              'Average Revenue Trolley Weekly': 'With Trolley',
            };
            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
            const mappedLabel = labelMap[label];

            if (xAxis === 'receipts_retail.dow') {

              innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, the ${KPIvalue} that shoppers ${mappedLabel} generated is <strong style="color:#AF3241">${value}</strong></div>
                  `;

            }

            else if (xAxis === 'receipts_retail.month') {
              innerHTML = `
                  <div>In <strong style="color:#AF3241">${xVal}</strong>, the ${KPIvalue} that shoppers ${mappedLabel} generated is <strong style="color:#AF3241">${value}</strong></div>
                  `;
            }

            else if (xAxis === 'receipts_retail.hour') {
              innerHTML = `
                  <div>At hour <strong style="color:#AF3241">${xVal}</strong>, the ${KPIvalue} that shoppers ${mappedLabel} generated is <strong style="color:#AF3241">${value}</strong></div>
                  `;
            }

            else if (xAxis === 'receipts_retail.date') {
              const isoString = titleLines[0];
              const date = new Date(isoString);

              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
              const year = date.getFullYear();

              const xVal = `${day}.${month}.${year}`;


              innerHTML = `
                  <div>On <strong style="color:#AF3241">${xVal}</strong>, the ${KPIvalue} that shoppers ${mappedLabel} generated is <strong style="color:#AF3241">${value}</strong></div>
                  `;
            }
          }

          else if (MarketingActivities) {
            if (xAxis=== 'big_dm.name_adlevel'){
              if (label === 'With C.A.P.') 
                {innerHTML = `
    For the selected group, Conversion Rate <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong></div>
  `;}
else if (label==='Without C.A.P.') 
                {innerHTML = `
    For the selected group, Conversion Rate <strong style="color:#62626E">${label}</strong> is <strong style="color:#62626E">${value}%</strong></div>
  `;}

  else if (label === 'With C.A.P') 
                {innerHTML = `
    For the selected group, Average Basket Size <strong style="color:#AF3241">With C.A.P.</strong> is <strong style="color:#AF3241">${value}</strong></div>
  `;} 
  else if (label==='Without C.A.P') 
                {innerHTML = `
    For the selected group, Average Basket Size <strong style="color:#62626E">Without C.A.P.</strong> is <strong style="color:#62626E">${value}</strong></div>
  `;}
  else {
    innerHTML = `
    For the selected group, <strong style="color:#F04B55">${label}</strong> is <strong style="color:#F04B55">${value}%</strong></div>
  `;
  }


            

            }
            else {
            const dataIndex = labelCtx.dataIndex;

            const lastMetric = metricsList[metricsList.length - 1];

            const fifthMetricValue = lastMetric && results?.data?.[dataIndex]?.[lastMetric.name]

            let xVal = titleLines[0];

            innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">"${fifthMetricValue}"</strong></div>
    <div style="margin-top: 8px;"><strong style="color:#F04B55">${xVal} </strong><strong style="color:#F04B55">${label}</strong> is <strong style="color:#F04B55">${value}</strong></div>
  `;}


          }


          else if (xAxis === "overview.hour") {

            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> impressions were generated during hour <strong style="color:#AF3241">${xVal}.</strong></div>
            
                  `;

          }

          else if (xAxis === "overview.date") {
            const isoString = titleLines[0];
            const date = new Date(isoString);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
            const year = date.getFullYear();

            // Function to get week number
            function getWeekNumber(d) {
              // Copy date so don't modify original
              d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
              // Set to nearest Thursday: current date + 4 - current day number
              // Make Sunday's day number 7
              d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
              // Get first day of year
              const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
              // Calculate full weeks to nearest Thursday
              const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
              return weekNo;
            }

            const weekNumber = getWeekNumber(date);
            const xVal = `${day}.${month}.${year}, (Week ${weekNumber})`;

            innerHTML = `
          <div><strong style="color:#AF3241">${value}</strong> impressions were generated on <strong style="color:#AF3241">${xVal}.</strong></div>
          `;
          }

          else if (xAxis === "overview.dow") {

            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> impressions were generated on <strong style="color:#AF3241">${xVal}.</strong></div>
            
                  `;

          }

          else if (xAxis === "overview.month1") {

            const xVal = titleLines[0].split(' ').slice(0, 2).join(', ');

            innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> impressions were generated in <strong style="color:#AF3241">${xVal}.</strong></div>
                  
                  `;

          }

          else if (overview) {

            const formatDate = (dateString: string | undefined) => {
              if (!dateString) return 'No date';
              const parts = dateString.split('-');
              if (parts.length !== 3) return dateString; // return original if format is unexpected
              return `${parts[2]}.${parts[1]}.${parts[0]}`;
            };

            const mappedIndex = labelCtx.dataIndex; // fallback to default if out of bounds
            const secondMetric = metricsList[1];

            const secondMetricValue = secondMetric && results?.data?.[mappedIndex]?.[secondMetric.name] !== undefined
              ? formatDate(results.data[mappedIndex][secondMetric.name]) // Changed type to 'string'
              : 'N/A';


            const thirdMetric = metricsList[2];

            const thirdMetricValue = thirdMetric && results?.data?.[mappedIndex]?.[thirdMetric.name] !== undefined
              ? formatDate(results.data[mappedIndex][thirdMetric.name]) // Changed type to 'string'
              : 'N/A';

            const xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            innerHTML = `
                  <div><strong style="color:#AF3241">${value}</strong> impressions were generated in <strong style="color:#AF3241">${xVal}</strong></div>
                  <div style="margin-top: 8px;">Period: <strong style="color:#AF3241">${secondMetricValue}</strong> to <strong style="color:#AF3241">${thirdMetricValue}</strong></div>
            
                  `;

          }

          else if (edeka) {
            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');
            xVal = xVal.charAt(0).toUpperCase() + xVal.slice(1).toLowerCase();

            innerHTML = `
    <div>In <strong style="color:#AF3241">${xVal}, </strong><strong style="color:#AF3241">${value}</strong> Impressions are encountered.</div>
  `;
          }

          else if (masterUplift) {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[1];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            innerHTML = `
            <div>Analysis Group <strong style="color:#AF3241">${fifthMetricValue}</strong></div>
    <div style="margin-top: 8px;">In <strong style="color:#F04B55">${xVal},</strong> Sales Uplift is <strong style="color:#F04B55">${value}%</strong></div>
  `;
          }


          else if (xAxis === 'big_dm.weather_bins') {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[3];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;"> At <strong style = "color:#AF3241"> ${xVal} </strong> temperature, Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}</strong></div>
              `;

            } else if (label === 'Without C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;"> At <strong style = "color:#62626E"> ${xVal} </strong> temperature, Conversion <strong style="color:#62626E">Without C.A.P. </strong> is <strong style="color:#62626E">${value}</strong></div>
              `;

            }
          }


          else if (xAxis === 'big_dm.weather_feels_bins') {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[3];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;"> At <strong style = "color:#AF3241"> ${xVal} </strong> temperature, Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}</strong></div>
              `;

            } else if (label === 'Without C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;"> At <strong style = "color:#62626E"> ${xVal} </strong> temperature, Conversion <strong style="color:#62626E">Without C.A.P. </strong> is <strong style="color:#62626E">${value}</strong></div>
              `;

            }
          }

          else if (xAxis === 'big_dm.rain_bool') {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[3];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">Rain <strong style = "color:#AF3241"> ${xVal}</strong>, Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}</strong></div>
              `;

            } else if (label === 'Without C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">Rain <strong style = "color:#62626E"> ${xVal}</strong>, Conversion <strong style="color:#62626E">Without C.A.P. </strong> is <strong style="color:#62626E">${value}</strong></div>
              `;

            }
          }

          else if (xAxis === 'big_dm.snow_bool') {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[3];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">Snow <strong style = "color:#AF3241"> ${xVal}</strong>, Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}</strong></div>
              `;

            } else if (label === 'Without C.A.P.') {

              innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">Snow <strong style = "color:#62626E"> ${xVal}</strong>, Conversion <strong style="color:#62626E">Without C.A.P. </strong> is <strong style="color:#62626E">${value}</strong></div>
              `;

            }
          }

          else if (xAxis === 'big_dm.name_market_type') {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[3];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {

              innerHTML = `
  <div>Analysis Group <strong style="color:#AF3241">"${fifthMetricValue}"</strong></div>
  <div style="font-size: 0.9em; color: #555; margin-top: 5px;">
    <div>0%: Clear sky with no clouds.</div>
    <div>10-20%: Mostly clear, with some scattered clouds.</div>
    <div>30-50%: Partly cloudy, with a mix of clouds and clear sky.</div>
    <div>60-90%: Mostly cloudy, with more clouds than clear sky.</div>
    <div>100%: Overcast sky, completely covered by clouds.</div>
  </div>
`;


            } else if (label === 'Without C.A.P.') {

              innerHTML = `
  <div>Analysis Group <strong style="color:#AF3241">"${fifthMetricValue}"</strong></div>
  <div style="font-size: 0.9em; color: #555; margin-top: 5px;">
    <div>0%: Clear sky with no clouds.</div>
    <div>10-20%: Mostly clear, with some scattered clouds.</div>
    <div>30-50%: Partly cloudy, with a mix of clouds and clear sky.</div>
    <div>60-90%: Mostly cloudy, with more clouds than clear sky.</div>
    <div>100%: Overcast sky, completely covered by clouds.</div>
  </div>
`;


            }
          }












          else if (MasterLines) {
            const dataIndex = labelCtx.dataIndex;

            const fifthMetric = metricsList[1];
            const fifthMetricValue = fifthMetric && results?.data?.[dataIndex]?.[fifthMetric.name]

            let xVal = titleLines[0].split(' ').slice(0, 2).join(' ');

            if (label === 'With C.A.P.') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On <strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.hour_group') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Hour Group<strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.month1') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In<strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>Conversion <strong style="color:#AF3241">With C.A.P. </strong> is <strong style="color:#AF3241">${value}%</strong></div>
              `;
              }
            }

            else if (label === 'Temperature (°C)') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              if (xAxis === 'big_dm.hour_group') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Hour Group<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              if (xAxis === 'big_dm.month1') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;


                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (°C) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
            }


            else if (label === 'Temperature (Feels Like °C)') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (Feels Like °C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;


                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (Feels Like °C) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (Feels Like °C) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Temperature (Feels Like °C) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
            }

            else if (label === 'Clouds (%)') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Clouds (%) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;


                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Clouds (%) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Clouds (%) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Clouds (%) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
            }

            else if (label === 'Rain (millimeter)') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Rain (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;


                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Rain (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Rain (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Rain (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
            }

            else if (label === 'Snow (millimeter)') {
              if (xAxis === 'big_dm.hour') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">At hour<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Snow (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.date') {
                const isoString = titleLines[0];
                const date = new Date(isoString);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const year = date.getFullYear();

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

                const xVal = `${day}.${month}.${year} (${weekday})`;


                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Snow (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
              `;
              }
              else if (xAxis === 'big_dm.weekday') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">On<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Snow (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
              else if (xAxis === 'big_dm.week') {

                innerHTML = `
          <div> Analysis Group <strong style = "color:#AF3241"> "${fifthMetricValue}" </strong></div>
            <div style="margin-top: 8px;">In Week<strong style = "color:#AF3241"> ${xVal}, </strong>the Average Snow (millimeter) is <strong style="color:#AF3241">${value}</strong></div>
             `;
              }
            }

          }

          else if (TrolleyBar) {
            const xVal = titleLines[0];

            innerHTML = `In<strong style = "color:#AF3241">${xVal}, ${value}%</strong> of the tolleys were used
              `;
          }


          else if (xAxis?.name === 'fact_line_crossings.hour_of_day') {
    const xVal = titleLines[0];
    innerHTML = `At hour <strong style="color:#AF3241">${xVal}</strong>, Visitors Frequency in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong>`;
} 
else if (xAxis?.name === 'fact_zone_visits.entry_hour') {
    const xVal = titleLines[0];
    innerHTML = `At hour <strong style="color:#AF3241">${xVal}</strong>, Visitors Dwell Time in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong> seconds`;
} 
else if (xAxis?.name === 'shelf_model.hour') {
    const xVal = titleLines[0];
    innerHTML = `At hour <strong style="color:#AF3241">${xVal}</strong>, Visitors Engagement Rate in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong>`;
} 
else if (xAxis?.name === 'fact_line_crossings.day_only') {
    const xVal = titleLines[0];
    innerHTML = `On <strong style="color:#AF3241">${xVal}</strong>, Visitors Frequency in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong>`;
} 
else if (xAxis?.name === 'fact_zone_visits.day_only') {
    const xVal = titleLines[0];
    innerHTML = `On <strong style="color:#AF3241">${xVal}</strong>, Visitors Dwell Time in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong> seconds`;
} 
else if (xAxis?.name === 'shelf_model.day_only') {
    const xVal = titleLines[0];
    innerHTML = `On <strong style="color:#AF3241">${xVal}</strong>, Visitors Engagement Rate in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong>`;
} 
else if (xAxis?.name === 'fact_line_crossings.week_number') {
    const xVal = titleLines[0];
    innerHTML = `During <strong style="color:#AF3241">${xVal}</strong>, Visitors Frequency in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong>`;
} 
else if (xAxis?.name === 'fact_zone_visits.week_number') {
    const xVal = titleLines[0];
    innerHTML = `During <strong style="color:#AF3241">${xVal}</strong>, Visitors Dwell Time in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong> seconds`;
} 
else if (xAxis?.name === 'shelf_model.week_number') {
    const xVal = titleLines[0];
    innerHTML = `During <strong style="color:#AF3241">${xVal}</strong>, Visitors Engagement Rate in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong>`;
} 
else if (xAxis?.name === 'fact_line_crossings.month_number') {
    const xVal = titleLines[0];
    innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, Visitors Frequency in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong>`;
} 
else if (xAxis?.name === 'fact_zone_visits.month_number') {
    const xVal = titleLines[0];
    innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, Visitors Dwell Time in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong> seconds`;
} 
else if (xAxis?.name === 'shelf_model.month_number') {
    const xVal = titleLines[0];
    innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, Visitors Engagement Rate in <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong>`;
}
else if (xAxis?.name === 'fact_line_crossings.geometry_zone') {
    const xVal = titleLines[0];

    if (label === 'Male' || label === 'Female') {
        innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, the <strong style="color:#AF3241">${label} Visitors</strong> are <strong style="color:#AF3241">${value}</strong>`;
    } else {
        innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, <strong style="color:#AF3241">Visitors ${label}</strong> is <strong style="color:#AF3241">${value}</strong>`;
    }
}

else if (xAxis?.name === 'fact_zone_visits.geometry_zone') {
    const xVal = titleLines[0];
    innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, Visitors <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}</strong> seconds`;
}

else if (xAxis?.name === 'shelf_model.shelf_name'){
    const xVal = titleLines[0];
    innerHTML = `In <strong style="color:#AF3241">${xVal}</strong>, Visitors <strong style="color:#AF3241">${label}</strong> is <strong style="color:#AF3241">${value}%</strong>`;
}
else if (xAxis?.name === 'ferrero_data.hour') {
    const xVal = titleLines[0];
    innerHTML = `At hour <strong style="color:#AF3241">${xVal}</strong>, the <strong style="color:#AF3241">${yAxisTitle}</strong> is <strong style="color:#AF3241">${value}</strong>`;
}
else if (xAxis?.name === 'ferrero_data.day_only') {
    const xVal = titleLines[0];
    innerHTML = `On <strong style="color:#AF3241">${xVal}</strong>, the <strong style="color:#AF3241">${yAxisTitle}</strong> is <strong style="color:#AF3241">${value}</strong>`;
}
else if (xAxis?.name === 'ferrero_data.week') {
    const xVal = titleLines[0];
    innerHTML = `During week <strong style="color:#AF3241">${xVal}</strong>, the <strong style="color:#AF3241">${yAxisTitle}</strong> is <strong style="color:#AF3241">${value}</strong>`;
}
else if (xAxis?.name === 'ferrero_data.month_number') {
    const xVal = titleLines[0];
 
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(xVal, 10) - 1;
    const monthName = monthNames[monthIndex] || xVal;
 
    innerHTML = `In <strong style="color:#AF3241">${monthName}</strong>, the <strong style="color:#AF3241">${yAxisTitle}</strong> is <strong style="color:#AF3241">${value}</strong>`;
}







          else if (impression && granularity && titleLines.length && bodyLines.length) {
            const xVal = titleLines[0];

            let [firstPart, secondPart] = xVal.split(" "); // Adjust this depending on the format of xVal

            let [year, month, day] = firstPart.split("-");
            let formattedDate = `${day}.${month}.${year}`;

            // Get day of the week
            let dateObj = new Date(`${year}-${month}-${day}`);
            let options = { weekday: 'long' };
            let dayOfWeek = dateObj.toLocaleDateString('en-US', options);

            // Capitalize first letter (optional)
            dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);


            function expandMonthName(xVal) {
              const monthMap = {
                Jan: 'January',
                Feb: 'February',
                Mar: 'March',
                Apr: 'April',
                May: 'May',
                Jun: 'June',
                Jul: 'July',
                Aug: 'August',
                Sept: 'September',
                Sep: 'September',
                Oct: 'October',
                Nov: 'November',
                Dec: 'December',
              };

              let [day, shortMonth] = xVal.split(" ");
              let fullMonth = monthMap[shortMonth];
              return `${day} ${fullMonth}`;
            }

            let prefix = '';
            // Determine whether the hovered dataset is a line chart
const dataset = chart.data.datasets[datasetIndex];
const isLineChart = dataset?.type === 'line';

// Define the correct term to use
const impressionsLabel = isLineChart ? 'Total Impressions' : 'Impressions';

// Then switch based on granularity
switch (granularity) {
  case 'hour':
    prefix = `At hour <strong style="color:#a53241">${xVal}</strong>, ${impressionsLabel} are `;
    break;
  case 'hour_group':
    prefix = `In hour group <strong style="color:#a53241">${xVal}</strong>, ${impressionsLabel} are `;
    break;
  case 'day':
    const expandedDate = expandMonthName(xVal);
    prefix = `On <strong style="color:#a53241">${expandedDate}</strong>, ${impressionsLabel} are `;
    break;
  case 'weekday':
    prefix = `On <strong style="color:#a53241">${xVal}</strong>, ${impressionsLabel} are `;
    break;
  case 'week':
    prefix = `In <strong style="color:#a53241">${xVal}</strong>, ${impressionsLabel} are `;
    break;
  case 'month':
    prefix = `In the month of <strong style="color:#a53241">${xVal}</strong>, ${impressionsLabel} are `;
    break;
  case 'total':
    prefix = `On <strong style="color:#a53241">${formattedDate} (${dayOfWeek})</strong> at <strong style="color:#a53241">${secondPart}</strong>, ${impressionsLabel} were `;
    break;
  default:
    prefix = `<strong style="color:#a53241">${xVal}</strong>: `;
}


            innerHTML = `<div>${prefix}<strong style="color:#a53241">${value}</strong></div>`;
          } else {
            innerHTML = `<div><strong style="color:#a53241">${label}</strong>: ${value}</div>`;
          }


          innerHTML = formatCurrency(innerHTML);


          tooltipEl.innerHTML = innerHTML;

          // Positioning
          // Positioning
          const position = context.chart.canvas.getBoundingClientRect();
          const tooltipWidth = tooltipEl.offsetWidth;
          const tooltipHeight = tooltipEl.offsetHeight;
          const chartWidth = context.chart.width;
          const chartHeight = context.chart.height;

          // Calculate if tooltip would go off screen to the right
          const rightEdge = position.left + tooltipModel.caretX + tooltipWidth;
          const windowWidth = window.innerWidth;
          const wouldGoOffRight = rightEdge > windowWidth;

          // Calculate if tooltip would go off screen to the top
          const topEdge = position.top + tooltipModel.caretY - tooltipHeight;
          const wouldGoOffTop = topEdge < 0;

          tooltipEl.style.opacity = '1';

          // Adjust position based on screen edges
          let leftPos = position.left + window.pageXOffset + tooltipModel.caretX;
          let topPos = position.top + window.pageYOffset + tooltipModel.caretY;

          // If tooltip would go off right side, position to left of cursor
          if (wouldGoOffRight) {
            leftPos = position.left + window.pageXOffset + tooltipModel.caretX - tooltipWidth - 10;
          }

          // If tooltip would go off top, position below cursor
          if (wouldGoOffTop) {
            topPos = position.top + window.pageYOffset + tooltipModel.caretY + 20;
          }

          tooltipEl.style.left = leftPos + 'px';
          tooltipEl.style.top = topPos + 'px';
        }
      },

      datalabels: {
        labels: {
          total: {
            anchor: (context) => {
              const dataset = context.dataset as ExtendedChartDataset;
              const totals = dataset.totals;

              if (!totals) {
                return 'end';
              }
              const currXAxisName = dataset.xAxisNames?.[context.dataIndex];
              const currTotal = totals[currXAxisName || '']?.total;
              if (currTotal && currTotal < 0) {
                return 'start';
              }
              return 'end';
            },
            align: (context) => {
              const dataset = context.dataset as ExtendedChartDataset;
              const totals = dataset.totals;
              if (!totals) {
                return displayHorizontally ? 'right' : 'top';
              }
              const currXAxisName = dataset.xAxisNames?.[context.dataIndex];
              const currTotal = totals[currXAxisName || '']?.total;
              if (currTotal && currTotal < 0) {
                return displayHorizontally ? 'left' : 'bottom';
              }
              return displayHorizontally ? 'right' : 'top';
            },
            display: showTotals && stackBars ? 'true' : false,
            font: {
              weight: 'bold',
            },
            color: stackMetrics ? '#FFFFFF' : undefined,
            formatter: (v, context) => {
              const dataset = context.dataset as ExtendedChartDataset;
              const xAxisNames = dataset.xAxisNames;
              const totals = dataset.totals;
              if (!totals || !xAxisNames) {
                return '';
              }
              const currxAxisName = xAxisNames[context.dataIndex];
              const currDatasetIndex = context.datasetIndex;
              if (currDatasetIndex === totals[currxAxisName]?.lastSegment && v !== null) {
                const barTotal = displayAsPercentage
                  ? '100'
                  : totals[currxAxisName].total.toString();
                let val = formatValue(barTotal, {
                  type: 'number',
                  dps: dps,
                  meta: displayAsPercentage ? undefined : metric?.meta
                }, Despar);
                if (displayAsPercentage) {
                  val += '%';
                }
                return val;
              } else {
                return '';
              }
            },
          },
          value: {
            color: stackMetrics ? '#FFFFFF' : undefined,
            font: {
        size: LabelFont, // ✅ add this line
      },
            anchor: stacked || stackMetrics ? 'center' : 'end',
            align: stacked || stackMetrics ? 'center' : 'end',
            display: showLabels ? 'auto' : false,
            formatter: (v, context) => {
              const dataset = context.chart.data.datasets?.[context.datasetIndex];
              const dataLength = dataset?.data?.length || 0;

              console.log(dataLength)

              // Skip label if too many points and not every 5th
              if (dataLength > 70 && context.dataIndex % 10 !== 0 && context.dataset.type === 'line') {
                return null;
              }
              const label = context.dataset.label || '';
              const metricIndex = context.datasetIndex;
              const metricsList = [...(metrics || []), ...(lineMetrics || [])];
              const metricObj = metrics ? metricsList[metricIndex] : metric;

              if (v === null) return null;

              let val = formatValue(v, {
                type: 'number',
                dps: dps,
                meta: displayAsPercentage ? undefined : metricObj?.meta
              }, Despar);

              if (typeof v === 'number') {
                if (v >= 1_000_000_000) {
                  val = `${(v / 1_000_000_000).toFixed(1)}B`;
                } else if (v >= 1_000_000) {
                  val = `${(v / 1_000_000).toFixed(1)}M`;
                } else if (v >= 10_000 && Profitability2) {
                  val = `${Math.round(v / 1_000)}K`;
                }
              }


              if (
                displayAsPercentage ||
                (MasterLines && label === 'With C.A.P.') ||
                (MarketingActivities && (label === 'With C.A.P.' || label === 'Without C.A.P.' || label === 'Sales Uplift')) ||
                (InstoreDuration && label === 'Total Shoppers (in %)') ||
                (TrolleyUsage && label === 'Trolley Ratio (%)') ||
                (xAxis?.name?.includes('shelf_model'))
              ) {
                val += '%';
              }

              if (MasterRetail && InstoreDuration && label === 'Average Revenue') {
                val += '€';
              }

              return val;
            },
            padding: -12,
          },
        },
      },

    },
  };
}
