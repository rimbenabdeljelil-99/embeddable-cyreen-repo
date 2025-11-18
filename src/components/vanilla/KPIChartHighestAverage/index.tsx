import React, { useState, useRef } from 'react';
import { DataResponse, Dimension, Measure } from '@embeddable.com/core';
import DownloadMenu from '../DownloadMenu';

type Props = {
    title?: string;
    metrics?: Measure[];
    results: DataResponse;
    xAxis?: Dimension;
    PercentageSign?: boolean;
    enableDownloadAsCSV?: boolean;
    enableDownloadAsPNG?: boolean;
    Explanation?: string;
};

export default (props: Props) => {
    const {
        title, metrics, results, xAxis, PercentageSign,
        enableDownloadAsCSV,
        enableDownloadAsPNG, Explanation
    } = props;
    const { isLoading, data, error } = results;
    const [showTooltip, setShowTooltip] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);
    const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);

    const chartRef = useRef<HTMLDivElement>(null);
    const [preppingDownload, setPreppingDownload] = useState(false);

    const firstMetric = metrics?.[0];
    const firstResult = data?.[1];
    let hourGroup = firstResult?.[xAxis?.name] || "No KPI available";

    let highestKpiValue = -Infinity;
    let highestKpiHourGroup = "No KPI available";

    if (firstMetric) {
        data?.forEach(result => {
            const kpiValue = Number(result[firstMetric.name]);
            if (kpiValue > highestKpiValue) {
                highestKpiValue = kpiValue;
                highestKpiHourGroup = result[xAxis?.name] || "No KPI available";
            }
        });
    }

    let formattedKpiValue = "N/A";
    if (highestKpiValue !== -Infinity) {
        formattedKpiValue = Number.isFinite(highestKpiValue)
            ? `${Math.round(highestKpiValue)} minutes`
            : 'No data';
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;
        // Only show tooltip if not in top 20px and not over download menu
        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;

        setMousePos({
            x: e.clientX - rect.left,
            y: yPos,
        });

        // Hide tooltip if in top 20px or over download menu
        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const tooltipContentJSX = firstMetric ? (
        <div>
            {data
                ?.map(result => {
                    let xAxisValue = result[xAxis?.name] || 'N/A';
                    const metricValue = Number(result[firstMetric.name]);
                    return { xAxisValue, metricValue };
                })
                .sort((a, b) => b.metricValue - a.metricValue)
                .map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: item.metricValue === highestKpiValue ? '#a53241' : '#555',
                        fontWeight: item.metricValue === highestKpiValue ? 'bold' : 'normal',
                        padding: '2px 0'
                    }}>
                        <span style={{ marginRight: '15px' }}>{item.xAxisValue}</span>
                        <span>{Number.isInteger(item.metricValue) ? item.metricValue : item.metricValue.toFixed(0)} minutes{PercentageSign ? '%' : ''}</span>
                    </div>
                ))}
        </div>
    ) : null;

    return (
        <div
            ref={(el) => {
                chartRef.current = el;
                if (el) {
                    const { width } = el.getBoundingClientRect();
                    setContainerWidth(width);
                }
            }}
            style={{
                border: '1px solid #ccc',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                height: '100%',
                backgroundColor: '#AF3241'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => {
                // Only hide tooltip if not over download menu
                if (!isOverDownloadMenu) {
                    setShowTooltip(false);
                }
            }}
            onMouseMove={handleMouseMove}
        >








            {/* Download Menu - with mouse event handlers */}
            {(enableDownloadAsCSV || enableDownloadAsPNG) && (
                <div
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        fontSize: '14px',
                        zIndex: 1000,
                        backgroundColor: 'transparent',
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        outline: 'none'
                    }}
                    onMouseEnter={() => setIsOverDownloadMenu(true)}
                    onMouseLeave={() => {
                        setIsOverDownloadMenu(false);
                        // Reset the tooltip visibility when leaving the download area
                        if (!preppingDownload) {
                            setShowTooltip(true);
                        }
                    }}
                >
                    <DownloadMenu
                        title={props.title}
                        csvOpts={{
                            chartName: props.title || 'chart',
                            props: {
                                ...props,
                                results: results,
                            },
                        }}
                        Explanation={Explanation}
                        onCloseExplanation={() => {
      setIsOverDownloadMenu(false);
      setShowTooltip(true);
  }}
                        enableDownloadAsCSV={enableDownloadAsCSV}
                        enableDownloadAsPNG={enableDownloadAsPNG}
                        pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
                        preppingDownload={preppingDownload}
                        setPreppingDownload={(prepping) => {
                            setPreppingDownload(prepping);
                            // When download preparation is complete, reset the hover states
                            if (!prepping) {
                                setIsOverDownloadMenu(false);
                                setShowTooltip(true);
                            }
                        }}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            margin: 0
                        }}
                    />
                </div>
            )}

            <h2 style={{
                color: 'white',
                fontSize: '23px',
                fontFamily: 'Arial, sans-serif',
                marginTop: '10px',
                marginBottom: '25px',
            }}>
                {title}
            </h2>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                color: 'white',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', marginRight: '4px' }}>in </span> {highestKpiHourGroup}
                </div>

                <div>
                    <span style={{ fontSize: '20px', marginRight: '4px' }}>with</span> {formattedKpiValue}
                </div>

                {showTooltip && tooltipContentJSX && (
                    <div style={{
                        position: 'absolute',
                        top: `${mousePos.y - 30}px`,
                        left: `${Math.min(mousePos.x - 30, containerWidth - 170)}px`,
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        zIndex: 10,
                        width: 'max-content',
                        maxWidth: '300px',
                        pointerEvents: 'none',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '12px',
                        color: '#333'
                    }}>
                        {tooltipContentJSX}
                    </div>
                )}
            </div>
        </div>
    );
};