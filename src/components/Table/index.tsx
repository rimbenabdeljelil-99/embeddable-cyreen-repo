import React, { useRef, useEffect, useState } from 'react';
import { Dataset, Dimension, Measure } from "@embeddable.com/core";
import { DataResponse } from "@embeddable.com/core";
import DownloadMenu from '../vanilla/DownloadMenu';

// Props for the table component
type Props = {
  ds: Dataset;
  columns: (Dimension | Measure)[]; // Columns passed as props
  results: DataResponse; // Results passed as props
  enableDownloadAsPNG?: boolean;
  enableDownloadAsCSV?: boolean;
  title?: string;
  Despar?: boolean;
  Explanation?: string
};

export default (props: Props) => {
  const {
    ds, columns, results, enableDownloadAsCSV,
    enableDownloadAsPNG, title, Despar, Explanation
  } = props;
  const { isLoading, data, error } = results;

  const [preppingDownload, setPreppingDownload] = useState(false); // Add state for download preparation
  const chartRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message || "An error occurred"}</div>;
  }

  const safeData = data || [];

  // Identify the second column (assuming it's at index 1)
  const secondColumn = columns[1]?.name;
  if (!secondColumn) {
    return <div>Error: Second column not found</div>;
  }

  // Calculate the sum of the second column values
  const totalValue = safeData.reduce((sum, row) => {
    const value = parseFloat(row[secondColumn]) || 0; // Ensure number conversion
    return sum + value;
  }, 0);

  console.log("Second Column:", totalValue);

  return (
    <div className="table-container" ref={chartRef}>
  {/* Show loading indicator if new data is loading */}
  {isLoading && (
    <div style={{ padding: "8px 12px", fontStyle: "italic" }}>Loading new data...</div>
  )}

  {/* Download menu */}
  {(enableDownloadAsCSV || enableDownloadAsPNG) && (
    <div style={{
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
    }}>
      <DownloadMenu
        title={"Smart Stores"}
        csvOpts={{
          chartName: props.title || 'chart',
          props: { ...props, results: results },
        }}
        Explanation={Explanation}
        enableDownloadAsCSV={enableDownloadAsCSV}
        enableDownloadAsPNG={enableDownloadAsPNG}
        pngOpts={{ chartName: props.title || 'chart', element: chartRef.current }}
        preppingDownload={preppingDownload}
        setPreppingDownload={setPreppingDownload}
        style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0 }}
      />
    </div>
  )}

  {/* Table */}
  <table className="table">
    <thead className="table-header">
      <tr>
        <th colSpan={columns.length + 1} className="table-header-cell title">{title}</th>
      </tr>
    </thead>
    <tbody>
      {safeData.map((row, index) => (
        <tr key={index} className={`table-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}>
          {columns.map((col, colIndex) => (
            <td key={col.name} className={`table-cell ${colIndex === 0 ? "first-column" : ""}`}>
              {row[col.name] !== undefined
                ? colIndex === 1
                  ? parseFloat(row[col.name]) > 999
                    ? Despar
                      ? parseFloat(row[col.name]).toLocaleString("de-DE")
                      : parseFloat(row[col.name]).toLocaleString("en-US")
                    : row[col.name]
                  : row[col.name]
                : "N/A"}
            </td>
          ))}
          <td className="table-cell">
            {totalValue > 0
              ? ((parseFloat(row[secondColumn] || 0) / totalValue) * 100).toFixed(0) + "%"
              : "0.00%"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
      {/* Component Styles */}
      <style jsx>{`
        .table-container {
          overflow: hidden;
          height:100%;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          
          border: 1px solid #ccc,
        }

        .table {
          width: 100%;
          height:100%;
          font-family: Arial, sans-serif;
          font-size: 13px;
          border-collapse: collapse;
          border-radius: 8px;
          border: 1px solid #ccc,
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }

        .table-header {
          background: linear-gradient(to right, #af3241, #af3241);
          color: white;
        }

        .table-header-cell {
          padding: 12px;
          text-align: left;
          text-transform: uppercase;
          font-weight: bold;
          color: white;
        }

        .table-header-cell.title {
          font-size: 23px;
          text-align: left;
          padding: 20px 12px;
          font-family: Arial, sans-serif;
          color: white;
          font-weight: normal; /* Changed from bold to normal */
          text-transform: none; /* Changed from uppercase to none */
        }


        .table-row {
          transition: background-color 0.2s ease; /* Smooth color transition between rows */
        }

        .even-row {
          background-color: #af3241; /* Even row color */
        }

        .odd-row {
          background-color: black; /* Odd row color */
        }

        .table-cell {
          padding: 12px;
          text-align: left;
          color: white;
        }

        .first-column {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

