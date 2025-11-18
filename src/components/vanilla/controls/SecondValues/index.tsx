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
  options: string[]; // now just a list of text values
  unclearable?: boolean;
  onChange: (v: string[]) => void;
  title?: string;
  defaultValue?: string[];
  placeholder?: string;
  minDropdownWidth?: number;
};

export default (props: Props) => {
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const [triggerBlur, setTriggerBlur] = useState(false);
  const [value, setValue] = useState<string[]>(props.defaultValue || []);
  const [search, setSearch] = useState('');
  const [isLoading] = useState(false);

  useEffect(() => {
    setValue(props.defaultValue || []);
  }, [props.defaultValue]);

  const filteredOptions = useMemo(() => {
    if (!search) return props.options;
    return props.options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, props.options]);

  const toggleValue = useCallback(
    (option: string) => {
      let newValues = [...value];
      if (newValues.includes(option)) {
        newValues = newValues.filter((v) => v !== option);
      } else {
        newValues.push(option);
      }
      props.onChange(newValues);
      setValue(newValues);
    },
    [value, props]
  );

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
      filteredOptions.map((option, i) => (
        <div
          key={i}
          onClick={() => {
            setTriggerBlur(false);
            toggleValue(option);
          }}
          className={`flex items-center min-h-[36px] px-3 py-2 hover:bg-black/5 cursor-pointer font-normal ${
            value.includes(option) ? 'bg-black/5' : ''
          } truncate`}
        >
          {value.includes(option) ? <Checkbox /> : <CheckboxEmpty />}
          <span className="font-normal pl-1 truncate" title={option}>
            {option}
          </span>
        </div>
      )),
    [filteredOptions, toggleValue, value]
  ) as ReactNode[];

  return (
    <Container title={props.title}>
      <div
        className={twMerge(
          'relative rounded-xl w-full min-w-[50px] h-10 border border-[#DADCE1] flex items-center',
          props.className
        )}
      >
        <input
          ref={ref}
          value={search}
          name="dropdown"
          placeholder={props.placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setTriggerBlur(true)}
          onChange={(e) => setSearch(e.target.value)}
          className={`outline-none bg-transparent leading-9 h-9 border-0 px-3 w-full cursor-pointer text-sm ${
  focus || value.length === 0 ? '' : 'opacity-0'
}`}

        />

        {!!value?.length && (
          <span
            className={`absolute w-[calc(100%-2rem)] whitespace-nowrap overflow-hidden truncate rounded-xl left-3 top-1 h-8 leading-8 block pointer-events-none text-sm ${
              focus ? 'hidden' : ''
            }`}
          >
            Selected {value.length} {value.length === 1 ? 'option' : 'options'}
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
              <div className="px-3 py-2 text-black/50 italic cursor-pointer">
                No results
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <Spinner show className="absolute right-2 top-2 z-1 pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2.5 top-2.5 z-1 pointer-events-none" />
        )}

        {!props.unclearable && !!value?.length && (
          <div
            onClick={() => {
              setValue([]);
              props.onChange([]);
            }}
            className="absolute right-10 top-0 h-10 flex items-center z-10 cursor-pointer"
          >
            <ClearIcon />
          </div>
        )}
      </div>
    </Container>
  );
};
