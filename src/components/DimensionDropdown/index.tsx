import React, { useState, useEffect } from 'react';
import { Dimension } from '@embeddable.com/core';

type Props = {
    dimensions: Dimension[];
    onChange: (value: string) => void;           // old string-based
    onChangeDimension?: (dim: Dimension | null) => void; // new dimension-based
    placeholder?: string;
    defaultXAxis?: string;
    defaultYAxis?: string;
    InstoreDuration?: boolean;
};

const DropdownDimensionNames = ({
    dimensions,
    onChange,
    onChangeDimension,
    placeholder,
    InstoreDuration,
    defaultXAxis = "impressions.weekday",
    defaultYAxis = "impressions.week"
}: Props) => {

    const resolvedDefaultXAxis = InstoreDuration
        ? "customer_journeys.month"
        : defaultXAxis;

    const resolvedDefaultYAxis = InstoreDuration
        ? "customer_journeys.weekday"
        : defaultYAxis;

    const [selectedName, setSelectedName] = useState<string>('');
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        const validNames = dimensions.map(d => d.name);
        if (!validNames.includes(selectedName)) {
            setSelectedName('');
            setDisplayValue('');
        }
    }, [dimensions, selectedName]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;

        if (newValue === "RESET_PLACEHOLDER") {
            const defaultValue =
                placeholder === "Select X-axis..." ? resolvedDefaultXAxis :
                placeholder === "Select Y-axis..." ? resolvedDefaultYAxis : '';

            setSelectedName(defaultValue);
            setDisplayValue('');

            const defaultDimension = dimensions.find(d => d.name === defaultValue) || null;

            onChange(defaultValue);            // old string
            onChangeDimension?.(defaultDimension); // new dimension object
        } else {
            setSelectedName(newValue);
            setDisplayValue(newValue);

            const selectedDimension = dimensions.find(d => d.name === newValue) || null;

            onChange(newValue);                 // old string
            onChangeDimension?.(selectedDimension); // new dimension object
        }
    };

    return (
        <div className="dropdown-container">
            <div className="dropdown-wrapper">
                <select
                    value={displayValue}
                    onChange={handleChange}
                    onPointerDown={e => e.stopPropagation()}
                    className={`dropdown ${!displayValue ? 'placeholder' : ''}`}
                >
                    <option value="" disabled hidden>{placeholder}</option>
                    <option value="RESET_PLACEHOLDER">{placeholder}</option>
                    {dimensions.map(({ name, title }) => (
                        <option key={name} value={name}>
                            {name === 'impressions.id_campaign' ? 'Total' : title}
                        </option>
                    ))}
                </select>
            </div>

            <style jsx>{`
                .dropdown-container {
                    width: 100%;
                    padding: 10px;
                    background-color: #fff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }

                .dropdown-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .dropdown {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    appearance: none;
                    cursor: pointer;
                    color: #333;
                }

                .dropdown.placeholder {
                    color: #aaa;
                }
            `}</style>
        </div>
    );
};

export default DropdownDimensionNames;
