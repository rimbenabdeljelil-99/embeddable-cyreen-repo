import React, { useEffect, useState } from 'react';
import Title from '../../Title';
import Description from '../../Description';
import { translateText } from '../../translateText';

// Import the image at the top of your file
import SummaryIcon from '../../../../assets/Summary.png';
import TimesplitIcon from '../../../../assets/Timesplit.png';
import ImpressionsIcon from '../../../../assets/Impressions by store.png';
import ComparisonIcon from '../../../../assets/Comparison.png';
import BasketsizeIcon from '../../../../assets/Basket Size.png';
import ConversionrateIcon from '../../../../assets/Conversion Rate.png';
import UpliftIcon from '../../../../assets/Uplift.png';
import WeekdayIcon from '../../../../assets/Weekday.png';
import StoresIcon from '../../../../assets/Stores.png';
import AllKPIsIcon from '../../../../assets/All KPIs.png';
import Impressions from '../../../../assets/Round Impressions.png';
import StoreComparison from '../../../../assets/Store Comparison.png';
import ShopperDuration from '../../../../assets/ShopperDuration.png';
import Network from '../../../../assets/Network.png';
import weather from '../../../../assets/weather.png';
import weathertypes from '../../../../assets/weathertypes.png';
import DurationGroups from '../../../../assets/DurationGroups.png';
import StoreTrolley from '../../../../assets/StoreTrolley.png';
import CheckoutEvents from '../../../../assets/CheckoutEvents.png';
import kpis from '../../../../assets/kpis.png';
import matrix from '../../../../assets/matrix.png';
import heatmapchart from '../../../../assets/heatmapchart.png';
import timeintervals from '../../../../assets/TimeIntervals.png';
import gender from '../../../../assets/gender.png';
import referencing from '../../../../assets/referencing.png';
import { ref } from 'process';


const iconMap: { [key: string]: string } = {
  summary: SummaryIcon,
  timesplit: TimesplitIcon,
  'impressions by store': ImpressionsIcon,
  comparison: ComparisonIcon,
  'basket size': BasketsizeIcon,
  uplift: UpliftIcon,
  'conversion rate': ConversionrateIcon,
  weekday: WeekdayIcon,
  stores: StoresIcon,
  allkpis: AllKPIsIcon,
  impressions: Impressions,
  storecomparison: StoreComparison,
  shopperduration: ShopperDuration,
  network: Network,
  weather: weather,
  weathertypes: weathertypes,
  durationgroups: DurationGroups,
  storetrolley: StoreTrolley,
  checkoutevents: CheckoutEvents,
  kpis: kpis,
  matrix: matrix,
  heatmapchart: heatmapchart,
  timeintervals: timeintervals,
  gender: gender,
  referencing: referencing
};

type Props = {
  title?: string;
  body?: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  clientContext?: {
    language?: string;
  };
  icon?: string;
  granularity?: string;
  weathertypes?: boolean
};

const AutoTranslateText = (props: Props) => {
  const {
    title = 'Default Title',
    body = 'Default body text',
    titleFontSize,
    bodyFontSize,
    clientContext,
    icon,
    granularity,
    weathertypes
  } = props;

  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [translatedBody, setTranslatedBody] = useState(body);

  useEffect(() => {
    const translate = async () => {
      if (clientContext?.language) {
        const tTitle = await translateText(title, clientContext.language);
        const tBody = await translateText(body, clientContext.language);
        setTranslatedTitle(tTitle);
        setTranslatedBody(tBody);
      }
    };

    translate();
  }, [title, body, clientContext]);

  // Function to get granularity text
  const getGranularityText = () => {
    if (!granularity) return '';
    switch (granularity.toLowerCase()) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      default: return '';
    }
  };

  const granularityText = getGranularityText();

  const containerStyle = {
    backgroundImage: weathertypes ? 'linear-gradient(135deg, #f2f2f2, #e6e6e6)' : 'none',
    backgroundColor: weathertypes ? undefined : '#62626e',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    height: '80px',
  };


  const titleStyle = {
    fontSize: titleFontSize ? `${titleFontSize}px` : 'inherit',
    lineHeight: titleFontSize ? '1.2em' : 'inherit',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
  };

  const bodyStyle = {
    fontSize: bodyFontSize ? `${bodyFontSize}px` : 'inherit',
    lineHeight: bodyFontSize ? '1.2em' : 'inherit',
    fontWeight: 'bold',
    color: weathertypes ? 'black' : 'white',
    marginTop: '0',
  };

  const iconUrl = icon ? iconMap[icon.toLowerCase()] : null;

  const iconStyle = {
    width: '69px',
    height: '69px',
    marginRight: '10px',
    marginLeft: '0px',
  };

  const bodyContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  };

  // Combine body and granularity text if granularity exists
  const descriptionText = granularityText
    ? `${translatedBody} ${granularityText}`
    : translatedBody;

  return (
    <div style={containerStyle}>
      {iconUrl && <img src={iconUrl} alt="Selected Icon" style={iconStyle} />}
      <div style={bodyContainerStyle}>
        <Title title={translatedTitle} style={titleStyle} />
        <Description description={descriptionText} style={bodyStyle} />
      </div>
    </div>
  );
};

export default AutoTranslateText;