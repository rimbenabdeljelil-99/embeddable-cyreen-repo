/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState, useRef } from 'react';
import { DataResponse, Measure } from '@embeddable.com/core';
import { translateText } from '../translateText';
import DownloadMenu from '../DownloadMenu';

interface Props {
    title?: string;
    metrics?: Measure[];
    results: DataResponse;
    clientContext?: {
        language?: string;
    };
    enableDownloadAsCSV?: boolean;
    enableDownloadAsPNG?: boolean;
    MasterRetail?: boolean;
    Explanation? : string;
}

export default (props: Props) => {
    const {
        title, metrics, results, clientContext,
        enableDownloadAsCSV,
        enableDownloadAsPNG, MasterRetail, Explanation
    } = props;
    const { isLoading, data } = results;

    // Translations
    const [translatedTitle, setTranslatedTitle] = useState<string | undefined>(title);
    const [translatedUplift, setTranslatedUplift] = useState<string>('Uplift');
    const [translatedDailyAverage, setTranslatedDailyAverage] = useState<string>('Daily Average');
    const [translatedShopperAverage, setTranslatedShopperAverage] = useState<string>('Shopper Average');
    const [showTooltip, setShowTooltip] = useState(false);
    const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);

    const chartRef = useRef<HTMLDivElement>(null);
    const [preppingDownload, setPreppingDownload] = useState(false);

    useEffect(() => {
        if (!clientContext?.language) return;

        (async () => {
            try {
                if (title) setTranslatedTitle(await translateText(title, clientContext.language));
                setTranslatedUplift(await translateText('Uplift', clientContext.language));
                setTranslatedDailyAverage(await translateText('Daily Average', clientContext.language));
                setTranslatedShopperAverage(await translateText('Shopper Average', clientContext.language));
            } catch (err) {
                console.error('Translation failed', err);
            }
        })();
    }, [title, clientContext?.language]);

    // Data extraction and formatting
    const firstMetric = metrics?.[0];
    const secondMetric = metrics?.[1];

    const firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
    const secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;

    const formatFirstValue = () => {
        if (!Number.isFinite(firstRaw)) return 'No data';

        const numValue = Math.round(firstRaw as number);
        const valueInK = (numValue / 1000).toFixed(0);
        const formattedNumber = valueInK.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'K';

        switch (title) {
            case 'Total Revenue':
                if (MasterRetail) {
                    return `${formattedNumber} €`
                } else {
                    return `CLP$ ${formattedNumber}`
                };
            case 'Total Sales':
                return `${formattedNumber} units`;
            default:
                return formattedNumber;
        }
    };

    const formatSecondValue = () => {
        if (!Number.isFinite(secondRaw)) return 'No data';

        const numValue = secondRaw as number;

        let formatted: string;

        if (title === 'Total Sales') {
            // For Total Sales, always round to nearest whole number
            formatted = Math.round(numValue).toLocaleString('en-US');
        } else if (numValue < 1000) {
            // For other cases with small numbers, show 2 decimals
            formatted = numValue.toFixed(2).replace('.', ',');
        } else {
            // For other cases with large numbers, round to nearest whole number
            formatted = Math.round(numValue).toLocaleString('en-US');
        }

        switch (title) {
            case 'Total Revenue':
                if (MasterRetail) {
                    return `${formatted} €`
                } else {
                    return `CLP$ ${formatted}`
                };
            case 'Total Sales':
                return `${formatted} units`;
            default:
                return formatted;
        }
    };


    const getSecondValueTitle = () => {
        switch (title) {
            case 'Total Revenue':
                return translatedShopperAverage;
            case 'Total Sales':
                return translatedShopperAverage;
            default:
                return translatedDailyAverage;
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;
        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPos = e.clientY - rect.top;

        setMousePos({
            x: e.clientX - rect.left,
            y: yPos,
        });

        setShowTooltip(yPos > 20 && !isOverDownloadMenu);
    };

    const getTooltipContent = () => {
        if (!Number.isFinite(firstRaw) || !Number.isFinite(secondRaw)) return null;

        const firstFormatted = formatFirstValue();
        const secondFormatted = formatSecondValue();

        switch (title) {
            case 'Total Revenue':
                return (
                    <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                        <div>
                            Total revenue collected: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{firstFormatted}</span>.
                        </div>
                        <div>
                            Average revenue per shopper: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{secondFormatted}</span>.
                        </div>
                    </div>
                );
            case 'Total Sales':
                return (
                    <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                        <div>
                            Total items bought: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{firstFormatted}</span>.
                        </div>
                        <div>
                            Average items per shopper: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{secondFormatted}</span>.
                        </div>
                    </div>
                );
            default:
                return (
                    <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                        <div>
                            Shoppers who visited the selected stores: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{firstFormatted}</span>.
                        </div>
                        <div>
                            Average shoppers per day: <span style={{ color: '#a53241', fontWeight: 'bold' }}>{secondFormatted}</span>.
                        </div>
                    </div>
                );
        }


    };

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);

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

            {translatedTitle && (
                <h2 style={{ color: '#a53241', fontSize: '23px' }}>{translatedTitle}</h2>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#333942',
                    alignSelf: 'flex-end'
                }}>
                    {isLoading ? '...' : formatFirstValue()}
                </div>

                {Number.isFinite(secondRaw) && (
                    <div style={{
                        position: 'absolute',
                        right: '0',
                        bottom: '-42px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
                            {getSecondValueTitle()}:
                        </span>
                        <span style={{ fontSize: '20px', color: '#6B8E23', fontWeight: 'bold' }}>
                            {formatSecondValue()}
                        </span>
                    </div>
                )}
            </div>

            {showTooltip && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${mousePos.y + 10}px`,
                        left: `${Math.min(mousePos.x + 10, containerWidth - 300)}px`,
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        zIndex: 10,
                        width: 'max-content',
                        maxWidth: '300px',
                        pointerEvents: 'none',
                    }}
                >
                    {getTooltipContent()}
                </div>
            )}
        </div>
    );
};