/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState, useRef } from 'react';
import { DataResponse, Measure } from '@embeddable.com/core';
import { translateText } from '../translateText';
import DownloadMenu from '../DownloadMenu';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
interface Props {
    title?: string;
    metrics?: Measure[];
    results: DataResponse;
    clientContext?: {
        language?: string;
    };
    enableDownloadAsCSV?: boolean;
    enableDownloadAsPNG?: boolean;
    KPIvalue?: string;
    Explanation?: string
}

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
export default (props: Props) => {
    const {
        title, metrics, results, clientContext,
        enableDownloadAsCSV,
        enableDownloadAsPNG, KPIvalue, Explanation
    } = props;
    const { isLoading, data } = results;

    // ----------------------------------------------------------------
    // TRANSLATIONS
    // ----------------------------------------------------------------
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
                // graceful degradation – keep original strings
                /* eslint-disable-next-line no-console */
                console.error('Translation failed', err);
            }
        })();
    }, [title, clientContext?.language]);

    // ----------------------------------------------------------------
    // DATA EXTRACTION
    // ----------------------------------------------------------------
    let firstMetric, secondMetric, thirdMetric;
    let firstRaw, secondRaw, thirdRaw;

    if (KPIvalue === 'Sales (Units)') {
        firstMetric = metrics?.[0];
        secondMetric = metrics?.[1];
        thirdMetric = metrics?.[2];
        firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
        secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;
        thirdRaw = thirdMetric ? +data?.[0]?.[thirdMetric.name] : undefined;
    } else if (KPIvalue?.includes('Revenue')) {
        firstMetric = metrics?.[5];
        secondMetric = metrics?.[6];
        thirdMetric = metrics?.[7];
        firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
        secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;
        thirdRaw = thirdMetric ? +data?.[0]?.[thirdMetric.name] : undefined;
    }

    const formatFirstValue = (value: number): string => {
        if (value >= 1000) {
            const valueInK = Math.round(value / 1000);
            return `${valueInK.toLocaleString('en-US')}K`;
        }
        return Math.round(value).toLocaleString('en-US');
    };

    // Format first value
    const firstDisplay = Number.isFinite(firstRaw) ? (
        <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
            {formatFirstValue(firstRaw)}
        </span>
    ) : 'No data';


    // Format second value (right aligned)
    const secondDisplay = Number.isFinite(secondRaw) ? (
        <div style={{ fontSize: '20px', color: '#000', fontWeight: 'bold', marginLeft: 'auto' }}>
            Average Shopper:{' '}
            <span style={{ color: '#6B8E23' }}>
                {Math.round(secondRaw).toLocaleString('en-US')}
            </span>
        </div>
    ) : null;


    // Format third value with arrow sign and styles
    const thirdDisplay = Number.isFinite(thirdRaw) ? (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '24px', color: thirdRaw >= 0 ? '#6B8E23' : '#F04B55' }}>
                {thirdRaw >= 0 ? '↑' : '↓'}
            </span>
            <span style={{ fontSize: '16px', color: '#000', fontWeight: 'bold' }}>
                {Math.abs(Math.round(thirdRaw))}% in comparison to without Trolley
            </span>
        </div>
    ) : null;


    // ----------------------------------------------------------------
    // TOOLTIP HANDLING
    // ----------------------------------------------------------------
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);

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

    const tooltipContent = (
        <div style={{ fontFamily: 'Arial', fontSize: '12px', lineHeight: '1.4' }}>
            <div>
                Shoppers with Trolley generated <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatFirstValue(firstRaw || 0)}</span> in {KPIvalue}.
            </div>
            <div style={{ marginTop: '6px' }}>
                Averaging <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{Math.round(secondRaw || 0).toLocaleString('en-US')}</span> per shopper.
            </div>
            <div style={{ marginTop: '6px' }}>
                This is <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{Math.abs(Math.round(thirdRaw || 0))}%</span> {thirdRaw && thirdRaw >= 0 ? 'higher' : 'lower'} than those without Trolley.
            </div>
        </div>
    );


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
                backgroundColor: 'white'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => {
                if (!isOverDownloadMenu) {
                    setShowTooltip(false);
                }
            }}
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

            <h2 style={{ color: '#a53241', fontSize: '23px' }}>{KPIvalue} with trolley</h2>

            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
                {isLoading ? '...' : firstDisplay}
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: '46px',
                    right: '10px',
                }}
            >
                {secondDisplay}
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                }}
            >
                {thirdDisplay}
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
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};