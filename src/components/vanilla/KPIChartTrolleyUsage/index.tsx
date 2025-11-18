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
    Explanation?: string
}

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
export default (props: Props) => {
    const {
        title, metrics, results, clientContext,
        enableDownloadAsCSV,
        enableDownloadAsPNG, Explanation
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
    const firstMetric = metrics?.[0];
    const secondMetric = metrics?.[1];

    const firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
    const secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;
    const storeName = data?.[0]?.[metrics?.[2]?.name] || ''; // Get the third value (store name)

    // Format first value based on title
    const firstDisplay = Number.isFinite(firstRaw) ? (
        <span>
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#333942' }}>
                {title === 'Usage (%)'
                    ? `${firstRaw.toFixed(0)}% `
                    : title === 'Trolley Ratio'
                        ? `${firstRaw.toFixed(0)}% `
                        : `${firstRaw.toFixed(0)} `}
            </span>
            <span style={{ fontSize: '23px', color: '#333942' }}>
                {title === 'Usage (%)'
                    ? 'trolleys used'
                    : title === 'Trolley Ratio'
                        ? 'with trolley'
                        : 'trolleys used'}
            </span>
        </span>
    ) : 'No data';


    // color logic for second value
    const secondColour = title === 'Trolley Ratio' ? '#6B8E23' : '#F04B55';

    // helper for rendering uplift string
    const renderUplift = () => {
        if (!Number.isFinite(secondRaw)) return null;

        const value = (title === 'Usage (%)' || title === 'Trolley Ratio')
            ? `${secondRaw.toFixed(0)}% `
            : `${secondRaw.toFixed(0)} `;

        return (
            <span>
                <span style={{ color: secondColour, fontWeight: 'bold' }}>{value}</span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>
                    {title === 'Trolley Ratio' ? 'without trolley' : 'trolleys unused'}
                </span>
            </span>
        );
    };


    // ----------------------------------------------------------------
    // TOOLTIP HANDLING
    // ----------------------------------------------------------------
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);

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

    const tooltipContent =
        title === 'Usage (%)' ?
            (
                <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                    <div>In
                        <span style={{ fontWeight: 'bold', color: '#AF3241', marginBottom: '5px' }}> {storeName},</span>
                        <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {firstRaw?.toFixed(0)}%</span> of the trolleys were used and
                        <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {secondRaw?.toFixed(0)}%</span> of the trolleys were unused
                    </div>
                    <div style={{ marginTop: '10px', color: '#62626e' }}>
                        Explanation: Trolley Usage provides the information on how many of the total trolleys are being used.
                    </div>
                </div >
            )
            : title === 'Trolley Ratio' ?
                (
                    <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                        <div>
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{firstRaw?.toFixed(0)}%</span> of the shoppers used the Trolley and
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {secondRaw?.toFixed(0)}%</span> shopped without Trolley.
                        </div>
                        <div style={{ marginTop: '10px', color: '#62626e' }}>
                            Explanation: Trolley Ratio provides the information on the number of shoppers using a trolley for their purchase.
                        </div>
                    </div>
                )
                :
                (
                    <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
                        <div>In
                            <span style={{ fontWeight: 'bold', color: '#AF3241', marginBottom: '5px' }}> {storeName},</span>
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {firstRaw?.toFixed(0)}</span> trolleys were used and
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {secondRaw?.toFixed(0)}</span> trolleys were unused
                        </div>
                        <div style={{ marginTop: '10px', color: '#62626e' }}>
                            Explanation: Trolley Usage provides the information on how many of the total trolleys are being used.
                        </div>
                    </div>
                )

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