/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DataResponse, Dimension, DimensionOrMeasure, Measure } from '@embeddable.com/core';
import { translateText } from '../../../translateText';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Filler,
  Legend,
  PointElement,
  LineElement,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'react-chartjs-2';

import {
  DATE_DISPLAY_FORMATS,
  EMB_FONT,
  LIGHT_FONT,
  SMALL_FONT_SIZE,
} from '../../../../constants';
import formatValue from '../../../../util/format';
import getBarChartOptions from '../../../../util/getBarChartOptions';
import { toDate } from 'date-fns';

/********************************************************************
 * PLUGINS
 ********************************************************************/


const ReferenceSeparatorPlugin = {
  id: 'referenceSeparator',
  beforeDatasetsDraw(chart, args, options) {
    if (!options.enabled) return;

    const { ctx, chartArea: { top, bottom, left, right } } = chart;

    // For charts with single label and multiple datasets (grouped bars)
    if (chart.data.labels.length === 1 && chart.data.datasets.length >= 3) {
      try {
        // Get the metadata for the datasets
        const meta0 = chart.getDatasetMeta(0); // 1st dataset
        const meta1 = chart.getDatasetMeta(1); // 2nd dataset
        const meta2 = chart.getDatasetMeta(2); // 3rd dataset
        const meta3 = chart.getDatasetMeta(3); // 4th dataset (if exists)
        
        if (!meta0?.data?.[0] || !meta1?.data?.[0] || !meta2?.data?.[0]) return;

        const bar0 = meta0.data[0];
        const bar1 = meta1.data[0];
        const bar2 = meta2.data[0];
        const bar3 = meta3?.data?.[0];

        // Calculate positions
        const firstGroupCenter = (bar0.x + bar1.x) / 2;
        const secondGroupCenter = bar3 ? (bar2.x + bar3.x) / 2 : bar2.x;
        
        // Calculate separator position between 2nd and 3rd bars
        const separatorX = bar1.x + (bar2.x - bar1.x) / 2;

        // Draw separator line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(separatorX, top);
        ctx.lineTo(separatorX, bottom);
        ctx.lineWidth = options.lineWidth || 2;
        ctx.strokeStyle = options.color || '#ff0000';
        ctx.stroke();
        ctx.restore();

        // Draw titles
        ctx.save();
        
        // Set font style for titles
        ctx.font = options.titleFont || 'bold 12px Arial';
        ctx.fillStyle = options.titleColor || '#2D2D37';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Calculate title position (above the chart area)
        const titleY = top - 5;

        // Draw "Pre-campaign Period" above first two bars
        ctx.fillText('Pre-campaign Period', firstGroupCenter, titleY);

        // Draw "Campaign Period" above the second two bars
        ctx.fillText('Campaign Period', secondGroupCenter, titleY);

        ctx.restore();

        // Draw store category labels underneath each bar
        ctx.save();
        
        // Set font style for category labels
        ctx.font = options.categoryFont || '12px Arial';
        ctx.fillStyle = options.categoryColor || '#2D2D37';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Calculate label position (below the bars)
        const labelY = bottom + 6;

        // First bar (index 0): Reference Store
        ctx.fillText('Reference Store', bar0.x, labelY);

        // Second bar (index 1): C.A.P. Stores
        ctx.fillText('C.A.P. Stores', bar1.x, labelY);

        // Third bar (index 2): Reference Store
        ctx.fillText('Reference Store', bar2.x, labelY);

        // Fourth bar (index 3): C.A.P. Stores (if exists)
        if (bar3) {
          ctx.fillText('C.A.P. Stores', bar3.x, labelY);
        }

        ctx.restore();

        // Draw arrow and percentage difference for campaign period (between 3rd and 4th bars)
        if (bar3 && chart.data.datasets[2] && chart.data.datasets[3]) {
          const dataset2 = chart.data.datasets[2];
          const dataset3 = chart.data.datasets[3];
          
          // Get the values for the 3rd and 4th datasets
          const value2 = dataset2.data[0]; // Third bar value
          const value3 = dataset3.data[0]; // Fourth bar value
          
          if (typeof value2 === 'number' && typeof value3 === 'number' && value2 !== 0) {
            // Calculate percentage difference
            const percentageDiff = (value3 - value2);
            const diffText = `${percentageDiff >= 0 ? '+' : ''}${percentageDiff.toFixed(0)}%`;
            
            // Calculate arrow position (between 3rd and 4th bars, positioned lower)
            const arrowStartX = bar2.x + (bar2.width / 2) + 15;
            const arrowEndX = bar3.x - (bar3.width / 2) - 15;
            
            // Position arrow lower down
            const arrowY = bottom - 80;
            
            // Draw thicker arrow line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(arrowStartX, arrowY);
            ctx.lineTo(arrowEndX, arrowY);
            ctx.lineWidth = options.arrowWidth || 6;
            ctx.strokeStyle = options.arrowColor || '#ff0000';
            ctx.stroke();
            
            // Draw proper arrowhead (not compressed)
            const arrowHeadSize = 15;
            const arrowHeadWidth = 10;
            
            ctx.beginPath();
            ctx.moveTo(arrowEndX, arrowY); // Tip of the arrow
            ctx.lineTo(arrowEndX - arrowHeadSize, arrowY - arrowHeadWidth); // Top point
            ctx.lineTo(arrowEndX - arrowHeadSize, arrowY + arrowHeadWidth); // Bottom point
            ctx.closePath();
            ctx.fillStyle = options.arrowColor || '#ff0000';
            ctx.fill();
            
            ctx.restore();
            
            // Draw percentage text above the arrow
            ctx.save();
            ctx.font = options.diffFont || 'bold 14px Arial';
            ctx.fillStyle = options.diffColor || '#ff0000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            const textX = (arrowStartX + arrowEndX) / 2;
            const textY = arrowY - 12;
            
            ctx.fillText(diffText, textX, textY);
            ctx.restore();
          }
        }

      } catch (error) {
        console.warn('ReferenceSeparatorPlugin error:', error);
      }
    }
  }
};
const StringMetricPlugin = {
  id: 'stringMetric1',
  afterDraw(chart, args, options) {
    if (!options.enabled || !options.metrics?.length || !options.rawData) return;

    const { ctx, chartArea } = chart;

    // Get the last metric
    const lastMetric = options.metrics[options.metrics.length - 1];
    if (!lastMetric?.name) return;

    // Get the string value from the first data point and capitalize first letter
    const rawValue = options.rawData[0]?.[lastMetric.name] || '';
    const stringValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);

    if (!stringValue) return;

    ctx.save();

    // Position text in the middle at the very top of the canvas
    const xPos = chartArea.left + (chartArea.right - chartArea.left) / 2;
    const yPos = 20; // Fixed position from top of canvas

    // Draw the text with capitalized first letter
    ctx.font = `bold 12px ${ChartJS.defaults.font.family}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2D2D37'; // Keeping your dark gray color
    ctx.fillText(stringValue, xPos, yPos);

    ctx.restore();
  }
};


const StringMetricPlugin2 = {
  id: 'stringMetric2',
  afterDraw(chart, args, options) {
    if (!options.enabled || !options.metrics?.length || !options.rawData) return;

    const { ctx, chartArea } = chart;

    // Get the last metric
    const lastMetric = options.metrics[options.metrics.length - 1];
    if (!lastMetric?.name) return;

    // Get the string value from the first data point and capitalize first letter
    const rawValue = options.rawData[0]?.[lastMetric.name] || '';
    const stringValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);

    if (!stringValue) return;

    ctx.save();

    // Position text in the middle at the very top of the canvas
    const xPos = chartArea.left + (chartArea.right - chartArea.left) / 2;
    const yPos = 6; // Fixed position from top of canvas

    // Draw the text with capitalized first letter
    ctx.font = `bold 12px ${ChartJS.defaults.font.family}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2D2D37'; // Keeping your dark gray color
    ctx.fillText(stringValue, xPos, yPos);

    ctx.restore();
  }
};

