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
  searchProperty?: string;
  minDropdownWidth?: number;
  property?: { name: string; title: string; nativeType: string; __type__: string };
  title?: string;
  defaultValue?: string[];
  placeholder?: string;
  ds?: { embeddableId: string; datasetId: string; variableValues: Record };
};

type Record = { [p: string]: string };
type SelectedValue = { value: string; title: string };

let debounce: number | undefined = undefined;

export default (props: Props) => {
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const [triggerBlur, setTriggerBlur] = useState(false);
  const [selectedValues, setSelectedValues] = useState<SelectedValue[]>([]);
  const [search, setSearch] = useState('');
  const [_, setServerSearch] = useEmbeddableState({
    [props.searchProperty || 'search']: '',
  }) as [Record, (f: (m: Record) => Record) => void];

  // Convert string[] defaultValue to SelectedValue[]
  useEffect(() => {
    if (props.defaultValue) {
      const initialValues = props.defaultValue.map(value => ({
        value,
        title: props.property?.title || value // Use dimension property title
      }));
      setSelectedValues(initialValues);
    }
  }, [props.defaultValue, props.property?.title]);

  const performSearch = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);

      clearTimeout(debounce);

      debounce = window.setTimeout(() => {
        setServerSearch((s) => ({ ...s, [props.searchProperty || 'search']: newSearch }));
      }, 500);
    },
    [setSearch, setServerSearch, props.searchProperty],
  );

  const handleSelection = useCallback(
    (newValue: string) => {
      performSearch('');

      let newSelectedValues: SelectedValue[];

      if (selectedValues.some(v => v.value === newValue)) {
        // Remove if already selected
        newSelectedValues = selectedValues.filter((v) => v.value !== newValue);
      } else {
        // Add if not selected - use dimension property title for all
        newSelectedValues = [...selectedValues, { 
          value: newValue, 
          title: props.property?.title || newValue 
        }];
      }

      setSelectedValues(newSelectedValues);
      props.onChange(newSelectedValues);
      setServerSearch((s) => ({ ...s, [props.searchProperty || 'search']: '' }));
      clearTimeout(debounce);
    },
    [performSearch, selectedValues, props, setServerSearch, props.searchProperty, props.property?.title],
  );

  const clearAll = useCallback(() => {
    setSelectedValues([]);
    props.onChange([]);
    performSearch('');
  }, [props, performSearch]);

  useLayoutEffect(() => {
    if (!triggerBlur) return;

    const timeout = setTimeout(() => {
      setFocus(false);
      setTriggerBlur(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [triggerBlur]);

  const list = useMemo(
    () =>
      props.options?.data?.reduce((memo, o, i: number) => {
        const optionValue = o[props.property?.name || ''];
        
        const isSelected = selectedValues.some(v => v.value === optionValue);
        
        memo.push(
          <div
            key={i}
            onClick={() => {
              setTriggerBlur(false);
              handleSelection(optionValue);
            }}
            className={`flex items-left items-center min-h-[36px] px-3 py-2 hover:bg-black/5 cursor-pointer font-normal ${
              isSelected ? 'bg-black/5' : ''
            } truncate`}
          >
            {isSelected ? <Checkbox /> : <CheckboxEmpty />}
            <span className="font-normal pl-1 truncate" title={optionValue}>
              {optionValue}
            </span>
            {o.note && <span className="font-normal pl-3 text-xs opacity-70">{o.note}</span>}
          </div>,
        );

        return memo;
      }, []),
    [props.options?.data, props.property, selectedValues, handleSelection],
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