import { DataResponse } from '@embeddable.com/core';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from "react";
import IconDownloadCSV from '../icons/DownloadCSV';
import IconDownloadPNG from '../icons/DownloadPNG';
import QuestionMarkIcon from '../icons/QuestionMark';
import IconVerticalEllipsis from '../icons/VerticalEllipsis';
import IconHorizontalEllipsis from '../icons/HorizontalEllipsis';
import downloadAsCSV from '../util/downloadAsCSV';
import IconEye from '../icons/Eye';
import IconEyeOff from '../icons/EyeOff';
import IconPercentage from '../icons/Percentage';
import downloadAsPNG from '../util/downloadAsPNG';
import { ContainerProps } from './Container';

interface CSVProps extends ContainerProps {
  results?: DataResponse | DataResponse[];
  prevResults?: DataResponse;
}

type Props = {
  title?: string;
  csvOpts?: { chartName: string; props: CSVProps; };
  enableDownloadAsCSV?: boolean;
  enableDownloadAsPNG?: boolean;
  pngOpts?: { chartName: string; element: HTMLDivElement | null; };
  preppingDownload: boolean;
  setPreppingDownload: Dispatch<SetStateAction<boolean>>;
  showLabels?: boolean;
  onToggleLabels?: (show: boolean) => void;
  Table?: boolean;
  Explanation?: string;
  onCloseExplanation?: () => void;

  // 🆕 Added Clear functionality
  clear?: boolean;
  setClear?: Dispatch<SetStateAction<boolean>>;
  Percentage?: boolean;
  setPercentage?: Dispatch<SetStateAction<boolean>>; // 🆕 add this
};

