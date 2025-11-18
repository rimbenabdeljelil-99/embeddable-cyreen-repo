import React, { useRef, useState, useEffect } from "react";
import Title from "../Title";
import Description from "../Description";
import { Dimension, Measure, DataResponse } from "@embeddable.com/core";
import FerreroMap from "../../../assets/FerreroMap.png";
import DownloadMenu from "../DownloadMenu";

type Props = {
  title?: string;
  body?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  metric?: Measure;
  AreaReader?: Dimension;
  results: DataResponse;
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
};

const AREA_MAP: Record<
  number,
  { name: string; x: number; y: number }
> = {
  101: { name: "Entrance Area", x: 794, y: 819 },
  102: { name: "Second Area", x: 563, y: 136 },
  103: { name: "Wine Area", x: 189, y: 798 },
};

export default function ProgetrankeAreas(props: Props) {
  const {
    title,
    body,
    titleFontSize,
    bodyFontSize,
    results,
    metric,
    enableDownloadAsCSV,
    enableDownloadAsPNG,
  } = props;

  const { data = [] } = results || {};
  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
   const [preppingDownload, setPreppingDownload] = useState(false);

  // Base dimensions of the image (for scaling)
  const BASE_WIDTH = 1354;
  const BASE_HEIGHT = 956;

  useEffect(() => {
    const updateSize = () => {
      if (chartRef.current) {
        setContainerWidth(chartRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Scale factor for responsiveness
  const scale = containerWidth / BASE_WIDTH;

  // Extract area → metric value
  const areaData = data.map((item) => {
    const id = Number(item[props.AreaReader?.name || "id_area_reader"]);
    const value = Number(item[metric?.name || "value"]);
    return { id, value };
  });

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "relative",
    border: "1px solid #ccc",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.15)",
  };

  const imageWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "auto",
    marginTop: "15px",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: "6px",
  };

  const boxStyle = (x: number, y: number): React.CSSProperties => ({
    position: "absolute",
    left: `${(x / BASE_WIDTH) * 100}%`,
    top: `${(y / BASE_HEIGHT) * 100}%`,
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "2px solid #AF3241",
    borderRadius: "10px",
    padding: "10px 15px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    minWidth: "180px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  });

  return (
    <div ref={chartRef} style={containerStyle}>
      {title && (
        <h3
          style={{
            fontSize: titleFontSize ? `${titleFontSize}px` : "20px",
            color: "#a53241",
            fontFamily: "Arial, sans-serif",
            margin: 0,
          }}
        >
          {title}
        </h3>
      )}
      {body && (
        <p
          style={{
            fontSize: bodyFontSize ? `${bodyFontSize}px` : "14px",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          {body}
        </p>
      )}

      <div style={imageWrapperStyle}>
        <img src={FerreroMap} alt="Progetränke Map" style={imageStyle} />
        {areaData.map(({ id, value }) => {
          const area = AREA_MAP[id];
          if (!area) return null;

          return (
            <div key={id} style={boxStyle(area.x, area.y)}>
              In {area.name}: <br />
              <span style={{ color: "#AF3241" }}>
                {value.toLocaleString("en-US")}
              </span>{" "}
              shoppers
            </div>
          );
        })}
      </div>

      {(enableDownloadAsCSV || enableDownloadAsPNG) && (
        <div style={{ position: "absolute", top: 15, right: 15 }}>
          <DownloadMenu
            csvOpts={{
              chartName: props.title || 'chart',
              props: {
                ...props,
                results: results,
              },
            }}
            enableDownloadAsCSV={enableDownloadAsCSV}
            enableDownloadAsPNG={enableDownloadAsPNG}
            pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
            preppingDownload={preppingDownload}
            setPreppingDownload={(prepping) => {
              setPreppingDownload(prepping);
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
    </div>
  );
}
