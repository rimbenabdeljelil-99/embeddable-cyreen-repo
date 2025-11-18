import { Value } from '@embeddable.com/core';
import { EmbeddedComponentMeta, Inputs, defineComponent } from '@embeddable.com/react';

import Component from './index';
import { ShowerHead, X } from 'lucide-react';

export const meta = {
  name: 'MultiSelectButtons',
  label: 'Multiselect buttons',
  defaultWidth: 400,
  defaultHeight: 80,
  category: 'Cyreen Components',
  inputs: [
    {
      name: 'values',
      type: 'string',
      array: true,
      label: 'Values',
      category: 'Button values'
    },
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      category: 'Settings'
    },
    {
      name: 'defaultValue',
      type: 'string',
      label: 'Default value',
      category: 'Pre-configured variables'
    },
    {
      name: 'Ranking',
      type: 'string',
      label: 'Ranking Value',
      category: 'Settings'
    },
    {
      name: 'RankingMin',
      type: 'string',
      label: 'Ranking Min Value',
      category: 'Settings'
    },
    {
      name: 'MasterRetail',
      type: 'boolean',
      label: 'Master Retail',
      category: 'Settings'
    }
  ],
  events: [
    {
      name: 'onChange',
      label: 'Change',
      properties: [
        {
          name: 'value',
          type: 'string',
          array: true
        },
        {
          name: 'CR',
          type: 'string',
          array: true
        },
        {
          name: 'Basket',
          type: 'string',
          array: true
        },
        {
          name: 'Rank_Stores',
          type: 'string',
          array: true
        },
        {
          name: 'Rank_Weekdays',
          type: 'string',
          array: true
        },
        {
          name: 'Rank_HourGroup',
          type: 'string',
          array: true
        },
        {
          name: 'xAxis',
          type: 'string'
        },
        {
          name: 'SortBy',
          type: 'string',
        },
        {
          name: 'KPIvalue',
          type: 'string',
          array: true
        },
        {
          name: 'DurationGroup',
          type: 'string',
          array: true
        },
        {
          name: 'Min5Filter',
          type: 'number',
          array: true
        },
        {
          name: 'Min10Filter',
          type: 'number',
          array: true
        },
        {
          name: 'Min15Filter',
          type: 'number',
          array: true
        },
        {
          name: 'Min30Filter',
          type: 'number',
          array: true
        },
        {
          name: 'Min60Filter',
          type: 'number',
          array: true
        },
        {
          name: 'Ranking',
          type: 'string',
          array: true
        },

        {
          name: 'xAxis2',
          type: 'string',
          array: true
        },
        {
          name: 'SortBy2',
          type: 'string',
          array: true
        },
        {
          name: 'xAxis3',
          type: 'string',
          array: true
        },
        {
          name: 'SortBy3',
          type: 'string',
          array: true
        },
        {
          name: 'WeatherAxis',
          type: 'string',
          array: true
        },
        {
          name: 'SortWeather',
          type: 'string',
          array: true
        },
        {
          name: 'WeatherLinesAxis',
          type: 'string',
          array: true
        },
        {
          name: 'SortWeatherLines',
          type: 'string',
          array: true
        },
        {
          name: 'KPILines',
          type: 'string',
          array: true
        },
        {
          name: 'xAxisTemp',
          type: 'boolean'
        },

        {
          name: 'LowHighRank',
          type: 'string',
          array: true
        },

        {
          name: 'AscDesc',
          type: 'string',
          array: true
        },

        {
          name: 'HeatmapKPI',
          type: 'string',
          array: true
        },

        {
          name: 'XaxisProfitability',
          type: 'dimension'
        },

        {
          name: 'XaxisFerreroFreq',
          type: 'dimension'
        },
        {
          name: 'XaxisFerreroDwell',
          type: 'dimension'
        },
        {
          name: 'XaxisFerreroEngagement',
          type: 'dimension'
        },
        {
          name: 'Locations',
          type: 'dimension'
        },
        {
          name: 'LocationsMap',
          type: 'dimension'
        },
        {
          name: 'LocationsPerf',
          type: 'dimension'
        },
        {
          name: 'Absolute',
          type: 'boolean'
        },
        {
          name: 'YaxisTitle',
          type: 'string'
        },
        {
          name: 'TimeFilter',
          type: 'timeRange'
        }
        ,
        {
          name: 'Granularity',
          type: 'string'
        },
        {
          name: 'minHour',
          type: 'number'
        },
        {
          name: 'maxHour',
          type: 'number'
        },
        {
          name: 'showAxis',
          type: 'boolean'
        },
        {
          name: 'time',
          type: 'timeRange'
        },
        {
          name: 'XaxisProduct',
          type: 'dimension'
        },
        {
          name: 'KPIproduct',
          type: 'measure',
          array: true
        },
        {
          name: 'SortProduct',
          type: 'string'
        },
        {
          name: 'PerfGran',
          type: 'string'
        },
        {
          name: 'TargetingHour',
          type: 'dimension'
        },
        {
          name: 'ReferencingPeriod',
          type: 'measure',
          array: true
        },
        {
          name: 'CompareKPI',
          type: 'dimensionOrMeasure',
          array: true
        }


      ]
    }
  ],
  variables: [
    {
      name: 'SalesUplift',
      type: 'string',
      array: true,
      defaultValue: 'Units of Sales',
      inputs: ['defaultValue'],
      events: [{ name: 'onChange', property: 'value' }]
    }
  ]
} as const satisfies EmbeddedComponentMeta;

