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
import React, { useState, useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { EMB_FONT, LIGHT_FONT, SMALL_FONT_SIZE } from '../../../constants';
import useTimeseries from '../../../hooks/useTimeseries';
import getBarChartOptions from '../../../util/getBarChartOptions';
import getStackedChartData, { Props } from '../../../util/getStackedChartData';
import Container from '../../Container';

// Register ChartJS components
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

// Configure ChartJS defaults
ChartJS.defaults.font.size = parseInt(SMALL_FONT_SIZE);
ChartJS.defaults.color = LIGHT_FONT;
ChartJS.defaults.font.family = EMB_FONT;
ChartJS.defaults.plugins.tooltip.enabled = true;

// Constants
const COLORS = [
  '#f1747cff', '#F04B55', '#AF3241', '#6E2332', 
  '#a7a6a6ff', '#68686bff', '#3a3a3dff', '#1E1E28'
];

const DATASETS_META = {
  barPercentage: 0.6,
  barThickness: 'flex' as const,
  maxBarThickness: 25,
  minBarLength: 0,
  borderRadius: 3,
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper functions
const getLabelTransformer = (xAxisName: string) => {
  const lowerName = xAxisName.toLowerCase();
  
  if (lowerName.includes('month_number')) {
    return (label: string | number) => {
      const monthIndex = parseInt(label as string, 10);
      return monthIndex >= 1 && monthIndex <= 12 
        ? MONTH_NAMES[monthIndex - 1] 
        : String(label);
    };
  }
  
  if (lowerName.includes('week_number')) {
    return (label: string | number) => `Week ${label}`;
  }
  
  return null;
};

const transformLabels = (chartData: ChartData<'bar'>, xAxisName: string): void => {
  if (!chartData.labels || !xAxisName) return;
  const transformer = getLabelTransformer(xAxisName);
  if (transformer) {
    chartData.labels = chartData.labels.map(transformer);
  }
};

const calculateTotals = (props: Props) => {
  const totals: Record<string, { total: number; lastSegment: number | null }> = {};
  const { data } = props.results;
  const { metric, xAxis } = props;

  if (!data?.length) return totals;

  data.forEach((item: { [key: string]: any }) => {
    const xValue = item[xAxis.name];
    const yValue = parseFloat(item[metric.name]);

    if (totals[xValue]) {
      totals[xValue].total += yValue;
      totals[xValue].lastSegment = null;
    } else {
      totals[xValue] = {
        total: yValue,
        lastSegment: null,
      };
    }
  });

  return totals;
};

const applyAbsolutePercentage = (chartData: ChartData<'bar'>): void => {
  const { labels, datasets } = chartData;
  if (!datasets?.length || !labels?.length) return;

  if (datasets.length <= 1) {
    const globalTotal = labels.reduce(
      (total, _label, index) => total + datasets.reduce((sum, ds) => sum + (Number(ds.data[index]) || 0), 0), 
      0
    );

    if (globalTotal !== 0) {
      datasets.forEach(ds => {
        ds.data = ds.data.map(v => (Number(v) / globalTotal) * 100);
      });
    }
  } else {
    labels.forEach((_label, labelIndex) => {
      const labelTotal = datasets.reduce((sum, ds) => sum + (Number(ds.data[labelIndex]) || 0), 0);
      if (labelTotal === 0) return;
      datasets.forEach(ds => {
        ds.data[labelIndex] = (Number(ds.data[labelIndex]) / labelTotal) * 100;
      });
    });
  }
};

// Apply colors per segment alphabetically
const applyColorsToDatasets = (chartData: ChartData<'bar'>, weiden?: boolean): void => {
  if (!chartData.datasets?.length) return;

  // Choose color palette
  const palette = weiden
    ? ['#F04B55', '#68686bff', '#AF3241'] // weiden-specific colors
    : COLORS;

  // Get all unique dataset labels (segments)
  const allLabels = chartData.datasets.map(ds => ds.label).filter(Boolean) as string[];
  const uniqueLabels = Array.from(new Set(allLabels)).sort(); // alphabetical order

  // Map each label to a color
  const colorMap: Record<string, string> = {};
  uniqueLabels.forEach((label, index) => {
    colorMap[label] = palette[index % palette.length];
  });

  // Assign colors to datasets
  chartData.datasets.forEach(ds => {
    ds.backgroundColor = ds.label ? colorMap[ds.label] : palette[0];
  });
};


// Simple Slider Component - just the bar
const ChartSlider = ({ 
  value, 
  onChange, 
  max, 
  min = 0 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  max: number; 
  min?: number; 
}) => {
  return (
    <div className="px-4 py-2 bg-gray-50 border-t">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-gray-200 cursor-pointer"
        style={{
          background: '#e5e7eb', // neutral solid background
          appearance: 'none',
        }}
      />
      <style>
        {`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 0;
            height: 0;
            border: none;
            background: transparent;
            box-shadow: none;
          }
          input[type=range]::-moz-range-thumb {
            width: 0;
            height: 0;
            border: none;
            background: transparent;
            box-shadow: none;
          }
          input[type=range]::-ms-thumb {
            width: 0;
            height: 0;
            border: none;
            background: transparent;
            box-shadow: none;
          }
        `}
      </style>
    </div>
  );
};



// Main Component
export default (props: Props) => {
  const [showLabels, setShowLabels] = useState(props.showLabels || false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { fillGaps } = useTimeseries(props, 'desc');
  const { results, isTSGroupedBarChart, AbsolutePercentage,weiden , Explanation} = props;

  const updatedProps = {
    ...props,
    showLabels,
    Explanation,
    onToggleLabels: setShowLabels,
    results: isTSGroupedBarChart
      ? { ...props.results, data: results?.data?.reduce(fillGaps, []) }
      : props.results,
  };

  if (props.showTotals) {
    updatedProps.totals = calculateTotals(props);
  }

  const chartData = getStackedChartData(updatedProps, DATASETS_META) as ChartData<'bar', number[], unknown>;
  transformLabels(chartData, props.xAxis?.name);
  console.log(weiden)
  applyColorsToDatasets(chartData, weiden);


  if (AbsolutePercentage) {
    applyAbsolutePercentage(chartData);
  }

  // Check if we need slider (more than 200 datapoints)
  const needsSlider = chartData.labels && chartData.labels.length > 30;
  const maxScrollPosition = chartData.labels ? Math.max(0, chartData.labels.length - 50) : 0; // Show ~50 bars at a time

  // Handle scroll position change
  const handleScrollPositionChange = (position: number) => {
    setScrollPosition(position);
    if (chartContainerRef.current) {
      const container = chartContainerRef.current;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const scrollLeft = (position / maxScrollPosition) * scrollWidth;
      container.scrollLeft = scrollLeft;
    }
  };

  // Sync slider with actual scroll
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || !needsSlider) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const position = scrollWidth > 0 ? (scrollLeft / scrollWidth) * maxScrollPosition : 0;
      setScrollPosition(Math.round(position));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [needsSlider, maxScrollPosition]);

  if (!chartData.datasets?.length || !chartData.labels?.length) {
    return (
      <Container {...updatedProps} className="overflow-y-hidden">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      </Container>
    );
  }

  const chartOptions = getBarChartOptions({
    ...updatedProps,
    stacked: props.stackBars,
  });

  // Calculate visible labels based on scroll position
  const visibleLabels = needsSlider 
    ? chartData.labels.slice(scrollPosition, scrollPosition + 50)
    : chartData.labels;

  const visibleData = needsSlider
    ? {
        ...chartData,
        labels: visibleLabels,
        datasets: chartData.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.slice(scrollPosition, scrollPosition + 50) as number[],
        })),
      }
    : chartData;

  return (
    <Container {...updatedProps} className="overflow-y-hidden flex flex-col">
      {/* Scrollable chart container */}
      <div 
        ref={chartContainerRef}
        className="flex-1 overflow-x-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
        }}
      >
        <div 
          style={{
            minWidth: needsSlider ? `${visibleLabels.length * 60}px` : 'auto',
            height: '100%',
            willChange: 'transform'
          }}
        >
          <Bar 
            height="100%" 
            options={{
              ...chartOptions,
              animation: {
                duration: 0 // Disable animations for better performance with slider
              }
            }} 
            data={visibleData} 
          />
        </div>
      </div>

      {/* Slider for large datasets - just the bar */}
      {needsSlider && (
        <ChartSlider
          value={scrollPosition}
          onChange={handleScrollPositionChange}
          max={maxScrollPosition}
        />
      )}
    </Container>
  );
};