const TotalSeparatorPlugin = {
  id: 'totalSeparator',
  beforeDatasetsDraw(chart, args, options) {
    if (!options.enabled) return;

    const { ctx, data, chartArea: { top, bottom }, scales: { x } } = chart;

    const totalIndex = data.labels.indexOf('Total');
    if (totalIndex === -1) return;

    // Get the start position of the Total bar
    const totalBarX = x.getPixelForValue(totalIndex);
    const barWidth = x.getPixelForValue(1) - x.getPixelForValue(0); // Estimate bar width

    // Position line at the left edge of the Total bar
    const xPos = totalBarX - barWidth / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xPos, top);  // 10 pixels above chart top
    ctx.lineTo(xPos, bottom + 37);  // 10 pixels below chart bottom
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    ctx.restore();
  }
};

const DateHeaderPlugin = {
  id: 'dateHeader',
  afterDraw(chart, _args, opts) {
    if (!opts.active) return;

    const {
      ctx,
      scales: { x },
    } = chart;
    ctx.save();
    ctx.font = `bold 11px ${ChartJS.defaults.font.family}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ChartJS.defaults.color as string;

    const dateBuckets: Record<string, number[]> = {};
    x.ticks.forEach((t, i) => {
      const fullLbl = x.getLabelForValue(t.value) as string; // "2024-12-20 17"
      const [date] = fullLbl.split(' '); // "2024-12-20"
      (dateBuckets[date] ??= []).push(i);
    });

    Object.entries(dateBuckets).forEach(([d, idxArr]) => {
      const first = idxArr[0];
      const last = idxArr[idxArr.length - 1];
      const xPos = (x.getPixelForTick(first) + x.getPixelForTick(last)) / 2;
      const yPos = x.top - 6;
      ctx.fillText(d, xPos, yPos);
    });
    ctx.restore();
  },
} as const;






const MonthHeaderPlugin = {
  id: 'monthHeader',
  afterDraw(chart, _args, opts) {
    if (!opts.active) return;

    const {
      ctx,
      scales: { x },
    } = chart;
    ctx.save();
    ctx.font = `bold 11px ${ChartJS.defaults.font.family}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ChartJS.defaults.color as string;

    const monthMap: Record<string, string> = {
      'Jan': 'January',
      'Feb': 'February',
      'Mar': 'March',
      'Apr': 'April',
      'May': 'May',
      'Jun': 'June',
      'Jul': 'July',
      'Aug': 'August',
      'Sep': 'September',
      'Sept': 'September',
      'Oct': 'October',
      'Nov': 'November',
      'Dec': 'December'
    };

    const monthBuckets: Record<string, number[]> = {};
    x.ticks.forEach((t, i) => {
      const label = x.getLabelForValue(t.value) as string; // "30 Sep"
      const [, month] = label.split(' ');
      (monthBuckets[month] ??= []).push(i);
    });

    Object.entries(monthBuckets).forEach(([abbr, idxArr]) => {
      const first = idxArr[0];
      const last = idxArr[idxArr.length - 1];
      const xPos = (x.getPixelForTick(first) + x.getPixelForTick(last)) / 2;
      const yPos = x.top - 6;
      ctx.fillText(monthMap[abbr] || abbr, xPos, yPos);
    });

    ctx.restore();
  },
} as const;

