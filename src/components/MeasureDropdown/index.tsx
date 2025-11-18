import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

type Props = {
    measureTitles: string[];
    placeholder?: string;
    onChange: (value: string) => void;
    defaultXAxis?: string;
    defaultYAxis?: string;
};

const DropdownMeasureNames = ({
    measureTitles,
    onChange,
    placeholder = "Select...",
    defaultXAxis = "Shoppers",
    defaultYAxis = "Sales"
}: Props) => {
    const [selectedTitle, setSelectedTitle] = useState('');
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (!measureTitles.includes(selectedTitle)) {
            setSelectedTitle('');
            setDisplayValue('');
        }
    }, [measureTitles, selectedTitle]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;

        if (newValue === "RESET_PLACEHOLDER") {
            // Reset to default values based on placeholder
            const defaultValue = placeholder === "Select X-axis..." ? defaultXAxis :
                placeholder === "Select Y-axis..." ? defaultYAxis : '';

            setSelectedTitle(defaultValue);
            setDisplayValue(''); // This will show the placeholder
            onChange(defaultValue);
        } else {
            setSelectedTitle(newValue);
            setDisplayValue(newValue);
            onChange(newValue);
        }
    };

    const handleClear = () => {
        // Reset to default values based on placeholder when clearing
        const defaultValue = placeholder === "Select X-axis..." ? defaultXAxis :
            placeholder === "Select Y-axis..." ? defaultYAxis : '';

        setSelectedTitle(defaultValue);
        setDisplayValue('');
        onChange(defaultValue);
    };

    return (
        <div className="dropdown-container">
            <div className="dropdown-wrapper">
                <select
                    value={displayValue}
                    onChange={handleChange}
                    className={`dropdown ${!displayValue ? 'placeholder' : ''}`}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    <option value="RESET_PLACEHOLDER">{placeholder}</option>
                    {measureTitles.map((title) => (
                        <option key={title} value={title}>
                            {title}
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
                .reset-button {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #ff5722;
                    transition: 0.3s ease-in-out;
                }

                .reset-button:hover {
                    color: #e64a19;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default DropdownMeasureNames;