import React, { useState, useEffect, useRef } from 'react';
import FerreroMap from '../../../assets/FerreroMap.png';
import replacement from '../../../assets/replacement.png'; // ✅ Added
import DownloadMenu from '../DownloadMenu';
import { DataResponse, Dimension, Measure } from '@embeddable.com/core';

type HeatmapCell = {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  heat: number;
  gridKey: string;
};

type GridCoordinateBoundsEntry = {
  grid: [number, number];
  pixel_bounds: {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
  coordinate_bounds: {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
  coordinate_center: [number, number];
};

type GridJson = {
  grid_coordinate_bounds: Record<string, GridCoordinateBoundsEntry>;
  [key: string]: any;
};

type Props = {
  title?: string;
  body?: string;
  results: DataResponse;
  dimensions: Dimension[];
  metrics: Measure[];
  Kpi: string;
  Explanation?: string;
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
};

const Heatmap: React.FC<Props> = ({
  title,
  body,
  results,
  dimensions,
  metrics,
  Kpi,
  enableDownloadAsCSV,
  enableDownloadAsPNG,
  Explanation
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredHeat, setHoveredHeat] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [gridJson, setGridJson] = useState<GridJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preppingDownload, setPreppingDownload] = useState(false); // ✅ Added
  const [clear, setClear] = useState(false); // ✅ Added

  const S3_JSON_URL =
    'https://cap-dev-data.s3.eu-central-1.amazonaws.com/data-exchange/ferrero_sensor_files/configuration/sensor_image/sensor_9/s9_pixel_map_20251105.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASRZAWKTS24Z3NXJI%2F20251112%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20251112T195756Z&X-Amz-Expires=604800&X-Amz-Signature=be7d05e872e75890ba9b15553b99a600e1e5833cdbfe9216d13e49962d2430ad&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject';

  // --- Load JSON from S3
  useEffect(() => {
    async function loadJson() {
      try {
        setLoading(true);
        const res = await fetch(S3_JSON_URL);
        if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.statusText}`);
        const json = await res.json();
        setGridJson(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJson();
  }, []);

  const { data, isLoading: dbLoading, error: dbError } = results;

  if (loading || dbLoading) return <p>Loading heatmap...</p>;
  if (error) return <p>Error loading grid JSON: {error}</p>;
  if (dbError) return <p>Error loading data: {dbError}</p>;
  if (!gridJson || !gridJson.grid_coordinate_bounds) return <p>No grid JSON data available</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No DB data available</p>;

  // ✅ Replacement behavior (copied from first code)
  if (clear) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {title && <h3>{title}</h3>}
        {body && <p>{body}</p>}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1270 / 628',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        ><div
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '14px',
            zIndex: 1000,
            backgroundColor: 'transparent'
          }}
        >
          <DownloadMenu
            csvOpts={{ chartName: title || 'heatmap', props: { results } }}
            Explanation={props.Explanation}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: title || 'heatmap', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
            clear={clear}
            setClear={setClear}
          />
          </div>
          <img
            src={replacement}
            alt="Replacement"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      </div>
    );
  }

  // --- Step 1: Map DB data to grid bounds
  const heatmapData: HeatmapCell[] = data
    .map((row) => {
      const gridX = Number(row['heatmap_cube.grid_x']);
      const gridY = Number(row['heatmap_cube.grid_y']);
      const key = `grid_${gridX}_${gridY}`;
      const boundsEntry = gridJson.grid_coordinate_bounds[key];
      if (!boundsEntry) return null;

      const heat = Number(row[Kpi === 'Frequency' ? metrics[0].name : metrics[1].name]);
      if (isNaN(heat)) return null;

      return {
        x_min: boundsEntry.pixel_bounds.x_min,
        x_max: boundsEntry.pixel_bounds.x_max,
        y_min: boundsEntry.pixel_bounds.y_min,
        y_max: boundsEntry.pixel_bounds.y_max,
        heat,
        gridKey: key,
      };
    })
    .filter((c): c is HeatmapCell => c !== null);

  // --- Step 2: Map heat values to colors
  const getDynamicColorScale = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const getQuantile = (q: number) => sorted[Math.floor((sorted.length - 1) * q)];
    const low = getQuantile(0.33);
    const mid = getQuantile(0.66);
    return (value: number) => {
      if (value <= low) return '#00b300';
      if (value <= mid) return '#f4d03f';
      return '#f04b55';
    };
  };

  const getColor = getDynamicColorScale(heatmapData.map((c) => c.heat));

  // --- Step 3: Map pixel coordinates to percentages for absolute positioning
  const mapCellToPercent = (x_min: number, x_max: number, y_min: number, y_max: number) => {
    const widthPx = x_max - x_min;
    const heightPx = y_max - y_min;
    return {
      leftPercent: (x_min / 1270) * 100,
      topPercent: (y_min / 628) * 100,
      widthPercent: (widthPx / 1270) * 100,
      heightPercent: (heightPx / 628) * 100,
    };
  };

  // --- Main Render (unchanged UI)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {title && <h3>{title}</h3>}
      {body && <p>{body}</p>}

      <div ref={chartRef} style={{ position: 'relative', width: '100%', aspectRatio: '1270 / 628' }}>
        {(enableDownloadAsCSV || enableDownloadAsPNG) && (
          <div
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '14px',
            zIndex: 1000,
            backgroundColor: 'transparent'
          }}
        >
          <DownloadMenu
            csvOpts={{ chartName: title || 'heatmap', props: { results } }}
            Explanation={Explanation}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: title || 'heatmap', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={setPreppingDownload}
            clear={clear}
            setClear={setClear}
          />
          </div>
        )}

        <img src={FerreroMap} alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {heatmapData.map((cell, i) => {
          const { leftPercent, topPercent, widthPercent, heightPercent } = mapCellToPercent(
            cell.x_min,
            cell.x_max,
            cell.y_min,
            cell.y_max
          );
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                backgroundColor: getColor(cell.heat),
                opacity: 0.9,
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                const rect = chartRef.current?.getBoundingClientRect();
                setTooltipPos({ x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                setHoveredHeat(cell.heat);
              }}
              onMouseLeave={() => {
                setHoveredHeat(null);
                setTooltipPos(null);
              }}
            />
          );
        })}

        {hoveredHeat !== null && tooltipPos && (
          <div
            style={{
              position: 'absolute',
              top: tooltipPos.y + 10,
              left: tooltipPos.x + 10,
              backgroundColor: '#fff',
              padding: '6px 10px',
              borderRadius: '6px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              fontSize: '12px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {Kpi === 'Frequency' ? `Frequency: ${hoveredHeat}` : `Dwell Time: ${Math.floor(hoveredHeat)}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Heatmap;
