import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Dimension, Measure, Dataset, DataResponse } from '@embeddable.com/core';
import DownloadMenu from '../vanilla/DownloadMenu';
import Loading from '../util/Loading';
import Error from '../util/Error';
import men from '../../assets/men.png';
import woman from '../../assets/woman.png';

// Month name mapping
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Label transformer
const getLabelTransformer = (xAxisName: string) => {
  const lowerName = xAxisName.toLowerCase();
  if (lowerName.includes('month_number')) {
    return (label: string | number) => MONTH_NAMES[parseInt(label as string, 10) - 1] || String(label);
  }
  if (lowerName.includes('week_number')) {
    return (label: string | number) => `Week ${label}`;
  }
  return null;
};

type Props = {
  ds: Dataset;
  xDim: Dimension;
  yDim: Dimension;
  valueMeasures: Measure[]; // [male, female]
  results: DataResponse;
  title?: string;
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  Explanation?: string;
};

export default function GenderSplitHeatmap({
  xDim,
  yDim,
  valueMeasures,
  results,
  title,
  enableDownloadAsCSV,
  enableDownloadAsPNG,
  Explanation,
}: Props) {
  const { isLoading, data, error } = results;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const leftYAxisRef = useRef<SVGSVGElement | null>(null);
  const rightYAxisRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [preppingDownload, setPreppingDownload] = useState(false);

  /* ------------------------------------------------------------ */
  /*  Tooltip – create once and clean up                          */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const tooltipNode = d3
      .select('body')
      .append('div')
      .attr('id', 'gender-heatmap-tooltip')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('z-index', '9999')
      .style('background-color', 'rgb(255,255,255)')
      .style('color', 'black')
      .style('padding', '8px')
      .style('font-family', 'Arial, sans-serif')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .node() as HTMLDivElement;

    tooltipRef.current = tooltipNode;

    return () => {
      d3.select('#gender-heatmap-tooltip').remove();
      tooltipRef.current = null;
    };
  }, []);

  const tooltip = d3.select(tooltipRef.current!);

  /* ------------------------------------------------------------ */
  /*  Global tooltip‑hide listeners                               */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const hide = () => tooltip.style('visibility', 'hidden');
    const keyHide = (e: KeyboardEvent) => e.key === 'Escape' && hide();
    document.addEventListener('mousedown', hide);
    document.addEventListener('wheel', hide, { passive: true });
    document.addEventListener('keydown', keyHide);
    return () => {
      document.removeEventListener('mousedown', hide);
      document.removeEventListener('wheel', hide);
      document.removeEventListener('keydown', keyHide);
    };
  }, [tooltip]);

  // Debounce
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Responsive
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      setSize({ width, height });
    };
    updateSize();
    const debounced = debounce(updateSize, 100);
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || data.length === 0) return;
    if (!valueMeasures || valueMeasures.length < 2) return;

    const maleMeasure = valueMeasures[0];
    const femaleMeasure = valueMeasures[1];

    const norm = data.map((d) => ({ ...d }));

    const container = containerRef.current;
    if (!container) return;

    const fullHeight = container.clientHeight - 30; // padding for title

    const margin = { top: 80, bottom: 15 };
    const heatmapHeight = fullHeight - margin.top - margin.bottom;

    // Filter valid data
    const filtered = norm.filter(d => d[xDim.name] != null && d[yDim.name] != null);

    const xValsRaw = Array.from(new Set(filtered.map(d => d[xDim.name])));
    const yVals = Array.from(new Set(filtered.map(d => d[yDim.name])));

    const xTransformer = getLabelTransformer(xDim.name);
    const xVals = xTransformer ? xValsRaw.map(xTransformer) : xValsRaw;

    if (xVals.length === 0 || yVals.length === 0) return;

    const cellWidth = 80;
    const heatmapWidth = xDim.name === 'fact_line_crossings.day_only'
      ? xVals.length * cellWidth
      : container.clientWidth - 200; // 200px for sticky Y-axes

    const xScale = d3.scaleBand<string>().domain(xVals).range([0, heatmapWidth]);
    const yScale = d3.scaleBand<string>().domain(yVals).range([0, heatmapHeight]);

    const maxValue = d3.max(filtered, d => Math.max(d[maleMeasure.name], d[femaleMeasure.name])) || 0;

    // --- SINGLE RED COLOR SCALE ---
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxValue])
      .range(['#e6e6e6', '#e03b46ff']); // light grey → dark red

    // --- Main heatmap ---
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', heatmapWidth)
       .attr('height', heatmapHeight + margin.top);

    const g = svg.append('g').attr('transform', `translate(0, ${margin.top})`);

    const cellGroup = g.selectAll('g.cell')
      .data(filtered)
      .enter()
      .append('g')
      .attr('transform', d => {
        const xLabel = xTransformer ? xTransformer(d[xDim.name]) : d[xDim.name];
        return `translate(${xScale(xLabel)}, ${yScale(d[yDim.name])})`;
      });

    const cellHeight = yScale.bandwidth();

    // Male top half
    const maleRects = cellGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', cellHeight / 2)
      .attr('fill', d => colorScale(d[maleMeasure.name]))
      .attr('rx', 2)
      .attr('ry', 2);

    // Female bottom half
    const femaleRects = cellGroup.append('rect')
      .attr('x', 0)
      .attr('y', cellHeight / 2)
      .attr('width', xScale.bandwidth())
      .attr('height', cellHeight / 2)
      .attr('fill', d => colorScale(d[femaleMeasure.name]))
      .attr('rx', 2)
      .attr('ry', 2);

    // Separator line
    cellGroup.append('line')
      .attr('x1', 0)
      .attr('x2', xScale.bandwidth())
      .attr('y1', cellHeight / 2)
      .attr('y2', cellHeight / 2)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Utility to compute luminance