const DownloadMenu: React.FC<Props> = (props) => {
  const {
    csvOpts,
    enableDownloadAsCSV,
    enableDownloadAsPNG,
    pngOpts,
    preppingDownload,
    setPreppingDownload,
    showLabels,
    onToggleLabels,
    title,
    Table,
    Explanation,
    onCloseExplanation,
    clear,
    setClear
  } = props;

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isDownloadStarted, setIsDownloadStarted] = useState<boolean>(false);
  const refFocus = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDownloadStarted && preppingDownload) {
      if (!pngOpts) {
        console.error('No PNG options supplied');
        return;
      }
      const { chartName, element } = pngOpts;
      if (element) {
        const cleanedChartName = chartName.replace(/([^a-zA-Z0-9 ]+)/gi, '-');
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setTimeout(() => {
          downloadAsPNG(element, `Cyreen-CAP-Explorer-${cleanedChartName}-${formattedDate}.png`, setPreppingDownload);
        }, 200);
      }
      setIsDownloadStarted(false);
    }
  }, [isDownloadStarted, pngOpts, preppingDownload, setPreppingDownload]);

  const beautifyHeader = (key: string): string => {
    const field = key.includes('.') ? key.split('.').pop()! : key;
    return field
      .split('_')
      .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toUpperCase()))
      .join(' ');
  };

  const roundAndRenameKeys = (obj: any) => {
    const transformed: Record<string, any> = {};
    for (const key in obj) {
      let value = obj[key];
      const lowerKey = key.toLowerCase();
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        if (value.endsWith('T00:00:00.000')) {
          value = value.split("T")[0];
        } else if (key.toLowerCase().includes('hour')) {
          const date = new Date(value);
          value = date.getHours().toString().padStart(2, '0');
        } else if (key.toLowerCase().includes('timestamp')) {
          value = value.split("T")[0];
        }
      } else if (value !== null && value !== '' && !isNaN(value)) {
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (lowerKey.includes('impression')) {
          value = Math.round(num);
        } else {
          value = Number.isInteger(num) ? num : num.toFixed(2);
        }
      }
      transformed[beautifyHeader(key)] = value;
    }
    return transformed;
  };

  const cleanColumnTitle = (title: string): string => {
    let newTitle = title;
    newTitle = newTitle.replace(/round|despar|original|only|no negative|bool|euros|base|absolute not minus|absolute max limit/gi, '');
    newTitle = newTitle.replace(/quote used percent/gi, 'Used Ratio');
    newTitle = newTitle.replace(/quote unused percent/gi, 'Unused Ratio');
    newTitle = newTitle.replace(/impression unfiltered calculation|total impressions/gi, 'Impressions');
    newTitle = newTitle.replace(/content name/gi, 'Visual');
    newTitle = newTitle.replace(/name campaign measure/gi, 'Name Campaign');
    newTitle = newTitle.replace(/date min/gi, 'Start Date');
    newTitle = newTitle.replace(/date max/gi, 'End Date');
    newTitle = newTitle.replace(/Dow/gi, 'Weekday');
    newTitle = newTitle.replace(/temp/gi, 'Temperature');
    newTitle = newTitle.replace(/percentage ed/gi, '(in %)');
    newTitle = newTitle.replace(/\d+/g, '');
    return beautifyHeader(newTitle.trim().replace(/_+/g, ' '));
  };

  const cleanCSVData = (data: any[]) => {
    if (!data || data.length === 0) return data;
    let keys = Object.keys(data[0]).filter((key) => !/agg|sort|tftf/i.test(key));
    keys = keys.filter((key) => data.some((row) => row[key] !== null && row[key] !== ''));
    const cleanedKeys = keys.map((key) => cleanColumnTitle(key));
    const uniqueKeys: string[] = [];
    const seenData: string[] = [];
    cleanedKeys.forEach((col, idx) => {
      const colData = JSON.stringify(data.map((row) => row[keys[idx]]));
      if (!seenData.includes(colData)) {
        seenData.push(colData);
        uniqueKeys.push(keys[idx]);
      }
    });
    return data.map((row) => {
      const newRow: Record<string, any> = {};
      uniqueKeys.forEach((origKey) => {
        newRow[cleanColumnTitle(origKey)] = row[origKey];
      });
      return newRow;
    });
  };

  const handleExplanationClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExplanation(!showExplanation);
    setShowMenu(false);
  };

  const handleCSVClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!csvOpts) {
      console.error('No CSV options supplied');
      return;
    }
    const { chartName, props: csvProps } = csvOpts;
    let data: DataResponse['data'] = [];
    if (Array.isArray(csvProps.results)) {
      data = csvProps.results.reduce((acc: DataResponse['data'] = [], result) => {
        if (result?.data) {
          acc.push(...result.data.map(roundAndRenameKeys));
        }
        return acc;
      }, []);
    } else {
      data = csvProps.results?.data?.map(roundAndRenameKeys) || [];
    }
    const cleanedData = cleanCSVData(data);
    const cleanedChartName = chartName.replace(/([^a-zA-Z0-9 ]+)/gi, '-');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const filename = `Cyreen-CAP-Explorer-${cleanedChartName}-${formattedDate}`;
    downloadAsCSV(csvProps, cleanedData, csvProps.prevResults?.data, filename, setPreppingDownload);
  };

  const handlePNGClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setPreppingDownload(true);
    setIsDownloadStarted(true);
  };

  const handleToggleLabels = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleLabels) onToggleLabels(!showLabels);
    setShowMenu(false);
  };

  // 🆕 Handle Clear
  const handleClearClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (setClear) setClear(!clear);
    setShowMenu(false);
  };

  const handleSetShow = () => setShowMenu(!showMenu);

  if (!enableDownloadAsCSV && !enableDownloadAsPNG) return;

  return (
    <>
      <div className="absolute top-0 right-0 z-5 flex items-center justify-end space-x-2">
        <div onClick={handleSetShow} className="cursor-pointer relative w-4 h-4 flex justify-center">
          {!preppingDownload && (Table ? (
            <IconHorizontalEllipsis className="text-white cursor-pointer hover:opacity-100 opacity-50 w-full h-full" />
          ) : (
            <IconVerticalEllipsis className={`cursor-pointer hover:opacity-100 opacity-50 w-full h-full ${title === 'Smart Stores' || title === 'Highest Average' || (clear !== undefined && clear == false)
 ? 'text-white' : 'text-[#474752]'}`} />
          ))}
          {showMenu && (
            <>
              <div className="absolute bg-white flex items-center right-0 p-4 rounded shadow-md top-6 w-40 whitespace-nowrap">
                <ul className="w-full space-y-2">
                  {Explanation && (
                    <li>
                      <a onMouseDown={handleExplanationClick} className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full">
                        <QuestionMarkIcon className="flex-shrink-0 w-4 h-4" />
                        <span>About this Visual</span>
                      </a>
                    </li>
                  )}
                  <li>
                    <a onMouseDown={handleCSVClick} className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full">
                      <IconDownloadCSV className="flex-shrink-0 w-4 h-4" />
                      <span>Download CSV</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onMouseDown={handlePNGClick} className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full">
                      <IconDownloadPNG className="flex-shrink-0 w-4 h-4" />
                      <span>Download PNG</span>
                    </a>
                  </li>
                  {showLabels !== undefined && onToggleLabels && (
                    <li>
                      <a href="#" onMouseDown={handleToggleLabels} className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full">
                        {showLabels ? (
                          <>
                            <IconEyeOff className="flex-shrink-0 w-4 h-4" />
                            <span>Hide Labels</span>
                          </>
                        ) : (
                          <>
                            <IconEye className="flex-shrink-0 w-4 h-4" />
                            <span>Show Labels</span>
                          </>
                        )}
                      </a>
                    </li>
                  )}

                  {/* 🆕 Clear Option */}
                  {/* 🆕 Clear Option */}
{clear !== undefined && setClear && (
  <li>
    <a href="#" onMouseDown={handleClearClick} className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full">
      {clear ? (
        <>
          <IconEyeOff className="flex-shrink-0 w-4 h-4" />
          <span>Disable Clear</span>
        </>
      ) : (
        <>
          <IconEye className="flex-shrink-0 w-4 h-4" />
          <span>Clear</span>
        </>
      )}
    </a>
  </li>
)}

{/* 🆕 Percentage / Absolute toggle — only for Gender */}
{title === "Gender" && props.Percentage !== undefined && props.setPercentage && (
  <li>
    <a
      href="#"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.setPercentage(!props.Percentage);
        setShowMenu(false);
      }}
      className="flex items-center gap-2 hover:opacity-100 opacity-60 w-full"
    >
      <IconPercentage className="flex-shrink-0 w-4 h-4" />
      <span>{props.Percentage ? "Absolute" : "Percentage"}</span>
    </a>
  </li>
)}


                </ul>
              </div>
              <input
                type="text"
                ref={refFocus}
                onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                style={{ width: 1, height: 1, opacity: 0 }}
              />
            </>
          )}
        </div>
      </div>

      {showExplanation && (
        <div className="absolute top-4 right-0 bg-white p-4 rounded shadow-md w-64 z-10">
          <button
            onClick={() => { setShowExplanation(false); if (props.onCloseExplanation) props.onCloseExplanation(); }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm font-bold"
          >
            ×
          </button>
          <p className="text-sm text-gray-800">
            {Explanation.split(/(<[^>]+>)/g).map((part, index) => {
              if (part.match(/^<.*>$/)) {
                return <span key={index} className="font-bold">{part.replace(/[<>]/g, "")}</span>;
              } else {
                return part.split("/").map((subPart, subIndex) => (
                  <React.Fragment key={`${index}-${subIndex}`}>
                    {subPart}{subIndex !== part.split("/").length - 1 && <br />}
                  </React.Fragment>
                ));
              }
            })}
          </p>
        </div>
      )}
    </>
  );
};

export default DownloadMenu;
