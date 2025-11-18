import { format as formatDate } from 'date-fns';
import { parseTime } from '../util/timezone';

type Type = 'number' | 'date' | 'string';

type Options = {
  type?: Type;
  truncate?: number;
  dateFormat?: string;
  meta?: { pretext?: string; posttext?: string };
  dps?: number;
};

const dateFormatter = new Intl.DateTimeFormat();

function numberFormatter(value: number, dps: number | undefined | null, Despar: boolean) {
  const fallback = dps == null || dps < 0;

  // Choose locale based on Despar flag
  const locale = Despar ? 'de-DE' : 'en-US';
  console.log(Despar)

  if (!fallback && dps === 0) {

    // For values 0.5 or greater, round to integer
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(value);

  }

  // Default behavior
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fallback ? 0 : dps,
    maximumFractionDigits: fallback ? 2 : dps,
    useGrouping: true,
  }).format(value);
}

export default function formatValue(str: string = '', opt: Type | Options = 'string', Despar: boolean) {
  if (str === null) return null;

  const { type, dateFormat, meta, truncate, dps }: Options =
    typeof opt === 'string' ? { type: opt } : opt;

  if (type === 'number') {
    const value = parseFloat(str);
    return wrap(numberFormatter(value, dps, Despar));
  }

  if (type === 'date' && str.endsWith('T00:00:00.000')) {
    return wrap(dateFormatter.format(new Date(str)));
  }

  if (type === 'date') return wrap(new Date(str).toLocaleString());

  if (truncate) {
    return str?.length > truncate
      ? `${meta?.pretext || ''}${str.substring(0, truncate)}...`
      : wrap(str);
  }

  if (dateFormat && str) return wrap(formatDate(parseTime(str), dateFormat));

  return str;

  function wrap(v: string) {
    return `${meta?.pretext || ''}${v}${meta?.posttext || ''}`;
  }
}


export const detectAndReturnLinks = (text: string) => {
  if (!text) {
    return { linkText: null, linkUrl: null };
  }
  const linkData = /\[(.*)\]\((.*)\)/.exec(text);
  return { linkText: linkData?.[1], linkUrl: encodeURI(linkData?.[2] || '') };
};