export default defineComponent(Component, meta, {
  props: (inputs: Inputs<typeof meta>, _state, clientContext) => {
    return {
      ...inputs,
      clientContext
    };
  },
  events: {
    onChange: ({ value, label, Ranking, RankingMin }) => {
      const isAbsolute = label === 'Rank By               Difference';
      const isRelative = label === 'Rank By               Uplift';
      const isNoRank = label === 'No Ranking';
      const isCR = label === 'Conversion Rate';
      const isBasket = label === 'Average Basket Size';
      const isSalesUp = label === 'Sales Uplift';
      const isAbsoluteDifference = Ranking === 'Absolute Difference (in pp)';
      const isRelativeDifference = Ranking === 'Relative Difference (in %)';
      const isNoRanking = Ranking === 'No Ranking';

      const isHour = label === "Hourly";
      const isHourGroup = label === "Hour Group";
      const isDay = label === "Daily";
      const isWeekday = label === "Weekday";
      const isMonth = label === "Monthly";
      const isWeekly = label === "Weekly";
      
      const isSales = label === "Sales (Units)";
      const isRevenue = label === "Revenue (CLP$)";
      const isRevenueEuro = label === "Revenue (€)";
      const isShoppers = label === "Shoppers (Amount)";
      const isDuration = label === "Duration (Min.)";
      const is5min = label === "5";
      const is10min = label === "10";
      const is15min = label === "15";
      const is30min = label === "30";
      const is60min = label === "60";


      const is5minRank = RankingMin === "5";
      const is10minRank = RankingMin === "10";
      const is15minRank = RankingMin === "15";
      const is30minRank = RankingMin === "30";
      const is60minRank = RankingMin === "60";

      const isTemperature = label === "Temperature (°C)"
      const isFeelsLike = label === "Temperature             (Feels Like °C)"
      const isClouds = label === "Clouds (%)"
      const isRain = label === "Rain (millimeter)"
      const isSnow = label === "Snow (millimeter)"


      const isAverageSalesRank = Ranking === "Average Sales (Units)"
      const isAverageRevenueRank = Ranking === "Average Revenue (€)" || Ranking === "Average Revenue (CLP$)";
      const isAverageShopperRank = Ranking === "Total Shoppers"
      const isAverageShopperPerRank = Ranking === "Total Shoppers (in %)"

      const isAverageSalesRankMin = RankingMin === "Average Sales (Units)"
      const isAverageRevenueRankMin = RankingMin === "Average Revenue (€)" || RankingMin === "Average Revenue (CLP$)";
      const isAverageShopperRankMin = RankingMin === "Total Shoppers"
      const isAverageShopperPerRankMin = RankingMin === "Total Shoppers (in %)"

      const isAverageSales = label === "Average Sales (Units)"
      const isAverageRevenue = label === "Average Revenue (€)" || label === "Average Revenue (CLP$)";

      const isAverageShopper = label === "Total Shoppers"
      const isAverageShopperPer = label === "Total Shoppers (in %)"

      const isLow = label === "Low -> High"
      const isHigh = label === "High -> Low"
      const isNoRankHL = label === "No Rank"

      const isLowRank = Ranking === "Low -> High"
      const isHighRank = Ranking === "High -> Low"
      const isNoRankHLRank = Ranking === "No Rank"


      const isAbsoluteButton = label === "Absolute"
      const isPercentageButton = label === "Percentage"

      const is6hours = label === "Last 6 hours"


      const isAbsoluteButton2 = RankingMin === "Absolute"
      const isPercentageButton2 = RankingMin === "Percentage"


      const isHourRank = RankingMin === "Hourly"
      const isMonthlyRank = RankingMin === "Monthly"
      const isDailyRank = RankingMin === "Daily"
      const isWeekdayRank = RankingMin === "Weekday"


      const isYesterday = label === "Yesterday"
      const isSevenDays = label === "7 Days"
      const isFourWeeks = label === "4 Weeks"


      const isSalesKnown = label === "Average Sales (Known Products)"
      const isSalesComplete = label === "Average Sales (Complete Purchase)"
      const isRevenueKnown = label === "Average Revenue (Known Products)"
      const isRevenueComplete = label === "Average Revenue (Complete Purchase)"
      const isTotalFrequency = label === "Total Frequency"
      const isTotalSales = label === "Total Sales"
      const isTotalRevenue = label === "Total Revenue"

      const isNielsen = label === "Nielsen Region"
      const isRegions = label === "Region"

      const isPastYear = label === "Past Year"
      const isPastQuarter = label === "Past Quarter"
      const isPastWeek = label === "Past Week"



      const LocationsDimension = isRegions
        ? {
          name: 'impressions.name_region',
          title: 'Region',
          __type__: 'dimension',
          modelTitle: 'Impressions',
          nativeType: 'string',
          shortTitle: 'Region',
          description: null,
          meta: null
        }
        : isNielsen
          ? {
            name: 'impressions.nielsen_region_code',
            title: 'Nielsen Region',
            __type__: 'dimension',
            modelTitle: 'Impressions',
            nativeType: 'string',
            shortTitle: 'Nielsen Region',
            description: null,
            meta: null
          }
              : undefined;


      const LocationsDimensionMap = isRegions
        ? {
          name: 'impressions.name_region2',
          title: 'Region',
          __type__: 'dimension',
          modelTitle: 'Impressions',
          nativeType: 'string',
          shortTitle: 'Region',
          description: null,
          meta: null
        }
        : isNielsen
          ? {
            name: 'impressions.nielsen_region_code',
            title: 'Nielsen Region',
            __type__: 'dimension',
            modelTitle: 'Impressions',
            nativeType: 'string',
            shortTitle: 'Nielsen Region',
            description: null,
            meta: null
          }
              : undefined;

      const LocationsDimensionPerf = isRegions
        ? {
          name: 'big_dm.name_region',
          title: 'Region',
          __type__: 'dimension',
          modelTitle: 'Big Dm',
          nativeType: 'string',
          shortTitle: 'Region',
          description: null,
          meta: null
        }
        : isNielsen
          ? {
            name: 'big_dm.nielsen_region_code',
            title: 'Nielsen Region',
            __type__: 'dimension',
            modelTitle: 'Big Dm',
            nativeType: 'string',
            shortTitle: 'Nielsen Region',
            description: null,
            meta: null
          }
              : undefined;


      const xAxisFerreroDimension = isHour
        ? {
          name: 'fact_line_crossings.hour_of_day',
          title: 'Hour Of Day',
          __type__: 'dimension',
          modelTitle: 'Fact Line Crossing',
          nativeType: 'number',
          shortTitle: 'Hour',
          description: null,
          meta: null
        }
        : isDay
          ? {
            name: 'fact_line_crossings.day_only',
            title: 'Day Only',
            __type__: 'dimension',
            modelTitle: 'Fact Line Crossing',
            nativeType: 'timestamp',
            shortTitle: 'Day Only',
            description: null,
            meta: null
          }
          : isWeekly
            ? {
              name: 'fact_line_crossings.week_number',
              title: 'Week Number',
              __type__: 'dimension',
              modelTitle: 'Fact Line Crossing',
              nativeType: 'number',
              shortTitle: 'Week Number',
              description: null,
              meta: null
            }
            : isMonth
              ? {
                name: 'fact_line_crossings.month_number',
                title: 'Month Number',
                __type__: 'dimension',
                modelTitle: 'Fact Line Crossing',
                nativeType: 'string',
                shortTitle: 'Month Number',
                description: null,
                meta: null
              }
              : undefined;
      const xAxisFerreroDimension2 = isHour
        ? {
          name: 'fact_zone_visits.entry_hour',
          title: 'Entry Hour',
          __type__: 'dimension',
          modelTitle: 'Fact Zone Visits',
          nativeType: 'number',
          shortTitle: 'Entry Hour',
          description: null,
          meta: null
        }
        : isDay
          ? {
            name: 'fact_zone_visits.day_only',
            title: 'Day Only',
            __type__: 'dimension',
            modelTitle: 'Fact Zone Visits',
            nativeType: 'timestamp',
            shortTitle: 'Day Only',
            description: null,
            meta: null
          }
          : isWeekly
            ? {
              name: 'fact_zone_visits.week_number',
              title: 'Week Number',
              __type__: 'dimension',
              modelTitle: 'Fact Zone Visits',
              nativeType: 'number',
              shortTitle: 'Week Number',
              description: null,
              meta: null
            }
            : isMonth
              ? {
                name: 'fact_zone_visits.month_number',
                title: 'Month Number',
                __type__: 'dimension',
                modelTitle: 'Fact Zone Visits',
                nativeType: 'string',
                shortTitle: 'Month Number',
                description: null,
                meta: null
              }
              : undefined;

      const xAxisFerreroDimension3 = isHour
        ? {
          name: 'shelf_model.hour',
          title: 'Hour',
          __type__: 'dimension',
          modelTitle: 'Fact Zone Visits',
          nativeType: 'number',
          shortTitle: 'Hour',
          description: null,
          meta: null
        }
        : isDay
          ? {
            name: 'shelf_model.day_only',
            title: 'Day Only',
            __type__: 'dimension',
            modelTitle: 'Fact Zone Visits',
            nativeType: 'timestamp',
            shortTitle: 'Day Only',
            description: null,
            meta: null
          }
          : isWeekly
            ? {
              name: 'shelf_model.week_number',
              title: 'Week Number',
              __type__: 'dimension',
              modelTitle: 'Fact Zone Visits',
              nativeType: 'number',
              shortTitle: 'Week Number',
              description: null,
              meta: null
            }
            : isMonth
              ? {
                name: 'shelf_model.month_number',
                title: 'Month Number',
                __type__: 'dimension',
                modelTitle: 'Fact Zone Visits',
                nativeType: 'string',
                shortTitle: 'Month Number',
                description: null,
                meta: null
              }
              : undefined;

      const xAxisProductDimension = isHour
        ? {
          name: 'ferrero_data.hour',
          title: 'Hour',
          __type__: 'dimension',
          modelTitle: 'Ferrero Data',
          nativeType: 'number',
          shortTitle: 'Hour',
          description: null,
          meta: null
        }
        : isDay
          ? {
            name: 'ferrero_data.day_only',
            title: 'Day Only',
            __type__: 'dimension',
            modelTitle: 'Ferrero Data',
            nativeType: 'timestamp',
            shortTitle: 'Day Only',
            description: null,
            meta: null
          }
          : isWeekly
            ? {
              name: 'ferrero_data.week',
              title: 'Week',
              __type__: 'dimension',
              modelTitle: 'Ferrero Data',
              nativeType: 'number',
              shortTitle: 'Week',
              description: null,
              meta: null
            }
            : isMonth
              ? {
                name: 'ferrero_data.month_number',
                title: 'Month Number',
                __type__: 'dimension',
                modelTitle: 'Ferrero Data',
                nativeType: 'string',
                shortTitle: 'Month Number',
                description: null,
                meta: null
              }
              : undefined;


      const KPIProductDimension = isSalesKnown
        ? [{
          name: 'ferrero_data.average_sales_count',
          title: 'Average Sales (Known Products)',
          __type__: 'measure',
          modelTitle: 'Ferrero Data',
          nativeType: 'number',
          shortTitle: 'Average Sales (Known Products)',
          description: null,
          meta: null
        }]
        : isRevenueKnown
          ? [{
            name: 'ferrero_data.average_revenue_value',
            title: 'Average Revenue (Known Products)',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Average Revenue (Known Products)',
            description: null,
            meta: null
          }] : isSalesComplete
          ? [{
            name: 'receipts.average_sales_complete_purchase',
            title: 'Average Sales (Complete Purchase)',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Average Sales (Complete Purchase)',
            description: null,
            meta: null
          }] : isRevenueComplete
          ? [{
            name: 'receipts.average_revenue_complete_purchase',
            title: 'Average Revenue (Complete Purchase)',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Average Revenue (Complete Purchase)',
            description: null,
            meta: null
          }] : isTotalFrequency
          ? [{
            name: 'receipts.frequency',
            title: 'Total Frequency',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Total Frequency',
            description: null,
            meta: null
          }] : isTotalSales
          ? [{
            name: 'receipts.total_sales',
            title: 'Total Sales',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Total Sales',
            description: null,
            meta: null
          }] : isTotalRevenue
          ? [{
            name: 'receipts.total_revenue',
            title: 'Total Revenue',
            __type__: 'measure',
            modelTitle: 'Ferrero Data',
            nativeType: 'number',
            shortTitle: 'Total Revenue',
            description: null,
            meta: null
          }]
              : undefined;

      const xAxisIsHour = isHour
        ? {
          name: 'big_dm.hour',
          title: 'Hour',
          __type__: 'dimension',
          modelTitle: 'Big Dm',
          nativeType: 'number',
          shortTitle: 'Hour',
          description: null,
          meta: null
        }
        : isHourGroup
          ? {
            name: 'big_dm.hour_group',
            title: 'Hour Group',
            __type__: 'dimension',
            modelTitle: 'Big Dm',
            nativeType: 'number',
            shortTitle: 'Hour Group',
            description: null,
            meta: null
          }: isWeekday
          ? {
            name: 'big_dm.weekday',
            title: 'Weekday',
            __type__: 'dimension',
            modelTitle: 'Big Dm',
            nativeType: 'number',
            shortTitle: 'Weekday',
            description: null,
            meta: null
          }
            
              : undefined;

      const ReferencePeriod = isPastYear
        ?  [
          {
      "meta": null,
      "name": "big_dm.baseline_past_year_reference",
      "title": "Past Year Baseline Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Past Year Baseline Reference Store (%)",
      "description": null
    },
    {
      "meta": null,
      "name": "big_dm.baseline_past_year_cap",
      "title": "Past Year Baseline C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Past Year Baseline C.A.P Store (%)",
      "description": null
    },
    
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_year_reference",
      "title": "Campaign vs Past Year Impact Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Campaign vs Past Year Impact Reference Store (%)",
      "description": null
    },
    
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_year_cap",
      "title": "Campaign vs Past Year Impact C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Campaign vs Past Year Impact C.A.P Store (%)",
      "description": null
    }
  ]
        : isPastQuarter
          ?  [
            {
      "meta": null,
      "name": "big_dm.baseline_past_quarter_reference",
      "title": "Past Quarter Baseline Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Past Quarter Baseline Reference Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.baseline_past_quarter_cap",
      "title": "Past Quarter Baseline C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Past Quarter Baseline C.A.P Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_quarter_reference",
      "title": "Campaign vs Past Quarter Impact Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Campaign vs Past Quarter Impact Reference Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_quarter_cap",
      "title": "Campaign vs Past Quarter Impact C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Campaign vs Past Quarter Impact C.A.P Store (%)"
    }
    
  ]: isPastWeek
          ? [
            {
      "meta": null,
      "name": "big_dm.baseline_week_before_reference",
      "title": "Week Before Baseline Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Week Before Baseline Reference Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.baseline_week_before_cap",
      "title": "Week Before Baseline C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Week Before Baseline C.A.P Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_week_before_reference",
      "title": "Campaign vs Week Before Impact Reference Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Campaign vs Week Before Impact Reference Store (%)"
    },
    {
      "meta": null,
      "name": "big_dm.impact_campaign_vs_week_before_cap",
      "title": "Campaign vs Week Before Impact C.A.P Store (%)",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "description": null,
      "shortTitle": "Campaign vs Week Before Impact C.A.P Store (%)"
    }
  ]
            
              : undefined;

      const KPImetrics = isCR
        ?  [
          {
      "meta": null,
      "name": "big_dm.without_cap_conversion_rate",
      "title": "Without C.A.P.",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Without C.A.P.",
      "description": null
    },
    {
      "meta": null,
      "name": "big_dm.with_cap_conversion_rate",
      "title": "With C.A.P.",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "With C.A.P.",
      "description": null
    },
    
    {
      "meta": null,
      "name": "big_dm.name_adlevel1",
      "title": "Analysis Group",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "string",
      "shortTitle": "Analysis Group",
      "description": null
    }
  ]
        : isBasket
        ?  [
          {
      "meta": null,
      "name": "big_dm.without_cap_basket_size",
      "title": "Without C.A.P",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Without C.A.P",
      "description": null
    },
    {
      "meta": null,
      "name": "big_dm.with_cap_basket_size",
      "title": "With C.A.P",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "With C.A.P",
      "description": null
    },
    
    {
      "meta": null,
      "name": "big_dm.name_adlevel1",
      "title": "Analysis Group",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "string",
      "shortTitle": "Analysis Group",
      "description": null
    }
  ]: isSalesUp
        ?  [
          {
      "meta": null,
      "name": "big_dm.sales_uplift_no_negative",
      "title": "Sales Uplift",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "number",
      "shortTitle": "Sales Uplift",
      "description": null
    },
    
    {
      "meta": null,
      "name": "big_dm.name_adlevel1",
      "title": "Analysis Group",
      "__type__": "measure",
      "modelTitle": "big_dm",
      "nativeType": "string",
      "shortTitle": "Analysis Group",
      "description": null
    }
  ]
            
              : undefined;


      

      



      const today = new Date();

      // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const day = today.getDay();

      // Adjust to get Monday as the start of the week
      const daysSinceMonday = (day + 6) % 7; // 0 if today is Monday, 1 if Tuesday, ..., 6 if Sunday

      // Start of current week (Monday)
      const startOfCurrentWeek = new Date(today);
      startOfCurrentWeek.setDate(today.getDate() - daysSinceMonday);

      // Go back 3 more full weeks (21 days)
      const startOfFourWeeks = new Date(startOfCurrentWeek);
      startOfFourWeeks.setDate(startOfCurrentWeek.getDate() - 21);









      // Always include the value in the return object
      return {
        value: value || Value.noFilter(),
        CR: isNoRank ? 'big_dm.name_adlevel1' : isAbsolute ? 'big_dm.conversion_difference_base' : isRelative ? 'big_dm.conversion_uplift_sort' : undefined,
        Basket: isNoRank ? 'big_dm.name_adlevel1' : isAbsolute ? 'big_dm.basket_difference_base' : isRelative ? 'big_dm.basket_uplift_sort' : undefined,
        Rank_Stores: isAbsoluteDifference ? (isCR ? 'big_dm.conversion_difference_base' : isBasket ? 'big_dm.basket_difference_base' : undefined) : isRelativeDifference ? (isCR ? 'big_dm.conversion_uplift_sort' : isBasket ? 'big_dm.basket_uplift_sort' : undefined) : isNoRanking ? 'big_dm.name_store' : 'big_dm.name_store',
        Rank_Weekdays: isAbsoluteDifference ? (isCR ? 'big_dm.conversion_difference_base' : isBasket ? 'big_dm.basket_difference_base' : undefined) : isRelativeDifference ? (isCR ? 'big_dm.conversion_uplift_sort' : isBasket ? 'big_dm.basket_uplift_sort' : undefined) : isNoRanking ? 'big_dm.weekday_agg_string' : 'big_dm.weekday_agg_string',
        Rank_HourGroup: isAbsoluteDifference ? (isCR ? 'big_dm.conversion_difference_base' : isBasket ? 'big_dm.basket_difference_base' : undefined) : isRelativeDifference ? (isCR ? 'big_dm.conversion_uplift_sort' : isBasket ? 'big_dm.basket_uplift_sort' : undefined) : isNoRanking ? 'big_dm.hour_value' : 'big_dm.hour_value',

        xAxis: isHour ? 'receipts_retail.hour' : isDay ? 'receipts_retail.date' : isWeekday ? 'receipts_retail.dow' : isMonth ? 'receipts_retail.month' : undefined,
        SortBy: isHour ? 'receipts_retail.hour' : isDay ? 'receipts_retail.date' : isWeekday ? 'receipts_retail.weekday_agg_string' : isMonth ? 'receipts_retail.month_sort' : undefined,

        KPIvalue: isSales ? 'Sales (Units)' : isRevenue ? 'Revenue (CLP$)' : isRevenueEuro ? 'Revenue (€)' : undefined,

        DurationGroup: is5min ? 'customer_journeys.duration_group_five' : is10min ? 'customer_journeys.duration_group_ten' : is15min ? 'customer_journeys.duration_group_fifteen' : is30min ? 'customer_journeys.duration_group_thirty' : is60min ? 'customer_journeys.duration_group_sixty' : undefined,

        Min5Filter: is5min ? 0 : undefined,
        Min10Filter: is10min ? 0 : undefined,
        Min15Filter: is15min ? 0 : undefined,
        Min30Filter: is30min ? 0 : undefined,
        Min60Filter: is60min ? 0 : undefined,

        xAxis2: isHour ? 'customer_journeys.hour' : isDay ? 'customer_journeys.date' : isWeekday ? 'customer_journeys.dow' : isMonth ? 'customer_journeys.month1' : undefined,
        SortBy2: isHour ? 'customer_journeys.hour' : isDay ? 'customer_journeys.date' : isWeekday ? 'customer_journeys.weekday_agg_string' : isMonth ? 'customer_journeys.month_sort' : undefined,

        xAxis3: isHour ? 'overview.hour' : isDay ? 'overview.date' : isWeekday ? 'overview.dow' : isMonth ? 'overview.month1' : undefined,
        SortBy3: isHour ? 'overview.hour' : isDay ? 'overview.date' : isWeekday ? 'overview.weekday_agg_string' : isMonth ? 'overview.month_sort' : undefined,

        WeatherAxis: isTemperature ? 'big_dm.weather_bins' : isFeelsLike ? 'big_dm.weather_feels_bins' : isClouds ? 'big_dm.name_market_type'
          : isRain ? 'big_dm.rain_bool' : isSnow ? 'big_dm.snow_bool' : undefined,

        SortWeather: isTemperature ? 'big_dm.weather_bins' : isFeelsLike ? 'big_dm.weather_feels_bins' : isRain ? 'big_dm.rain_bool_tftf' : undefined,

        WeatherLinesAxis: isHour ? 'big_dm.hour' : isHourGroup ? 'big_dm.hour_group' :isDay ? 'big_dm.date': isWeekday ? 'big_dm.weekday' : isWeekly ? 'big_dm.week' : isMonth? 
        'big_dm.month1' : undefined,
        SortWeatherLines: isHour ? 'big_dm.hour' : isHourGroup ? 'big_dm.hour_value' : isDay ? 'big_dm.date': isWeekday ? 'big_dm.weekday_agg_string' : isWeekly ? 'big_dm.week' : isMonth? 'big_dm.month_sort': undefined,
        KPILines: isTemperature ? 'Temperature (°C)' : isFeelsLike ? 'Temperature (Feels Like °C)' :
          isClouds ? 'Clouds (%)' : isRain ? 'Rain (millimeter)' : isSnow ? 'Snow (millimeter)' : undefined,

        xAxisTemp: isTemperature ? true : isFeelsLike ? true :
          isClouds ? false : isRain ? true : isSnow ? true : undefined,


        LowHighRank: isLow ? (isAverageSalesRank ? 'customer_journeys.average_sales' : isAverageRevenueRank ? 'customer_journeys.average_revenue'
          : isAverageShopperRank ? 'customer_journeys.average_shopper' : isAverageShopperPerRank ? 'customer_journeys.average_shopper_percentage_rounded' : undefined)
          : isHigh ? (isAverageSalesRank ? 'customer_journeys.average_sales' : isAverageRevenueRank ? 'customer_journeys.average_revenue'
            : isAverageShopperRank ? 'customer_journeys.average_shopper' : isAverageShopperPerRank ? 'customer_journeys.average_shopper_percentage_rounded' : undefined)




            : isAverageSales ? (isLowRank ? 'customer_journeys.average_sales' : isHighRank ? 'customer_journeys.average_sales' : isNoRankHLRank ? (is5minRank ? 'customer_journeys.duration_group_five' : is10minRank ? 'customer_journeys.duration_group_ten'
              : is15minRank ? 'customer_journeys.duration_group_fifteen' : is30minRank ? 'customer_journeys.duration_group_thirty'
                : is60min ? 'customer_journeys.duration_group_sixty' : undefined) : undefined)


              : isAverageRevenue ? (isLowRank ? 'customer_journeys.average_revenue' : isHighRank ? 'customer_journeys.average_revenue' : isNoRankHLRank ? (is5minRank ? 'customer_journeys.duration_group_five' : is10minRank ? 'customer_journeys.duration_group_ten'
                : is15minRank ? 'customer_journeys.duration_group_fifteen' : is30minRank ? 'customer_journeys.duration_group_thirty'
                  : is60min ? 'customer_journeys.duration_group_sixty' : undefined) : undefined)


                : isAverageShopper ? (isLowRank ? 'customer_journeys.average_shopper' : isHighRank ? 'customer_journeys.average_shopper' : isNoRankHLRank ? (is5minRank ? 'customer_journeys.duration_group_five' : is10minRank ? 'customer_journeys.duration_group_ten'
                  : is15minRank ? 'customer_journeys.duration_group_fifteen' : is30minRank ? 'customer_journeys.duration_group_thirty'
                    : is60min ? 'customer_journeys.duration_group_sixty' : undefined) : undefined)


                  : isAverageShopperPer ? (isLowRank ? 'customer_journeys.average_shopper_percentage_rounded' : isHighRank ? 'customer_journeys.average_shopper_percentage_rounded' : isNoRankHLRank ? (is5minRank ? 'customer_journeys.duration_group_five' : is10minRank ? 'customer_journeys.duration_group_ten'
                    : is15minRank ? 'customer_journeys.duration_group_fifteen' : is30minRank ? 'customer_journeys.duration_group_thirty'
                      : is60min ? 'customer_journeys.duration_group_sixty' : undefined) : undefined)




                    : isNoRankHL ? (is5minRank ? 'customer_journeys.duration_group_five' : is10minRank ? 'customer_journeys.duration_group_ten'
                      : is15minRank ? 'customer_journeys.duration_group_fifteen' : is30minRank ? 'customer_journeys.duration_group_thirty'
                        : is60minRank ? 'customer_journeys.duration_group_sixty' : undefined) :





                      is5min ? (
                        isNoRankHLRank ? 'customer_journeys.duration_group_five' :
                          (isLowRank || isHighRank) ? (
                            isAverageSalesRankMin ? 'customer_journeys.average_sales' :
                              isAverageRevenueRankMin ? 'customer_journeys.average_revenue' :
                                isAverageShopperRankMin ? 'customer_journeys.average_shopper' :
                                  isAverageShopperPerRankMin ? 'customer_journeys.average_shopper_percentage_rounded' :
                                    undefined
                          ) : undefined
                      ) :
                        is10min ? (
                          isNoRankHLRank ? 'customer_journeys.duration_group_ten' :
                            (isLowRank || isHighRank) ? (
                              isAverageSalesRankMin ? 'customer_journeys.average_sales' :
                                isAverageRevenueRankMin ? 'customer_journeys.average_revenue' :
                                  isAverageShopperRankMin ? 'customer_journeys.average_shopper' :
                                    isAverageShopperPerRankMin ? 'customer_journeys.average_shopper_percentage_rounded' :
                                      undefined
                            ) : undefined
                        ) :
                          is15min ? (
                            isNoRankHLRank ? 'customer_journeys.duration_group_fifteen' :
                              (isLowRank || isHighRank) ? (
                                isAverageSalesRankMin ? 'customer_journeys.average_sales' :
                                  isAverageRevenueRankMin ? 'customer_journeys.average_revenue' :
                                    isAverageShopperRankMin ? 'customer_journeys.average_shopper' :
                                      isAverageShopperPerRankMin ? 'customer_journeys.average_shopper_percentage_rounded' :
                                        undefined
                              ) : undefined
                          ) :
                            is30min ? (
                              isNoRankHLRank ? 'customer_journeys.duration_group_thirty' :
                                (isLowRank || isHighRank) ? (
                                  isAverageSalesRankMin ? 'customer_journeys.average_sales' :
                                    isAverageRevenueRankMin ? 'customer_journeys.average_revenue' :
                                      isAverageShopperRankMin ? 'customer_journeys.average_shopper' :
                                        isAverageShopperPerRankMin ? 'customer_journeys.average_shopper_percentage_rounded' :
                                          undefined
                                ) : undefined
                            ) :
                              is60min ? (
                                isNoRankHLRank ? 'customer_journeys.duration_group_sixty' :
                                  (isLowRank || isHighRank) ? (
                                    isAverageSalesRankMin ? 'customer_journeys.average_sales' :
                                      isAverageRevenueRankMin ? 'customer_journeys.average_revenue' :
                                        isAverageShopperRankMin ? 'customer_journeys.average_shopper' :
                                          isAverageShopperPerRankMin ? 'customer_journeys.average_shopper_percentage_rounded' :
                                            undefined
                                  ) : undefined
                              ) :
                                undefined,


        AscDesc: isNoRankHL ? 'asc' : isLow ? 'asc' : isHigh ? 'desc' : undefined,

        HeatmapKPI: isSales ? 'customer_journeys.sum_sales' : isRevenue ? 'customer_journeys.sum_revenue'
          : isRevenueEuro ? 'customer_journeys.sum_revenue' : isShoppers ? 'customer_journeys.shoppers' : isDuration ? 'customer_journeys.duration_amount' : undefined,


        //XaxisProfitability: xAxisProfitabilityDimension ? xAxisProfitabilityDimension : undefined,

        XaxisFerreroFreq: xAxisFerreroDimension ? xAxisFerreroDimension : undefined,

        XaxisFerreroDwell: xAxisFerreroDimension2 ? xAxisFerreroDimension2 :  undefined,

        XaxisFerreroEngagement: xAxisFerreroDimension3 ? xAxisFerreroDimension3 :  undefined,

        Locations: LocationsDimension ? LocationsDimension : undefined,

        LocationsMap: LocationsDimensionMap ? LocationsDimensionMap : undefined,

        LocationsPerf: LocationsDimensionPerf ? LocationsDimensionPerf : undefined,


        XaxisProduct: xAxisProductDimension ? xAxisProductDimension : undefined,

        KPIproduct: KPIProductDimension? KPIProductDimension: undefined,

        Absolute: isAbsoluteButton ? false : isPercentageButton ? true : undefined,

        YaxisTitle: (isHour || isWeekday) ? ((isAbsoluteButton2) ? 'Average Shoppers (Amount)' : isPercentageButton2 ? 'Average Shoppers (%)' : undefined) : (isMonth || isDay) ? ((isAbsoluteButton2) ? 'Total Shoppers (Amount)' : isPercentageButton2 ? 'Total Shoppers (%)' : undefined)
          : isAbsoluteButton ? ((isHourRank || isWeekdayRank) ? 'Average Shoppers (Amount)' : (isMonthlyRank || isDailyRank) ? 'Total Shoppers (Amount)' : undefined)
            :
            isPercentageButton ? ((isMonthlyRank || isDailyRank) ? 'Total Shoppers (%)' : (isHourRank || isWeekdayRank) ? 'Average Shoppers (%)' : undefined) : undefined,




        TimeFilter: isYesterday ? { relativeTimeString: 'Yesterday' } : isSevenDays ? { relativeTimeString: 'Last 7 days' } : isFourWeeks
          ? {
            relativeTimeString: [
              startOfFourWeeks.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            ]
          }
          : undefined,

        Granularity: isYesterday ? 'hour' : isSevenDays ? 'day' : isFourWeeks ? 'week' : undefined,

        minHour: isYesterday ? '8' : isSevenDays ? '0' : isFourWeeks ? '0' : undefined,


        maxHour: isYesterday ? '21' : isSevenDays ? '26' : isFourWeeks ? '26' : undefined,

        showAxis: (isHour || isWeekday || isMonth) ? false : isDay ? true : undefined,

        time: is6hours ? { relativeTimeString: 'Last 6 hours' } : undefined,


        SortProduct: isHour? 'ferrero_data.hour' : isDay? 'ferrero_data.day_only' : isWeekly? 'ferrero_data.week' : isMonth? 'ferrero_data.month_number' : undefined,

        PerfGran : isWeekly? 'week' : isMonth? 'month' : undefined,

        TargetingHour : xAxisIsHour? xAxisIsHour : undefined,
        ReferencingPeriod : ReferencePeriod? ReferencePeriod : undefined,


        CompareKPI: KPImetrics? KPImetrics: undefined
        






      };
    }
  }
});