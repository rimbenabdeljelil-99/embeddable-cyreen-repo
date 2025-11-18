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
    Explanation?: string;
}

export default (props: Props) => {
    const {
        title, metrics, results, clientContext,
        enableDownloadAsCSV,
        enableDownloadAsPNG, Explanation
    } = props;
    const { isLoading, data } = results;

    // Translations
    const [translatedTitle, setTranslatedTitle] = useState<string | undefined>(title);
    const [translatedUplift, setTranslatedUplift] = useState<string>('Uplift');
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
            } catch (err) {
                console.error('Translation failed', err);
            }
        })();
    }, [title, clientContext?.language]);

    // Data extraction
    const firstMetric = metrics?.[0];
    const secondMetric = metrics?.[1];

    const firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
    const secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;

    const firstDisplay = Number.isFinite(firstRaw)
        ? `${Math.round(firstRaw)} minutes`
        : 'No data';

    // Color logic for second value
    const secondColour = secondRaw !== undefined && secondRaw < 0 ? '#F04B55' : '#00aa00';

    // Helper for rendering uplift string
    const renderUplift = () => {
        if (!Number.isFinite(secondRaw)) return null;
        const sign = secondRaw > 0 ? '+ ' : '';
        return `${sign}${secondRaw}% ${translatedUplift}`;
    };

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

    // Tooltip content
    const tooltipContent = secondRaw !== undefined
        ? (
            <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                <div>
                    Conversion Rate <span style={{ color: '#AF3241', fontWeight: 'bold' }}>with C.A.P.</span>{' '}
                    is <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{firstRaw?.toFixed(2)}%</span>
                </div>
                <div>
                    Conversion Uplift is{' '}
                    <span style={{ color: secondRaw < 0 ? '#f04b55' : '#00aa00', fontWeight: 'bold' }}>
                        {renderUplift()}
                    </span>
                </div>
            </div>
        )
        : (
            <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                <span style={{ color: '#AF3241', fontWeight: 'bold' }}>{Math.round(firstRaw)} minutes</span>{' '}
                is the Average Duration spent by shoppers in the store.
            </div>
        );

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

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
                    {isLoading ? '...' : firstDisplay}
                </div>

                {Number.isFinite(secondRaw) && (
                    <div
                        style={{
                            fontSize: '20px',
                            color: secondColour,
                            fontWeight: 'bold',
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                        }}
                    >
                        {renderUplift()}
                    </div>
                )}
            </div>

            {showTooltip && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${mousePos.y + 10}px`,
                        left: `${Math.min(mousePos.x + 10, containerWidth - 290)}px`,
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
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};