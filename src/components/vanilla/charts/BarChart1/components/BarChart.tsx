import { DataResponse, Dimension, DimensionOrMeasure, Granularity, Measure } from '@embeddable.com/core';
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
import React from 'react';
import { Chart } from 'react-chartjs-2';

import {
    COLORS,
    DATE_DISPLAY_FORMATS,
    EMB_FONT,
    LIGHT_FONT,
    SMALL_FONT_SIZE,
} from '../../../../constants';
import formatValue from '../../../../util/format';
import getBarChartOptions from '../../../../util/getBarChartOptions';
import { filter } from 'd3';

const drawYearLabelsPlugin = {
    id: 'drawYearLabelsPlugin',
    afterDraw(chart, _args, opts) {
        if (!opts.active) return;

        const { ctx, chartArea: { top }, scales: { x } } = chart;

        if (!x || !x.getLabels) return;

        const labels = x.getLabels();  // ['January 2022', 'February 2022', ...]
        const yearPositions = new Map();

        labels.forEach((label, index) => {
            const parts = label.split(' ');
            if (parts.length !== 2) return;

            const [, year] = parts;
            const pixel = x.getPixelForTick(index);

            if (!yearPositions.has(year)) {
                yearPositions.set(year, []);
            }
            yearPositions.get(year).push(pixel);
        });

        // Draw year labels above the chart
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#62626E';

        yearPositions.forEach((positions, year) => {
            const avgX = positions.reduce((a, b) => a + b, 0) / positions.length;
            ctx.fillText(year, avgX, top - 50);  // Adjust Y-position as needed
        });

        ctx.restore();
    }
};

