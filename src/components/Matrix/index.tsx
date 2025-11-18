import React, { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Dataset, Dimension, Measure } from '@embeddable.com/core';
import { DataResponse } from '@embeddable.com/core';
import Loading from '../util/Loading';
import Error from '../util/Error';
import * as d3 from 'd3';
import DownloadMenu from '../vanilla/DownloadMenu';

type Props = {
    ds: Dataset;
    xMeasures: Measure[];
    yMeasures: Measure[];
    matrixValue: Dimension;
    results: DataResponse;
    xAxisTitle?: string;
    yAxisTitle?: string;
    MatrixKPIvalue: string;
    enableDownloadAsPNG?: boolean;
    enableDownloadAsCSV?: boolean;
    title?: string;
    MasterRetail?: boolean;
    xAxisKPI?: string;
    yAxisKPI?: string;
    RetailOptimization?: boolean;
    Despar?: boolean;
    Explanation?: string;
};

// Helper function to format currency based on MasterRetail flag
const formatCurrency = (text: string, masterRetail?: boolean) => {
    if (!masterRetail) return text;
    return text.replace(/CLP\$/g, '€');
};

// Function to format axis labels based on the provided rules
const formatAxisLabel = (value: number, Despar: boolean, index: number, ticks: { value: number }[], maxValue: number, minValue: number) => {
    // Skip label if the range is small

    // Determine formatting type
    let unit = '';
    let divisor = 1;

    if (maxValue >= 1_000_000_000) {
        unit = 'B';
        divisor = 1_000_000_000;
    } else if (maxValue >= 5_000_000) {
        unit = 'M';
        divisor = 1_000_000;
    } else if (maxValue > 5000) {
        unit = 'k';
        divisor = 1000;
    }

    // Format value
    let numPart = (value / divisor).toFixed(0);
    if (Despar) {
        numPart = Number(numPart).toLocaleString('de-DE');
    }
    const formatted = `${numPart}${unit}`;


    // Avoid duplicate tick labels
    const prevTick = ticks[index - 1];
    const prevFormatted = prevTick !== undefined
        ? `${(prevTick.value / divisor).toFixed(0)}${unit}`
        : null;

    if (formatted === prevFormatted) {
        return '';
    }

    return formatted;
};

// Function to determine which measure to use based on KPI value
const getMeasureIndex = (kpi?: string) => {
    if (!kpi) return null; // Return null if not specified

    switch (kpi.toLowerCase()) {
        case 'revenue':
            return 0;
        case 'sales':
            return 1;
        case 'shoppers':
            return 2;
        case 'duration':
            return 3;
        default:
            return null;
    }
};