// Get luminance from any CSS color (HEX or rgb)
const getTextColor = (color: string) => {
  let r: number, g: number, b: number;

  if (color.startsWith('rgb')) {
    const parts = color.match(/\d+/g);
    if (!parts) return 'white';
    [r, g, b] = parts.map(Number);
  } else if (color.startsWith('#')) {
    const c = color.substring(1);
    if (c.length === 3) { // short HEX
      r = parseInt(c[0] + c[0], 16);
      g = parseInt(c[1] + c[1], 16);
      b = parseInt(c[2] + c[2], 16);
    } else {
      r = parseInt(c.substring(0, 2), 16);
      g = parseInt(c.substring(2, 4), 16);
      b = parseInt(c.substring(4, 6), 16);
    }
  } else {
    return 'white';
  }

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 70 ? 'black' : 'white'; // adjust threshold if needed
};

// Labels for Male top half
cellGroup.append('text')
  .attr('x', xScale.bandwidth() / 2)
  .attr('y', cellHeight / 4)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('fill', d => getTextColor(colorScale(d[maleMeasure.name])))
  .style('font-size', '12px')
  .style('font-weight', 'bold')
  .text(d => d3.format(',')(d[maleMeasure.name]));

// Labels for Female bottom half
cellGroup.append('text')
  .attr('x', xScale.bandwidth() / 2)
  .attr('y', (cellHeight * 3) / 4)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('fill', d => getTextColor(colorScale(d[femaleMeasure.name])))
  .style('font-size', '12px')
  .style('font-weight', 'bold')
  .text(d => d3.format(',')(d[femaleMeasure.name]));


    /* Tooltip events */
    const handleMouseOver = (e: any, d: any) => {
  const xVal = d[xDim.name];
  const yVal = d[yDim.name];
  const maleValue = d[maleMeasure.name];
  const femaleValue = d[femaleMeasure.name];

  const formatNumber = d3.format(','); // ✅ consistent formatting for all numbers

  let datePrefix = '';
  if (xDim.name === 'fact_line_crossings.hour_of_day') {
    datePrefix = `At hour ${xVal}`;
  } else if (xDim.name === 'fact_line_crossings.day_only') {
    datePrefix = `On ${xVal}`;
  } else if (xDim.name === 'fact_line_crossings.week_number') {
    datePrefix = `During Week ${xVal}`;
  } else if (xDim.name === 'fact_line_crossings.month_number') {
    datePrefix = `In ${MONTH_NAMES[parseInt(xVal, 10) - 1] || xVal}`;
  } else {
    datePrefix = `At ${xVal}`;
  }

  const tooltipContent = `${datePrefix}, the total Male Visitors are <strong style="color:#AF3241">${formatNumber(maleValue)}</strong> and the total Female Visitors are <strong style="color:#AF3241">${formatNumber(femaleValue)}</strong> in ${yVal}`;

  tooltip.style('visibility', 'visible').html(tooltipContent);
};


    const handleMouseMove = (e: any) => {
      const tooltipNode = tooltipRef.current;
      if (!tooltipNode) return;

      const tooltipRect = tooltipNode.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      const mouseX = e.pageX;
      const mouseY = e.pageY;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let leftPos = mouseX + 5;
      if (windowWidth - mouseX < tooltipWidth && mouseX > tooltipWidth) leftPos = mouseX - tooltipWidth - 5;

      let topPos = mouseY + 5;
      if (windowHeight - mouseY < tooltipHeight && mouseY > tooltipHeight) topPos = mouseY - tooltipHeight - 5;

      tooltip.style('top', `${topPos}px`).style('left', `${leftPos}px`);
    };

    const handleMouseLeave = () => tooltip.style('visibility', 'hidden');

    maleRects.on('mouseover', handleMouseOver).on('mousemove', handleMouseMove).on('mouseleave', handleMouseLeave);
    femaleRects.on('mouseover', handleMouseOver).on('mousemove', handleMouseMove).on('mouseleave', handleMouseLeave);

    // X & Y grid lines
    yVals.forEach((yVal, i) => {
      if (i === yVals.length - 1) return;
      const yPos = yScale(yVal)! + yScale.bandwidth();
      g.append('line')
        .attr('x1', 0)
        .attr('x2', heatmapWidth)
        .attr('y1', yPos)
        .attr('y2', yPos)
        .attr('stroke', '#8B0000')
        .attr('stroke-width', 1);
    });

    xVals.forEach((xVal, i) => {
      if (i === xVals.length - 1) return;
      const xPos = xScale(xVal)! + xScale.bandwidth();
      g.append('line')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', heatmapHeight)
        .attr('stroke', '#8B0000')
        .attr('stroke-width', 1);
    });

    g.append('g')
      .selectAll('text')
      .data(xVals)
      .enter()
      .append('text')
      .attr('x', d => xScale(d)! + xScale.bandwidth() / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font', '13px Arial, sans-serif')
      .text(d => d);

    // Sticky Y-axes
    const renderYAxis = (ref: React.RefObject<SVGSVGElement>, isRight: boolean) => {
      if (!ref.current) return;
      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();
      svg.attr('width', 100).attr('height', heatmapHeight + margin.top);
      const g = svg.append('g').attr('transform', `translate(0, ${margin.top})`);

      yVals.forEach((yVal) => {
        const yPos = yScale(yVal)!;

        if (!isRight) {
          let lines: string[] = [yVal];
          const maxLen = 15;
          if (yVal.length > maxLen) lines = yVal.split(' ');

          const text = g.append('text')
            .attr('x', 95)
            .attr('y', yPos + yScale.bandwidth() / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .style('font', '13px Arial, sans-serif');

          lines.forEach((line, i) => {
            text.append('tspan').attr('x', 95).attr('dy', i === 0 ? '0' : '1.2em').text(line);
          });
        } else {
          const iconSize = yScale.bandwidth() / 2;
          const iconOffset = iconSize * 0.3;
          g.append('image').attr('x', 10).attr('y', yPos + iconOffset).attr('width', iconSize / 2).attr('height', iconSize / 2).attr('href', men);
          g.append('image').attr('x', 10).attr('y', yPos + yScale.bandwidth() / 2 + iconOffset).attr('width', iconSize / 2).attr('height', iconSize / 2).attr('href', woman);
        }
      });
    };

    renderYAxis(leftYAxisRef, false);
    renderYAxis(rightYAxisRef, true);

  }, [data, size, xDim, yDim, valueMeasures]);

  if (isLoading) return <Loading />;
  if (error) return <Error msg={error} />;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        position: 'relative',
        display: 'flex',
      }}
    >
      {/* Title */}
      {title && (
        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 1000, color: '#AF3241', fontSize: '25px', fontFamily: 'Arial, sans-serif' }}>
          {title}
        </div>
      )}

      {/* Download menu */}
      {(enableDownloadAsCSV || enableDownloadAsPNG) && (
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000, backgroundColor: 'transparent' }}>
          <DownloadMenu
            csvOpts={{ chartName: title || 'gender_split_heatmap', props: { results } }}
            Explanation={Explanation}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: title || 'chart', element: svgRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
          />
        </div>
      )}

      {/* Left Y-axis */}
      <div style={{ flex: '0 0 110px', position: 'sticky', left: 0, top: 0, backgroundColor: '#fff', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px' }}>
        <svg ref={leftYAxisRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Heatmap */}
      <div style={{ overflowX: xDim.name === 'fact_line_crossings.day_only' ? 'auto' : 'hidden', flex: 1, position: 'relative', scrollbarWidth: 'thin', scrollbarColor: '#c53030 #f7fafc' }}>
        <svg ref={svgRef} style={{ display: 'block', height: '100%' }} />
      </div>

      {/* Right Y-axis */}
      <div style={{ flex: '0 0 60px', position: 'sticky', right: 0, top: 0, backgroundColor: '#fff', zIndex: 10 }}>
        <svg ref={rightYAxisRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
