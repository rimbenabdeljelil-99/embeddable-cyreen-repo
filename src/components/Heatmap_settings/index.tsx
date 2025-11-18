import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Dimension, Measure, Dataset } from '@embeddable.com/core';
import { DataResponse } from '@embeddable.com/core';
import Loading from '../util/Loading';
import Error from '../util/Error';
import DownloadMenu from '../vanilla/DownloadMenu';

type Props = {
    ds: Dataset;
    xDim: Dimension;
    yDim: Dimension;
    valueMeasure: Measure;
    results: DataResponse;
    AbsolutePercentage?: boolean;
    InstoreDurationEdeka?: boolean;
    InstoreDurationUnimarc?: boolean;
    title?: string;
    enableDownloadAsPNG?: boolean;
    enableDownloadAsCSV?: boolean;
    edeka?: boolean;
    KPIvalue?: string;
    Despar?: boolean;
    Explanation?: string
};

export default (props: Props) => {
    const {
        xDim,
        yDim,
        valueMeasure,
        results,
        AbsolutePercentage,
        InstoreDurationEdeka,
        InstoreDurationUnimarc,
        title,
        enableDownloadAsCSV,
        enableDownloadAsPNG,
        edeka,
        KPIvalue,
        Despar,
        Explanation
    } = props;
    const { isLoading, data, error } = results;
    const svgRef = useRef<SVGSVGElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const refExportPNGElement = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [preppingDownload, setPreppingDownload] = useState(false);
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    /* ------------------------------------------------------------ */
    /*  Tooltip – create once and clean up                          */
    /* ------------------------------------------------------------ */
    useEffect(() => {
        const tooltipNode = d3
            .select('body')
            .append('div')
            .attr('id', 'heatmap-tooltip')
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
            d3.select('#heatmap-tooltip').remove();
            tooltipRef.current = null;
        };
    }, []);

    const tooltip = d3.select(tooltipRef.current!);

    /* ------------------------------------------------------------ */
    /*  Maps & helpers                                               */
    /* ------------------------------------------------------------ */
    const impressionsMapping: Record<string, string> = {
        'impressions.weekday': 'Weekday',
        'impressions.name_store': 'Store Name',
        'impressions.name_region': 'Region',
        'impressions.day': 'Day',
        'impressions.nielsen_region_code': 'Nielsen Region',
        'impressions.hour': 'Hour',
        'impressions.hour_group': 'Hour Group',
        'impressions.week': '',
        'impressions.month': 'Month',
        'impressions.id_campaign': 'Total',
        'customer_journeys.hour': 'Hour',
        'customer_journeys.hour_group': 'Hour Group',
        'customer_journeys.month': 'Month',
        'customer_journeys.weekday': 'Weekday',
    };

    const weekday = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    const getDayLabel = (v: string | number, dim: Dimension) => {
        const idx = +v;
        if (dim === 'impressions.weekday' || dim === 'customer_journeys.weekday') {
            if (idx >= 1 && idx <= 7) return weekday[idx - 1];
        }
        if (dim === 'impressions.week') {
            return `Week ${v}`;
        }
        return v;
    };

    /* ------------------------------------------------------------ */
    /*  Resize observer                                              */
    /* ------------------------------------------------------------ */
    useEffect(() => {
        const updateSize = () => {
            if (!containerRef.current) return;
            const { clientWidth: width, clientHeight: height } = containerRef.current;
            setSize({ width, height });
        };

        updateSize();
        const debouncedUpdateSize = debounce(updateSize, 100);
        window.addEventListener('resize', debouncedUpdateSize);

        return () => {
            window.removeEventListener('resize', debouncedUpdateSize);
        };
    }, []);

    /* ------------------------------------------------------------ */
    /*  Global tooltip‑hide listeners                                */
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

    /* ------------------------------------------------------------ */
    /*  Ordering helpers                                             */
    /* ------------------------------------------------------------ */
    const hourGroupOrder = [
        '8:00 - 10:59',
        '11:00 - 12:59',
        '13:00 - 14:59',
        '15:00 - 16:59',
        '17:00 - 18:59',
        '19:00 - 21:59',
    ];

    const hourGroupOrder2 = [
        '8:00-10:59',
        '8:30-10:59',
        '11:00-12:59',
        '13:00-14:59',
        '15:00-16:59',
        '17:00-18:59',
        '19:00-21:30',
        '19:00-22:00'
    ];

    const hourGroupOrder3 = [
        '7-10',
        '10-12',
        '12-15',
        '15-18',
        '18-22'
    ];

    const activeHourGroupOrder = InstoreDurationUnimarc ? hourGroupOrder2 : edeka ? hourGroupOrder3 : hourGroupOrder;

    const normHourLabel = (s: string) =>
        s.replace(/\s*-\s*/, ' - ').replace(/\s+/g, ' ').trim();

    const hourRank = Object.fromEntries(
        activeHourGroupOrder.map((h, i) => [normHourLabel(h), i]),
    );

    const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthRank = Object.fromEntries(monthOrder.map((m, i) => [m, i]));

    const dimSorter = (dim: Dimension, dataWeeks?: string[]) => {
        if (dim === 'impressions.hour_group' || dim === 'customer_journeys.hour_group') {
            return (a: string, b: string) => {
                const ra = hourRank[normHourLabel(a)];
                const rb = hourRank[normHourLabel(b)];
                return ra !== undefined && rb !== undefined
                    ? ra - rb
                    : d3.ascending(a, b);
            };
        }
        if (dim === 'impressions.month' || dim === 'customer_journeys.month') {
            return (a: string, b: string) => monthRank[a] - monthRank[b];
        }
        if (dim === 'impressions.weekday' || dim === 'customer_journeys.weekday') {
            return (a: any, b: any) => +a - +b;
        }

        if (dim === 'impressions.week' && dataWeeks) {
            const weeksNum = dataWeeks.map((w) => +w);
            const maxWeek = Math.max(...weeksNum);
            const minWeek = Math.min(...weeksNum);

            return (a: any, b: any) => {
                const wa = +a;
                const wb = +b;

                if (maxWeek >= 52 && minWeek <= 6) {
                    const shift = 53;
                    const aShifted = wa <= 6 ? wa + shift : wa;
                    const bShifted = wb <= 6 ? wb + shift : wb;
                    return aShifted - bShifted;
                }

                return wa - wb;
            };
        }

        return (a: any, b: any) =>
            !isNaN(+a) && !isNaN(+b) ? +a - +b : d3.ascending(a, b);
    };

    /* ------------------------------------------------------------ */
    /*  Main draw                                                    */
    /* ------------------------------------------------------------ */
    const formatNumber = d3.format(',');

    useEffect(() => {
        if (!data || !svgRef.current) return;

        // --- normalise data ----------------------------------------
        const norm = data.map((d) => {
            const r: any = { ...d };
            if (xDim === 'impressions.id_campaign') r[xDim] = 'Total';
            if (yDim === 'impressions.id_campaign') r[yDim] = 'Total';
            return r;
        });

        // --- filters ------------------------------------------------
        const filtered = norm.filter((d) => {
            const xVal = d[xDim];
            const yVal = d[yDim];
            const closedX = (xDim === 'impressions.hour_group' || xDim === 'customer_journeys.hour_group') && xVal === 'Closed';
            const closedY = (yDim === 'impressions.hour_group' || yDim === 'customer_journeys.hour_group') && yVal === 'Closed';
            return xVal != null && yVal != null && !closedX && !closedY;
        });

        const xValsSet = new Set<string>();
        const yValsSet = new Set<string>();
        for (const d of filtered) {
            xValsSet.add(d[xDim]);
            yValsSet.add(d[yDim]);
        }

        const xVals = [...xValsSet].sort(dimSorter(xDim, [...xValsSet]));
        const yVals = [...yValsSet].sort(dimSorter(yDim, [...yValsSet]));

        // --- Calculate dimensions for scrolling --------------------
        const needsHorizontalScroll = xDim === 'impressions.day';
        const needsVerticalScroll = yDim === 'impressions.day';

        const cellWidth = 80;
        const cellHeight = 40;
        
        // Base container dimensions
        const containerWidth = containerRef.current?.clientWidth || 1000;
        const containerHeight = containerRef.current?.clientHeight || 400;

        // INCREASED MARGINS to prevent cutting and overlapping
        const margin = {
            top: 60, // Increased to prevent title/x-axis overlap
            right: 15,
            bottom: 40, // Increased to prevent last row from being cut
            left: 100,
        };

        // Calculate heatmap dimensions - expand if needed for scrolling
        const heatmapWidth = needsHorizontalScroll 
            ? Math.max(containerWidth - margin.left - margin.right, xVals.length * cellWidth)
            : containerWidth - margin.left - margin.right;

        const heatmapHeight = needsVerticalScroll
            ? Math.max(containerHeight - margin.top - margin.bottom, yVals.length * cellHeight)
            : containerHeight - margin.top - margin.bottom;

        // Total SVG dimensions - ensure enough space for bottom margin
        const svgWidth = margin.left + heatmapWidth + margin.right;
        const svgHeight = margin.top + heatmapHeight + margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        
        // Set SVG dimensions explicitly - NO viewBox!
        svg.attr('width', svgWidth)
           .attr('height', svgHeight)
           .style('width', 'auto')
           .style('height', 'auto')
           .style('min-width', '100%')
           .style('min-height', '100%');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const total = d3.sum(filtered, (d) => +d[valueMeasure] || 0);

        // --- scales -------------------------------------------------
        // REMOVED PADDING to eliminate space between cells
        const xScale = d3.scaleBand<string>().domain(xVals).range([0, heatmapWidth]).padding(0);
        const yScale = d3.scaleBand<string>().domain(yVals).range([0, heatmapHeight]).padding(0);

        const minValue = d3.min(filtered, (d) => +d[valueMeasure]) || 0;
        const maxValue = d3.max(filtered, (d) => +d[valueMeasure]) || 1;
        const valueRange = maxValue - minValue;

        const colorScale = (InstoreDurationUnimarc || InstoreDurationEdeka)
            ? d3.scaleLinear<string>()
                .domain([
                    minValue - (valueRange * 0.1),
                    maxValue + (valueRange * 0.1)
                ])
                .range(['#fcd5d9', '#f04b55'])
            : d3.scaleLinear<string>()
                .domain([0, maxValue])
                .range(['#fcd5d9', '#f04b55']);

        // --- ADD TITLE TO SVG - POSITIONED PROPERLY ---------------
        svg.append('text')
            .attr('x', 10) // Position at top left of SVG (not relative to margin)
            .attr('y', 25) // Position within top margin
            .attr('text-anchor', 'start')
            .style('fill', '#AF3241')
            .style('font-size', '25px')
            .style('font-family', 'Arial, sans-serif')
            .text(title || 'Heatmap');

        // --- axes labels -------------------------------------------
        g.append('g')
            .selectAll('text')
            .data(xVals)
            .enter()
            .append('text')
            .attr('x', (d) => xScale(d)! + xScale.bandwidth() / 2)
            .attr('y', -15) // Positioned to avoid overlapping with title
            .attr('text-anchor', 'middle')
            .style('font', '13px Arial, sans-serif')
            .text((d) => getDayLabel(d, xDim));

        g.append('g')
            .selectAll('text')
            .data(yVals)
            .enter()
            .append('text')
            .attr('x', -45)
            .attr('y', (d) => yScale(d)! + yScale.bandwidth() / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style('font', '13px Arial, sans-serif')
            .text((d) => getDayLabel(d, yDim));

        // --- cells --------------------------------------------------
        const cells = g
            .selectAll('rect')
            .data(filtered)
            .enter()
            .append('rect')
            .attr('x', (d) => xScale(d[xDim])!)
            .attr('y', (d) => yScale(d[yDim])!)
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', (d) => {
                const val = +d[valueMeasure];
                return colorScale((InstoreDurationUnimarc || InstoreDurationEdeka) ? Math.max(minValue - (valueRange * 0.1), Math.min(val, maxValue + (valueRange * 0.1))) : val);
            })
            .attr('stroke', '#fff');

        cells
            .on('mouseover', (e, d: any) => {
                const xL = getDayLabel(d[xDim], xDim);
                const yL = getDayLabel(d[yDim], yDim);
                const formattedValue = (+d[valueMeasure]).toLocaleString(Despar ? 'de-DE' : 'en-US');

                const value = AbsolutePercentage
                    ? `${Math.round((+d[valueMeasure] / total) * 100)}%`
                    : (+d[valueMeasure]).toLocaleString(Despar ? 'de-DE' : 'en-US');

                if (['Sales (Units)', 'Revenue (€)', 'Revenue (CLP$))', 'Shoppers (Amount)', 'Duration (Min.)'].includes(KPIvalue || '')) {
                    tooltip
                        .style('visibility', 'visible')
                        .html(
                            `The ${KPIvalue} is <strong style="color:#AF3241">${formattedValue}</strong> during ${impressionsMapping[xDim]} <strong style="color:#AF3241">${xL}</strong> and ${impressionsMapping[yDim]} <strong style="color:#AF3241">${yL}</strong>.`
                        );
                }
                else if (xDim.includes("customer_journeys") && !KPIvalue) {
                    tooltip
                        .style('visibility', 'visible')
                        .html(
                            `<strong style="color:#AF3241">${d[valueMeasure]}</strong> minutes is the average in-store shopping duration during  ` +
                            `${impressionsMapping[xDim]} <strong style="color:#AF3241">${xL}</strong> and ` +
                            `${impressionsMapping[yDim]} <strong style="color:#AF3241">${yL}</strong>.`
                        );
                } else {
                    tooltip
                        .style('visibility', 'visible')
                        .html(
                            `During ${impressionsMapping[xDim]} <strong style="color:#AF3241">${xL}</strong> and ` +
                            `${impressionsMapping[yDim]} <strong style="color:#AF3241">${yL}</strong>, ` +
                            `Impressions are <strong style="color:#AF3241">${value}</strong>`
                        );
                }
            })
            .on('mousemove', (e) => {
                const tooltipNode = tooltipRef.current;
                if (!tooltipNode) return;

                const tooltipRect = tooltipNode.getBoundingClientRect();
                const tooltipWidth = tooltipRect.width;
                const tooltipHeight = tooltipRect.height;

                const mouseX = e.pageX;
                const mouseY = e.pageY;

                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                const rightSpace = windowWidth - mouseX;
                const leftSpace = mouseX;
                const bottomSpace = windowHeight - mouseY;
                const topSpace = mouseY;

                let leftPos = mouseX + 5;
                if (rightSpace < tooltipWidth && leftSpace > tooltipWidth) {
                    leftPos = mouseX - tooltipWidth - 5;
                }

                let topPos = mouseY + 5;
                if (bottomSpace < tooltipHeight && topSpace > tooltipHeight) {
                    topPos = mouseY - tooltipHeight - 5;
                }

                tooltip
                    .style('top', `${topPos}px`)
                    .style('left', `${leftPos}px`);
            })
            .on('mouseleave', () => tooltip.style('visibility', 'hidden'));

        // --- cell text ---------------------------------------------
        const fmt = new Intl.NumberFormat();
        g.selectAll('text.cell-val')
            .data(filtered)
            .enter()
            .append('text')
            .attr('class', 'cell-val')
            .attr('x', (d) => xScale(d[xDim])! + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d[yDim])! + yScale.bandwidth() / 2)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('font', '13px Arial, sans-serif')
            .style('fill', (d) =>
                d3.hsl(colorScale(+d[valueMeasure])).l > 0.6 ? 'black' : 'white'
            )
            .text((d) => {
                const v = +d[valueMeasure];
                if (isNaN(v)) return '';

                if (AbsolutePercentage) {
                    return `${Math.round((v / total) * 100)}%`;
                }

                if (v >= 1_000_000) {
                    return `${Math.round(v / 1000).toLocaleString(Despar ? 'de-DE' : 'en-US')}K`;
                }

                return Despar ? v.toLocaleString('de-DE') : v.toLocaleString('en-US');
            });

    }, [data, xDim, yDim, valueMeasure, size, AbsolutePercentage]);

    if (isLoading) return <Loading />;
    if (error) return <Error msg={error} />;

    const needsHorizontalScroll = xDim === 'impressions.day';
    const needsVerticalScroll = yDim === 'impressions.day';

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
                flexDirection: 'column',
            }}
        >
            {/* Download menu */}
            {(enableDownloadAsCSV || enableDownloadAsPNG) && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    zIndex: 1000,
                    backgroundColor: 'transparent',
                    padding: 0,
                    margin: 0,
                    border: 'none',
                    outline: 'none'
                }}>
                    <DownloadMenu
                        csvOpts={{
                            chartName: props.title || 'heatmap',
                            props: {
                                ...props,
                                results: results,
                            },
                        }}
                        Explanation={Explanation}
                        enableDownloadAsCSV={enableDownloadAsCSV}
                        enableDownloadAsPNG={enableDownloadAsPNG}
                        pngOpts={{ chartName: props.title || 'chart', element: svgRef.current }}
                        preppingDownload={preppingDownload}
                        setPreppingDownload={setPreppingDownload}
                    />
                </div>
            )}

            {/* Heatmap container with conditional scrolling */}
            <div style={{
                flex: 1,
                overflowX: needsHorizontalScroll ? 'auto' : 'hidden',
                overflowY: needsVerticalScroll ? 'auto' : 'hidden',
                position: 'relative',
                scrollbarWidth: 'thin',
                scrollbarColor: '#c53030 #f7fafc',
            }}>
                <svg
                    ref={svgRef}
                    style={{
                        display: 'block',
                        minWidth: '100%',
                        minHeight: '100%'
                    }}
                />
            </div>
        </div>
    );
};