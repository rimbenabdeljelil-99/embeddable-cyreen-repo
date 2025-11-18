/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState, useRef } from 'react';
import { DataResponse, Dimension, Measure } from '@embeddable.com/core';
import { translateText } from '../translateText';
import DownloadMenu from '../DownloadMenu';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
interface Props {
    title?: string;
    metrics?: Measure[];
    dimensions?: Dimension[];
    results: DataResponse;
    clientContext?: {
        language?: string;
    };
    enableDownloadAsCSV?: boolean;
    enableDownloadAsPNG?: boolean,
    Despar?: boolean;
    Explanation?: string;
}

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
export default (props: Props) => {
    const {
        title, metrics, results, clientContext, dimensions, Despar,
        enableDownloadAsCSV,
        enableDownloadAsPNG, Explanation
    } = props;
    const { isLoading, data } = results;

    // ----------------------------------------------------------------
    // TRANSLATIONS
    // ----------------------------------------------------------------
    const [translatedTitle, setTranslatedTitle] = useState<string | undefined>(title);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isOverDownloadMenu, setIsOverDownloadMenu] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const [preppingDownload, setPreppingDownload] = useState(false);

    useEffect(() => {
        if (!clientContext?.language) return;

        (async () => {
            try {
                if (title) setTranslatedTitle(await translateText(title, clientContext.language));
            } catch (err) {
                // graceful degradation – keep original strings
                /* eslint-disable-next-line no-console */
                console.error('Translation failed', err);
            }
        })();
    }, [title, clientContext?.language]);

    // ----------------------------------------------------------------
    // DATA EXTRACTION AND FORMATTING
    // ----------------------------------------------------------------
    const firstMetric = metrics?.[0];
    const secondMetric = metrics?.[1];
    const thirdMetric = metrics?.[2];

    const firstRaw = firstMetric ? +data?.[0]?.[firstMetric.name] : undefined;
    const secondRaw = secondMetric ? +data?.[0]?.[secondMetric.name] : undefined;
    const thirdRaw = thirdMetric ? +data?.[0]?.[thirdMetric.name] : undefined;

    // Format number with commas if >= 1000
    const formatNumber = (num: number | undefined) => {
        if (!Number.isFinite(num) || num === undefined) return 'No data';

        return Despar
            ? num.toLocaleString('de-DE') // European style: 0,5 and 178.598
            : num >= 1000
                ? num.toLocaleString('en-US') // Default: US style
                : num.toString();
    };


    // Format date from YYYY-MM-DD to DD.MM.YYYY
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'No date';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString; // return original if format is unexpected
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    const firstDisplay = formatNumber(firstRaw);
    const secondDisplay = formatNumber(secondRaw);
    const thirdDisplay = formatNumber(thirdRaw);

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
        <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#000' }}>
            {title === 'Total Campaigns' && (
                <div>
                    <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#AF3241' }}>{firstDisplay}</strong> campaigns ran, are running or are planned to run on your Retail Media Network.
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <strong>Period:</strong>
                        <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {formatDate(data?.[0]?.[metrics?.[1]?.name])}</span> to
                        <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {formatDate(data?.[0]?.[metrics?.[2]?.name])}</span>
                    </div>

                    <div>
                        <strong>Campaigns & their status:</strong>
                        <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                            <li>Live: <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{data?.[0]?.[metrics?.[3]?.name]}</span></li>
                            <li>Completed: <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{data?.[0]?.[metrics?.[4]?.name]}</span></li>
                            <li>Planned: <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{data?.[0]?.[metrics?.[5]?.name]}</span></li>
                        </ul>
                    </div>
                </div>

            )}
            {title === 'Live Campaigns' && (
                firstDisplay === '0' ? (
                    <div>
                        No campaigns are currently running in your Retail Media Network.
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#AF3241' }}>{firstDisplay}</strong> campaigns are currently running on your Retail Media Network.
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <strong>Period:</strong>
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {formatDate(data?.[0]?.[metrics?.[1]?.name])}</span> to
                            <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {formatDate(data?.[0]?.[metrics?.[2]?.name])}</span>
                        </div>

                        <div>
                            <strong>Campaigns:</strong>
                            <ul style={{
                                paddingLeft: '20px',
                                margin: '6px 0',
                                listStyleType: 'disc'
                            }}>
                                {data?.[0]?.[metrics?.[3]?.name]?.split(',')
                                    .map((campaign, index) => (
                                        <li key={index} style={{ color: '#AF3241', fontWeight: 'bold' }}>
                                            {campaign.trim()}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                )
            )}
            {title === 'Total Impressions' && (
                <div >
                    <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{firstDisplay}</span> impressions were generated in your Retail Media Network
                    <br />
                    <strong>Period:</strong> <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatDate(data?.[0]?.[metrics?.[1]?.name])}</span> to <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatDate(data?.[0]?.[metrics?.[2]?.name])}</span>

                </div>
            )}
            {title === 'Average Daily Impressions' && (
                <div >
                    <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{firstDisplay}</span> average daily impressions were generated in your Retail Media Network
                    <br />
                    <strong>Period:</strong> <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatDate(data?.[0]?.[metrics?.[1]?.name])}</span> to <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatDate(data?.[0]?.[metrics?.[2]?.name])}</span>

                </div>
            )}
            {['Smart Stores', 'Smart Screens', 'Smart Devices'].includes(title || '') && (
                <>
                    {title === 'Smart Stores' && (
                        <>
                            <div>
                                <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatNumber(firstRaw)}</span>
                                {firstRaw === 1 ? ' smart store is' : ' smart stores are'} included in your Retail Media Network.
                            </div>
                            <div>
                                {firstRaw === 1 ? 'It is' : 'They are'} equipped with
                                <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {secondDisplay}</span>
                                {secondRaw === 1 ? ' smart screen' : ' smart screens'}
                                {thirdRaw !== 0 && (
                                    <>
                                        {' and '}
                                        <span style={{ fontWeight: 'bold', color: '#AF3241' }}> {thirdDisplay}</span>
                                        {thirdRaw === 1 ? ' smart device' : ' smart devices'}
                                    </>
                                )}.
                            </div>
                        </>
                    )}

                    {(title === 'Smart Screens' || title === 'Smart Devices') && (
                        <div>
                            <>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{formatNumber(firstRaw)} </span>
                                    {title.toLowerCase()} {firstRaw === 1 ? 'is' : 'are'} part of your Retail Media Network.
                                </div>
                                <div>
                                    {firstRaw === 1 ? 'It is' : 'They are'} installed in <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{secondDisplay}</span>
                                    {secondRaw === 1 ? ' smart store' : ' smart stores'}.
                                </div>
                            </>
                        </div>
                    )}
                </>
            )}
            {!['Total Campaigns', 'Live Campaigns', 'Total Impressions', 'Average Daily Impressions', 'Smart Stores', 'Smart Screens', 'Smart Devices'].includes(title || '') && (
                <div >
                    Current Value: <span style={{ fontWeight: 'bold', color: '#AF3241' }}>{firstDisplay}</span>
                </div>
            )}
        </div>

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
                            margin: 0,
                            color: 'white'
                        }}
                    />
                </div>
            )}

            {translatedTitle && (
                <h2 style={{ color: title === 'Smart Stores' ? 'white' : '#a53241', fontSize: '23px' }}>{translatedTitle}</h2>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: title === 'Smart Stores' ? 'white' : '#333942'
                }}>
                    {isLoading ? '...' : firstDisplay}
                </div>
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