import React from 'react';
import Title from '../Title';
import Description from '../Description';
import { Dimension, DataResponse, DimensionOrMeasure } from '@embeddable.com/core';
import ImpressionIcon from '../../../assets/Impression.png';
import PerformanceIcon from '../../../assets/Performance.png';
import OptimizationIcon from '../../../assets/Optimization.png';
import TotalPerformanceIcon from '../../../assets/Total Performance.png';
import OverviewIcon from '../../../assets/Overview.png';
import GenralKPIsIcon from '../../../assets/GeneralKPIs.png';
import InstoreDuration from '../../../assets/InstoreDuration.png';
import RetailMediaNetwork from '../../../assets/RetailMediaNetwork.png';
import OptimizationRetail from '../../../assets/OptimizationRetail.png';
import TrolleyUsage from '../../../assets/TrolleyUsage.png';
import Profitability from '../../../assets/Profitability.png';
import Heatmap from '../../../assets/Heatmap.png';
import MarketingActivities from '../../../assets/MarketingActivities.png';
import ABTesting from '../../../assets/ABTesting.png';

const iconMap: { [key: string]: string } = {
  impression: ImpressionIcon,
  performance: PerformanceIcon,
  optimization: OptimizationIcon,
  totalperformance: TotalPerformanceIcon,
  overview: OverviewIcon,
  generalkpis: GenralKPIsIcon,
  instoreduration: InstoreDuration,
  retailmedianetwork: RetailMediaNetwork,
  optimizationretail: OptimizationRetail,
  trolleyusage: TrolleyUsage,
  profitability: Profitability,
  heatmap: Heatmap,
  marketingactivities: MarketingActivities,
  abtesting: ABTesting,
};

type Props = {
  title?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  body?: string;
  metric?: DimensionOrMeasure;
  results: DataResponse;
  icon?: string;  // Accept icon prop
  granularity?: string;
};

export default (props: Props) => {
  const { title, body, titleFontSize, metric, bodyFontSize, results, icon } = props;
  const { isLoading, data, error } = results;

  const containerStyle = {
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',           // Use flex to align items horizontally
    alignItems: 'center',
  };

  // Handling metric value extraction, safely checking for the presence of data and the metric.
  const metricValue = metric ? data?.[0]?.[metric.name] : null;
  const displayMetricValue = metric ? (metricValue !== null && metricValue !== undefined ? metricValue : 'No data') : '';

  // Style settings for title and body
  const titleStyle = {
    fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
    lineHeight: titleFontSize ? '1.2em' : undefined,
    color: '#a53241',
    fontFamily: 'Arial, sans-serif',
  };

  const bodyStyle = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : 'inherit',
    lineHeight: bodyFontSize ? '1.2em' : 'inherit',
    fontWeight: 'bold',
    marginTop: '0',
  };

  const iconStyle = {
    width: icon === "optimization" || icon === "profitability" || icon === "marketingactivities" || icon === "generalkpis"
      ? '185px'
      : '135px',
    height: icon === "optimization" ? '115px' : '100px',
    marginRight: '10px',
    marginLeft: '0px',
  };


  const iconUrl = icon ? iconMap[icon.toLowerCase()] : null;

  // Build description text with proper spacing
  const descriptionParts = [];
  if (body) descriptionParts.push(body);
  if (displayMetricValue) descriptionParts.push(displayMetricValue);
  const descriptionText = descriptionParts.join(' ');

  return (
    <div style={containerStyle}>
      {iconUrl && <img src={iconUrl} alt="Selected Icon" style={iconStyle} />}
      {title && <Title title={title} style={titleStyle} />}
      <Description description={descriptionText} style={bodyStyle} />
    </div>
  );
};