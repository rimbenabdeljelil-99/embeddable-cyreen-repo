import React, { useEffect, useState, useRef } from 'react';
import { Dataset, Dimension, Measure, DataResponse } from '@embeddable.com/core';
import { DivIcon } from 'leaflet';
import { LatLngExpression, LatLngBounds, Map } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { FaHome } from 'react-icons/fa';
import * as d3 from 'd3';
import Container from '../vanilla/Container';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';

type Props = {
    ds: Dataset;
    latDim: Dimension;
    lonDim: Dimension;
    valueMetric1: Dimension;
    valueMetric2: Measure;
    results: DataResponse;
    title: string;
    showLabels?: boolean;
    Despar?: boolean;
    onToggleLabels?: (show: boolean) => void;
    Explanation?: string 
};

const FitMapBounds = ({ markers, homeTrigger }: { markers: { position: LatLngExpression }[], homeTrigger: boolean }) => {
    const map = useMap();
    const initialBounds = useRef<LatLngBounds | null>(null);

    useEffect(() => {
        if (markers.length > 0 && map) {
            const bounds = new LatLngBounds(markers.map(marker => marker.position));

            if (!initialBounds.current) {
                initialBounds.current = bounds;
            }

            map.fitBounds(bounds, {
                padding: [35, 35],
                maxZoom: 16
            });
        }
    }, [map, markers, homeTrigger]);

    return null;
};

const HomeButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '50%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                zIndex: 1000,
            }}
        >
            <FaHome size={20} color="#AF3241" />
        </button>
    );
};