/********************************************************************
 * CHART.JS GLOBAL CONFIG
 ********************************************************************/
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
  MonthHeaderPlugin,
  DateHeaderPlugin,
  TotalSeparatorPlugin,
  StringMetricPlugin,
  StringMetricPlugin2,
  ReferenceSeparatorPlugin
);

ChartJS.defaults.font.size = parseInt(SMALL_FONT_SIZE);
ChartJS.defaults.color = LIGHT_FONT;
ChartJS.defaults.font.family = EMB_FONT;
ChartJS.defaults.plugins.tooltip.enabled = true;

/********************************************************************
 * TYPES
 ********************************************************************/
type Props = {
  description?: string;
  displayHorizontally?: boolean;
  dps?: number;
  enableDownloadAsCSV?: boolean;
  metrics: Measure[];
  AbsolutePercentage?: boolean;
  lineMetrics?: Measure[];
  results?: DataResponse;
  reverseXAxis?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  sortBy?: Dimension | Measure;
  stackMetrics?: boolean;
  title?: string;
  xAxis: Dimension;
  xAxisTitle?: string;
  yAxisTitle?: string;
  granularity?: string;
  showSecondYAxis?: boolean;
  secondAxisTitle?: string;
  xAxisPosition?: string;
  xAxisFont?: number;
  LabelFont?: number;
  displayYaxis?: boolean;
  displayXaxis?: boolean;
  clientContext?: {
    language?: string;
  };
  round?: boolean;
  TotalStores?: boolean;
  PercentageSign?: boolean;
  impression?: boolean;
  performance?: boolean;
  Weekly?: boolean;
  Totalperformance?: boolean;
  KPIvalue?: string[];
  optimization?: boolean;
  TrolleyBar?: boolean;
  overview?: boolean;
  edeka?: boolean;
  Despar?: boolean;
  edeka_hourgroup?: boolean;
  master?: boolean;
  masterUplift?: boolean;
  Referencing?: boolean;
  onToggleLabels?: (show: boolean) => void;
};


/********************************************************************
 * MAIN COMPONENT
 ********************************************************************/