export default (props: Props) => {
    const {
        xMeasures, yMeasures, matrixValue, results, xAxisTitle, yAxisTitle, MatrixKPIvalue, enableDownloadAsCSV,
        enableDownloadAsPNG, title, MasterRetail, xAxisKPI, yAxisKPI, RetailOptimization, Despar, Explanation
    } = props;
    const { isLoading, data, error } = results;
    const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number; z: string } | null>(null);

    const [preppingDownload, setPreppingDownload] = useState(false); // Add state for download preparation
    const chartRef = useRef<HTMLDivElement>(null);

    if (isLoading) return <Loading />;
    if (error) return <Error msg={error} />;

    // Determine which measures to use - first try xAxisKPI/yAxisKPI, then fall back to MatrixKPIvalue logic
    const xMeasureIndexFromKPI = getMeasureIndex(xAxisKPI);
    const yMeasureIndexFromKPI = getMeasureIndex(yAxisKPI);

    let yMeasure, xMeasure;

    // For yMeasure - first try yAxisKPI, then fall back to MatrixKPIvalue logic
    if (yMeasureIndexFromKPI !== null && yMeasures[yMeasureIndexFromKPI]) {
        yMeasure = yMeasures[yMeasureIndexFromKPI];
    } else {
        // Original MatrixKPIvalue logic for yMeasure
        yMeasure = MatrixKPIvalue === "Sales (Units)"
            ? yMeasures[0]
            : MatrixKPIvalue === formatCurrency("Revenue (CLP$)", MasterRetail)
                ? yMeasures[1]
                : yMeasures[0]; // Default to first measure if not matched
    }

    // For xMeasure - first try xAxisKPI, then fall back to MatrixKPIvalue logic
    if (xMeasureIndexFromKPI !== null && xMeasures[xMeasureIndexFromKPI]) {
        xMeasure = xMeasures[xMeasureIndexFromKPI];
    } else {
        // Original MatrixKPIvalue logic for xMeasure
        xMeasure = MatrixKPIvalue === "Average Sales (Units)"
            ? xMeasures[0]
            : MatrixKPIvalue === formatCurrency("Average Revenue (CLP$)", MasterRetail)
                ? xMeasures[1]
                : xMeasures[0]; // Default to first measure if not matched
    }

    // Format data for ECharts
    const formattedData = data
        .map((d) => ({
            x: Number(d[xMeasure.name]),
            y: Number(d[yMeasure.name]),
            z: d[matrixValue.name],
        }))
        .filter((d) => !isNaN(d.x) && !isNaN(d.y));

    // Calculate min/max values for both axes
    const xValues = formattedData.map(d => d.x);
    const yValues = formattedData.map(d => d.y);
    const maxX = Math.max(...xValues);
    const minX = Math.min(...xValues);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);

    const formatTooltipNumber = (num: number) => {
        return num < 1000 ? Math.round(num).toString() : d3.format(',')(Math.round(num));
    };

    const getTickRoundedMax = (value: number) => {
        if (value >= 1_000_000) return 1_000_000 * Math.floor(value / 1_000_000);
        if (value >= 100_000) return 100_000 * Math.floor(value / 100_000);
        if (value >= 10_000) return 10_000 * Math.floor(value / 10_000);
        if (value >= 1_000) return 1_000 * Math.floor(value / 1_000);
        return Math.ceil(value);
    };

    const getAxisSettings = (maxValue: number) => {
        const tickInterval = d3.tickStep(0, maxValue, 5);
        const roundedMax = Math.ceil(maxValue / tickInterval) * tickInterval;
        const paddedMax = roundedMax + tickInterval;
        return { interval: tickInterval, tickMax: roundedMax, axisMax: paddedMax };
    };

    const xSettings = getAxisSettings(maxX);
    const ySettings = getAxisSettings(maxY);






    const xTickMax = getTickRoundedMax(maxX);
    const yTickMax = getTickRoundedMax(maxY);







    // Define ECharts options
    const options = {
        title: {
            text: 'Matrix',
            left: 'left',
            textStyle: {
                color: '#AF3241',
                fontSize: 25,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal'
            },
            top: 5,
            itemGap: 20
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const xValue = params.value[0];
                const yValue = params.value[1];
                const zValue = params.value[2];

                const formatTooltipNumber = (num: number) => {
                    const rounded = Math.round(num);
                    if (Despar) {
                        return rounded.toLocaleString('de-DE'); // e.g. 172.368
                    }
                    return d3.format(',')(rounded); // e.g. 172,368
                };


                const formattedY = formatTooltipNumber(yValue);
                const formattedX = formatTooltipNumber(xValue);
                if (props.RetailOptimization) {
                    return `
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: black; white-space: nowrap; line-height: 1.8;">
            <div>
                <strong style="color: #AF3241;">${zValue}</strong>
                <span style="color: black;"> : ${xAxisKPI} vs ${yAxisKPI}</span>
            </div>
            <div>
                <span style="color: black;">${xAxisKPI}</span> : 
                <span style="color: #AF3241; font-weight: bold;">${formattedX}</span>
            </div>
            <div>
                <span style="color: black;">${yAxisKPI}</span> : 
                <span style="color: #AF3241; font-weight: bold;">${formattedY}</span>
            </div>
        </div>
    `;
                }


                else if (MatrixKPIvalue === "Average Sales (Units)" || MatrixKPIvalue === formatCurrency("Average Revenue (CLP$)", MasterRetail)) {
                    return `
                <div style="font-family: Arial, sans-serif; font-size: 12px; color: black; white-space: nowrap;">
                    In <span style="color: #AF3241; font-weight: bold;">${zValue}</span>, 
                    <span style="color: #AF3241; font-weight: bold;">${formattedY}</span> minutes is the average in-store shopping duration<br>
                    and the <span style="color: #AF3241; font-weight: bold;">${formatCurrency(MatrixKPIvalue, MasterRetail)}</span> at this store is 
                    <span style="color: #AF3241; font-weight: bold;">${formattedX}</span>.
                </div>
            `;
                } else {
                    return `
                <div style="font-family: Arial, sans-serif; font-size: 12px; color: black; white-space: nowrap;">
                    <span style="color: #AF3241; font-weight: bold;">${formattedX}</span> shoppers visited
                    <span style="color: #AF3241; font-weight: bold;">${zValue}</span>,<br>
                    generating <span style="color: #AF3241; font-weight: bold;">${formattedY}</span> in ${formatCurrency(MatrixKPIvalue, MasterRetail)}
                </div>
            `;
                }
            },
            textStyle: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 12,
                color: 'black'
            },
            backgroundColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1,
            padding: 10,
            extraCssText: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 4px;'
        },

        xAxis: {
            type: 'value',
            name: formatCurrency(xAxisTitle || xMeasure.title, MasterRetail),
            nameLocation: 'middle',
            nameGap: 30,
            min: 0,
            max: xSettings.axisMax, // e.g. 350k
            interval: xSettings.interval, // e.g. 50k
            nameTextStyle: {
                color: 'black',
                fontFamily: 'Arial, sans-serif'
            },
            axisLine: { lineStyle: { color: 'black' } },
            axisTick: { lineStyle: { color: 'black' } },
            axisLabel: {
                formatter: (value: number) => formatAxisLabel(value, Despar, 0, [], xSettings.tickMax, 0),
                margin: 10,
                color: 'black',
                fontFamily: 'Arial, sans-serif'
            },
            splitLine: { show: true }
        },
        yAxis: {
            type: 'value',
            name: yAxisTitle || yMeasure.title,
            nameLocation: 'middle',
            nameGap: 50,
            min: 0,
            max: ySettings.axisMax, // e.g. 6M
            interval: ySettings.interval, // e.g. 1M
            nameTextStyle: {
                color: 'black',
                fontFamily: 'Arial, sans-serif'
            },
            axisLine: { lineStyle: { color: 'black' } },
            axisTick: { lineStyle: { color: 'black' } },
            axisLabel: {
                formatter: (value: number) => formatAxisLabel(value, Despar, 0, [], ySettings.tickMax, 0),
                margin: 10,
                color: 'black',
                fontFamily: 'Arial, sans-serif'
            },
            nameRotate: 90,
            splitLine: { show: true }
        },


        series: [
            {
                name: 'Matrix Data',
                type: 'scatter',
                data: formattedData.map((d) => [d.x, d.y, d.z]),
                symbolSize: 18,
                itemStyle: {
                    color: '#f04b55'
                },
                emphasis: {
                    itemStyle: {
                        color: '#AF3241',
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => params.value[2],
                    color: 'black',
                    fontSize: 12,
                    fontFamily: 'Arial, sans-serif'
                },
            },
        ],
        grid: {
            left: 74,   // was '8%', try 60 (px)
            right: 40,
            top: '20%',
            bottom: 50
        },

        textStyle: {
            fontFamily: 'Arial, sans-serif'
        }
    };

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: '100%',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                padding: '15px',
                borderRadius: '15px',
                border: '1px solid #ccc',
                position: 'relative'
            }}>
            {/* Add DownloadMenu component with improved styling */}
            {(enableDownloadAsCSV || enableDownloadAsPNG) && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    fontSize: '14px',
                    zIndex: 1000,
                    backgroundColor: 'transparent', // Changed to transparent
                    padding: 0,
                    margin: 0,
                    border: 'none',
                    outline: 'none'
                }}>
                    <DownloadMenu
                        csvOpts={{
                            chartName: props.title || 'chart',
                            props: {
                                ...props,
                                results: results,
                            },
                        }}
                        Explanation={Explanation}
                        enableDownloadAsCSV={enableDownloadAsCSV}
                        enableDownloadAsPNG={enableDownloadAsPNG}
                        pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
                        preppingDownload={preppingDownload}
                        setPreppingDownload={setPreppingDownload}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            margin: 0
                        }}
                    />
                </div>
            )}
            <ReactECharts
                option={options}
                style={{ width: '100%', height: 400 }}
                onEvents={{
                    click: (params) => {
                        if (params.data) {
                            setSelectedPoint({ x: params.data[0], y: params.data[1], z: params.data[2] });
                        }
                    },
                }}
            />

            {selectedPoint && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                    <strong>Selected Matrix Value:</strong> {selectedPoint.z}
                </div>
            )}
        </div>
    );
};