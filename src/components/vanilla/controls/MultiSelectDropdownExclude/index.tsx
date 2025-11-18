import { DataResponse } from '@embeddable.com/core';
import { useEmbeddableState } from '@embeddable.com/react';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import Checkbox from '../../../icons/Checkbox';
import CheckboxEmpty from '../../../icons/CheckboxEmpty';
import Container from '../../Container';
import Spinner from '../../Spinner';
import { ChevronDown, ClearIcon } from '../../icons';

export type Props = {
  className?: string;
  options: DataResponse;
  unclearable?: boolean;
  onChange: (v: Array<{value: string, title: string}>) => void;
  onExcludedChange?: (excludedValues: string[]) => void;
  searchProperty?: string;
  minDropdownWidth?: number;
  property?: { name: string; title: string; nativeType: string; __type__: string };
  title?: string;
  defaultValue?: string[];
  placeholder?: string;
  ds?: { embeddableId: string; datasetId: string; variableValues: Record };
  excludeValues?: string[];
  selectedDimension?: any;
};

type Record = { [p: string]: string };
type SelectedValue = { value: string; title: string };

let debounce: number | undefined = undefined;

// Helper function to safely compare values of any type
const safeCompare = (a: any, b: any): number => {
  // Handle undefined/null values
  if (a == null && b == null) return 0;
  if (a == null) return 1; // null/undefined goes to end
  if (b == null) return -1; // null/undefined goes to end
  
  // Convert both to strings for comparison
  const strA = String(a);
  const strB = String(b);
  
  // Use localeCompare for string comparison
  return strA.localeCompare(strB);
};

// Custom sorting functions - ONLY for the three specific cases
const sortHourGroup = (a: any, b: any): number => {
  const hourOrder = ["8:00-10:59", "11:00-12:59", "13:00-14:59", "15:00-16:59", "17:00-18:59","19:00-21:59"];
  
  // Convert to string for comparison
  const strA = String(a || '');
  const strB = String(b || '');
  
  const indexA = hourOrder.indexOf(strA);
  const indexB = hourOrder.indexOf(strB);
  
  // If both are in the predefined order, sort by that order
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  // If only one is in predefined order, prioritize it
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  
  // If neither is in predefined order, do safe comparison
  return safeCompare(strA, strB);
};

const sortWeekday = (a: any, b: any): number => {
  const weekdayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Convert to string for comparison
  const strA = String(a || '');
  const strB = String(b || '');
  
  const indexA = weekdayOrder.indexOf(strA);
  const indexB = weekdayOrder.indexOf(strB);
  
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  
  return safeCompare(strA, strB);
};

const sortWeek = (a: any, b: any): number => {
  // Convert to string for comparison
  const strA = String(a || '');
  const strB = String(b || '');
  
  // Try to parse as numbers first
  const numA = parseInt(strA, 10);
  const numB = parseInt(strB, 10);
  
  // If both are valid numbers, sort numerically with weeks 50+ coming before weeks 1-9
  if (!isNaN(numA) && !isNaN(numB)) {
    // For week numbers, we want: 50, 51, 52, 1, 2, 3, etc.
    // This assumes weeks 50+ are from previous year and should come first
    if (numA >= 50 && numB < 50) return -1;
    if (numA < 50 && numB >= 50) return 1;
    return numA - numB;
  }
  
  // If not numbers, do safe comparison
  return safeCompare(strA, strB);
};

// Helper function to normalize value for comparison (handles number/string mismatch)
const normalizeValue = (value: any): string => {
  if (value == null) return '';
  return String(value);
};

// Main sorting function - ONLY applies custom sorting for the three specific cases
const getSortedOptions = (options: any[], propertyName: string, searchTerm: string = '') => {
  if (!options || options.length === 0) return options;
  
  // For search, don't apply any custom sorting - let the search results show naturally
  if (searchTerm.trim() !== '') {
    return options;
  }
  
  // Only apply custom sorting for the three specific property names
  if (propertyName === 'big_dm.hour_group' || 
      propertyName === 'big_dm.weekday' || 
      propertyName === 'big_dm.week') {
    
    const sortedOptions = [...options];
    
    // Apply custom sorting based on property name
    if (propertyName === 'big_dm.hour_group') {
      sortedOptions.sort((a, b) => sortHourGroup(a[propertyName], b[propertyName]));
    } else if (propertyName === 'big_dm.weekday') {
      sortedOptions.sort((a, b) => sortWeekday(a[propertyName], b[propertyName]));
    } else if (propertyName === 'big_dm.week') {
      sortedOptions.sort((a, b) => sortWeek(a[propertyName], b[propertyName]));
    }
    
    return sortedOptions;
  }
  
  // For all other properties, return the original options without any sorting
  return options;
};