export default function BarChart({ ...props }: Props) {
  const { clientContext, title, metrics, granularity,Referencing, PercentageSign, Weekly, AbsolutePercentage, impression, performance, master, KPIvalue, xAxis, Totalperformance, edeka } = props;
  const language = clientContext?.language;












  const [translatedTitle, setTranslatedTitle] = useState<string | undefined>(title);
  const [translatedMetrics, setTranslatedMetrics] = useState<string[]>(metrics.map((m) => m.title));

  useEffect(() => {
    const translateAll = async () => {
      if (!language) return;

      if (title) {
        setTranslatedTitle(await translateText(title, language));
      }

      setTranslatedMetrics(await Promise.all(metrics.map((m) => translateText(m.title, language))));
    };

    translateAll();
  }, [language, title, metrics]);
  console.log("metric.name:", metrics);

  const updatedPercentageSign =
    KPIvalue?.includes('Conversion Rate') ||
      KPIvalue?.includes('Sales Uplift') ||
      KPIvalue?.includes('Conversion Uplift')
      ? true
      : PercentageSign;


  const options = useMemo(() => {
    let updatedOptions = getBarChartOptions({
      ...props,

      granularity,
      stacked: props.stackMetrics,
      displayAsPercentage: props.AbsolutePercentage,
      xAxisPosition: props.xAxisPosition === 'top' ? 'top' : 'bottom',
      xAxisFont : props.xAxisFont ? props.xAxisFont : 12,
      LabelFont : props.LabelFont ? props.LabelFont : 12,
      displayYaxis: props.displayYaxis,
      displayXaxis: props.displayXaxis, // Passing the state value to the chart options
      impression: props.impression,
      performance: props.performance,
      Weekly: props.Weekly,
      optimization: props.optimization,
      TrolleyBar: props.TrolleyBar,
      showLabels: props.showLabels,
      overview: props.overview,
      edeka: props.edeka,
      Despar: props.Despar,
      master: props.master,
      masterUplift: props.masterUplift
    });

    // Check if xAxis.name equals 'big_dm.weekday' and update the xAxis labels
    //if (props.xAxis.name === 'big_dm.weekday') {
    // Define day names for Sunday to Saturday
    //const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Modify xAxis tick callback to show day names
    //updatedOptions.scales.x.ticks.callback = (value: number) => {
    //return dayNames[value]; // Map 0 -> 'Sunday', 1 -> 'Monday', etc.
    //};
    //}




    return updatedOptions;
  }, [props, props.showLabels]);




  // ----- append % sign to labels/ticks when requested -----
  // ----- append % sign to labels/ticks when requested -----
  if (updatedPercentageSign) {
    options.plugins = {
      ...options.plugins,
      datalabels: {
        ...options.plugins?.datalabels,
        labels: {
          ...(options.plugins?.datalabels?.labels || {}),
          value: {
            ...options.plugins?.datalabels?.labels?.value,

            formatter: (v: number) => {
              if (v === null) return '';
              if (props.Despar) {
                return Number.isInteger(v)
                  ? `${v}%`
                  : `${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
              } else {
                return Number.isInteger(v)
                  ? `${v}%`
                  : `${v.toFixed(2)}%`;
              }
            }



          },
        },
      },
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...(options.plugins?.tooltip?.callbacks || {}),
          label: (ctx: any) => {
            const value = ctx.raw;
            return props.Despar
              ? `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
              : `${value.toFixed(2)}%`;
          }

        },
      },
    };

    if (!options.scales) options.scales = {};
    ['y', 'y1'].forEach((axis) => {
      if (options.scales?.[axis]) {
        // @ts-ignore dynamic access
        options.scales[axis].ticks = {
          ...(options.scales[axis].ticks || {}),
          callback: (val: number | string) => `${Number(val)}%`, // Rounds to 2 decimals
        };
      }
    });
  }


  else if (!props.AbsolutePercentage && props.stackMetrics && KPIvalue?.includes('Sales in (€)')) {
    options.plugins = {
      ...options.plugins,
      datalabels: {
        ...options.plugins?.datalabels,
        labels: {
          ...(options.plugins?.datalabels?.labels || {}),
          value: {
            ...options.plugins?.datalabels?.labels?.value,

            formatter: (v: number) => {
              if (v === null) return '';
              return props.Despar
                ? `${v.toLocaleString('de-DE')} €`
                : `${v.toLocaleString('en-US')} €`;
            }


          },
        },
      },
    }
  }

  // --------------------------------------------------------

  // --------------------------------------------------------
  const toggleLabels = () => {
    if (props.onToggleLabels) {
      props.onToggleLabels(!props.showLabels);
    }
  };



  const StackedTotalPlugin = {
    id: 'stackedTotalPlugin',
    afterDatasetsDraw(chart: any) {
      const { ctx, data, scales } = chart;
      const xAxis = scales.x;
      const yAxis = scales.y;

      // Access plugin options
      const AbsolutePercentage = chart.options.plugins.stackedTotalPlugin?.AbsolutePercentage;
      const KPIvalue = chart.options.plugins.stackedTotalPlugin?.KPIvalue;
      const stackMetrics = chart.options.plugins.stackedTotalPlugin?.stackMetrics;

      // Store total values and positions for tooltip
      const totalValues: { x: number, y: number, value: number, label: string }[] = [];

      data?.labels?.forEach((label, i) => {
        let total = 0;
        let barTop = Number.POSITIVE_INFINITY;

        data.datasets.forEach((dataset: any) => {
          const meta = chart.getDatasetMeta(data.datasets.indexOf(dataset));
          const bar = meta.data[i];
          const value = dataset.data[i];

          if (bar && typeof value === 'number' && !dataset.hidden) {
            total += value;
            barTop = Math.min(barTop, bar.y);
          }
        });

        if (!isFinite(barTop)) return;

        ctx.save();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';

        let formattedTotal = props.Despar
          ? total.toLocaleString("de-DE")
          : total.toLocaleString("en-US");


        if (stackMetrics && KPIvalue?.includes('Sales in (€)') && !AbsolutePercentage) {
          formattedTotal = `${formattedTotal} €`;
        } else if (AbsolutePercentage) {
          formattedTotal = `${formattedTotal}%`;
        }

        const xPos = xAxis.getPixelForTick(i);
        const yPos = barTop - 10;

        ctx.fillText(formattedTotal, xPos, yPos);
        ctx.restore();

        // Store position and value for tooltip
        totalValues.push({
          x: xPos,
          y: yPos,
          value: total,
          label: label.toString()
        });
      });

      // Add tooltip functionality
      if (chart.totalTooltip) {
        chart.totalTooltip.destroy();
      }

      const tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-total-tooltip';
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
        opacity: '0'
      });
      document.body.appendChild(tooltipEl);

      chart.totalTooltip = {
        element: tooltipEl,
        destroy: () => {
          if (tooltipEl.parentNode) {
            tooltipEl.parentNode.removeChild(tooltipEl);
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        const hoveredTotal = totalValues.find(total =>
          Math.abs(mouseX - total.x) < 20 &&
          Math.abs(mouseY - total.y) < 20
        );

        if (hoveredTotal) {
          tooltipEl.style.opacity = '1';

          // Format the value based on conditions
          let displayValue = props.Despar
            ? hoveredTotal.value.toLocaleString("de-DE")
            : hoveredTotal.value.toLocaleString("en-US");

          if (AbsolutePercentage) {
            displayValue += '%';
          } else if (stackMetrics && KPIvalue?.includes('Sales in (€)')) {
            displayValue = `${displayValue} €`;
          }

          // Create the tooltip content
          // Extract the first two words of the label
          const labelParts = hoveredTotal.label.split(' ');
          const labelText = labelParts.slice(0, 2).join(' ');

          // Create the tooltip content with the updated label
          const tooltipText = KPIvalue?.includes('Sales in (€)')
            ? `In <strong style="color:#AF3241">${labelText},</strong> Total Sales in (€) are <strong style="color:#AF3241">${displayValue}</strong>`
            : `In <strong style="color:#AF3241">${labelText},</strong> Total Sales are <strong style="color:#AF3241">${displayValue}</strong>`;

          tooltipEl.innerHTML = `<div>${tooltipText}</div>`;

          // Position the tooltip
          const position = chart.canvas.getBoundingClientRect();
          tooltipEl.style.left = `${position.left + window.pageXOffset + hoveredTotal.x}px`;
          tooltipEl.style.top = `${position.top + window.pageYOffset + hoveredTotal.y - 40}px`;
        } else {
          tooltipEl.style.opacity = '0';
        }
      };

      const handleMouseOut = () => {
        tooltipEl.style.opacity = '0';
      };

      chart.canvas.addEventListener('mousemove', handleMouseMove);
      chart.canvas.addEventListener('mouseout', handleMouseOut);

      // Clean up event listeners when plugin is destroyed
      chart._totalTooltipListeners = {
        mousemove: handleMouseMove,
        mouseout: handleMouseOut
      };
    },

    // Cleanup when chart is destroyed
    beforeDestroy(chart: any) {
      if (chart.totalTooltip) {
        chart.totalTooltip.destroy();
      }
      if (chart._totalTooltipListeners) {
        chart.canvas.removeEventListener('mousemove', chart._totalTooltipListeners.mousemove);
        chart.canvas.removeEventListener('mouseout', chart._totalTooltipListeners.mouseout);
      }
    }
  };


  const data = useMemo(() => chartData({ ...props, metrics: metrics.map((m, i) => ({ ...m, title: translatedMetrics[i] })) }), [props, translatedMetrics]);

  const needsSmallBars = granularity === 'total' && data.labels.length > 700;

  return (
    granularity === 'total' ? (
      <div style={{
        overflowX: 'scroll',
        width: '100%',
        // Scrollbar styling for better visibility (works in most modern browsers)
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '4px',
        }
      }}>
        <div style={{
          minWidth: `${Math.min(Math.max(data.labels.length, 30) * (needsSmallBars ? 10 : 60), 30000)}px`,
          height: '400px',
          willChange: 'transform' // Improves scrolling performance
        }}>
          <Chart
            type="bar"
            height="100%"
            options={{
              ...options,
              animation: {
                duration: 0 // Disable animations for better performance
              },
              plugins: {
                ...options.plugins,
                stackedTotalPlugin: {
                  AbsolutePercentage: props.AbsolutePercentage,
                  KPIvalue: props.KPIvalue,
                  stackMetrics: props.stackMetrics
                },
                totalSeparator: {
                  enabled: props.TotalStores
                },
                stringMetric1: {
                  enabled: (props.performance && !props.stackMetrics) || (props.optimization && xAxis.name !== 'big_dm.name_market_type'),
                  metrics: metrics,
                  rawData: props.results?.data || []
                },
                stringMetric2: {
                  enabled: (props.optimization && xAxis.name === 'big_dm.name_market_type'),
                  metrics: metrics,
                  rawData: props.results?.data || []
                },
                referenceSeparator: {
                  enabled: props.Referencing,
    color: '#af3241',
    lineWidth: 2,
    titleFont: 'bold 12px Arial',
    titleColor: '#2D2D37',
    categoryFont: '12px Arial',
    categoryColor: '#2D2D37',
    
    // Arrow customization - thicker and positioned lower
    arrowColor: '#af3241',
    arrowWidth: 6,           // Much thicker line
    arrowPosition: 120,       // Distance from bottom (40px)
    diffFont: 'bold 14px Arial',
    diffColor: '#af3241'
                },
              }
            }}
            data={data}
            plugins={props.stackMetrics ? [StackedTotalPlugin] : []}
          />
        </div>
      </div>
    ) : (
      <Chart
        type="bar"
        height="100%"
        options={{
          ...options,
          plugins: {
            ...options.plugins,
            stackedTotalPlugin: {
              AbsolutePercentage: props.AbsolutePercentage,
              KPIvalue: props.KPIvalue,
              stackMetrics: props.stackMetrics
            },
            totalSeparator: {
              enabled: props.TotalStores
            },
            stringMetric1: {
              enabled: (props.performance && !props.stackMetrics) || (props.optimization && xAxis.name !== 'big_dm.name_market_type') || props.masterUplift,
              metrics: metrics,
              rawData: props.results?.data || []
            },
            stringMetric2: {
              enabled: (props.optimization && xAxis.name === 'big_dm.name_market_type'),
              metrics: metrics,
              rawData: props.results?.data || []
            },
            referenceSeparator: {
              enabled: props.Referencing,
    color: '#af3241',
    lineWidth: 2,
    titleFont: 'bold 12px Arial',
    titleColor: '#2D2D37',
    categoryFont: '12px Arial',
    categoryColor: '#2D2D37',
    
    // Arrow customization - thicker and positioned lower
    arrowColor: '#af3241',
    arrowWidth: 6,           // Much thicker line
    arrowPosition: 120,       // Distance from bottom (40px)
    diffFont: 'bold 14px Arial',
    diffColor: '#af3241'
            }
          }
        }}
        data={data}
        plugins={props.stackMetrics ? [StackedTotalPlugin] : []}
      />
    )
  );



}

/********************************************************************
 * HELPERS
 ********************************************************************/
function formatToWeekLabel(date: Date, performance: boolean, stackMetrics: boolean): string {
  const target = new Date(date); // Clone the input date
  const day = target.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Calculate ISO weekday (Monday = 1, Sunday = 7)
  const isoDay = day === 0 ? 7 : day;

  // Get Monday of the current week
  const monday = new Date(target);
  monday.setDate(target.getDate() - isoDay + 1);

  // Calculate ISO week number
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3); // ISO week is the week with Thursday

  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstThursdayDay = firstThursday.getDay();
  const firstISOWeekStart = new Date(firstThursday);
  firstISOWeekStart.setDate(firstThursday.getDate() - (firstThursdayDay === 0 ? 6 : firstThursdayDay - 1));

  const weekNumber = Math.round(
    ((monday.getTime() - firstISOWeekStart.getTime()) / 86400000) / 7 + 1
  );

  // Add one day to Monday
  const mondayPlusOne = new Date(monday);
  mondayPlusOne.setDate(mondayPlusOne.getDate() + 1);
  const mondayFormatted = mondayPlusOne.toISOString().split('T')[0];

  // Add one day to Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayPlusOne = new Date(sunday);
  sundayPlusOne.setDate(sundayPlusOne.getDate() + 1);
  const sundayFormatted = sundayPlusOne.toISOString().split('T')[0];

  if (performance && !stackMetrics) {
    return `Week ${weekNumber} ${mondayFormatted} ${sundayFormatted}`;
  } else {
    return `Week ${weekNumber}`;
  }
}