const StringMetricPlugin = {
    id: 'stringMetric',
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
        const yPos = 10; // Fixed position from top of canvas

        // Draw the text with capitalized first letter
        ctx.font = `bold 12px ${ChartJS.defaults.font.family}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2D2D37'; // Keeping your dark gray color
        ctx.fillText(stringValue, xPos, yPos);

        ctx.restore();
    }
};

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
    drawYearLabelsPlugin,
    StringMetricPlugin
);

ChartJS.defaults.font.size = parseInt(SMALL_FONT_SIZE);
ChartJS.defaults.color = LIGHT_FONT;
ChartJS.defaults.font.family = EMB_FONT;
ChartJS.defaults.plugins.tooltip.enabled = true;

type Props = {
    description?: string;
    displayHorizontally?: boolean;
    dps?: number;
    enableDownloadAsCSV?: boolean;
    metrics: DimensionOrMeasure[];
    lineMetrics?: DimensionOrMeasure[];
    results?: DataResponse;
    reverseXAxis?: boolean;
    showLabels?: boolean;
    showLegend?: boolean;
    sortBy?: Dimension | Measure;
    stackMetrics?: boolean;
    KPIvalue?: string;
    title?: string;
    xAxis: Dimension;
    xAxisTitle?: string;
    yAxisTitle?: string;
    granularity?: Granularity;
    showSecondYAxis?: boolean;
    secondAxisTitle?: string;
    InstoreDuration?: boolean;
    InstoreDuration2?: boolean;
    TrolleyUsage?: boolean;
    Profitability?: boolean;
    Profitability2?: boolean;
    GeneralKPIs?: boolean;
    Overview?: boolean;
    Despar?: boolean;
    PercentageSign?: boolean;
    Master?: boolean;
    MasterLines?: boolean;
    MasterRetail?: boolean;
    displayYaxis?: boolean;
    displayXaxis?: boolean;
    AbsolutePercentage?: boolean;
    MarketingActivities?: boolean;
};

import { useMemo, useRef, useState } from 'react';



export default function BarChart({ ...props }: Props) {
    const chartRef = useRef<ChartJS>(null);
    const chartDataResult = useMemo(() => chartData(props), [props]);
    const [hiddenDatasets, setHiddenDatasets] = useState<Record<number, boolean>>({});

    const toggleDataset = (datasetIndex: number) => {
        const chart = chartRef.current;
        if (!chart) return;

        const currentlyVisible = chart.isDatasetVisible(datasetIndex);
        chart.setDatasetVisibility(datasetIndex, !currentlyVisible);
        chart.update();

        setHiddenDatasets((prev) => ({
            ...prev,
            [datasetIndex]: currentlyVisible,
        }));
    };

    const needsScrollableContainer = chartDataResult.labels.length > 200;

    const needsCustomLegend = props.xAxis === 'receipts_retail.date' || props.xAxis === 'customer_journeys.date';

    // Combine both conditions
    const shouldShowCustomLegend = needsScrollableContainer || needsCustomLegend;


    // Helper function to format currency based on MasterRetail flag
    const formatCurrency = (text: string) => {
        if (!props.MasterRetail) return text;
        return text.replace(/CLP\$/g, '€');
    };

    if (props.results?.isLoading) {
        return <div style={{ height: '100%' }} />;
    }

    // Return blank component if xAxis doesn't exist in the first data item
    const xAxisMap: Record<string, string> = {
        'Other': 'big_dm.activity_4',
        'Discount': 'big_dm.activity_1',
        'Second placement': 'big_dm.activity_2',
        'Regal Wochen': 'big_dm.activity_3',
        'Design Edition': 'big_dm.activity_5',
    };

    if (props.results?.data?.length > 0 && props.xAxis) {
        const firstDataItem = props.results.data[0];
        const mappedXAxis = xAxisMap[props.xAxis] || props.xAxis;
        const xAxisExists = Object.prototype.hasOwnProperty.call(firstDataItem, mappedXAxis);

        if (!xAxisExists) {
            return null;
        }
    }

    // Determine if we need to reverse the legend
    const shouldReverse =
        (props.xAxis === "receipts_retail.hour" && props.GeneralKPIs) ||
        props.xAxis === "receipts_retail.date" ||
        props.xAxis === "customer_journeys.dow" ||
        props.xAxis === "customer_journeys.month1";

    // Prepare legend items with correct indices
    const labelMap: Record<string, string> = {
        "Total Frequency": "Shoppers (Amount)",
        "Without C.A.P": "Without C.A.P.",
        "With C.A.P": "With C.A.P.",
        "Sales Uplift (No Negative)": "Sales Uplift",
        "SP CR Uplift Positive": "Conversion Uplift",
        "Sum Frequency No Device": "Without Trolley",
        "Sum Frequency Trolley": "With Trolley",
        "Average Frequency No Device Hourly": "Without Trolley",
        "Average Frequency Trolley Hourly": "With Trolley",
        "Average Frequency No Device Weekly": "Without Trolley",
        "Average Frequency Trolley Weekly": "With Trolley",
        "Sum Revenue No Device": "Without Trolley",
        "Sum Revenue Trolley": "With Trolley",
        "Sum Sales No Device": "Without Trolley",
        "Sum Sales Trolley": "With Trolley",
        "Average Sales No Device Hourly": "Without Trolley",
        "Average Sales Trolley Hourly": "With Trolley",
        "Average Sales No Device Weekly": "Without Trolley",
        "Average Sales Trolley Weekly": "With Trolley",
        "Average Revenue No Device Hourly": "Without Trolley",
        "Average Revenue Trolley Hourly": "With Trolley",
        "Average Revenue No Device Weekly": "Without Trolley",
        "Average Revenue Trolley Weekly": "With Trolley",
    };

    const legendItems = chartDataResult.datasets.map((ds, originalIndex) => ({
        label: labelMap[ds.label] || ds.label,
        color: ds.backgroundColor,
        originalIndex, // Store the original dataset index
        displayIndex: shouldReverse
            ? chartDataResult.datasets.length - 1 - originalIndex // Reverse the index for display
            : originalIndex
    }));

    if (shouldReverse) {
        legendItems.reverse(); // Reverse the array for display order
    }

    const renderChart = (additionalProps?: any) => (
        <Chart
            ref={chartRef}
            type="bar"
            height="100%"
            options={
                getBarChartOptions({
                    ...props,
                    stacked: false,
                    displayXaxis: props.displayXaxis,
                    KPIvalue: props.KPIvalue ? formatCurrency(props.KPIvalue) : props.KPIvalue,
                    showLabels: props.showLabels,
                    showSecondYAxis: (props.KPIvalue === "Total Shoppers" || props.KPIvalue === "Total Shoppers (in %)" ||
                        props.KPIvalue === "Average Duration" || props.KPIvalue === "Trolley Ratio (%)") ? false : props.showSecondYAxis,
                    displayAsPercentage: props.PercentageSign,
                    MasterLines: props.MasterLines,
                    MasterRetail: props.MasterRetail,
                    InstoreDuration: props.InstoreDuration,
                    TrolleyUsage: props.TrolleyUsage,
                    InstoreDuration2: props.InstoreDuration2,
                    GeneralKPIs: props.GeneralKPIs,
                    Profitability: props.Profitability,
                    Profitability2: props.Profitability2,
                    MarketingActivities: props.MarketingActivities,
                    Despar: props.Despar
                })
            }
            data={chartDataResult}
            {...additionalProps}
        />
    );

    if (needsScrollableContainer) {
        // Get the max value from the datasets for the right y-axis
        const maxY1Value = Math.max(
            ...(chartDataResult.datasets
                .filter(ds => ds.yAxisID === 'y1')
                .flatMap(ds => ds.data as number[])
            ) || 0);

        function niceStep(value: number) {
            if (value <= 10) {
                return 5;
            } else if (value <= 50) {
                return Math.ceil(value / 5) * 5;
            } else if (value <= 100) {
                return Math.ceil(value / 10) * 10;
            } else {
                const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
                return Math.ceil(value / magnitude) * magnitude;
            }
        }

        const roughStep = maxY1Value / 10;
        const step = niceStep(roughStep);
        const maxTick = Math.ceil(maxY1Value / step) * step;
        const numTicks = Math.floor(maxTick / step) + 1;

        const ticks = [];
        for (let i = 0; i < numTicks; i++) {
            ticks.push(i * step);
        }

        function formatTickValue(value: number) {
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
            return value.toFixed(0);
        }

        return (
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "40px",
                    boxSizing: "border-box",
                }}
            >
                {/* Scrollable chart container */}
                <div
                    style={{
                        overflowX: "auto",
                        width: "100%",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#888 #f1f1f1",
                    }}
                >
                    <div style={{ display: "flex", position: "relative", width: "100%" }}>
                        {/* Scrollable chart area */}
                        <div style={{ flexGrow: 1 }}>
                            <div
                                style={{
                                    minWidth: `${Math.max(chartDataResult.labels.length, 30) * 6}px`,
                                    height: "400px",
                                    willChange: "transform",
                                }}
                            >
                                {renderChart()}
                            </div>
                        </div>

                        {/* Fixed Y1 axis container */}
                        {props.showSecondYAxis && (
                            <div
                                style={{
                                    width: "80px",
                                    paddingLeft: 0,
                                    background: "#fff",
                                    display: "flex",
                                    flexDirection: "row",
                                    position: "sticky",
                                    right: 0,
                                    top: 0,
                                    zIndex: 10,
                                    height: "400px",
                                    boxSizing: "border-box",
                                    userSelect: "none",
                                }}
                            >
                                <div
                                    style={{
                                        borderLeft: "1px solid #ddd",
                                        height: "85%",
                                        margin: "40% 0",
                                        display: "flex",
                                        flexDirection: "row",
                                        flexGrow: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            flexGrow: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            alignItems: "flex-end",
                                            paddingLeft: "6px",
                                            paddingRight: "6px",
                                            fontSize: "12px",
                                            color: "#555",
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {ticks
                                            .slice()
                                            .reverse()
                                            .map((tickValue, index) => (
                                                <div key={index}>{formatTickValue(tickValue)}</div>
                                            ))}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        writingMode: "vertical-rl",
                                        textAlign: "center",
                                        fontSize: "13px",
                                        paddingLeft: "8px",
                                        flexShrink: 0,
                                        color: "#444",
                                        userSelect: "none",
                                        alignSelf: "center",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {props.secondAxisTitle}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Legend */}
                {props.showLegend && (
                    <div
                        style={{
                            position: "sticky",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            padding: "10px 0",
                            backgroundColor: "white",
                            zIndex: 20,
                            borderTop: "1px solid #ddd",
                            boxSizing: "border-box",
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "#444",
                            userSelect: "none",
                        }}
                    >
                        {legendItems.map(({ label, color, originalIndex }, i) => {
                            const isHidden = hiddenDatasets[originalIndex];

                            return (
                                <span
                                    key={i}
                                    onClick={() => toggleDataset(originalIndex)} // Use original index for toggling
                                    style={{
                                        display: "inline-block",
                                        marginRight: 20,
                                        verticalAlign: "middle",
                                        cursor: "pointer",
                                        opacity: isHidden ? 0.4 : 1,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            backgroundColor: color,
                                            marginRight: 6,
                                            verticalAlign: "middle",
                                        }}
                                    />
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }


    // Fix for date-based charts without scroll
    if (needsCustomLegend && !needsScrollableContainer && props.showLegend) {
        return (
            <div style={{
                position: "relative",
                width: "100%",
                height: "100%", // Add explicit height
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Chart container with proper height */}
                <div style={{
                    flex: 1,
                    minHeight: "400px", // Ensure minimum height
                    position: "relative"
                }}>
                    {renderChart()}
                </div>

                {/* Custom Legend */}
                <div
                    style={{
                        textAlign: "center",
                        padding: "10px 0",
                        backgroundColor: "white",
                        borderTop: "1px solid #ddd",
                        boxSizing: "border-box",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#444",
                        userSelect: "none",
                        flexShrink: 0 // Prevent legend from growing
                    }}
                >
                    {legendItems.map(({ label, color, originalIndex }, i) => {
                        const isHidden = hiddenDatasets[originalIndex];

                        return (
                            <span
                                key={i}
                                onClick={() => toggleDataset(originalIndex)}
                                style={{
                                    display: "inline-block",
                                    marginRight: 20,
                                    verticalAlign: "middle",
                                    cursor: "pointer",
                                    opacity: isHidden ? 0.4 : 1,
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        backgroundColor: color,
                                        marginRight: 6,
                                        verticalAlign: "middle",
                                    }}
                                />
                                {label}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    }

    return renderChart();
}
// ... (previous imports remain the same)

function chartData(props: Props): ChartData<'bar' | 'line'> {
    const { results, xAxis, metrics, granularity, lineMetrics = [], showSecondYAxis, MarketingActivities, AbsolutePercentage, Master, MasterLines, KPIvalue, Overview, Despar, InstoreDuration, InstoreDuration2, TrolleyUsage, Profitability, Profitability2, GeneralKPIs, PercentageSign, MasterRetail } = props;

    // Helper function to format currency based on MasterRetail flag
    const formatCurrency = (text: string) => {
        if (!MasterRetail) return text;
        return text.replace(/CLP\$/g, '€');
    };

    let dateFormat: string | undefined;
    if (xAxis.nativeType === 'time' && granularity) {
        dateFormat = DATE_DISPLAY_FORMATS[granularity];
    }

    const durationGroups = [
        'customer_journeys.duration_group_five',
        'customer_journeys.duration_group_ten',
        'customer_journeys.duration_group_fifteen',
        'customer_journeys.duration_group_thirty',
        'customer_journeys.duration_group_sixty'
    ];

    // Filter data based on xAxis type
    let filteredData = durationGroups.includes(xAxis)
        ? results?.data?.filter(d => d[xAxis] !== null)
        : results?.data;

    // Special handling for overview.hour - filter hours between 8 and 21
    if (xAxis === 'overview.hour') {
        filteredData = filteredData?.filter(d => {
            const hour = parseInt(d[xAxis], 10);
            return hour >= 8 && hour <= 21;
        });

        // Sort by hour to ensure correct order
        filteredData?.sort((a, b) => parseInt(a[xAxis], 10) - parseInt(b[xAxis], 10));
    }

    // Handle MarketingActivities xAxis transformations
    let xAxisToUse = xAxis;
    if (MarketingActivities) {
        if (xAxis === 'Other') {
            xAxisToUse = 'big_dm.activity_4';
        } else if (xAxis === 'Discount') {
            xAxisToUse = 'big_dm.activity_1';
        } else if (xAxis === 'Second placement') {
            xAxisToUse = 'big_dm.activity_2';
        } else if (xAxis === 'Regal Wochen') {
            xAxisToUse = 'big_dm.activity_3';
        } else if (xAxis === 'Design Edition') {
            xAxisToUse = 'big_dm.activity_5';
        }
    }

    const labels = [
        ...new Set(
            filteredData?.map((d: { [p: string]: any }) => {
                const rawValue = d[xAxisToUse];

                // Handle marketingActivities boolean display
                if (MarketingActivities && typeof rawValue === 'boolean') {
                    return `Marketing Activities : ${rawValue ? 'Yes' : 'No'}`;
                }

                return formatValue(rawValue === null ? '' : rawValue, {
                    meta: xAxis?.meta,
                    dateFormat: dateFormat,
                });
            }),
        ),
    ] as string[];


    // Define colors based on InstoreDuration
    const BAR_COLOR = (InstoreDuration || InstoreDuration2 || TrolleyUsage || Overview) ? '#F04B55' : '#62626e';
    const LINE_COLOR = (InstoreDuration || InstoreDuration2 || TrolleyUsage) ? '#af3241' : '#F04B55';
    const LINE_COLORS = InstoreDuration ? ['#af3241', '#af3241'] : ['#62626e', '#F04B55'];

    let selectedMetrics: DimensionOrMeasure[] = [];
    let selectedLineMetrics: DimensionOrMeasure[] = [];

    if (InstoreDuration) {
        if (KPIvalue === 'Average Sales (Units)') {
            if (metrics.length > 0) selectedMetrics = [metrics[0]];
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
            if (metrics.length > 0) selectedMetrics = [metrics[1]];
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === 'Total Shoppers') {
            if (metrics.length > 0) selectedMetrics = [metrics[2]];
        } else if (KPIvalue === 'Total Shoppers (in %)') {
            if (metrics.length > 0) selectedMetrics = [metrics[3]];
        }
    }
    else if (InstoreDuration2) {
        if (xAxis === 'customer_journeys.hour' || xAxis === 'customer_journeys.date') {
            if (KPIvalue === 'Average Sales (Units)') {
                selectedLineMetrics = [lineMetrics[2], lineMetrics[0]];
            } else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                selectedLineMetrics = [lineMetrics[2], lineMetrics[1]];
            } else if (KPIvalue === 'Average Duration') {
                selectedLineMetrics = [lineMetrics[2]];
            }
        } else if ((xAxis === 'customer_journeys.dow') || (xAxis === 'customer_journeys.month1')) {
            if (KPIvalue === 'Average Sales (Units)') {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0]];
            } else if (KPIvalue === formatCurrency('Average Revenue (CLP$)')) {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[1]];
            } else if (KPIvalue === 'Average Duration') {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
            }
        }
    }

    else if (GeneralKPIs) {
        if (xAxis === 'receipts_retail.hour' || xAxis === 'receipts_retail.date') {
            if (KPIvalue === 'Sales (Units)') {
                selectedLineMetrics = [lineMetrics[0], lineMetrics[2]];
            } else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                selectedLineMetrics = [lineMetrics[1], lineMetrics[2]];
            } else {
                selectedLineMetrics = lineMetrics;
            }
        } else if ((xAxis === 'receipts_retail.dow') || (xAxis === 'receipts_retail.month')) {
            if (KPIvalue === 'Sales (Units)') {
                if (metrics.length > 0) selectedMetrics = [metrics[0]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[lineMetrics.length - 1]];
            } else if (KPIvalue === formatCurrency('Revenue (CLP$)')) {
                if (metrics.length > 0) selectedMetrics = [metrics[1]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[lineMetrics.length - 1]];
            }
        }
    }

    else if (Profitability) {
        if (xAxis === 'receipts_retail.hour') {
            if (metrics.length > 0) selectedMetrics = [metrics[0], metrics[1]];

        } else if ((xAxis === 'receipts_retail.dow')) {
            if (metrics.length > 0) selectedMetrics = [metrics[2], metrics[3]];

        } else if (xAxis === 'receipts_retail.date') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0], lineMetrics[1]];

        } else if ((xAxis === 'receipts_retail.month')) {
            if (metrics.length > 0) selectedMetrics = [metrics[4], metrics[5]];

        }
    }

    else if (Profitability2) {
        if (KPIvalue === 'Average Sales (Units)') {
            if (xAxis === 'receipts_retail.hour') {
                if (metrics.length > 0) selectedMetrics = [metrics[0], metrics[1]];

            } else if ((xAxis === 'receipts_retail.dow')) {
                if (metrics.length > 0) selectedMetrics = [metrics[2], metrics[3]];

            } else if (xAxis === 'receipts_retail.date') {
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0], lineMetrics[1]];

            } else if ((xAxis === 'receipts_retail.month')) {
                if (metrics.length > 0) selectedMetrics = [metrics[4], metrics[5]];

            }

        }
        else if (KPIvalue === ('Average Revenue (CLP$)') || KPIvalue === ('Average Revenue (€)')) {
            if (xAxis === 'receipts_retail.hour') {
                if (metrics.length > 0) selectedMetrics = [metrics[6], metrics[7]];

            } else if ((xAxis === 'receipts_retail.dow')) {
                if (metrics.length > 0) selectedMetrics = [metrics[8], metrics[9]];

            } else if (xAxis === 'receipts_retail.date') {
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[2], lineMetrics[3]];

            } else if ((xAxis === 'receipts_retail.month')) {
                if (metrics.length > 0) selectedMetrics = [metrics[10], metrics[11]];

            }

        }

    }

    else if (Overview) {
        if (xAxis === "overview.date") {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0]];
        } else {
            if (metrics.length > 0) selectedMetrics = [metrics[0]];
        }
    } else if (Master) {
        if (metrics.length > 0) selectedMetrics = [metrics[0], metrics[1]];
    } else if (MasterLines) {
        if (KPIvalue === 'Temperature (°C)') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0], lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === 'Temperature (Feels Like °C)') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[1], lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === 'Clouds (%)') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[3], lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === 'Rain (millimeter)') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[2], lineMetrics[lineMetrics.length - 1]];
        } else if (KPIvalue === 'Snow (millimeter)') {
            if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[4], lineMetrics[lineMetrics.length - 1]];
        }
    }
    else if (TrolleyUsage) {
        if (xAxis === 'customer_journeys.hour' || xAxis === 'customer_journeys.date') {
            if (KPIvalue === 'Average sales with trolley (Units)') {
                selectedLineMetrics = [lineMetrics[2], lineMetrics[0]];
            } else if (KPIvalue === formatCurrency('Average revenue with trolley (CLP$)')) {
                selectedLineMetrics = [lineMetrics[2], lineMetrics[1]];
            } else if (KPIvalue === 'Trolley Ratio (%)') {
                selectedLineMetrics = [lineMetrics[2]];
            }
        } else if ((xAxis === 'customer_journeys.dow') || (xAxis === 'customer_journeys.month1')) {
            if (KPIvalue === 'Average sales with trolley (Units)') {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[0]];
            } else if (KPIvalue === formatCurrency('Average revenue with trolley (CLP$)')) {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
                if (lineMetrics.length > 0) selectedLineMetrics = [lineMetrics[1]];
            } else if (KPIvalue === 'Trolley Ratio (%)') {
                if (metrics.length > 0) selectedMetrics = [metrics[2]];
            }
        }
    }

    else if (MarketingActivities) {
        if (metrics.length === 3) { selectedMetrics = [metrics[0], metrics[1]]; }
        else if (metrics.length === 2) { selectedMetrics = [metrics[0]]; }

    }
    else {
        selectedMetrics = metrics;
        selectedLineMetrics = lineMetrics;
    }

    const hoverColorMap: Record<string, string> = {
        '#f04b55': '#af3241',
        '#af3241': '#8a2a2a',
        '#62626e': '#2d2d37',
    };

    const metricsDatasets = selectedMetrics.map((metric, index) => {
        let backgroundColor = BAR_COLOR;
        let hoverBackgroundColor = (InstoreDuration || InstoreDuration2 || TrolleyUsage)
            ? '#af3241'
            : hoverColorMap[BAR_COLOR.toLowerCase()] ?? BAR_COLOR;

        if (Master) {
            if (index === 0) {
                backgroundColor = '#62626e';
                hoverBackgroundColor = '#2d2d37';
            } else if (index === 1) {
                backgroundColor = '#f04b55';
                hoverBackgroundColor = '#af3241';
            }
        }

        // Add this condition for Profitability case
        if ((Profitability || Profitability2) && selectedMetrics.length === 2 && selectedLineMetrics.length === 0) {
            if (index === 0) {
                backgroundColor = '#f04b55';
                hoverBackgroundColor = '#af3241';
            } else if (index === 1) {
                backgroundColor = '#62626e';
                hoverBackgroundColor = '#2d2d37';
            }
        }

        else if (MarketingActivities && selectedLineMetrics.length === 0) {
            if (selectedMetrics.length === 2) {
                if (index === 1) {
                    backgroundColor = '#f04b55';
                    hoverBackgroundColor = '#af3241';
                } else if (index === 0) {
                    backgroundColor = '#62626e';
                    hoverBackgroundColor = '#2d2d37';
                }
            }

            else if (selectedMetrics.length === 1) {
                backgroundColor = '#f04b55';
                hoverBackgroundColor = '#af3241';

            }
        }

        return {
            barPercentage: 0.8,
            barThickness: 'flex',
            maxBarThickness: 200,
            minBarLength: 0,
            borderRadius: 4,
            type: 'bar' as const,
            label: formatCurrency(metric.title),
            data: filteredData?.map((d) => parseFloat(d[metric.name] || 0)) || [],
            backgroundColor,
            borderColor: backgroundColor,
            hoverBackgroundColor,
            order: 1,
        };
    });

    const lineMetricsDatasets = selectedLineMetrics.map((metric, i) => {
        let backgroundColor = LINE_COLOR;
        let borderColor = LINE_COLOR;
        let hoverBackgroundColor = hoverColorMap[LINE_COLOR.toLowerCase()];

        if (InstoreDuration2 || TrolleyUsage) {
            if (selectedLineMetrics.length === 2 && selectedMetrics.length === 0) {
                backgroundColor = i === 0 ? '#f04b55' : '#af3241';
            } else if (selectedLineMetrics.length === 1) {
                backgroundColor = selectedMetrics.length === 0 ? '#f04b55' : '#af3241';
            }

            borderColor = backgroundColor;
            hoverBackgroundColor = hoverColorMap[backgroundColor.toLowerCase()] ?? backgroundColor;
        } else if (selectedLineMetrics.length === 2) {
            backgroundColor = LINE_COLORS[i % LINE_COLORS.length];
            borderColor = backgroundColor;
            hoverBackgroundColor = hoverColorMap[backgroundColor.toLowerCase()] ?? backgroundColor;
        }

        return {
            label: formatCurrency(metric.title),
            data: filteredData?.map((d) => parseFloat(d[metric.name] || 0)) || [],
            backgroundColor,
            borderColor,
            hoverBackgroundColor,
            cubicInterpolationMode: 'monotone' as const,
            pointRadius: 2,
            pointHoverRadius: 3,
            type: 'line' as const,
            order: 0,
            yAxisID: (selectedLineMetrics.length === 1 && selectedMetrics.length === 0) ? 'y' :
                showSecondYAxis && selectedLineMetrics.length === 2
                    ? i === 0
                        ? 'y'
                        : 'y1'
                    : 'y1',
        };
    });

    // Combine all datasets
    const allDatasets = [...metricsDatasets, ...lineMetricsDatasets];

    // Apply AbsolutePercentage transformation if needed
    if (AbsolutePercentage) {
        // Combine only the datasets we want to transform (both metrics and lineMetrics)
        const datasetsToTransform = [...metricsDatasets, ...lineMetricsDatasets];

        if (selectedMetrics.length <= 1 && selectedLineMetrics.length <= 1) {
            // ---------- global-total behaviour ---------- //
            const globalTotal = labels.reduce(
                (tot, _lbl, i) =>
                    tot + datasetsToTransform.reduce((s, ds) => s + (+ds.data[i] || 0), 0),
                0,
            );
            if (globalTotal !== 0) {
                datasetsToTransform.forEach((ds) => {
                    ds.data = ds.data.map((v) => ((+v / globalTotal) * 100));
                });
            }
        } else {
            // ---------- per-label behaviour ---------- //
            labels.forEach((_lbl, li) => {
                const labelTotal = datasetsToTransform.reduce((s, ds) => s + (+ds.data[li] || 0), 0);
                if (labelTotal === 0) return;
                datasetsToTransform.forEach((ds) => {
                    ds.data[li] = (+ds.data[li] / labelTotal) * 100;
                });
            });
        }
    }

    return {
        labels,
        datasets: allDatasets,
    };
}