import React, { useState, useRef } from 'react';
import { DataResponse, Dimension, Measure } from '@embeddable.com/core';
import DownloadMenu from '../DownloadMenu';

type Props = {
    title?: string;
    metrics?: Measure[];
    results: DataResponse;
    xAxis?: Dimension;
    KPIvalue?: string[];
    PercentageSign?: boolean;
    enableDownloadAsCSV?: boolean;
    enableDownloadAsPNG?: boolean;
    Despar?: boolean;
    Explanation?: string;
};

export default (props: Props) => {
    const {
        title, metrics, results, xAxis, KPIvalue, PercentageSign,
        enableDownloadAsCSV,
        enableDownloadAsPNG,
        Despar, Explanation
    } = props;
    const { data } = results;
    const [showTooltip, setShowTooltip] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);
    const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const [preppingDownload, setPreppingDownload] = useState(false);

    const formatNumber = (value: number, isPercentage = false): string => {
        if (isNaN(value)) return 'N/A';
        const formatted = Despar
            ? value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : value.toFixed(2);
        return isPercentage ? `${formatted}%` : formatted;
    };

    const firstResult = data?.[1];
    let hourGroup = firstResult?.[xAxis?.name] || "No data available";

    let selectedMetrics: Measure[] = [];

    if (KPIvalue?.includes('Conversion Rate')) {
        selectedMetrics = metrics?.filter(metric => metric.name.includes('conversion_rate')) || [];
    } else if (KPIvalue?.includes('Conversion Difference')) {
        selectedMetrics = metrics?.filter(metric => metric.name.includes('conversion_difference')) || [];
    } else if (KPIvalue?.includes('Sales Uplift')) {
        selectedMetrics = metrics?.filter(metric => metric.name.includes('sales_uplift')) || [];
    } else if (KPIvalue?.includes('Conversion Uplift')) {
        selectedMetrics = metrics?.filter(metric => metric.name.includes('sp_cr_uplift_positive')) || [];
    }

    let highestKpiValue = -Infinity;
    let highestKpiHourGroup = "No data available";

    selectedMetrics.forEach(metric => {
        data?.forEach(result => {
            const kpiValue = Number(result[metric.name]);
            if (kpiValue > highestKpiValue) {
                highestKpiValue = kpiValue;
                highestKpiHourGroup = result[xAxis?.name] || "No data available";
            }
        });
    });

    let formattedKpiValue = "N/A";
    if (highestKpiValue !== -Infinity) {
        if (KPIvalue?.includes('Conversion Uplift')) {
            formattedKpiValue = Despar
                ? Math.round(highestKpiValue).toLocaleString("de-DE") + '%'
                : Math.round(highestKpiValue).toString() + '%';
        } else {
            formattedKpiValue = formatNumber(highestKpiValue, true);
        }
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;
        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;
        setMousePos({ x: e.clientX - rect.left, y: yPos });
        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const tooltipContentJSX = selectedMetrics.map((metric, idx) => {
        const sortedData = data
            ?.map(result => {
                let xAxisValue = result[xAxis?.name] || 'N/A';
                const metricValue = Number(result[metric.name]);
                return { xAxisValue, metricValue };
            })
            .sort((a, b) => b.metricValue - a.metricValue);

        return (
            <div key={metric.name} style={{ marginBottom: idx !== selectedMetrics.length - 1 ? '10px' : '0' }}>
                <div>
                    {sortedData?.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: item.metricValue === highestKpiValue ? '#a53241' : '#555',
                            fontWeight: item.metricValue === highestKpiValue ? 'bold' : 'normal',
                            padding: '2px 0'
                        }}>
                            <span style={{ marginRight: '15px' }}>{item.xAxisValue}</span>
                            <span>
                                {KPIvalue?.includes('Conversion Uplift')
                                    ? (Despar
                                        ? Math.round(item.metricValue).toLocaleString("de-DE")
                                        : Math.round(item.metricValue).toString()) + '%'
                                    : formatNumber(item.metricValue, true)}
                            </span>
                        </div>
                    ))}
                </div>
                {idx !== selectedMetrics.length - 1 && (
                    <div style={{
                        height: '1px',
                        background: 'linear-gradient(to right, #eee, #ccc, #eee)',
                        marginTop: '10px'
                    }} />
                )}
            </div>
        );
    });

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
                backgroundColor: title === 'Smart Stores' ? '#AF3241' : 'white'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => !isOverDownloadMenu && setShowTooltip(false)}
            onMouseMove={handleMouseMove}
        >
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
                        if (!preppingDownload) setShowTooltip(true);
                    }}
                >
                    <DownloadMenu
                        csvOpts={{
                            chartName: props.title || 'chart',
                            props: { ...props, results },
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
                color: '#a53241',
                fontSize: '23px',
                fontFamily: 'Arial, sans-serif',
                marginTop: '10px',
                marginBottom: '25px',
            }}>
                Best {xAxis?.title}
            </h2>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333942',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {highestKpiHourGroup}
                    <span style={{
                        fontSize: '12px',
                        color: '#888',
                        marginLeft: '5px',
                        verticalAlign: 'super',
                    }}>
                        Highest
                    </span>
                </div>

                <div>{formattedKpiValue}</div>

                {showTooltip && (
                    <div style={{
                        position: 'absolute',
                        top: `${mousePos.y - 60}px`,
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