/********************************************************************
 * DATA TRANSFORM
 ********************************************************************/

function chartData(props: Props): ChartData<'bar' | 'line'> {
  const {
    results,
    xAxis,
    metrics,
    granularity,
    lineMetrics,
    AbsolutePercentage,
    showSecondYAxis,
    TotalStores,
    round,
    PercentageSign,
    Totalperformance,
    performance,
    KPIvalue,
    stackMetrics
  } = props;

  const roundValue = (v: number) => (round ? Math.round(v) : v);

  if (!results?.data) return { labels: [], datasets: [] };

  const labels: string[] = [];
  /** perMetric[metricIndex][labelIndex] = value */
  const perMetric: number[][] = metrics.map(() => []);

  /** helper to ensure label uniqueness + index lookup */
  const getLabelIndex = (lbl: string) => {
    let idx = labels.indexOf(lbl);
    if (idx === -1) {
      labels.push(lbl);
      perMetric.forEach((arr) => arr.push(0));
      idx = labels.length - 1;
    }
    return idx;
  };

  let selectedMetrics = metrics;
  if (performance && !stackMetrics) {
    selectedMetrics = metrics.slice(0, 2);
  }

  if (Totalperformance) {
    selectedMetrics = metrics.slice(0, 2);
  }

  if (props.masterUplift) {
    selectedMetrics = metrics.slice(0, 1);
  }

  if (KPIvalue?.includes('Units of Sales')) {
    selectedMetrics = metrics.slice(0, 2);
  } else if (KPIvalue?.includes('Sales in (€)')) {
    selectedMetrics = metrics.slice(2, 4);
  }
  else if (KPIvalue?.includes('Conversion Rate')) {
    selectedMetrics = metrics.slice(0, 2);
  }
  else if (KPIvalue?.includes('Average Basket Size')) {
    selectedMetrics = metrics.slice(2, 4);
  }
  else if (KPIvalue?.includes('Sales Uplift')) {
    selectedMetrics = metrics.slice(4, 5);
  }
  else if (KPIvalue?.includes('Conversion Uplift')) {
    selectedMetrics = metrics.slice(5, 6);
  }
  else if (KPIvalue?.includes('Overview')) {
    selectedMetrics = metrics.slice(0, 1);
  }

  // ---- GROUPING LOGIC ---- //
  const pushValue = (metricIdx: number, label: string, value: number) => {
    const li = getLabelIndex(label);
    perMetric[metricIdx][li] += value;
  };

  results.data.forEach((entry) => {
    const rawDate = new Date(entry[xAxis.name]);
    if (
      (granularity === 'week' && performance && !entry["big_dm.timestamp.week"]) ||
      (granularity === 'week' && props.masterUplift && !entry["big_dm.timestamp.week"])
    ) return;

    selectedMetrics.forEach((metric, mi) => {
      const val = +entry[metric.name] || 0;

      let label = '';
      switch (granularity) {
        case 'day':
          label = rawDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace(',', '');
          break;

        case 'week':
          label = formatToWeekLabel(rawDate, performance, stackMetrics);
          break;

        case 'month':
          label = rawDate.toLocaleString('en-US', { month: 'long' });
          break;

        case 'hour': {
          const h = rawDate.getHours();
          if (h < 8 || h > 21) return;
          label = `${h}`;
          break;
        }

        case 'hour_group': {
          const h = rawDate.getHours();
          if (props.edeka_hourgroup) {
            if (h < 7 || h >= 22) return;
            if (h < 10) label = '7 - 10';
            else if (h < 12) label = '10 - 12';
            else if (h < 15) label = '12 - 15';
            else if (h < 18) label = '15 - 18';
            else label = '18 - 22';
          } else {
            if (h < 8 || h > 21) return;
            if (h <= 10) label = '8:00 - 10:59';
            else if (h <= 12) label = '11:00 - 12:59';
            else if (h <= 14) label = '13:00 - 14:59';
            else if (h <= 16) label = '15:00 - 16:59';
            else if (h <= 18) label = '17:00 - 18:59';
            else label = '19:00 - 21:59';
          }
          break;
        }

        case 'weekday': {
          const weekday = rawDate.toLocaleDateString('en-US', { weekday: 'long' });
          label = weekday;
          break;
        }

        case 'total': {
          const h = rawDate.getHours();
          if (h < 8 || h > 21) return;
          const date = rawDate.toISOString().slice(0, 10);
          const hr = h.toString();
          label = `${date} ${hr}`;
          break;
        }

        default:
          label = formatValue(entry[xAxis.name] ?? '', {
            meta: xAxis.meta,
            dateFormat: DATE_DISPLAY_FORMATS[granularity ?? ''],
          });
      }

      pushValue(mi, label, val);
    });
  });

  /* ---------- FIX hour label order (8 → 21) ------------------------ */
  if (granularity === 'hour') {
    const hourIndexPairs = labels.map((h, i) => ({ hour: +h, idx: i }));
    hourIndexPairs.sort((a, b) => b.hour - a.hour);
    const orderedLabels = hourIndexPairs.map(p => String(p.hour));
    perMetric.forEach((row, mi) => {
      const reordered = hourIndexPairs.map(p => row[p.idx]);
      perMetric[mi] = reordered;
    });
    labels.splice(0, labels.length, ...orderedLabels);
  }

  /* ---------- FIX hour‑group label order --------------------------- */
  if (granularity === 'hour_group') {
    const desired = props.edeka_hourgroup
      ? [
        '7 - 10',
        '10 - 12',
        '12 - 15',
        '15 - 18',
        '18 - 22'
      ]
      : [
        '8:00 - 10:59',
        '11:00 - 12:59',
        '13:00 - 14:59',
        '15:00 - 16:59',
        '17:00 - 18:59',
        '19:00 - 21:59',
      ];

    const idxMap: Record<string, number> = {};
    labels.forEach((lbl, i) => (idxMap[lbl] = i));
    const orderedLabels = desired.filter((lbl) => lbl in idxMap).reverse();
    perMetric.forEach((row, mi) => {
      const reordered = orderedLabels.map((lbl) => row[idxMap[lbl]]);
      perMetric[mi] = reordered;
    });
    labels.splice(0, labels.length, ...orderedLabels);
  }

  if (granularity === 'weekday') {
    const weekdayOrder: Record<string, number> = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    const labelIndexPairs = labels.map((lbl, i) => ({ label: lbl, idx: i }));
    labelIndexPairs.sort((a, b) => weekdayOrder[b.label] - weekdayOrder[a.label]);
    perMetric.forEach((row, mi) => {
      const reordered = labelIndexPairs.map(p => row[p.idx]);
      perMetric[mi] = reordered;
    });
    labels.splice(0, labels.length, ...labelIndexPairs.map(p => p.label));
  }

  // ---- APPLY CUMULATIVE SUM ONLY FOR LINE METRICS ----
  // Create cumulative versions only for line metrics
  const cumulativeDataForLineMetrics: number[][] = [];
  
  if (lineMetrics && lineMetrics.length > 0) {
    // For each line metric, find its index in selectedMetrics and create cumulative data
    lineMetrics.forEach(lineMetric => {
      const metricIndex = selectedMetrics.findIndex(m => m.name === lineMetric.name);
      if (metricIndex !== -1) {
        const originalData = perMetric[metricIndex];
        
        // Since data comes in reverse chronological order (newest first), we need to:
        // 1. Reverse the data to get chronological order (oldest first)
        // 2. Calculate cumulative sum from oldest to newest
        // 3. Reverse back to match the display order (newest first)
        
        const chronologicalData = [...originalData].reverse(); // Oldest first
        const cumulativeChronological: number[] = [];
        let runningTotal = 0;
        
        // Calculate cumulative sum from oldest to newest
        for (let i = 0; i < chronologicalData.length; i++) {
          runningTotal += chronologicalData[i];
          cumulativeChronological.push(runningTotal);
        }
        
        // Reverse back to match the original display order (newest first)
        cumulativeDataForLineMetrics[metricIndex] = cumulativeChronological.reverse();
      }
    });
  }

  // ---- DATASETS ----
  const defaultRamp = ['#888888', '#aaaaaa', '#bbbbbb'];
  const palette: string[] = (() => {
    if (selectedMetrics.length > 1) return ['#62626e', '#f04b55','#af3241','#6e2332',...defaultRamp];
    return ['#f04b55', ...defaultRamp];
  })();

  const buildBarDataset = (metricIndex: number) => {
    // Bar charts always use original data (no cumulative sum)
    let data = perMetric[metricIndex].map(roundValue);

    if (TotalStores) {
      const total = perMetric[metricIndex].reduce((sum, value) => sum + value, 0);
      data = [...data, roundValue(total)];
    }

    let baseColor = palette[metricIndex] ?? palette[palette.length - 1];

     // Apply Referencing color pattern if Referencing is true
  if (props.Referencing && selectedMetrics.length === 4) {
    // First bar (index 0) and third bar (index 2): #f04b55
    // Second bar (index 1) and fourth bar (index 3): #62626e
    if (metricIndex === 1 || metricIndex === 3) {
      baseColor = '#f04b55';
    } else if (metricIndex === 0 || metricIndex === 2) {
      baseColor = '#62626e';
    }
  }
    const hoverColorMap: Record<string, string> = {
      '#f04b55': '#af3241',
      '#62626e': '#2d2d37',
      
    };

    return {
      barPercentage: 0.8,
      barThickness: 'flex',
      maxBarThickness: 120,
      minBarLength: 0,
      borderRadius: 6,
      label: selectedMetrics[metricIndex].title,
      data,
      backgroundColor: baseColor,
      hoverBackgroundColor: hoverColorMap[baseColor.toLowerCase()] ?? baseColor,
      borderColor: palette[metricIndex] ?? palette[palette.length - 1],
      order: 1,
    } as const;
  };

  const barDatasets = selectedMetrics.map((_, i) => buildBarDataset(i));

  const lineDatasets = (lineMetrics || []).map((metric) => {
    const idx = selectedMetrics.findIndex((m) => m.name === metric.name);
    
    // For line datasets: use cumulative data if available, otherwise use regular data
    let dsData;
    if (idx !== -1 && cumulativeDataForLineMetrics[idx]) {
      dsData = cumulativeDataForLineMetrics[idx]; // Use cumulative data
    } else {
      dsData = idx !== -1 ? perMetric[idx] : labels.map(() => 0);
    }
    
    return {
      label: metric.title,
      data: dsData.map(roundValue),
      backgroundColor: '#a53241',
      borderColor: '#a53241',
      cubicInterpolationMode: 'monotone' as const,
      pointRadius: 2,
      pointHoverRadius: 3,
      type: 'line' as const,
      order: 0,
      Stack: true,
      yAxisID: showSecondYAxis ? 'y1' : 'y',
    } as const;
  });

  let datasets = [...barDatasets, ...lineDatasets];

  // ---- SPECIAL ABSOLUTE PERCENTAGE HANDLING FOR LINE METRICS ----
  if (AbsolutePercentage) {
  if (lineMetrics && lineMetrics.length > 0) {
    // === Line datasets: scale to their own max value ===
    datasets.forEach((ds) => {
      if (ds.type === 'line') {
        const dataArray = ds.data;
        if (dataArray.length > 0) {
          const maxValue = Math.max(...dataArray.map(v => +v));
          if (maxValue !== 0) {
            ds.data = dataArray.map((v) => (+v / maxValue) * 100);
          }
        }
      }
    });

    // === Bar datasets: scale normally, excluding line datasets ===
    if (selectedMetrics.length <= 1) {
      // Global percentage for single metric
      const globalTotal = labels.reduce(
        (tot, _lbl, i) =>
          tot +
          datasets.reduce((s, ds) => {
            if (ds.type !== 'line') {
              return s + (+ds.data[i] || 0);
            }
            return s;
          }, 0),
        0,
      );

      if (globalTotal !== 0) {
        datasets.forEach((ds) => {
          if (ds.type !== 'line') {
            ds.data = ds.data.map((v) => ((+v / globalTotal) * 100));
          }
        });
      }
    } else {
      // Percentage per label for multiple metrics
      labels.forEach((_lbl, li) => {
        const labelTotal = datasets.reduce((s, ds) => {
          if (ds.type !== 'line') {
            return s + (+ds.data[li] || 0);
          }
          return s;
        }, 0);

        if (labelTotal === 0) return;

        datasets.forEach((ds) => {
          if (ds.type !== 'line') {
            ds.data[li] = (+ds.data[li] / labelTotal) * 100;
          }
        });
      });
    }
  } else {
    // === No line metrics: normal percentage logic ===
    if (selectedMetrics.length <= 1) {
      const globalTotal = labels.reduce(
        (tot, _lbl, i) =>
          tot + datasets.reduce((s, ds) => s + (+ds.data[i] || 0), 0),
        0,
      );

      if (globalTotal !== 0) {
        datasets.forEach((ds) => {
          ds.data = ds.data.map((v) => ((+v / globalTotal) * 100));
        });
      }
    } else {
      labels.forEach((_lbl, li) => {
        const labelTotal = datasets.reduce((s, ds) => s + (+ds.data[li] || 0), 0);
        if (labelTotal === 0) return;
        datasets.forEach((ds) => {
          ds.data[li] = (+ds.data[li] / labelTotal) * 100;
        });
      });
    }
  }
}


  if (TotalStores) labels.push('Total');

  return { labels, datasets };
}