export default (props: Props) => {
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const [triggerBlur, setTriggerBlur] = useState(false);
  const [selectedValues, setSelectedValues] = useState<SelectedValue[]>([]);
  const [search, setSearch] = useState('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [_, setServerSearch] = useEmbeddableState({
    [props.searchProperty || 'search']: '',
  }) as [Record, (f: (m: Record) => Record) => void];

  // Memoize property name for stable references
  const propertyName = props.property?.name || '';
  const propertyTitle = props.property?.title || '';

  // Memoize sorted options data - only applies custom sorting for specific cases
  const sortedOptions = useMemo(() => {
    return getSortedOptions(props.options?.data || [], propertyName, search);
  }, [props.options?.data, propertyName, search]);

  // Memoize options data and extract normalized values efficiently
  const optionValues = useMemo(() => {
    return sortedOptions?.map(o => normalizeValue(o[propertyName])) || [];
  }, [sortedOptions, propertyName]);

  const skipAutoApplyRef = useRef(false);

  
  // Handle initial values and excludeValues
  useEffect(() => {
    if (hasUserInteracted) return;

  // Skip one auto-apply immediately after a property change
  if (skipAutoApplyRef.current) {
    skipAutoApplyRef.current = false;
    return;
  }

    let valuesToSet: SelectedValue[] = [];
    
    if (props.excludeValues && props.excludeValues.length > 0) {
      valuesToSet = props.excludeValues.map(value => ({
        value: normalizeValue(value), // Ensure value is normalized string
        title: propertyTitle || normalizeValue(value)
      }));
    } else if (props.defaultValue) {
      valuesToSet = props.defaultValue.map(value => ({
        value: normalizeValue(value), // Ensure value is normalized string
        title: propertyTitle || normalizeValue(value)
      }));
    }
    
    // Only update if values actually changed
    const currentValues = selectedValues.map(v => v.value);
    const newValues = valuesToSet.map(v => v.value);
    
    if (currentValues.length !== newValues.length || 
        !currentValues.every((val, idx) => val === newValues[idx])) {
      setSelectedValues(valuesToSet);
      
      if (props.excludeValues && props.excludeValues.length > 0) {
        props.onChange(valuesToSet);
      }
    }
  }, [props.defaultValue, props.excludeValues, propertyTitle, hasUserInteracted, selectedValues]);
  


  useEffect(() => {
  console.log('Property changed, resetting selection!', propertyName);
  setSelectedValues([]);
  setSearch('');
  setHasUserInteracted(false);
  setFocus(false);
  clearTimeout(debounce);
  setServerSearch((s) => ({ ...s, [props.searchProperty || 'search']: '' }));
  props.onChange([]);
  if (props.onExcludedChange) props.onExcludedChange([]);

  // tell auto-default effect to skip one run (so defaults are NOT re-applied)
  skipAutoApplyRef.current = true;
}, [propertyName]);




  const performSearch = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);

      clearTimeout(debounce);

      debounce = window.setTimeout(() => {
        setServerSearch((s) => ({ ...s, [props.searchProperty || 'search']: newSearch }));
      }, 500);
    },
    [setServerSearch, props.searchProperty],
  );

  const handleSelection = useCallback(
    (newValue: any) => {
      setHasUserInteracted(true);
      performSearch('');

      // Normalize the new value for consistent comparison
      const normalizedValue = normalizeValue(newValue);

      let newSelectedValues: SelectedValue[];

      if (selectedValues.some(v => v.value === normalizedValue)) {
        newSelectedValues = selectedValues.filter((v) => v.value !== normalizedValue);
      } else {
        newSelectedValues = [...selectedValues, { 
          value: normalizedValue, 
          title: propertyTitle || normalizedValue 
        }];
      }

      setSelectedValues(newSelectedValues);
      props.onChange(newSelectedValues);
      setServerSearch((s) => ({ ...s, [props.searchProperty || 'search']: '' }));
      clearTimeout(debounce);
    },
    [performSearch, selectedValues, props, setServerSearch, props.searchProperty, propertyTitle],
  );

  // Optimized exclude click handler
  const handleExcludeClick = useCallback(() => {
    setHasUserInteracted(true);
    
    // Use pre-computed optionValues (already normalized)
    const selectedOptionValues = selectedValues.map(v => v.value);
    const excludedValues = optionValues.filter(value => !selectedOptionValues.includes(value));
    
    if (props.onExcludedChange) {
      props.onExcludedChange(excludedValues);
    }
  }, [optionValues, selectedValues, props.onExcludedChange]);

  const clearAll = useCallback(() => {
    setHasUserInteracted(true);
    setSelectedValues([]);
    props.onChange([]);
    performSearch('');
    
    if (props.onExcludedChange) {
      props.onExcludedChange([]);
    }
  }, [props, performSearch]);

  // Simplified effect for resetting user interaction
  useEffect(() => {
    if (selectedValues.length === 0 && (!props.excludeValues || props.excludeValues.length === 0)) {
      setHasUserInteracted(false);
    }
  }, [selectedValues.length, props.excludeValues]);

  useLayoutEffect(() => {
    if (!triggerBlur) return;

    const timeout = setTimeout(() => {
      setFocus(false);
      setTriggerBlur(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [triggerBlur]);

  // Optimized list generation using sorted options
  const list = useMemo(
    () => {
      if (!sortedOptions || sortedOptions.length === 0) return [];

      const optionsList = sortedOptions.map((o, i: number) => {
        const optionValue = o[propertyName];
        const displayValue = String(optionValue || ''); // Ensure we have a string for display
        const normalizedValue = normalizeValue(optionValue); // Normalized for comparison
        const isSelected = selectedValues.some(v => v.value === normalizedValue);
        
        return (
          <div
            key={`${propertyName}-${i}-${normalizedValue}`}
            onClick={() => {
              setTriggerBlur(false);
              handleSelection(optionValue);
            }}
            className={`flex items-left items-center min-h-[36px] px-3 py-2 hover:bg-black/5 cursor-pointer font-normal ${
              isSelected ? 'bg-black/5' : ''
            } truncate`}
          >
            {isSelected ? <Checkbox /> : <CheckboxEmpty />}
            <span className="font-normal pl-1 truncate" title={displayValue}>
              {displayValue}
            </span>
            {o.note && <span className="font-normal pl-3 text-xs opacity-70">{o.note}</span>}
          </div>
        );
      });

      // Add Exclude option
      const selectedOptionValues = selectedValues.map(v => v.value);
      const excludedCount = optionValues.length - selectedOptionValues.length;
      const hasSelectedValues = selectedValues.length > 0;

      optionsList.push(
        <div
          key="exclude-option"
          onClick={() => {
            if (!hasSelectedValues) return;
            setTriggerBlur(false);
            handleExcludeClick();
          }}
          className={`flex items-left items-center min-h-[36px] px-3 py-2 cursor-pointer font-normal border-t border-gray-200 truncate ${
            hasSelectedValues 
              ? 'hover:bg-black/5 text-blue-600 cursor-pointer' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span
            className="font-normal pl-1 truncate"
            title="Exclude"
          >
            {props.placeholder?.includes("Group A")
              ? `Exclude From Group B`
              : props.placeholder?.includes("Group B")
                ? `Exclude From Group A`
                : `Exclude`}
          </span>
        </div>
      );

      return optionsList;
    },
    [sortedOptions, propertyName, selectedValues, handleSelection, handleExcludeClick, optionValues],
  ) as ReactNode[];

  return (
    <Container title={props.title}>
      <div
        className={twMerge(
          'relative rounded-xl w-full min-w-[50px] h-10 border border-[#DADCE1] flex items-center',
          props.className,
        )}
      >
        <input
          ref={ref}
          value={search}
          name="dropdown"
          placeholder={props.placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setTriggerBlur(true)}
          onChange={(e) => performSearch(e.target.value)}
          className={`outline-none bg-transparent leading-9 h-9 border-0 px-3 w-full cursor-pointer text-sm ${
            focus || !selectedValues.length ? '' : 'opacity-0'
          }`}
        />

        {!!selectedValues.length && (
          <span
            className={`absolute w-[calc(100%-2rem)] whitespace-nowrap overflow-hidden truncate rounded-xl left-3 top-1 h-8 leading-8 block pointer-events-none text-sm ${
              focus ? 'hidden' : ''
            }`}
          >
            Selected {selectedValues.length} {selectedValues.length === 1 ? 'option' : 'options'}
          </span>
        )}

        {focus && (
          <div
            tabIndex={0}
            onBlur={() => setFocus(false)}
            style={{ minWidth: props.minDropdownWidth }}
            className="flex flex-col bg-white rounded-xl absolute top-11 z-50 border border-[#DADCE1] w-full overflow-y-auto overflow-x-hidden max-h-[400px]"
          >
            {list}
            {list?.length === 0 && !!search && (
              <div className="px-3 py-2 text-black/50 italic cursor-pointer">No results</div>
            )}
          </div>
        )}

        {props.options?.isLoading ? (
          <Spinner show className="absolute right-2 top-2 z-1 pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2.5 top-2.5 z-1 pointer-events-none" />
        )}

        {!props.unclearable && !!selectedValues.length && (
          <div
            onClick={clearAll}
            className="absolute right-10 top-0 h-10 flex items-center z-10 cursor-pointer"
          >
            <ClearIcon />
          </div>
        )}
      </div>
    </Container>
  );
};