export default (props: Props) => {
    const {
        ds, latDim, lonDim, valueMetric1, valueMetric2, results, title, Despar, Explanation
    } = props;

    const [showLabels, setShowLabels] = useState(props.showLabels || false);
    const { isLoading, error, data } = results;
    const [homeTrigger, setHomeTrigger] = useState(false);

    const updatedProps = {
        ...props,
        showLabels,
        onToggleLabels: setShowLabels
    };

    const [markers, setMarkers] = useState<
        { position: LatLngExpression; popupContent: string; size: number; label: string }[]
    >([]);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const initialBounds = useRef<LatLngBounds | null>(null);

    const handleHomeClick = () => {
        setHomeTrigger(prev => !prev);
    };

    useEffect(() => {
        if (!isLoading && !error && data) {
            const maxValue = Math.max(...data.map((point: any) => point[valueMetric2.name] || 0));

            const newMarkers = data
                .filter((point: { [key: string]: any }) =>
                    point[latDim.name] !== null && point[lonDim.name] !== null
                )
                .map((point: { [key: string]: any }) => {
                    const value1 = point[valueMetric1.name] ?? "Unknown";
                    const value2 = point[valueMetric2.name] ?? 0;
                    const dotLocale = d3.formatLocale({
                        decimal: ',',
                        thousands: '.',
                        grouping: [3],
                        currency: ["", ""]
                    });

                    let popupContent;
                    if (title === 'Locations') {
                        popupContent = `
            <span style="font-family: Arial; font-size: 12px; color: black;">
                Store <span style="color: #AF3241; font-weight: bold">${value1}</span> 
                located at ZIP-code <span style="color: #AF3241; font-weight: bold">${value2}</span>
            </span>
            `;
                    } else {
                        popupContent = `
            <span style="font-family: Arial; font-size: 12px; color: black;">
                <span style="color: #AF3241; font-weight: bold">${value1}</span> generated 
                <span style="color: #AF3241; font-weight: bold">${Despar ? dotLocale.format(",")(value2) : d3.format(",")(value2)}</span> Impressions.
            </span>
            `;
                    }

                    // 🔹 Fixed size if Locations, proportional otherwise
                    const size = title === 'Locations'
                        ? 14 // 👈 all same size
                        : maxValue > 0
                            ? 10 + (20 * value2) / maxValue
                            : 10;

                    return {
                        position: [point[latDim.name], point[lonDim.name]],
                        popupContent,
                        size,
                        label: value1,
                    };
                });


            setMarkers(newMarkers);
        }
    }, [isLoading, error, data, latDim, lonDim, valueMetric1, valueMetric2, title]);

    const handleMarkerHover = (e: any, markerContent: string, isHovered: boolean) => {
        if (!tooltipRef.current) return;

        tooltipRef.current.innerHTML = markerContent;
        tooltipRef.current.style.display = isHovered ? 'block' : 'none';

        if (e && e.latlng) {
            const { lat, lng } = e.latlng;
            const point = mapRef.current?.latLngToContainerPoint([lat, lng]);

            if (point) {
                const tooltip = tooltipRef.current;
                tooltip.style.display = 'block';
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;
                const mapContainer = mapRef.current?.getContainer();
                const containerWidth = mapContainer?.offsetWidth || window.innerWidth;
                const containerHeight = mapContainer?.offsetHeight || window.innerHeight;

                let left = point.x + 10;
                let top = point.y - 17;

                if (left + tooltipWidth > containerWidth) {
                    left = point.x - tooltipWidth - 10;
                }

                if (left < 0) {
                    left = 10;
                }

                if (top + tooltipHeight > containerHeight) {
                    top = point.y - tooltipHeight - 10;
                }

                if (top < 0) {
                    top = 10;
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            }
        }
    };

    return (
        <Container
            {...updatedProps}
            className="overflow-y-hidden"
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#fff',
                    position: 'relative',
                }}
            >
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={2}
                    scrollWheelZoom={true}
                    attributionControl={false}
                    style={{
                        width: '100%',
                        height: '90%',
                        borderRadius: '8px',
                    }}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmltMDQiLCJhIjoiY203eGprczltMDZ6MTJrc2NhbTE0NWJnNSJ9.jtSf8YJjqLcSK1ubO_2qww"
                        attribution=""
                    />

                    {markers.length > 10 ? (
                        <MarkerClusterGroup
                            iconCreateFunction={(cluster) => {
                                const childCount = cluster.getChildCount();
                                return new DivIcon({
                                    html: `<div><span>${childCount}</span></div>`,
                                    className: 'marker-cluster-custom',
                                    iconSize: [40, 40]
                                });
                            }}
                        >
                            {markers.map((marker, index) => (
                                <Marker
                                    key={index}
                                    position={marker.position}
                                    icon={new DivIcon({
                                        className: 'custom-marker',
                                        iconSize: [marker.size, marker.size],
                                        iconAnchor: [marker.size / 2, marker.size / 2],
                                        popupAnchor: [0, -marker.size / 2],
                                        html: `
                                    <div class="marker-container">
                                        <div class="marker-circle" 
                                             style="width: ${marker.size}px; height: ${marker.size}px;">
                                        </div>
                                        ${showLabels ? `
                                        <div class="marker-label ${title === 'Locations' ? 'small-label' : ''}">
                                            ${marker.label}
                                        </div>
                                        ` : ''}
                                    </div>
                                    `,
                                    })}
                                    eventHandlers={{
                                        mouseover: (e) => {
                                            handleMarkerHover(e, marker.popupContent, true);
                                            e.target.getElement()?.querySelector('.marker-circle')?.classList.add('hovered');
                                        },
                                        mouseout: (e) => {
                                            handleMarkerHover(null, '', false);
                                            e.target.getElement()?.querySelector('.marker-circle')?.classList.remove('hovered');
                                        },
                                    }}
                                />
                            ))}
                        </MarkerClusterGroup>
                    ) : (
                        markers.map((marker, index) => (
                            <Marker
                                key={index}
                                position={marker.position}
                                icon={new DivIcon({
                                    className: 'custom-marker',
                                    iconSize: [marker.size, marker.size],
                                    iconAnchor: [marker.size / 2, marker.size / 2],
                                    popupAnchor: [0, -marker.size / 2],
                                    html: `
                                <div class="marker-container">
                                    <div class="marker-circle" 
                                         style="width: ${marker.size}px; height: ${marker.size}px;">
                                    </div>
                                    ${showLabels ? `
                                    <div class="marker-label ${title === 'Locations' ? 'small-label' : ''}">
                                        ${marker.label}
                                    </div>
                                    ` : ''}
                                </div>
                                `,
                                })}
                                eventHandlers={{
                                    mouseover: (e) => {
                                        handleMarkerHover(e, marker.popupContent, true);
                                        e.target.getElement()?.querySelector('.marker-circle')?.classList.add('hovered');
                                    },
                                    mouseout: (e) => {
                                        handleMarkerHover(null, '', false);
                                        e.target.getElement()?.querySelector('.marker-circle')?.classList.remove('hovered');
                                    },
                                }}
                            />
                        ))
                    )}

                    <FitMapBounds markers={markers} homeTrigger={homeTrigger} />
                    <HomeButton onClick={handleHomeClick} />
                </MapContainer>

                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        backgroundColor: 'rgb(255,255,255)',
                        color: 'black',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        display: 'none',
                        pointerEvents: 'none',
                        zIndex: 9999,
                        maxWidth: '300px',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        fontSize: '12px',
                        fontFamily: 'Arial, sans-serif',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                />

                <style>{`
    /* Specifically remove cluster hover polygon styling */
    .leaflet-marker-icon.leaflet-interactive {
        outline: none !important;
        border: none !important;
    }
    .leaflet-marker-icon.leaflet-interactive path {
        stroke: none !important;
        fill: none !important;
    }

    /* Remove spiderfy connector lines when expanding clusters */
    .marker-cluster-spiderfy-leg {
        display: none !important;
    }

    /* Remove default cluster polygon styling */
    .marker-cluster div {
        background-color: transparent !important;
        background-image: none !important;
    }

    .marker-container {
        text-align: center;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .marker-circle {
        background-color: #f04b55;
        border-radius: 50%;
        margin: 0 auto;
        transition: background-color 0.2s ease;
        border: 2px solid white;
    }

    .marker-circle.hovered {
        background-color: #AF3241 !important;
    }

    .marker-label {
        font-size: 14px;
        color: #333;
        margin-top: 2px;
        font-weight: 500;
        white-space: nowrap;
        font-family: Arial, sans-serif;
        text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;
    }

    .small-label {
        font-size: 12px !important;
        transform: translateY(-5px);
    }

    /* Cluster styling */
    .marker-cluster-custom {
        background-color: rgba(240, 75, 85, 0.6);
        border-radius: 50%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .marker-cluster-custom div {
        background-color: rgba(175, 50, 65, 0.8);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        font-family: Arial, sans-serif;
    }

    .marker-cluster-custom span {
        color: white;
    }
`}</style>
            </div>
        </Container>
    );
};